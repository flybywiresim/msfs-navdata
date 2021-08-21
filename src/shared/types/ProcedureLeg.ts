import { VHFNavaid } from "../../server/providers/navigraph_dfd/types/VHFNavaids";
import { DatabaseItem, DegreesMagnetic, DegreesTrue, Feet, Knots, Minutes, NauticalMiles } from "./Common";
import { NdbNavaid } from "./NdbNavaid";
import { Waypoint } from "./Waypoint";

export interface ProcedureLeg extends DatabaseItem {
    procedureIdent: string,
    type: LegType,
    waypoint?: Waypoint,
    recommendedNavaid?: VHFNavaid | NdbNavaid | Waypoint, // TODO can be other types?
    rho?: NauticalMiles,
    theta?: DegreesMagnetic,
    arcCentreFix?: Waypoint,
    arcRadius?: NauticalMiles,
    // these two are XOR
    length?: NauticalMiles,
    lengthTime?: Minutes,
    rnp?: NauticalMiles,
    transitionAltitude?: Feet,
    altitudeDescriptor: AltitudeDescriptor,
    altitude1: Feet,
    altitude2: Feet,
    speed?: Knots,
    speedDescriptor?: SpeedDescriptor,
    turnDirection: TurnDirection,
    magneticCourse: DegreesMagnetic,
    routeDistance: NauticalMiles,
}

export enum AltitudeDescriptor {
    AtAlt1, // @, At in Alt1
    AtOrAboveAlt1, // +, at or above in Alt1
    AtOrBelowAlt1, // -, at or below in Alt1
    BetweenAlt1Alt2, // B, range between Alt1 and Alt2
    AtOrAboveAlt2, // C, at or above in Alt2
    AtAlt1GsMslAlt2, // G, Alt1 At for FAF, Alt2 is glideslope MSL
    AtOrAboveAlt1GsMslAlt2, // H, Alt1 is At or above for FAF, Alt2 is glideslope MSL
    AtAlt1GsIntcptAlt2, // I, Alt1 is at for FACF, Alt2 is glidelope intercept
    AtOrAboveAlt1GsIntcptAlt2, // J, Alt1 is at or above for FACF, Alt2 is glideslope intercept
    AtOrAboveAlt1AngleAlt2, // V, Alt1 is procedure alt for step-down, Alt2 is at alt for vertical path angle
    AtAlt1AngleAlt2, // X, Alt 1 is at, Alt 2 is on the vertical angle
    AtOrBelowAlt1AngleAlt2,// Y, Alt 1 is at or below, Alt 2 is on the vertical angle
}

export enum SpeedDescriptor {
    Mandatory,
    Minimum,
    Maximum,
}

export enum TurnDirection {
    Unknown = 0,
    Left = 1,
    Right = 2,
    Either = 3,
}

export enum LegType {
    Unknown = 0,
    AF = 1, // Arc to a fix (i.e. DME ARC)
    CA = 2, // Course to an Altitude
    CD = 3, // Course to a DME distance
    CF = 4, // Course to a Fix
    CI = 5, // Course to an intercept (next leg)
    CR = 6, // Course to a VOR radial
    DF = 7, // Direct to Fix from PPOS
    FA = 8, // Track from Fix to Altitude
    FC = 9, // Track from Fix to a Distance
    FD = 10, // Track from Fix to a DME distance (not the same fix)
    FM = 11, // Track from Fix to a Manual termination
    HA = 12, // Holding with Altitude termination
    HF = 13, // Holding, single circuit terminating at the fix
    HM = 14, // Holding with manual termination
    IF = 15, // Initial Fix
    PI = 16, // Procedure turn
    RF = 17, // Constant radius arc between two fixes, lines tangent to arc and a centre fix
    TF = 18, // Track to a Fix
    VA = 19, // Heading to an altitude
    VD = 20, // Heading to a DME distance
    VI = 21, // Heading to an intercept
    VM = 22, // Heading to a manual termination
    VR = 23, // Heading to a VOR radial
}
