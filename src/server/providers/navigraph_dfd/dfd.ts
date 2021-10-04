import fs from 'fs';
import initSqlJs, { Database, Statement } from 'sql.js';
import { getBoundsOfDistance, getDistance, isPointInPolygon } from 'geolib';
import { Header } from './types/Header';
import { DatabaseIdent } from '../../../shared/types/DatabaseIdent';
import { Airport as NaviAirport } from './types/Airports';
import { TerminalProcedure as NaviProcedure } from './types/TerminalProcedures';
import { Airport } from '../../../shared/types/Airport';
import { Runway } from '../../../shared/types/Runway';
import { Provider } from '../provider';
import { Waypoint, WaypointType } from '../../../shared/types/Waypoint';
import { TerminalWaypoint } from './types/TerminalWaypoints';
import { NdbNavaid } from '../../../shared/types/NdbNavaid';
import { TerminalNDBNavaid } from './types/NDBNavaids';
import { EnrouteWaypoint } from './types/EnrouteWaypoints';
import { Departure } from '../../../shared/types/Departure';
import { Arrival } from '../../../shared/types/Arrival';
import { Approach } from '../../../shared/types/Approach';
import { Airway } from '../../../shared/types/Airway';
import { EnRouteAirway as NaviAirwayFix } from './types/EnrouteAirways';
import { DFDMappers } from './mappers';
import { LocalizerGlideslope } from './types/LocalizerGlideslopes';
import { IlsNavaid } from '../../../shared/types/IlsNavaid';
import { VhfNavaid } from '../../../shared';

const query = (stmt: Statement) => {
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    return rows;
};
export class NavigraphDfd implements Provider {
    private db: Database = undefined as any;

    private mappers: DFDMappers = new DFDMappers(this);

    constructor(db_path: string) {
        const filebuffer = fs.readFileSync(db_path);
        initSqlJs().then((SQL) => {
            this.db = new SQL.Database(filebuffer);
        });
    }

