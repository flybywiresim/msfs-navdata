import {getBoundsOfDistance, getDistance, isPointInPolygon} from 'geolib';
import {Header} from './types/Header';
import {DatabaseIdent} from '../../../shared/types/DatabaseIdent';
import {Airport as NaviAirport} from './types/Airports';
import { TerminalProcedure as NaviProcedure } from './types/TerminalProcedures';
import {Airport} from '../../../shared/types/Airport';
import {Runway, RunwaySurfaceType} from '../../../shared/types/Runway';
import {Provider} from '../provider';
import fs from 'fs';
import initSqlJs, {Database, Statement} from 'sql.js';
import {Runway as NaviRunway} from "./types/Runways";
import {LsCategory} from "../../../shared/types/Common";
import {Waypoint} from "../../../shared/types/Waypoint";
import {TerminalWaypoint} from "./types/TerminalWaypoints";
import {NdbClass, NdbNavaid} from "../../../shared/types/NdbNavaid";
import {TerminalNDBNavaid} from "./types/NDBNavaids";
import {VhfNavaidType} from "../../../shared/types/VhfNavaid";
import {EnrouteWaypoint} from "./types/EnrouteWaypoints";
import { IlsMlsGlsCategory } from "./types/LocalizerGlideslopes";
import { Departure } from '../../../shared/types/Departure';
import { AltitudeDescriptor, LegType, ProcedureLeg, SpeedDescriptor, TurnDirection } from '../../../shared/types/ProcedureLeg';
import { Arrival } from '../../../shared/types/Arrival';
import { Approach, ApproachType } from '../../../shared/types/Approach';

const query = (stmt: Statement) => {
    const rows = [];
    while(stmt.step())
        rows.push(stmt.getAsObject())
    return rows;
}
export class NavigraphDfd implements Provider {
    private db: Database = undefined as any;

    constructor(db_path: string) {
        const filebuffer = fs.readFileSync(db_path);
        initSqlJs().then((SQL) => {
            this.db = new SQL.Database(filebuffer);
        })

    }

