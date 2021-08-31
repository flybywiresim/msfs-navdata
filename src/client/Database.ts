import { Airport } from "../shared/types/Airport";
import { Approach } from "../shared/types/Approach";
import { Arrival } from "../shared/types/Arrival";
import { Departure } from "../shared/types/Departure";
import { Runway } from "../shared/types/Runway";
import { DatabaseBackend } from "./backends/Backend";
import {Airway, NdbNavaid, Waypoint} from "../shared";

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
            const runwayIdentifier = Database.approachToRunway(approach.ident)
            arrivals = arrivals.filter(arrival => arrival.runwayTransitions.find(trans => runwayIdentifier === null || trans.ident === runwayIdentifier))
        }
        return arrivals;
    }

    public async getApproaches(airportIdentifier: string, arrival?: Arrival): Promise<Approach[]> {
        let approaches = await this.backend.getApproaches(airportIdentifier);
        if(arrival) approaches = approaches.filter(approach => arrival.runwayTransitions.find(trans => {
                return Database.approachToRunway(approach.ident) === null || trans.ident === Database.approachToRunway(approach.ident)
            }
        ));
        return approaches;
    }

    public async getTerminalWaypoints(airportIdentifier: string): Promise<Waypoint[]> {
        return this.backend.getWaypointsAtAirport(airportIdentifier);
    }

    public async getTerminalNdbs(airportIdentifier: string): Promise<NdbNavaid[]> {
        return this.backend.getNdbsAtAirport(airportIdentifier);
    }

    public async getAirways(idents: string[]): Promise<Airway[]> {
        return this.backend.getAirwaysByIdents(idents);
    }

    /** Returns the identifier of the runway attached to the approach, null if it is not specific to any runway */
    public static approachToRunway(ident: string): string | null {
        if(!ident.match(/\d+/g))
            return null;
        switch(ident[3]) {
            case 'L':
            case 'C':
            case 'R':
                return (`RW${ident.substr(1, 3)}`);
            default:
                return (`RW${ident.substr(1, 2)}`);
        }
    }
}
