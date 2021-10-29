import fs from 'fs';
import initSqlJs, { Database, Statement } from 'sql.js';
import { getBoundsOfDistance, getDistance, isPointInPolygon } from 'geolib';
import { Header } from './types/Header';
import {
    Airport,
    Airway,
    AirwayLevel,
    Approach,
    Arrival,
    DatabaseIdent,
    Departure,
    IlsNavaid,
    Location,
    NauticalMiles,
    NdbNavaid,
    Runway,
    VhfNavaid,
    VorClass,
    Waypoint,
    WaypointType,
    DataInterface,
    HeightSearchRange,
    ZoneSearchRange,
} from '../../../shared';
import { Airport as NaviAirport } from './types/Airports';
import { TerminalProcedure as NaviProcedure } from './types/TerminalProcedures';
import { TerminalWaypoint } from './types/TerminalWaypoints';
import { EnrouteNDBNavaid, TerminalNDBNavaid } from './types/NDBNavaids';
import { EnrouteWaypoint } from './types/EnrouteWaypoints';
import { EnRouteAirway as NaviAirwayFix } from './types/EnrouteAirways';
import { DFDMappers } from './mappers';
import { LocalizerGlideslope } from './types/LocalizerGlideslopes';
import { VHFNavaid } from './types/VHFNavaids';
import { AirportCommunication } from '../../../shared/types/Communication';

const query = (stmt: Statement) => {
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    return rows;
};

export class NavigraphProvider implements DataInterface {
    private database: Database = undefined as any;

    private mappers: DFDMappers = new DFDMappers(this);

    constructor(databasePath: string) {
        const fileBuffer = fs.readFileSync(databasePath);
        initSqlJs().then((SQL) => {
            this.database = new SQL.Database(fileBuffer);
        });
    }

    async getDatabaseIdent(): Promise<DatabaseIdent> {
        const sql = 'SELECT current_airac, effective_fromto, previous_fromto FROM tbl_header';
        const stmt = this.database.prepare(sql);
        try {
            const headers: Header[] = NavigraphProvider.toCamel(query(stmt));
            const result: DatabaseIdent = {
                provider: 'Navigraph',
                airacCycle: headers[0].currentAirac,
                dateFromTo: headers[0].effectiveFromto,
                previousFromTo: headers[0].previousFromto,
            };
            return (result);
        } finally {
            stmt.free();
        }
    }

    async getWaypoints(idents: string[]): Promise<Waypoint[]> {
        const sql = `SELECT * FROM tbl_enroute_waypoints WHERE waypoint_identifier IN (${idents.map(() => '?').join(',')})`;
        const stmt = this.database.prepare(sql, idents);
        const rows = NavigraphProvider.toCamel(query(stmt)) as EnrouteWaypoint[];
        return rows.map((waypoint) => this.mappers.mapEnrouteWaypoint(waypoint));
    }

    async getNDBsAtAirport(airportIdentifier: string): Promise<NdbNavaid[]> {
        const sql = 'SELECT * FROM tbl_terminal_ndbnavaids WHERE airport_identifier = $ident';
        const stmt = this.database.prepare(sql, { $ident: airportIdentifier });
        const rows = NavigraphProvider.toCamel(query(stmt)) as TerminalNDBNavaid[];
        return rows.map((ndb) => this.mappers.mapTerminalNdb(ndb));
    }

    async getIlsAtAirport(airportIdentifier: string): Promise<IlsNavaid[]> {
        const sql = 'SELECT * FROM tbl_localizers_glideslopes WHERE airport_identifier = $ident';
        const stmt = this.database.prepare(sql, { $ident: airportIdentifier });
        const rows = NavigraphProvider.toCamel(query(stmt)) as LocalizerGlideslope[];
        return rows.map((ils) => this.mappers.mapIls(ils));
    }

    async getWaypointsAtAirport(airportIdentifier: string): Promise<Waypoint[]> {
        const sql = 'SELECT * FROM tbl_terminal_waypoints WHERE region_code = $ident';
        const stmt = this.database.prepare(sql, { $ident: airportIdentifier });
        const rows = NavigraphProvider.toCamel(query(stmt)) as TerminalWaypoint[];
        return rows.map((waypoint) => ({
            icaoCode: waypoint.icaoCode,
            ident: waypoint.waypointIdentifier,
            databaseId: `W${waypoint.icaoCode}${waypoint.regionCode}${waypoint.waypointIdentifier}`,
            location: { lat: waypoint.waypointLatitude, lon: waypoint.waypointLongitude },
            name: waypoint.waypointName,
            type: WaypointType.Unknown,
        }));
    }

