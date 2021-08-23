import { DatabaseItem, Feet, NauticalMiles } from "./Common";
import { Waypoint } from "./Waypoint";

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
    All,
    High,
    Low,
}

export enum AirwayDirection {
    Either,
    Forward,
    Backward,
}

export interface Airway extends DatabaseItem {
    level: AirwayLevel,
    fixes: Waypoint[],
    turnRadius?: NauticalMiles,
    rnp?: NauticalMiles,
    direction: AirwayDirection,
    minimumAltitudeForward?: Feet,
    minimumAltitudeBackward?: Feet,
    maximumAltitude?: Feet,
}
