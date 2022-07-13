import { Feet, NauticalMiles } from 'msfs-geo';
import { Fix } from './Fix';

export enum AirwayType {
    Airline,
    Control,
    Direct,
    Helicopter,
    Official,
    Rnav,
    Ats,
}

export enum AirwayLevel {
    Both = 1 << 0,
    High = 1 << 1,
    Low = 1 << 2,
}

export enum AirwayDirection {
    Either,
    Forward,
    Backward,
}

export interface Airway {
    databaseId: string,
    ident: string,
    level: AirwayLevel,
    fixes: Fix[],
    turnRadius?: NauticalMiles,
    rnp?: NauticalMiles,
    direction: AirwayDirection,
    minimumAltitudeForward?: Feet,
    minimumAltitudeBackward?: Feet,
    maximumAltitude?: Feet,
}
