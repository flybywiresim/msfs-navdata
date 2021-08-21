import sqlite3 from 'sqlite3';
import { getBoundsOfDistance, getDistance, isPointInPolygon } from 'geolib';
import { Header } from './types/Header';
import { DatabaseIdent } from '../../../shared/types/DatabaseIdent';
import { Airport as NaviAirport } from './types/Airports';
import { Airport } from '../../../shared/types/Airport';
import { RunwaySurfaceType } from '../../../shared/types/Runway';
import { Provider } from '../provider';

export class NavigraphDfd implements Provider {
    private db;

    constructor(db_path: string) {
        this.db = new sqlite3.Database(db_path, err => {
            if (err) {
                return console.error(err.message);
            }
            console.log('Successful connection to the database');
        });
    }

    async getDatabaseIdent(): Promise<DatabaseIdent> {
        return new Promise((resolve, reject) => {
            const sql = "SELECT current_airac FROM tbl_header";
            this.db.all(sql, [], (err, rows) => {
                if (err) {
                    return reject(err.message);
                }
                const headers: Header[] = NavigraphDfd.toCamel(rows);
                if (headers.length > 1) {
                    console.warn('Multiple rows in tbl_header!');
                }
                const result: DatabaseIdent = {
                    provider: 'Navigraph',
                    airacCycle: headers[0].currentAirac,
                    dateFromTo: headers[0].effectiveFromto,
                };
                resolve(result);
            });
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
            location: { lat: airport.airportRefLatitude, long: airport.airportRefLongitude, alt: airport.elevation },
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
            this.db.all(sql, idents, (err, rows) => {
                if (err) {
                    return reject(err.message);
                }
                const airports: NaviAirport[] = NavigraphDfd.toCamel(rows);
                resolve(airports.map((airport => NavigraphDfd.mapAirport(airport))));
            });
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
                sql += " AND (airport_ref_longitude <= ? OR airport_ref_longitude >= ?)";
            } else {
                sql += " AND airport_ref_longitude <= ? AND airport_ref_longitude >= ?";
            }

            this.db.all(sql, [southWestCorner.latitude, northEastCorner.latitude, northEastCorner.longitude, southWestCorner.longitude], (err, rows) => {
                if (err) {
                    return reject(err.message);
                } else if (rows.length < 1) {
                    return reject('No airports found');
                }
                const airports: NaviAirport[] = NavigraphDfd.toCamel(rows);
                resolve(airports.map((airport) => {
                    const ap = NavigraphDfd.mapAirport(airport);
                    ap.distance = getDistance(centre, { latitude: ap.location.lat, longitude: ap.location.long }) / 1852;
                    return ap;
                }).filter((ap) => (ap.distance ?? 0) <= range).sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0)));
            });
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
