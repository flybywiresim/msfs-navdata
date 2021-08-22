import { getBoundsOfDistance, getDistance, isPointInPolygon } from 'geolib';
import { Header } from './types/Header';
import { DatabaseIdent } from '../../../shared/types/DatabaseIdent';
import { Airport as NaviAirport } from './types/Airports';
import { Airport } from '../../../shared/types/Airport';
import { RunwaySurfaceType } from '../../../shared/types/Runway';
import { Provider } from '../provider';
import fs from 'fs';
import initSqlJs, { BindParams, Database, Statement } from 'sql.js';

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
            const sql = "SELECT current_airac, effective_fromto FROM tbl_header";
            const stmt = this.db.prepare(sql);
            const headers: Header[] = NavigraphDfd.toCamel(query(stmt));
            const result: DatabaseIdent = {
                provider: 'Navigraph',
                airacCycle: headers[0].currentAirac,
                dateFromTo: headers[0].effectiveFromto,
            };
            resolve(result);
        });
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

    async getAirportsByIdents(idents: string[]): Promise<Airport[]> {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM tbl_airports WHERE airport_identifier IN (${ idents.map(() => "?").join(",") })`;
            const stmt = this.db.prepare(sql, idents);
            const rows = query(stmt);
            const airports: NaviAirport[] = NavigraphDfd.toCamel(rows);
            resolve(airports.map((airport => NavigraphDfd.mapAirport(airport))));
        });
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

    private static airportDatabaseId(airport: NaviAirport): string {
        return `A      ${airport.airportIdentifier}`;
    }
}
