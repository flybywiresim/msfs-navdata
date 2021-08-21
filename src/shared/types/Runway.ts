import { Location, Degrees, DegreesTrue, DegreesMagnetic, Feet, Metres, LsCategory, DatabaseItem } from "./Common";

export interface Runway extends DatabaseItem {
    airportIdent: string;
    centreLocation: Location;
    bearing: DegreesTrue;
    magneticBearing: DegreesMagnetic;
    gradient: Degrees;
    thresholdLocation: Location;
    thresholdCrossingHeight: Feet;
    length: Metres;
    width: Metres;
    lsIdent: string;
    lsCategory: LsCategory;
    surfaceType?: RunwaySurfaceType;
}

export enum RunwaySurfaceType {
    Unknown,
    Hard,
    Soft,
    Water,
}
