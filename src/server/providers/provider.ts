import { Airport } from "../../shared/types/Airport";
import { DatabaseIdent } from "../../shared/types/DatabaseIdent";
import { Runway } from "../../shared/types/Runway";
import {Waypoint} from "../../shared/types/Waypoint";
import {NdbNavaid} from "../../shared/types/NdbNavaid";

export abstract class Provider {
    abstract getDatabaseIdent(): Promise<DatabaseIdent>;
    abstract getAirportsByIdents(idents: string[]): Promise<Airport[]>;
    abstract getRunwaysAtAirport(ident: string): Promise<Runway[]>;
    abstract getWaypointsAtAirport(ident: string): Promise<Waypoint[]>;
    abstract getNDBsAtAirport(ident: string): Promise<NdbNavaid[]>;
    /**
     * Find all the airports within range
     * @param lat
     * @param lon
     * @param range nautical miles
     * @returns list of airports sorted from nearest to furthest
     */
    abstract getNearbyAirports(lat: number, lon: number, range: number): Promise<Airport[]>;
}
