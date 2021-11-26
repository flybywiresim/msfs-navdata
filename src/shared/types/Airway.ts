import { DatabaseItem, Feet, Level, NauticalMiles } from './Common';
import { Waypoint } from './Waypoint';

export enum AirwayType {
    Airline,
    Control,
    Direct,
    Helicopter,
    Official,
    Rnav,
    Ats,
}

export enum AirwayDirection {
    Either,
    Forward,
    Backward,
}

export interface Airway extends DatabaseItem {
    level: Level,
    fixes: Waypoint[],
    turnRadius?: NauticalMiles,
    rnp?: NauticalMiles,
    direction: AirwayDirection,
    minimumAltitudeForward?: Feet,
    minimumAltitudeBackward?: Feet,
    maximumAltitude?: Feet,
}
