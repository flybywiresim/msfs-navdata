import { Coordinates, Degrees, DegreesMagnetic, DegreesTrue, Feet, Metres } from 'msfs-geo';
import {
    LsCategory,
    ElevatedCoordinates,
} from './Common';
import {
    Fix,
    FixType,
} from './Fix';

export interface Runway extends Fix {
    fixType: FixType.Runway;
    airportIdent: string,
    bearing: DegreesTrue,
    magneticBearing: DegreesMagnetic,
    /**
     * slope of the runway, negative for downhill
     */
    gradient: Degrees,
    startLocation: Coordinates,
    /**
     * Location, including altitude (if available), of the threshold
     */
    location: ElevatedCoordinates,
    thresholdCrossingHeight: Feet,
    // TODO is this TORA, ASDA, LDW, ???
    length: Metres,
    width: Metres,
    lsFrequencyChannel?: number,
    lsIdent: string,
    lsCategory?: LsCategory,
    surfaceType?: RunwaySurfaceType,
}

export enum RunwaySurfaceType {
    Unknown = 1 << 0,
    Hard = 1 << 1,
    Soft = 1 << 2,
    Water = 1 << 3,
}