    async getDatabaseIdent(): Promise<DatabaseIdent> {
        return new Promise((resolve, reject) => {
            const sql = "SELECT current_airac, effective_fromto, previous_fromto FROM tbl_header";
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

    private static mapTerminalNdb(ndb: TerminalNDBNavaid): NdbNavaid {
        return {
            ident: ndb.ndbIdentifier,
            databaseId: `N${ndb.icaoCode}${ndb.airportIdentifier}${ndb.ndbIdentifier}`,
            frequency: ndb.ndbFrequency,
            stationDeclination: 0,
            location: { lat: ndb.ndbLatitude, lon: ndb.ndbLongitude },
            class: NdbClass.Unknown,
            type: VhfNavaidType.Unknown,
        }
    }

    async getWaypointsByIdent(ident: string): Promise<Waypoint[]> {
        const sql = `SELECT * FROM tbl_enroute_waypoints WHERE waypoint_identifier = $ident`;
        const stmt = this.db.prepare(sql, { $ident: ident });
        const rows = NavigraphDfd.toCamel(query(stmt)) as EnrouteWaypoint[];
        return rows.map(waypoint => {
            return {
                ident: waypoint.waypointIdentifier,
                databaseId: `W    ${waypoint.icaoCode}${waypoint.waypointIdentifier}`,
                location: { lat: waypoint.waypointLatitude, lon: waypoint.waypointLongitude },
                name: waypoint.waypointName,
                type: waypoint.waypointType,
            };
        });
    }

    async getNDBsAtAirport(ident: string): Promise<NdbNavaid[]> {
        const sql = `SELECT * FROM tbl_terminal_ndbnavaids WHERE airport_identifier = $ident`;
        const stmt = this.db.prepare(sql, { $ident: ident });
        const rows = NavigraphDfd.toCamel(query(stmt)) as TerminalNDBNavaid[];
        return rows.map(navaid => NavigraphDfd.mapTerminalNdb(navaid));
    }

    private static mapAirport(airport: NaviAirport): Airport {
        let surfaceCode = RunwaySurfaceType.Unknown;
        switch (airport.longestRunwaySurfaceCode) {
            case 'H':
                surfaceCode = RunwaySurfaceType.Hard;
                break;
            case 'S':
                surfaceCode = RunwaySurfaceType.Soft;
                break;
            case 'W':
                surfaceCode = RunwaySurfaceType.Water;
                break;
        }
        return {
            databaseId: NavigraphDfd.airportDatabaseId(airport),
            ident: airport.airportIdentifier,
            icaoCode: airport.icaoCode,
            airportName: airport.airportName,
            location: { lat: airport.airportRefLatitude, lon: airport.airportRefLongitude, alt: airport.elevation },
            speedLimit: airport.speedLimit || undefined,
            speedLimitAltitude: airport.speedLimitAltitude || undefined,
            transitionAltitude: airport.transitionAltitude || undefined,
            transitionLevel: airport.transitionLevel / 100 || undefined,
            longestRunwaySurfaceType: surfaceCode,
        };
    }

    private static mapLsCategory(naviCategory: IlsMlsGlsCategory): LsCategory {
        switch(naviCategory) {
            case '0':
                return LsCategory.LocOnly;
            case '1':
                return LsCategory.Category1;
            case '2':
                return LsCategory.Category2;
            case '3':
                return LsCategory.Category3;
            case "I":
                return LsCategory.IgsOnly;
            case "L":
                return LsCategory.LdaGlideslope;
            case "A":
                return LsCategory.LdaOnly;
            case "S":
                return LsCategory.SdfGlideslope;
            case "F":
                return LsCategory.SdfOnly;
        }
        return LsCategory.None;
    }

    private static mapRunway(runway: NaviRunway): Runway {
        return {
            ident: runway.runwayIdentifier,
            databaseId: `R  ${runway.airportIdentifier}${runway.runwayIdentifier}`,
            airportIdent: runway.airportIdentifier,
            centreLocation: { lat: runway.runwayLatitude, lon: runway.runwayLongitude },
            bearing: runway.runwayTrueBearing,
            magneticBearing: runway.runwayMagneticBearing,
            gradient: runway.runwayGradient,
            thresholdLocation: { lat: 0, lon: 0 },
            thresholdCrossingHeight: runway.thresholdCrossingHeight,
            length: runway.runwayLength,
            width: runway.runwayWidth,
            lsIdent: runway.llzIdentifier,
            lsCategory: this.mapLsCategory(runway.llzMlsGlsCategory),
            surfaceType: RunwaySurfaceType.Unknown, // navigraph pls
        }
    }

    async getWaypointsAtAirport(ident: string): Promise<Waypoint[]> {
        const sql = `SELECT * FROM tbl_terminal_waypoints WHERE region_code = $ident`;
        const stmt = this.db.prepare(sql, { $ident: ident });
        const rows = NavigraphDfd.toCamel(query(stmt)) as TerminalWaypoint[];
        return rows.map(waypoint => {
            return {
                ident: waypoint.waypointIdentifier,
                databaseId: `W${waypoint.icaoCode}${waypoint.regionCode}${waypoint.waypointIdentifier}`,
                location: { lat: waypoint.waypointLatitude, lon: waypoint.waypointLongitude },
                name: waypoint.waypointName,
                type: waypoint.waypointType
            };
        });
    }

    async getAirportsByIdents(idents: string[]): Promise<Airport[]> {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM tbl_airports WHERE airport_identifier IN (${ idents.map(() => "?").join(",") })`;
            const stmt = this.db.prepare(sql, idents);
            try {
                const rows = query(stmt);
                const airports: NaviAirport[] = NavigraphDfd.toCamel(rows);
                resolve(airports.map((airport => NavigraphDfd.mapAirport(airport))));
            } finally {
                stmt.free();
            }
        });
    }

    async getRunwaysAtAirport(ident: string): Promise<Runway[]> {
        const sql = `SELECT * FROM tbl_runways WHERE airport_identifier = $ident`;
        const stmt = this.db.prepare(sql, { $ident: ident });
        try {
            const rows = NavigraphDfd.toCamel(query(stmt));
            return rows.map(runway => NavigraphDfd.mapRunway(runway));
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

            if (isPointInPolygon({latitude: 89.99, longitude: 0}, [southWestCorner, northEastCorner, northWestCorner, southEastCorner])) {
                // crossed the north pole, do a bodgie...
                southWestCorner.latitude = Math.min(southWestCorner.latitude, northWestCorner.latitude);
                northEastCorner.latitude = 90;
            } else if (isPointInPolygon({latitude: -89.99, longitude: 0}, [southWestCorner, northEastCorner, northWestCorner, southEastCorner])) {
                // crossed the south pole, do a bodgie...
                northEastCorner.latitude = Math.max(southWestCorner.latitude, northWestCorner.latitude);
                southWestCorner.latitude = -90;
            }

            let sql = "SELECT * FROM tbl_airports WHERE airport_ref_latitude >= ? AND airport_ref_latitude <= ?";

            if (southWestCorner.longitude > northEastCorner.longitude) {
                // wrapped around +/- 180
                // TODO this still isn't quite rihgt... 
                // we need two boxes, one either side of the pole
                sql += " AND (airport_ref_longitude <= ? OR airport_ref_longitude >= ?";
            } else {
                sql += " AND airport_ref_longitude <= ? AND airport_ref_longitude >= ?";
            }

            const rows = query(this.db.prepare(sql, [southWestCorner.latitude, northEastCorner.latitude, northEastCorner.longitude, southWestCorner.longitude]));
            if (rows.length < 1) {
                return reject('No airports found');
            }
            const airports: NaviAirport[] = NavigraphDfd.toCamel(rows);
            resolve(airports.map((airport) =>
            {
                const ap = NavigraphDfd.mapAirport(airport);
                ap.distance = getDistance(centre, {latitude: ap.location.lat, longitude: ap.location.lon}) / 1852;
                return ap;
            }).filter((ap) => (ap.distance ?? 0) <= range).sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0)));
        });
    }

    private static mapLegType(legType: string): LegType {
        switch (legType) {
            case 'IF':
                return LegType.IF;
            case 'TF':
                return LegType.TF;
            case 'CF':
                return LegType.CF;
            case 'DF':
                return LegType.DF;
            case 'FA':
                return LegType.FA;
            case 'FC':
                return LegType.FC;
            case 'FD':
                return LegType.FD;
            case 'FM':
                return LegType.FM;
            case 'CA':
                return LegType.CA;
            case 'CD':
                return LegType.CD;
            case 'CI':
                return LegType.CI;
            case 'CR':
                return LegType.CR;
            case 'RF':
                return LegType.RF;
            case 'AF':
                return LegType.AF;
            case 'VA':
                return LegType.VA;
            case 'VD':
                return LegType.VD;
            case 'VI':
                return LegType.VI;
            case 'VM':
                return LegType.VM;
            case 'VR':
                return LegType.VR;
            case 'PI':
                return LegType.PI;
            case 'HA':
                return LegType.HA;
            case 'HF':
                return LegType.HF;
            case 'HM':
                return LegType.HM;
        }
        return LegType.Unknown;
    }

    private static mapAltitudeDescriptor(desc: string): AltitudeDescriptor {
        switch (desc) {
            case '+':
                return AltitudeDescriptor.AtOrAboveAlt1;
            case '-':
                return AltitudeDescriptor.AtOrBelowAlt1;
            case '@':
            case '':
                return AltitudeDescriptor.AtAlt1;
            case 'B':
                return AltitudeDescriptor.BetweenAlt1Alt2;
            case 'C':
                return AltitudeDescriptor.AtOrAboveAlt2;
            case 'G':
                return AltitudeDescriptor.AtAlt1GsMslAlt2;
            case 'H':
                return AltitudeDescriptor.AtOrAboveAlt1GsMslAlt2;
            case 'I':
                return AltitudeDescriptor.AtAlt1GsIntcptAlt2;
            case 'J':
                return AltitudeDescriptor.AtOrAboveAlt1GsIntcptAlt2;
            case 'V':
                return AltitudeDescriptor.AtOrAboveAlt1AngleAlt2;
            case 'X':
                return AltitudeDescriptor.AtAlt1AngleAlt2;
            case 'Y':
                return AltitudeDescriptor.AtOrBelowAlt1AngleAlt2;
        }
        return AltitudeDescriptor.None;
    }

    private static mapSpeedLimitDescriptor(desc: string): SpeedDescriptor {
        switch (desc) {
            case '@':
            case '':
                return SpeedDescriptor.Mandatory;
            case '+':
                return SpeedDescriptor.Minimum;
            case '-':
                return SpeedDescriptor.Maximum;
        }
        return SpeedDescriptor.Mandatory;
    }

    private static mapTurnDirection(dir: string): TurnDirection {
        switch (dir) {
            case 'L':
                return TurnDirection.Left;
            case 'R':
                return TurnDirection.Right;
        }
        return TurnDirection.Unknown;
    }

    private static mapLegIdent(leg: NaviProcedure): string {
        return leg.waypointIdentifier ?? leg.seqno.toFixed(0); // TODO proper format
    }

    private static mapLeg(leg: NaviProcedure, icaoCode: string): ProcedureLeg {
        return {
            databaseId: NavigraphDfd.procedureDatabaseId(leg, icaoCode) + leg.seqno,
            ident: NavigraphDfd.mapLegIdent(leg),
            procedureIdent: leg.procedureIdentifier,
            type: NavigraphDfd.mapLegType(leg.pathTermination),
            waypoint: undefined, // TODO fetch these
            recommendedNavaid: undefined, // TODO fetch these
            rho: leg.rho,
            theta: leg.theta,
            arcCentreFix: undefined, // TODO fetch these
            arcRadius: leg.arcRadius,
            length: leg.distanceTime === 'D' ? leg.routeDistanceHoldingDistanceTime : undefined,
            lengthTime: leg.distanceTime === 'T' ? leg.routeDistanceHoldingDistanceTime : undefined,
            rnp: leg.rnp,
            transitionAltitude: leg.transitionAltitude,
            altitudeDescriptor: (!leg.altitude1 && !leg.altitude2) ? AltitudeDescriptor.None : this.mapAltitudeDescriptor(leg.altitudeDescription),
            altitude1: leg.altitude1,
            altitude2: leg.altitude2,
            speed: leg.speedLimit,
            speedDescriptor: leg.speedLimit ? NavigraphDfd.mapSpeedLimitDescriptor(leg.speedLimitDescription) : undefined,
            turnDirection: NavigraphDfd.mapTurnDirection(leg.turnDirection),
            magneticCourse: leg.magneticCourse,
        };
    }

    private static mapDepartures(legs: NaviProcedure[], icaoCode: string): Departure[] {
        let departures: Map<string, Departure> = new Map();

        // legs are sorted in sequence order by the db... phew
        legs.forEach((leg) => {
            if (!departures.has(leg.procedureIdentifier)) {
                departures.set(leg.procedureIdentifier, {
                    databaseId: NavigraphDfd.procedureDatabaseId(leg, icaoCode),
                    ident: leg.procedureIdentifier,
                    runwayTransitions: [],
                    commonLegs: [],
                    enrouteTransitions: [],
                    engineOutLegs: [],
                });
            }

            const apiLeg = NavigraphDfd.mapLeg(leg, icaoCode);
            const departure = departures.get(leg.procedureIdentifier);
            let transition;
            switch (leg.routeType) {
                case '0':
                    departure?.engineOutLegs.push(apiLeg);
                    break;
                case '1':
                case '4':
                case 'F':
                case 'T':
                    transition = departure?.runwayTransitions.find((t) => t.ident === leg.transitionIdentifier);
                    if (!transition) {
                        transition = {
                            ident: leg.transitionIdentifier,
                            legs: [],
                        }
                        departure?.runwayTransitions.push(transition);
                    }
                    transition.legs.push(apiLeg);
                    break;
                case '2':
                case '5':
                case 'M':
                    departure?.commonLegs.push(apiLeg);
                    break;
                case '3':
                case '6':
                case 'S':
                case 'V':
                    transition = departure?.enrouteTransitions.find((t) => t.ident === leg.transitionIdentifier);
                    if (!transition) {
                        transition = {
                            ident: leg.transitionIdentifier,
                            legs: [],
                        }
                        departure?.enrouteTransitions.push(transition);
                    }
                    transition.legs.push(apiLeg);
                    break;
                default:
                    console.error(`Unmappable leg ${apiLeg.ident}: ${leg.pathTermination} in ${leg.procedureIdentifier}: SID`);
            }
        });

        return Array.from(departures.values());
    }

    private static mapArrivals(legs: NaviProcedure[], icaoCode: string): Arrival[] {
        let arrivals: Map<string, Arrival> = new Map();

        // legs are sorted in sequence order by the db... phew
        legs.forEach((leg) => {
            if (!arrivals.has(leg.procedureIdentifier)) {
                arrivals.set(leg.procedureIdentifier, {
                    databaseId: NavigraphDfd.procedureDatabaseId(leg, icaoCode),
                    ident: leg.procedureIdentifier,
                    runwayTransitions: [],
                    commonLegs: [],
                    enrouteTransitions: [],
                });
            }

            const apiLeg = NavigraphDfd.mapLeg(leg, icaoCode);
            const arrival = arrivals.get(leg.procedureIdentifier);
            let transition;
            switch (leg.routeType) {
                case '1':
                case '4':
                case 'F':
                    transition = arrival?.enrouteTransitions.find((t) => t.ident === leg.transitionIdentifier);
                    if (!transition) {
                        transition = {
                            ident: leg.transitionIdentifier,
                            legs: [],
                        }
                        arrival?.enrouteTransitions.push(transition);
                    }
                    transition.legs.push(apiLeg);
                    break;
                case '2':
                case '5':
                case '8':
                case 'M':
                    arrival?.commonLegs.push(apiLeg);
                    break;
                case '3':
                case '6':
                case '9':
                case 'S':
                    transition = arrival?.runwayTransitions.find((t) => t.ident === leg.transitionIdentifier);
                    if (!transition) {
                        transition = {
                            ident: leg.transitionIdentifier,
                            legs: [],
                        }
                        arrival?.runwayTransitions.push(transition);
                    }
                    transition.legs.push(apiLeg);
                    break;
                default:
                    console.error(`Unmappable leg ${apiLeg.ident}: ${leg.pathTermination} in ${leg.procedureIdentifier}: STAR`);
            }
        });

        return Array.from(arrivals.values());
    }

    private static mapApproachType(routeType: string): ApproachType {
        switch (routeType) {
            case 'B':
                return ApproachType.LocBackcourse;
            case 'D':
                return ApproachType.VorDme;
            case 'F':
                return ApproachType.Fms;
            case 'G':
                return ApproachType.Igs;
            case 'I':
                return ApproachType.Ils;
            case 'J':
                return ApproachType.Gls;
            case 'L':
                return ApproachType.Loc;
            case 'M':
                return ApproachType.Mls;
            case 'N':
                return ApproachType.Ndb;
            case 'P':
                return ApproachType.Gps;
            case 'Q':
                return ApproachType.NdbDme;
            case 'R':
                return ApproachType.Rnav;
            case 'S':
                return ApproachType.Vortac;
            case 'T':
                return ApproachType.Tacan;
            case 'U':
                return ApproachType.Sdf;
            case 'V':
                return ApproachType.Vor;
            case 'W':
                return ApproachType.MlsTypeA;
            case 'X':
                return ApproachType.Lda;
            case 'Y':
                return ApproachType.MlsTypeBC;
        }
        return ApproachType.Unknown;
    }

    private static mapApproaches(legs: NaviProcedure[], icaoCode: string): Approach[] {
        let approaches: Map<string, Approach> = new Map();

        // legs are sorted in sequence order by the db... phew
        legs.forEach((leg) => {
            if (!approaches.has(leg.procedureIdentifier)) {
                approaches.set(leg.procedureIdentifier, {
                    databaseId: NavigraphDfd.procedureDatabaseId(leg, icaoCode),
                    ident: leg.procedureIdentifier,
                    type: ApproachType.Unknown,
                    transitions: [],
                    legs: [],
                    missedLegs: [],
                });
            }

            const apiLeg = NavigraphDfd.mapLeg(leg, icaoCode);
            const approach = approaches.get(leg.procedureIdentifier);
            let transition;
            switch (leg.routeType) {
                case 'A':
                    transition = approach?.transitions.find((t) => t.ident === leg.transitionIdentifier);
                    if (!transition) {
                        transition = {
                            ident: leg.transitionIdentifier,
                            legs: [],
                        }
                        approach?.transitions.push(transition);
                    }
                    transition.legs.push(apiLeg);
                    break;
                case 'B':
                case 'D':
                case 'F':
                case 'G':
                case 'I':
                case 'J':
                case 'L':
                case 'M':
                case 'N':
                case 'P':
                case 'Q':
                case 'R':
                case 'S':
                case 'T':
                case 'U':
                case 'V':
                case 'W':
                case 'X':
                case 'Y':
                    if (approach?.type === ApproachType.Unknown) {
                        approach.type = NavigraphDfd.mapApproachType(leg.routeType);
                    }
                    approach?.legs.push(apiLeg);
                    break;
                case 'Z':
                    approach?.missedLegs.push(apiLeg);
                    break;
                default:
                    console.error(`Unmappable leg ${apiLeg.ident}: ${leg.pathTermination} in ${leg.procedureIdentifier}: Approach`);
            }
        });

        return Array.from(approaches.values());
    }

    async getDepartures(ident: string): Promise<Departure[]> {
        // niggly that the the procedure legs are about the only thing in the whole db without icao code
        const ap = await this.getAirportsByIdents([ident]);
        return new Promise((resolve, reject) => {
            if (ap.length < 1) {
                return reject('Invalid airport');
            }
            const stmt = this.db.prepare('SELECT * FROM tbl_sids WHERE airport_identifier=$ident ORDER BY seqno ASC', { $ident: ident });
            try {
                const rows = query(stmt);
                if (rows.length < 1) {
                    reject('No departures!');
                }
                const departureLegs: NaviProcedure[] = NavigraphDfd.toCamel(rows);
                resolve(NavigraphDfd.mapDepartures(departureLegs, ap[0].icaoCode));
            } finally {
                stmt.free();
            }
        });
    }

    async getArrivals(ident: string): Promise<Arrival[]> {
        // niggly that the the procedure legs are about the only thing in the whole db without icao code
        const ap = await this.getAirportsByIdents([ident]);
        return new Promise((resolve, reject) => {
            if (ap.length < 1) {
                return reject('Invalid airport');
            }
            const stmt = this.db.prepare('SELECT * FROM tbl_stars WHERE airport_identifier=$ident ORDER BY seqno ASC', { $ident: ident });
            try {
                const rows = query(stmt);
                if (rows.length < 1) {
                    reject('No arrivals!');
                }
                const arrivalLegs: NaviProcedure[] = NavigraphDfd.toCamel(rows);
                resolve(NavigraphDfd.mapArrivals(arrivalLegs, ap[0].icaoCode));
            } finally {
                stmt.free();
            }
        });
    }

    async getApproaches(ident: string): Promise<Approach[]> {
        // niggly that the the procedure legs are about the only thing in the whole db without icao code
        const ap = await this.getAirportsByIdents([ident]);
        return new Promise((resolve, reject) => {
            if (ap.length < 1) {
                return reject('Invalid airport');
            }
            const stmt = this.db.prepare('SELECT * FROM tbl_iaps WHERE airport_identifier=$ident ORDER BY seqno ASC', { $ident: ident });
            try {
                const rows = query(stmt);
                if (rows.length < 1) {
                    reject('No arrivals!');
                }
                const approachLegs: NaviProcedure[] = NavigraphDfd.toCamel(rows);
                resolve(NavigraphDfd.mapApproaches(approachLegs, ap[0].icaoCode));
            } finally {
                stmt.free();
            }
        });
    }

    public static toCamel(query: any[]) {
        return query.map(obj => {
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
        })
    }

    public static capitalizeFirstLetter(text: string): string {
        return text.charAt(0).toUpperCase() + text.substring(1);
    }

    // The MSFS "icao" code is a pretty clever globally unique ID, so we follow it, and extend it where needed
    // It is important to ensure that these are truly globally unique
    private static airportDatabaseId(airport: NaviAirport): string {
        return `A      ${airport.airportIdentifier}`;
    }

    private static procedureDatabaseId(procedure: NaviProcedure, icaoCode: string): string {
        return `P${icaoCode}${procedure.airportIdentifier}${procedure.procedureIdentifier}`;
    }
}
