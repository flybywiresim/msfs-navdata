import { Airport } from "../../shared/types/Airport";
import { Approach } from "../../shared/types/Approach";
import { Arrival } from "../../shared/types/Arrival";
import { DatabaseIdent } from "../../shared/types/DatabaseIdent";
import { Departure } from "../../shared/types/Departure";
import { Runway } from "../../shared/types/Runway";
import { Waypoint } from "../../shared/types/Waypoint";
import { NdbNavaid } from "../../shared/types/NdbNavaid";
import { Airway } from "../../shared/types/Airway";

export abstract class Provider {
    abstract getDatabaseIdent(): Promise<DatabaseIdent>;
    abstract getAirportsByIdents(idents: string[]): Promise<Airport[]>;
    abstract getRunwaysAtAirport(ident: string): Promise<Runway[]>;
    abstract getWaypointsAtAirport(ident: string): Promise<Waypoint[]>;
    abstract getNDBsAtAirport(ident: string): Promise<NdbNavaid[]>;
    abstract getWaypointsByIdent(ident: string): Promise<Waypoint[]>;
    /**
     * Find all the airports within range
     * @param lat
     * @param lon
     * @param range nautical miles
     * @returns list of airports sorted from nearest to furthest
     */
    abstract getNearbyAirports(lat: number, lon: number, range: number): Promise<Airport[]>;
    abstract getDepartures(ident: string): Promise<Departure[]>;
    abstract getArrivals(ident: string): Promise<Arrival[]>;
    abstract getApproaches(ident: string): Promise<Approach[]>;
    abstract getAirwaysByIdents(idents: string[]): Promise<Airway[]>;
    abstract getAirwaysByFix(idents: string): Promise<Airway[]>;
}
