import { ProcedureLeg } from './ProcedureLeg';

export type Degrees = number;
export type DegreesMagnetic = Degrees;
export type DegreesTrue = Degrees;
export type Feet = number;
export type FeetPerMinute = number;
export type FlightLevel = number;
export type KiloHertz = number;
export type Knots = number;
export type Latitude = Degrees;
export type Longitude = Degrees;
export type MegaHertz = number;
export type Metres = number;
export type Minutes = number;
export type NauticalMiles = number;

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

export interface Location {
    lat: Latitude,
    lon: Longitude,
    alt?: Feet,
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

export enum Level {
    All,
    High,
    Low,
}
