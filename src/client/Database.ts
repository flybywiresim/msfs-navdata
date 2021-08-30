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

    public async getRunways(airportIdentifier: string, procedure?: Departure | Arrival): Promise<Runway[]> {
        let runways = await this.backend.getRunways(airportIdentifier);
        if(procedure) {
            runways = runways.filter(runway => procedure.runwayTransitions.find(trans => trans.ident === runway.ident))
        }
        return runways;
    }

    public async getDepartures(airportIdentifier: string, runwayIdentifier?: string): Promise<Departure[]> {
        let departures = await this.backend.getDepartures(airportIdentifier);
        if(runwayIdentifier) {
            departures = departures.filter(departure => departure.runwayTransitions.find(trans => trans.ident === runwayIdentifier))
        }
        return departures;
    }

    public async getArrivals(airportIdentifier: string, approach?: Approach): Promise<Arrival[]> {
        let arrivals = await this.backend.getArrivals(airportIdentifier);
        if(approach) {
            //TODO: Properly determine runway based on approach ident properly, this is very unsafe right now
            const runwayIdentifier = approach.ident.substring(1)
            arrivals = arrivals.filter(arrival => arrival.runwayTransitions.find(trans => trans.ident === runwayIdentifier))
        }
        return arrivals;
    }

    public async getApproaches(airportIdentifier: string, arrival?: Arrival): Promise<Approach[]> {
        let approaches = await this.backend.getApproaches(airportIdentifier);
        if(arrival) approaches = approaches.filter(approach => arrival.runwayTransitions.find(trans =>
            //TODO: SAME HERE
            trans.ident === approach.ident.substring(1)
        ));
        return approaches;
    }
}
