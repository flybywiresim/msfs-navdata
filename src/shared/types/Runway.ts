import { Location, Degrees, DegreesTrue, DegreesMagnetic, Feet, Metres, LsCategory, DatabaseItem } from "./Common";

export interface Runway extends DatabaseItem {
    airportIdent: string;
    bearing: DegreesTrue;
    magneticBearing: DegreesMagnetic;
    gradient: Degrees;
    /**
     * Location, including altitude (if available), of the threshold
     */
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
