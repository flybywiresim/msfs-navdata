import { Coordinates, NauticalMiles } from 'msfs-geo';
import { Airport } from './types/Airport';
import { Departure } from './types/Departure';
import { Arrival } from './types/Arrival';
import { Approach } from './types/Approach';
import { DatabaseIdent } from './types/DatabaseIdent';
import { Waypoint } from './types/Waypoint';
import { NdbNavaid, NdbClass } from './types/NdbNavaid';
import { IlsNavaid } from './types/IlsNavaid';
import { Runway, RunwaySurfaceType } from './types/Runway';
import { Airway, AirwayLevel } from './types/Airway';
import { VhfNavaid, VhfNavaidType, VorClass } from './types/VhfNavaid';
import { AirportCommunication } from './types/Communication';
import { ControlledAirspace, RestrictiveAirspace } from './types/Airspace';

// FIXME move to more appropriate place..
export enum NavaidArea {
    Terminal = 1 << 0,
    EnRoute = 1 << 1,
}

export interface DataInterface {
    getDatabaseIdent(): Promise<DatabaseIdent>;

    getAirports(idents: string[]): Promise<Airport[]>;
    getDepartures(airportIdentifier: string): Promise<Departure[]>;
    getArrivals(airportIdentifier: string): Promise<Arrival[]>;
    getApproaches(airportIdentifier: string): Promise<Approach[]>;
    getRunways(airportIdentifier: string): Promise<Runway[]>;

    getWaypointsAtAirport(airportIdentifier: string): Promise<Waypoint[]>;
    getNdbsAtAirport(airportIdentifier: string): Promise<NdbNavaid[]>;
    getIlsAtAirport(airportIdentifier: string): Promise<IlsNavaid[]>;
    getCommunicationsAtAirport(airportIdentifier: string): Promise<AirportCommunication[]>

    getWaypoints(idents: string[], ppos?: Coordinates, icaoCode?: string, airportIdent?: string): Promise<Waypoint[]>;
    getNdbNavaids(idents: string[], ppos?: Coordinates, icaoCode?: string, airportIdent?: string): Promise<NdbNavaid[]>;
    getVhfNavaids(idents: string[], ppos?: Coordinates, icaoCode?: string, airportIdent?: string): Promise<VhfNavaid[]>;

    getAirways(idents: string[]): Promise<Airway[]>;
    getAirwaysByFix(ident: string, icaoCode: string): Promise<Airway[]>;

    getNearbyAirports(center: Coordinates, range: NauticalMiles, longestRunwaySurfaces?: RunwaySurfaceType): Promise<Airport[]>;
    getNearbyAirways(center: Coordinates, range: NauticalMiles, levels?: AirwayLevel): Promise<Airway[]>;
    getNearbyVhfNavaids(centre: Coordinates, range: number, classes?: VorClass, types?: VhfNavaidType): Promise<VhfNavaid[]>;
    getNearbyNdbNavaids(center: Coordinates, range: NauticalMiles, classes?: NdbClass): Promise<NdbNavaid[]>;
    getNearbyWaypoints(center: Coordinates, range: NauticalMiles): Promise<Waypoint[]>;

    getControlledAirspaceInRange(center: Coordinates, range: NauticalMiles): Promise<ControlledAirspace[]>;
    getRestrictiveAirspaceInRange(center: Coordinates, range: NauticalMiles): Promise<RestrictiveAirspace[]>;
}
