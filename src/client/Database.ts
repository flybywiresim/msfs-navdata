import { Airport } from "../shared/types/Airport";
import { Approach } from "../shared/types/Approach";
import { Arrival } from "../shared/types/Arrival";
import { Departure } from "../shared/types/Departure";
import { Runway } from "../shared/types/Runway";
import { DatabaseBackend } from "./backends/Backend";

export class Database {
    backend: DatabaseBackend;

    constructor(backend: DatabaseBackend) {
        this.backend = backend;
    }

    public async getAirportByIdent(ident: string): Promise<Airport | null> {
        const airports = await this.backend.getAirportsByIdent([ident]);
        if (airports.length < 1) {
            return null;
        }
        return airports[0];
    }

    public async getAirportsByIdent(idents: string[]): Promise<Airport[]> {
        return await this.backend.getAirportsByIdent(idents);
    }

    public async getNearbyAirports(lat: number, lon: number, range?: number): Promise<Airport[]> {
        return await this.backend.getNearbyAirports(lat, lon, range);
    }

    public async getRunways(airportIdentifier: string): Promise<Runway[]> {
        return await this.backend.getRunways(airportIdentifier);
    }

    public async getDepartures(airportIdentifier: string): Promise<Departure[]> {
        return await this.backend.getDepartures(airportIdentifier);
    }

    public async getArrivals(airportIdentifier: string): Promise<Arrival[]> {
        return await this.backend.getArrivals(airportIdentifier);
    }

    public async getApproaches(airportIdentifier: string): Promise<Approach[]> {
        return await this.backend.getApproaches(airportIdentifier);
    }
}
