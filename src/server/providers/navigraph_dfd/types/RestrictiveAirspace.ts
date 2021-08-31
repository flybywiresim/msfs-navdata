import { BoundaryVia } from './ControlledAirspace';
import { FlightLevel } from './EnrouteAirways';

type RestrictiveAirspaceType =
    /** Alert */
    'A' |
    /** Caution */
    'C' |
    /** Danger */
    'D' |
    /** Military Operations Area */
    'M' |
    /** Prohabited */
    'P' |
    /** Restricted */
    'R' |
    /** Training */
    'T' |
    /** Warning */
    'W' |
    /** Unknown */
    'U';
export type RestrictiveAirspace = {
    /** geographical area of the airspace */
    areaCode: string;
    /** location indicator of the airspace */
    icaoCode: string;
    /** contains the number or name that uniquely identifies the restrictive airspace */
    restrictiveAirspaceDesignation: string;
    /** name of the restrictive airspace when assigned */
    restrictiveAirspaceName: string;
    /** indicates the type of Airspace in which the flight of aircraft is prohibited or restricted */
    restrictiveType: RestrictiveAirspaceType;
    /** indicates Restrictive Airspace having the same designator but subdivided or differently divided by lateral and/or vertical detail */
    multipleCode: string;
    /** sort order of each airspace, no duplicate sequences per airspace are possible */
    seqno: number;
    /** defines the path of the boundary from the position identified in the record to the next defined position */
    boundaryVia: `${BoundaryVia}${'E' | ''}`;
    /** defines the airway structure */
    flightlevel: FlightLevel;
    /** latitude in degrees decimal floating point (N positive, S negative) */
    latitude: number;
    /** longitude in degrees decimal floating point (E positive, W negative) */
    longitude: number;
    /** arc origin latitude in degrees decimal floating point (N positive, S negative) */
    arcOriginLatitude: number;
    /** arc origin longitude in degrees decimal floating point (E positive, W negative) */
    arcOriginLongitude: number;
    /** define the distance in nautical miles from the "Arc Origin" position */
    arcDistance: number;
    /** contains the true bearing from the "Arc Origin" position to the beginning of the arc */
    arcBearing: number;
    /** specified as "above mean sea level" (MSL) or "above ground level" (AGL) */
    unitIndicatorLowerLimit: string;
    /** contains the lower limits of the FIR */
    lowerLimit: string;
    /** specified as "above mean sea level" (MSL) or "above ground level" (AGL) */
    unitIndicatorUpperLimit: string;
    /** contains the upper limits of the FIR */
    upperLimit: string;
}
