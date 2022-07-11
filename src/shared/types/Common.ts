import { Coordinates, Feet } from 'msfs-geo';
import { Airport } from './Airport';
import { GlsNavaid } from './GlsNavaid';
import { IlsNavaid } from './IlsNavaid';
import { NdbNavaid } from './NdbNavaid';
import { ProcedureLeg } from './ProcedureLeg';
import { Runway } from './Runway';
import { VhfNavaid } from './VhfNavaid';
import { Waypoint } from './Waypoint';

export type FeetPerMinute = number;
export type FlightLevel = number;
export type KiloHertz = number;
export type Knots = number;
export type MegaHertz = number;
export type Minutes = number;

export enum Area {
    Terminal = 1 << 0,
    EnRoute = 1 << 1,
}

export interface DatabaseItem {
    /**
     * Globally unique ID
     * Should _not_ be used for any purpose other than comparing equality
     * between objects from the nav database (i.e. check if your tuned VOR is the same as a waypoint)
     */
    databaseId: string,
    /**
     * ICAO region code (2 letter)
     */
    icaoCode: string,
    ident: string,
}

export interface ElevatedCoordinates extends Coordinates {
    alt: Feet,
}

export enum LsCategory {
    None,
    LocOnly,
    Category1,
    Category2,
    Category3,
    IgsOnly,
    LdaGlideslope,
    LdaOnly,
    SdfGlideslope,
    SdfOnly,
}

export interface ProcedureTransition {
    ident: string,
    legs: ProcedureLeg[],
}

export enum FixType {
    Airport,
    GlsNavaid,
    IlsNavaid,
    NdbNavaid,
    Runway,
    VhfNavaid,
    Waypoint,
}

export enum FixTypeFlags {
    Airport = 1 << 0,
    GlsNavaid = 1 << 1,
    IlsNavaid = 1 << 2,
    NdbNavaid = 1 << 3,
    Runway = 1 << 4,
    VhfNavaid = 1 << 5,
    Waypoint = 1 << 6,
}

export type PopulatedFix = Airport | GlsNavaid | IlsNavaid | NdbNavaid | Runway | VhfNavaid | Waypoint;
export type EnrouteFix = NdbNavaid | VhfNavaid | Waypoint;
export type StandaloneFix = EnrouteFix | Airport;
export type Navaid = GlsNavaid | IlsNavaid | NdbNavaid | VhfNavaid;
export type AirportFix = GlsNavaid | IlsNavaid | Runway;

export interface Fix extends DatabaseItem {
    fixType: FixType,
    location: Coordinates,
    airportIdent?: string,
}
