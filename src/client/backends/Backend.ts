import { Airport } from "../../shared/types/Airport";
import { Airway } from "../../shared/types/Airway";
import { Approach } from "../../shared/types/Approach";
import { Arrival } from "../../shared/types/Arrival";
import { Departure } from "../../shared/types/Departure";
import { Runway } from "../../shared/types/Runway";
import {NdbNavaid, Waypoint} from "../../shared";

export abstract class DatabaseBackend {
    abstract getAirportsByIdent(idents: string[]): Promise<Airport[]>;
    abstract getNearbyAirports(lat: number, lon: number, range?: number): Promise<Airport[]>;
    abstract getRunways(airportIdentifier: string): Promise<Runway[]>;
    abstract getDepartures(airportIdentifier: string): Promise<Departure[]>;
    abstract getArrivals(airportIdentifier: string): Promise<Arrival[]>;
    abstract getApproaches(airportIdentifier: string): Promise<Approach[]>;
    abstract getWaypointsAtAirport(ident: string): Promise<Waypoint[]>;
    abstract getNdbsAtAirport(ident: string): Promise<NdbNavaid[]>;
    abstract getAirwaysByIdents(idents: string[]): Promise<Airway[]>;
    abstract getAirwaysByFix(ident: string): Promise<Airway[]>;
}
