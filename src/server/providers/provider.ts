import { Airport } from "../../shared/types/Airport";
import { DatabaseIdent } from "../../shared/types/DatabaseIdent";

export abstract class Provider {
    abstract getDatabaseIdent(): Promise<DatabaseIdent>;
    abstract getAirportByIdent(ident: string): Promise<Airport>;
    /**
     * Find all the airports within range
     * @param lat 
     * @param lon 
     * @param range nautical miles
     * @returns list of airports sorted from nearest to furthest
     */
    abstract getNearbyAirports(lat: number, lon: number, range: number): Promise<Airport[]>;
}