    async getAirports(idents: string[]): Promise<Airport[]> {
        const sql = `SELECT * FROM tbl_airports WHERE airport_identifier IN (${idents.map(() => '?').join(',')})`;
        const stmt = this.database.prepare(sql, idents);
        try {
            const rows = query(stmt);
            const airports: NaviAirport[] = NavigraphProvider.toCamel(rows);
            return (airports.map(((airport) => this.mappers.mapAirport(airport))));
        } finally {
            stmt.free();
        }
    }

    async getRunways(airportIdentifier: string): Promise<Runway[]> {
        const sql = 'SELECT * FROM tbl_runways WHERE airport_identifier = $ident';
        const stmt = this.database.prepare(sql, { $ident: airportIdentifier });
        try {
            const rows = NavigraphProvider.toCamel(query(stmt));
            return rows.map((runway) => this.mappers.mapRunway(runway));
        } finally {
            stmt.free();
        }
    }

    async getAirportsInRange(center: Location, range: NauticalMiles): Promise<Airport[]> {
        const sql = NavigraphProvider.rangeQueryString(center, range, 'airport_ref_latitude', 'airport_ref_longitude');
        const rows = query(this.database.prepare(`SELECT * FROM tbl_airports WHERE ${sql}`));
        const airports: NaviAirport[] = NavigraphProvider.toCamel(rows);
        return (airports.map((airport) => {
            const ap = this.mappers.mapAirport(airport);
            ap.distance = getDistance(center, { latitude: ap.location.lat, longitude: ap.location.lon }) / 1852;
            return ap;
        }).filter((ap) => (ap.distance ?? 0) <= range).sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0)));
    }

    async getDepartures(airportIdentifier: string): Promise<Departure[]> {
        const airports = await this.getAirports([airportIdentifier]);
        if (airports.length < 1) {
            return Promise.reject(new Error('Invalid airport'));
        }
        const stmt = this.database.prepare('SELECT * FROM tbl_sids WHERE airport_identifier=$ident', { $ident: airportIdentifier });
        try {
            const rows = query(stmt);
            const departureLegs: NaviProcedure[] = NavigraphProvider.toCamel(rows);
            return (this.mappers.mapDepartures(departureLegs, airports[0]));
        } finally {
            stmt.free();
        }
    }

    async getArrivals(airportIdentifier: string): Promise<Arrival[]> {
        const airports = await this.getAirports([airportIdentifier]);
        if (airports.length < 1) {
            return Promise.reject(new Error('Invalid airport'));
        }
        const stmt = this.database.prepare('SELECT * FROM tbl_stars WHERE airport_identifier=$ident', { $ident: airportIdentifier });
        try {
            const rows = query(stmt);
            const arrivalLegs: NaviProcedure[] = NavigraphProvider.toCamel(rows);
            return (this.mappers.mapArrivals(arrivalLegs, airports[0]));
        } finally {
            stmt.free();
        }
    }

    async getApproaches(airportIdentifier: string): Promise<Approach[]> {
        const airports = await this.getAirports([airportIdentifier]);
        if (airports.length < 1) {
            return Promise.reject(new Error('Invalid airport'));
        }
        const stmt = this.database.prepare('SELECT * FROM tbl_iaps WHERE airport_identifier=$ident', { $ident: airportIdentifier });
        try {
            const rows = query(stmt);
            const approachLegs: NaviProcedure[] = NavigraphProvider.toCamel(rows);
            return (this.mappers.mapApproaches(approachLegs, airports[0]));
        } finally {
            stmt.free();
        }
    }

    async getAirways(idents: string[]): Promise<Airway[]> {
        const stmt = this.database.prepare(`SELECT * FROM tbl_enroute_airways WHERE route_identifier IN (${idents.map(() => '?').join(',')})`, idents);
        try {
            const rows = query(stmt);
            const airways: NaviAirwayFix[] = NavigraphProvider.toCamel(rows);
            return (this.mappers.mapAirways(airways));
        } finally {
            stmt.free();
        }
    }

    async getAirwaysByFix(ident: string, icaoCode: string): Promise<Airway[]> {
        const stmt = this.database.prepare(
            'SELECT * FROM tbl_enroute_airways WHERE route_identifier IN (SELECT route_identifier FROM tbl_enroute_airways WHERE waypoint_identifier = $ident AND icao_code = $icao)',
            { $ident: ident, $icao: icaoCode },
        );
        try {
            const rows = query(stmt);
            const airways: NaviAirwayFix[] = NavigraphProvider.toCamel(rows);
            return (this.mappers.mapAirways(airways).filter((airway) => airway.fixes.find((fix) => fix.ident === ident)));
        } finally {
            stmt.free();
        }
    }

    async getNavaids(idents: string[]): Promise<VhfNavaid[]> {
        const sql = `SELECT * FROM tbl_vhfnavaids WHERE vor_identifier IN (${idents.map(() => '?').join(',')})`;
        const stmt = this.database.prepare(sql, idents);
        try {
            const rows = NavigraphProvider.toCamel(query(stmt));
            return rows.map((navaid) => this.mappers.mapVhfNavaid(navaid));
        } finally {
            stmt.free();
        }
    }

    async getAirwaysInRange(center: Location, range: NauticalMiles, searchRange?: HeightSearchRange): Promise<Airway[]> {
        const sql = NavigraphProvider.rangeQueryString(center, range, 'waypoint_latitude', 'waypoint_longitude');
        // TODO: This currently loads all Airways with a route_identifier which is the same as an in range airway.
        // Queries significantly more airways than it should, the getDistance fixes it but bad performance
        const rows = query(this.database.prepare(
            `SELECT * FROM tbl_enroute_airways WHERE route_identifier IN (SELECT route_identifier FROM tbl_enroute_airways WHERE ${sql})`,
        ));
        const airways = this.mappers.mapAirways(NavigraphProvider.toCamel(rows)).filter((airway) => airway.fixes.find((fix) => getDistance(fix.location, center) < range * 1852));
        return airways.filter((airway) => {
            switch (searchRange) {
            default:
            case HeightSearchRange.Both:
                return true;
            case HeightSearchRange.Low:
                return airway.level === AirwayLevel.All || airway.level === AirwayLevel.Low;
            case HeightSearchRange.High:
                return airway.level === AirwayLevel.All || airway.level === AirwayLevel.High;
            }
        });
    }

    async getNavaidsInRange(center: Location, range: NauticalMiles, searchRange?: HeightSearchRange): Promise<VhfNavaid[]> {
        const sql = NavigraphProvider.rangeQueryString(center, range, 'vor_latitude', 'vor_longitude');
        const rows = query(this.database.prepare(`SELECT * FROM tbl_vhfnavaids WHERE ${sql}`));
        const navaids: VHFNavaid[] = NavigraphProvider.toCamel(rows);
        return (navaids.map((navaid) => {
            const nav = this.mappers.mapVhfNavaid(navaid);
            nav.distance = getDistance(center, nav.vorLocation) / 1852;
            return nav;
        }).filter((ap) => (ap.distance ?? 0) <= range).sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0))).filter((navaid) => {
            switch (searchRange) {
            default:
            case HeightSearchRange.Both:
                return true;
            case HeightSearchRange.Low:
                return navaid.class === VorClass.LowAlt || navaid.class === VorClass.Unknown || VorClass.Terminal;
            case HeightSearchRange.High:
                return navaid.class === VorClass.HighAlt || navaid.class === VorClass.Unknown;
            }
        });
    }

    async getNDBs(idents: string[]): Promise<NdbNavaid[]> {
        const enRouteSql = `SELECT * FROM tbl_enroute_ndbnavaids WHERE ndb_identifier IN (${idents.map(() => '?').join(',')})`;
        const enRouteStmt = this.database.prepare(enRouteSql, idents);

        const terminalSql = `SELECT * FROM tbl_terminal_ndbnavaids WHERE ndb_identifier IN (${idents.map(() => '?').join(',')})`;
        const terminalStmt = this.database.prepare(terminalSql, idents);
        try {
            const enrouteRows = NavigraphProvider.toCamel(query(enRouteStmt));
            const terminalRows = NavigraphProvider.toCamel(query(terminalStmt));

            return [...enrouteRows.map((navaid) => this.mappers.mapEnrouteNdb(navaid)), ...terminalRows.map((navaid) => this.mappers.mapTerminalNdb(navaid))];
        } finally {
            enRouteStmt.free();
            terminalStmt.free();
        }
    }

    async getNDBsInRange(center: Location, range: NauticalMiles, searchRange?: ZoneSearchRange): Promise<NdbNavaid[]> {
        const sql = NavigraphProvider.rangeQueryString(center, range, 'ndb_latitude', 'ndb_longitude');
        const enRouteRows = query(this.database.prepare(`SELECT * FROM tbl_enroute_ndbnavaids WHERE ${sql}`));
        const terminalRows = query(this.database.prepare(`SELECT * FROM tbl_terminal_ndbnavaids WHERE ${sql}`));
        const enRouteNDBs: EnrouteNDBNavaid[] = searchRange === ZoneSearchRange.Both || searchRange === ZoneSearchRange.EnRoute ? NavigraphProvider.toCamel(enRouteRows) : [];
        const terminalNDBs: TerminalNDBNavaid[] = searchRange === ZoneSearchRange.Both || searchRange === ZoneSearchRange.Terminal ? NavigraphProvider.toCamel(terminalRows) : [];
        return [...enRouteNDBs.map((ndb) => {
            const nav = this.mappers.mapEnrouteNdb(ndb);
            nav.distance = getDistance(center, { latitude: nav.location.lat, longitude: nav.location.lon }) / 1852;
            return nav;
        }),
        ...terminalNDBs.map((ndb) => {
            const nav = this.mappers.mapTerminalNdb(ndb);
            nav.distance = getDistance(center, { latitude: nav.location.lat, longitude: nav.location.lon }) / 1852;
            return nav;
        })].filter((ap) => (ap.distance ?? 0) <= range).sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
    }

    async getWaypointsInRange(center: Location, range: NauticalMiles, searchRange?: ZoneSearchRange): Promise<Waypoint[]> {
        const sql = NavigraphProvider.rangeQueryString(center, range, 'waypoint_latitude', 'waypoint_longitude');
        const enRouteRows = query(this.database.prepare(`SELECT * FROM tbl_enroute_waypoints WHERE ${sql}`));
        const terminalRows = query(this.database.prepare(`SELECT * FROM tbl_terminal_waypoints WHERE ${sql}`));
        const enRouteWaypoints: EnrouteWaypoint[] = searchRange === ZoneSearchRange.Both || searchRange === ZoneSearchRange.EnRoute ? NavigraphProvider.toCamel(enRouteRows) : [];
        const terminalWaypoints: TerminalWaypoint[] = searchRange === ZoneSearchRange.Both || searchRange === ZoneSearchRange.Terminal ? NavigraphProvider.toCamel(terminalRows) : [];
        return [...enRouteWaypoints.map((waypoint) => {
            const nav = this.mappers.mapEnrouteWaypoint(waypoint);
            nav.distance = getDistance(center, { latitude: nav.location.lat, longitude: nav.location.lon }) / 1852;
            return nav;
        }),
        ...terminalWaypoints.map((waypoint) => {
            const nav = this.mappers.mapTerminalWaypoint(waypoint);
            nav.distance = getDistance(center, { latitude: nav.location.lat, longitude: nav.location.lon }) / 1852;
            return nav;
        })].filter((ap) => (ap.distance ?? 0) <= range).sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
    }

    public static toCamel(query: any[]) {
        return query.map((obj) => {
            const newObj: any = {};
            for (const key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    let segments = key.split('_');
                    segments = segments.map((seg, i) => {
                        if (i) return this.capitalizeFirstLetter(seg);
                        return seg;
                    });
                    const newKey = segments.join('');
                    newObj[newKey] = obj[key];
                }
            }
            return newObj;
        });
    }

    public static capitalizeFirstLetter(text: string): string {
        return text.charAt(0).toUpperCase() + text.substring(1);
    }

    public static rangeQueryString(center: Location, range: NauticalMiles, latColumn: string, lonColumn: string): string {
        const rangeMetres = range * 1852;
        const [southWest, northEast] = getBoundsOfDistance(center, rangeMetres);
        const southEast = { lat: southWest.latitude, lon: northEast.longitude };
        const northWest = { lat: northEast.latitude, lon: southWest.longitude };

        if (isPointInPolygon({ latitude: 89.99, longitude: 0 }, [southWest, northEast, northWest, southEast])) {
            // crossed the north pole, do a bodgie...
            southWest.latitude = Math.min(southWest.latitude, northWest.lat);
            northEast.latitude = 90;
        } else if (isPointInPolygon({ latitude: -89.99, longitude: 0 }, [southWest, northEast, northWest, southEast])) {
            // crossed the south pole, do a bodgie...
            northEast.latitude = Math.max(southWest.latitude, northWest.lat);
            southWest.latitude = -90;
        }

        let sql = `${latColumn} >= ${southWest.latitude} AND ${lonColumn} <= ${northEast.longitude}`;

        if (southWest.longitude > northEast.longitude) {
            // wrapped around +/- 180
            // TODO this still isn't quite rihgt...
            // we need two boxes, one either side of the pole
            sql += ` AND (${latColumn} <= ${northEast.latitude} OR ${lonColumn} >= ${southWest.longitude})`;
        } else {
            sql += ` AND ${latColumn} <= ${northEast.latitude} AND ${lonColumn} >= ${southWest.longitude}`;
        }
        return sql;
    }

    async getCommunicationsAtAirport(airportIdentifier: string): Promise<AirportCommunication[]> {
        const stmt = this.database.prepare('SELECT * FROM tbl_airport_communication WHERE tbl_airport_communication.airport_identifier = $ident', { $ident: airportIdentifier });
        try {
            const rows = NavigraphProvider.toCamel(query(stmt));
            return rows.map((communication) => this.mappers.mapAirportCommunication(communication));
        } finally {
            stmt.free();
        }
    }
}
