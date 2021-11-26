import { Airport } from './types/Airport';
import { Departure } from './types/Departure';
import { Arrival } from './types/Arrival';
import { Approach } from './types/Approach';
import { DatabaseIdent } from './types/DatabaseIdent';
import { Waypoint } from './types/Waypoint';
import { NdbNavaid } from './types/NdbNavaid';
import { IlsNavaid } from './types/IlsNavaid';
import { Runway } from './types/Runway';
import { Airway } from './types/Airway';
import { VhfNavaid } from './types/VhfNavaid';
import { NauticalMiles, Location } from './types/Common';
import { AirportCommunication } from './types/Communication';
import { ControlledAirspace, RestrictiveAirspace } from './types/Airspace';

export enum HeightSearchRange {
    Both,
    Low,
    High,
}

export enum ZoneSearchRange {
    Both,
    Terminal,
    EnRoute,
}

export interface DataInterface {
    getDatabaseIdent(): Promise<DatabaseIdent>;

    getAirports(idents: string[]): Promise<Airport[]>;
    getDepartures(airportIdentifier: string): Promise<Departure[]>;
    getArrivals(airportIdentifier: string): Promise<Arrival[]>;
    getApproaches(airportIdentifier: string): Promise<Approach[]>;
    getRunways(airportIdentifier: string): Promise<Runway[]>;

    getWaypointsAtAirport(airportIdentifier: string): Promise<Waypoint[]>;
    getNDBsAtAirport(airportIdentifier: string): Promise<NdbNavaid[]>;
    getIlsAtAirport(airportIdentifier: string): Promise<IlsNavaid[]>;
    getCommunicationsAtAirport(airportIdentifier: string): Promise<AirportCommunication[]>

    getWaypoints(idents: string[]): Promise<Waypoint[]>;
    getNDBs(idents: string[]): Promise<NdbNavaid[]>;
    getNavaids(idents: string[]): Promise<VhfNavaid[]>;

    getAirways(idents: string[]): Promise<Airway[]>;
    getAirwaysByFix(ident: string, icaoCode: string): Promise<Airway[]>;

    getAirportsInRange(center: Location, range: NauticalMiles): Promise<Airport[]>;
    getAirwaysInRange(center: Location, range: NauticalMiles, searchRange?: HeightSearchRange): Promise<Airway[]>;
    getNavaidsInRange(center: Location, range: NauticalMiles, searchRange?: HeightSearchRange): Promise<VhfNavaid[]>;
    getNDBsInRange(center: Location, range: NauticalMiles, searchRange?: ZoneSearchRange): Promise<NdbNavaid[]>;
    getWaypointsInRange(center: Location, range: NauticalMiles, searchRange?: ZoneSearchRange): Promise<Waypoint[]>;

    getControlledAirspaceInRange(center: Location, range: NauticalMiles): Promise<ControlledAirspace[]>

    getRestrictiveAirspaceInRange(center: Location, range: NauticalMiles): Promise<RestrictiveAirspace[]>
}
