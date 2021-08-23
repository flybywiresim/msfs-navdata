import { ProcedureLeg } from "./ProcedureLeg";

export type Degrees = number;
export type DegreesMagnetic = Degrees;
export type DegreesTrue = Degrees;
export type Feet = number;
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
    // unique ID that can be used to compare objects
    databaseId: string,
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