    async getDatabaseIdent(): Promise<DatabaseIdent> {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT current_airac, effective_fromto, previous_fromto FROM tbl_header';
            const stmt = this.db.prepare(sql);
            try {
                const headers: Header[] = NavigraphDfd.toCamel(query(stmt));
                const result: DatabaseIdent = {
                    provider: 'Navigraph',
                    airacCycle: headers[0].currentAirac,
                    dateFromTo: headers[0].effectiveFromto,
                    previousFromTo: headers[0].previousFromto,
                };
                resolve(result);
            } finally {
                stmt.free();
            }
        });
    }

    async getWaypointsByIdent(ident: string): Promise<Waypoint[]> {
        const sql = 'SELECT * FROM tbl_enroute_waypoints WHERE waypoint_identifier = $ident';
        const stmt = this.db.prepare(sql, { $ident: ident });
        const rows = NavigraphDfd.toCamel(query(stmt)) as EnrouteWaypoint[];
        return rows.map((waypoint) => ({
            icaoCode: waypoint.icaoCode,
            ident: waypoint.waypointIdentifier,
            databaseId: `W    ${waypoint.icaoCode}${waypoint.waypointIdentifier}`,
            location: { lat: waypoint.waypointLatitude, lon: waypoint.waypointLongitude },
            name: waypoint.waypointName,
            type: WaypointType.Unknown,
        }));
    }

    async getNDBsAtAirport(ident: string): Promise<NdbNavaid[]> {
        const sql = 'SELECT * FROM tbl_terminal_ndbnavaids WHERE airport_identifier = $ident';
        const stmt = this.db.prepare(sql, { $ident: ident });
        const rows = NavigraphDfd.toCamel(query(stmt)) as TerminalNDBNavaid[];
        return rows.map((navaid) => this.mappers.mapTerminalNdb(navaid));
    }

    async getIlsAtAirport(ident: string): Promise<IlsNavaid[]> {
        const sql = 'SELECT * FROM tbl_localizers_glideslopes WHERE airport_identifier = $ident';
        const stmt = this.db.prepare(sql, { $ident: ident });
        const rows = NavigraphDfd.toCamel(query(stmt)) as LocalizerGlideslope[];
        return rows.map((ils) => this.mappers.mapIls(ils));
    }

    async getWaypointsAtAirport(ident: string): Promise<Waypoint[]> {
        const sql = 'SELECT * FROM tbl_terminal_waypoints WHERE region_code = $ident';
        const stmt = this.db.prepare(sql, { $ident: ident });
        const rows = NavigraphDfd.toCamel(query(stmt)) as TerminalWaypoint[];
        return rows.map((waypoint) => ({
            icaoCode: waypoint.icaoCode,
            ident: waypoint.waypointIdentifier,
            databaseId: `W${waypoint.icaoCode}${waypoint.regionCode}${waypoint.waypointIdentifier}`,
            location: { lat: waypoint.waypointLatitude, lon: waypoint.waypointLongitude },
            name: waypoint.waypointName,
            type: WaypointType.Unknown,
        }));
    }

    async getAirportsByIdents(idents: string[]): Promise<Airport[]> {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM tbl_airports WHERE airport_identifier IN (${idents.map(() => '?').join(',')})`;
            const stmt = this.db.prepare(sql, idents);
            try {
                const rows = query(stmt);
                const airports: NaviAirport[] = NavigraphDfd.toCamel(rows);
                resolve(airports.map(((airport) => this.mappers.mapAirport(airport))));
            } finally {
                stmt.free();
            }
        });
    }

    async getRunwaysAtAirport(ident: string): Promise<Runway[]> {
        const sql = 'SELECT * FROM tbl_runways WHERE airport_identifier = $ident';
        const stmt = this.db.prepare(sql, { $ident: ident });
        try {
            const rows = NavigraphDfd.toCamel(query(stmt));
            return rows.map((runway) => this.mappers.mapRunway(runway));
        } finally {
            stmt.free();
        }
    }

    async getNearbyAirports(lat: number, lon: number, range: number): Promise<Airport[]> {
        return new Promise((resolve, reject) => {
            const rangeMetres = range * 1852;
            const centre = { latitude: lat, longitude: lon };
            const [southWestCorner, northEastCorner] = getBoundsOfDistance(centre, rangeMetres);
            const southEastCorner = { latitude: southWestCorner.latitude, longitude: northEastCorner.longitude };
            const northWestCorner = { latitude: northEastCorner.latitude, longitude: southWestCorner.longitude };

            if (isPointInPolygon({ latitude: 89.99, longitude: 0 }, [southWestCorner, northEastCorner, northWestCorner, southEastCorner])) {
                // crossed the north pole, do a bodgie...
                southWestCorner.latitude = Math.min(southWestCorner.latitude, northWestCorner.latitude);
                northEastCorner.latitude = 90;
            } else if (isPointInPolygon({ latitude: -89.99, longitude: 0 }, [southWestCorner, northEastCorner, northWestCorner, southEastCorner])) {
                // crossed the south pole, do a bodgie...
                northEastCorner.latitude = Math.max(southWestCorner.latitude, northWestCorner.latitude);
                southWestCorner.latitude = -90;
            }

            let sql = 'SELECT * FROM tbl_airports WHERE airport_ref_latitude >= ? AND airport_ref_latitude <= ?';

            if (southWestCorner.longitude > northEastCorner.longitude) {
                // wrapped around +/- 180
                // TODO this still isn't quite rihgt...
                // we need two boxes, one either side of the pole
                sql += ' AND (airport_ref_longitude <= ? OR airport_ref_longitude >= ?';
            } else {
                sql += ' AND airport_ref_longitude <= ? AND airport_ref_longitude >= ?';
            }

            const rows = query(this.db.prepare(sql, [southWestCorner.latitude, northEastCorner.latitude, northEastCorner.longitude, southWestCorner.longitude]));
            if (rows.length < 1) {
                return reject('No airports found');
            }
            const airports: NaviAirport[] = NavigraphDfd.toCamel(rows);
            resolve(airports.map((airport) => {
                const ap = this.mappers.mapAirport(airport);
                ap.distance = getDistance(centre, { latitude: ap.location.lat, longitude: ap.location.lon }) / 1852;
                return ap;
            }).filter((ap) => (ap.distance ?? 0) <= range).sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0)));
        });
    }

    async getDepartures(ident: string): Promise<Departure[]> {
        // niggly that the the procedure legs are about the only thing in the whole db without icao code
        const airports = await this.getAirportsByIdents([ident]);
        return new Promise((resolve, reject) => {
            if (airports.length < 1) {
                return reject('Invalid airport');
            }
            const stmt = this.db.prepare('SELECT * FROM tbl_sids WHERE airport_identifier=$ident ORDER BY seqno ASC', { $ident: ident });
            try {
                const rows = query(stmt);
                if (rows.length < 1) {
                    return reject('No departures!');
                }
                const departureLegs: NaviProcedure[] = NavigraphDfd.toCamel(rows);
                resolve(this.mappers.mapDepartures(departureLegs, airports[0]));
            } finally {
                stmt.free();
            }
        });
    }

    async getArrivals(ident: string): Promise<Arrival[]> {
        // niggly that the the procedure legs are about the only thing in the whole db without icao code
        const airports = await this.getAirportsByIdents([ident]);
        return new Promise((resolve, reject) => {
            if (airports.length < 1) {
                return reject('Invalid airport');
            }
            const stmt = this.db.prepare('SELECT * FROM tbl_stars WHERE airport_identifier=$ident ORDER BY seqno ASC', { $ident: ident });
            try {
                const rows = query(stmt);
                if (rows.length < 1) {
                    return reject('No arrivals!');
                }
                const arrivalLegs: NaviProcedure[] = NavigraphDfd.toCamel(rows);
                resolve(this.mappers.mapArrivals(arrivalLegs, airports[0]));
            } finally {
                stmt.free();
            }
        });
    }

    async getApproaches(ident: string): Promise<Approach[]> {
        // niggly that the the procedure legs are about the only thing in the whole db without icao code
        const airports = await this.getAirportsByIdents([ident]);
        return new Promise((resolve, reject) => {
            if (airports.length < 1) {
                return reject('Invalid airport');
            }
            const stmt = this.db.prepare('SELECT * FROM tbl_iaps WHERE airport_identifier=$ident ORDER BY seqno ASC', { $ident: ident });
            try {
                const rows = query(stmt);
                if (rows.length < 1) {
                    return reject('No arrivals!');
                }
                const approachLegs: NaviProcedure[] = NavigraphDfd.toCamel(rows);
                resolve(this.mappers.mapApproaches(approachLegs, airports[0]));
            } finally {
                stmt.free();
            }
        });
    }

    async getAirwaysByIdents(idents: string[]): Promise<Airway[]> {
        return new Promise((resolve, reject) => {
            const stmt = this.db.prepare(`SELECT * FROM tbl_enroute_airways WHERE route_identifier IN (${idents.map(() => '?').join(',')}) ORDER BY seqno ASC`, idents);
            try {
                const rows = query(stmt);
                if (rows.length < 1) {
                    return reject('No airways');
                }
                const airways: NaviAirwayFix[] = NavigraphDfd.toCamel(rows);
                resolve(this.mappers.mapAirways(airways));
            } finally {
                stmt.free();
            }
        });
    }

    async getAirwaysByFix(idents: string): Promise<Airway[]> {
        return new Promise((resolve, reject) => {
            // TODO
            reject('SOON');
        });
    }

    async getNavaidsByIdent(ident: string): Promise<VhfNavaid[]> {
        const sql = 'SELECT * FROM tbl_vhfnavaids WHERE vor_identifier = $ident';
        const stmt = this.db.prepare(sql, { $ident: ident });
        try {
            const rows = NavigraphDfd.toCamel(query(stmt));
            return rows.map((navaid) => this.mappers.mapVhfNavaid(navaid));
        } finally {
            stmt.free();
        }
    }

    public static toCamel(query: any[]) {
        return query.map((obj) => {
            const newObj: any = {};
            for (const key in obj) {
                let segments = key.split('_');
                segments = segments.map((seg, i) => {
                    if (i) return this.capitalizeFirstLetter(seg);
                    return seg;
                });
                const newKey = segments.join('');
                newObj[newKey] = obj[key];
            }
            return newObj;
        });
    }

    public static capitalizeFirstLetter(text: string): string {
        return text.charAt(0).toUpperCase() + text.substring(1);
    }
}
