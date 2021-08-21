import { FlightLevel } from "./EnrouteAirways"

type AirspaceType =
    /** Class C Airspace (USA) */
     'A' |
    /** Control Area, ICAO Designation (CTA) */
     'C' |
    /** Control Area, ICAO Designation (CTA) */
     'K' |
    /** Terminal Control Area, ICAO Designation (TMA or TCA) */
     'M' |
    /** Military Control Zone (MCTR) */
     'Q' |
    /** Radar Zone or Radar Area (USA) */
     'R' |
    /** Class B Airspace (USA) */
     'T' |
    /** Terminal Control Area (TCA) */
     'W' |
    /** Terminal Area (TMA) */
     'X' |
    /** Terminal Radar Service Area (TRSA) */
     'Y' |
    /** Class D Airspace, ICAO Designation (CTR) */
     'Z'
type TimeCode =
    /** active continuously, including holidays */
     'C' |
    /** active continuously, excluding holidays */
     'H' |
    /** active none continuously, refer to continuation records */
     'N' |
    /** active times announced by Notams */
     ''
export type BoundaryVia =
    /** Circle */
     'C' |
    /** Great Circle */
     'G' |
    /** Rhumb Line */
     'H' |
    /** Counter Clockwise ARC */
     'L' |
    /** Clockwise ARC */
     'R';
export type ControlledAirspace = {
    /** geographical area */
    areaCode: string;
    /** location indicator of the airspace center */
    icaoCode: string;
    /** defines the navigation element upon which the controlled airspace being defined is predicated, but not necessarily centered */
    airspaceCenter: string;
    /** the name of the controlled airspace when assigned */
    controlledAirspaceName: string;
    /** indicate the type of controlled airspace */
    airspaceType: AirspaceType;
    /** indicating the published classification of the controlled airspace, when assigned */
    airspaceClassification: string;
    /** indicate Restrictive Airspace having the same designator but subdivided or differently divided by lateral and/or vertical detail */
    multipleCode: string;
    /** Active Time */
    timeCode: TimeCode;
    /** sort order of each airspace, no duplicate sequences per airspace are possible */
    seqno: number;
    /** defines the airway structure */
    flightlevel: FlightLevel;
    /** defines the path of the boundary from the position identified in the record to the next defined position */
    boundaryVia: `${BoundaryVia}${'E' | ''}`;
    /** latitude in degrees decimal floating point (N positive, S negative) */
    latitude: number;
    /** longitude in degrees decimal floating point (E positive, W negative) */
    longitude: number;
    /** arc origin latitude in degrees decimal floating point (N positive, S negative) */
    arcOriginLatitude: number;
    /** arc origin longitude in degrees decimal floating point (E positive, W negative) */
    arcOriginLongitude: number;
    /** defines the distance in nautical miles from the "Arc Origin" position */
    arcDistance: number;
    /** contains the true bearing from the "Arc Origin" position to the beginning of the arc */
    arcBearing: number;
    /** specified as "above mean sea level" (MSL) or "above ground level" (AGL) */
    unitIndicatorLowerLimit: string;
    /** contains the lower limits */
    lowerLimit: string;
    /** specified as "above mean sea level" (MSL) or "above ground level" (AGL) */
    unitIndicatorUpperLimit: string;
    /** contain the upper limits */
    upperLimit: string;
}
