import sqlite3 from 'sqlite3';
import { Header } from './types/Header';
import { DatabaseIdent } from '../../../shared/types/DatabaseIdent';

export class NavigraphDfd {
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
                    reject(err.message);
                }
                const headers: Header[] = NavigraphDfd.toCamel(rows);
                if (headers.length > 1) {
                    console.warn('Multiple rows in tbl_header!');
                }
                const result: DatabaseIdent = {
                    provider: 'Navigraph',
                    airacCycle: headers[0].currentAirac,
                };
                resolve(result);
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

    static capitalizeFirstLetter(text: string): string {
        return text.charAt(0).toUpperCase() + text.substring(1);
    }
}
