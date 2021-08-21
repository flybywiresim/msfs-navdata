import { BoundaryVia } from "./ControlledAirspace";
import { CruiseTableIdentifier } from "./CruisingTable";

type FiruirAdress =
    /** related to an IFR Flight */
     'ZQZX' |
    /** related to an VFR Flight */
     'ZFZX' |
    /** related to an Oceanic FIR/UIR */
     'ZOZX' |
    /** related to all other FIR/UIR */
     'ZRZX';
type FirUirIndicator =
    /** FIR */
    'F' |
    /** UIR */
    'U' |
    /** Combined FIR/UIR */
    'B';
type ReportingUnitsSpeed =
    /** not specified */
    0 |
    /** TAS in Knots */
    1 |
    /** TAS in Mach */
    2 |
    /** TAS in Kilometer/hour */
    3;
type ReportingUnitsAltitude =
    /** not specified */
    0 |
    /** Altitude in Flightlevel */
    1 |
    /** Altitude in Meters */
    2 |
    /** Altitude in Feet */
    3;
export type FirUir = {
    /** geographical area */
    areaCode: string;
    /** identifies the Flight Information Region and Upper Information Region of airspace */
    firUirIdentifier: string;
    /** communication address of the FIR/UIR to supplement the FIR/UIR ident */
    firUirAdress: FiruirAdress;
    /** the name of the controlled airspace when assigned */
    firUirName: string;
    /** indicate the type of controlled airspace */
    firUirIndicator: FirUirIndicator;
    /** sort order of each airspace, no duplicate sequences per airspace are possible */
    seqno: number;
    /** defines the path of the boundary from the position identified in the record to the next defined position */
    boundaryVia: `${BoundaryVia}${'E' | ''}`;
    /** identifies the Flight Information Region and Upper Information Region of airspace */
    adjacentFirIdentifier: string;
    /** identifies the Flight Information Region and Upper Information Region of airspace */
    adjacentUirIdentifier: string;
    /** indicate the units of measurement concerning True Air Speed used in the specific FIR/UIR */
    reportingUnitsSpeed: ReportingUnitsSpeed;
    /** indicate the units of measurement concerning the altitude used in the specific FIR/UIR */
    reportingUnitsAltitude: ReportingUnitsAltitude;
    /** FIR/UIR latitude in degrees decimal floating point (N positive, S negative) */
    firUirLatitude: number;
    /** FIR/UIR longitude in degrees decimal floating point (E positive, W negative) */
    firUirLongitude: number;
    /** arc origin latitude in degrees decimal floating point (N positive, S negative) */
    arcOriginLatitude: number;
    /** arc origin longitude in degrees decimal floating point (E positive, W negative) */
    arcOriginLongitude: number;
    /** define the distance in nautical miles from the "Arc Origin" position */
    arcDistance: number;
    /** contains the true bearing from the "Arc Origin" position to the beginning of the arc */
    arcBearing: number;
    /** contains the FIR upper limits */
    firUpperLimit: number;
    /** contain the UIR lower limits */
    uirLowerLimit: number;
    /** contain the UIR upper limits */
    uirUpperLimit: number;
    /** indicate the cruising table */
    cruiseTableIdentifier: CruiseTableIdentifier;
}
