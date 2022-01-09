import { DatabaseItem, DegreesMagnetic, DegreesTrue, Feet, Knots, Minutes, NauticalMiles } from './Common';
import { NdbNavaid } from './NdbNavaid';
import { VhfNavaid } from './VhfNavaid';
import { Waypoint } from './Waypoint';

export interface ProcedureLeg extends DatabaseItem {
    procedureIdent: string,
    type: LegType,
    /**
     * Should the termination of this leg be overflown (not flown by in a turn)
     */
    overfly: boolean,
    /**
     * The waypoint assocaited with the termination of this leg
     * For VM legs at the end of a STAR, this shall be the airport reference point
     */
    waypoint?: Waypoint,
    /**
     * Radio navaid to be used for this leg
     */
    recommendedNavaid?: VhfNavaid | NdbNavaid | Waypoint, // TODO can be other types?
    /**
     * Distance from the recommended navaid, to the waypoint
     */
    rho?: NauticalMiles,
    /**
     * Magnetic bearing from the recommended navaid, to the waypoint
     * For AF legs this is the fix radial
     */
    theta?: DegreesMagnetic,
    /**
     * Defines the arc for RF legs
     */
    arcCentreFix?: Waypoint,
    /**
     * Defines the radius for RF legs
     */
    arcRadius?: NauticalMiles,
    /**
     * length if it is specified in distance
     * exact meaning depends on the leg type
     * mutually exclusive with lengthTime
     * For PI legs, the excursion distance from the waypoint
     */
    length?: NauticalMiles,
    /**
     * length if it is specified in time
     * exact meaning depends on the leg type
     * mutually exclusive with length
     */
    lengthTime?: Minutes,
    /**
     * Required Navigation Performance for this leg
     */
    rnp?: NauticalMiles,
    transitionAltitude?: Feet,
    /**
     * Specifies the meaning of the altitude1 and altitude2 properties
     */
    altitudeDescriptor: AltitudeDescriptor,
    /**
     * altitudeDescriptor property specifies the meaning of this property
     */
    altitude1?: Feet,
    /**
     * altitudeDescriptor property specifies the meaning of this property
     */
    altitude2?: Feet,
    /**
     * On SIDS the speed limit applies backwards from termination of this leg,
     * to either the previous speed limit terminator, or the start of the procedure.
     * On STARs and approaches, the speed limit applies forwards until either
     * the end of the procedure, or the next speed limit
     * The exact meaning is coded in the speedDescriptor property
     */
    speed?: Knots,
    /**
     * Specifies the meaning of the speed property
     */
    speedDescriptor?: SpeedDescriptor,
    /**
     * Specifies the direction of the turn at the termination of this leg
     */
    turnDirection?: TurnDirection,
    /**
     * Specifies the outbound course associated with the termination of this leg
     * For AF legs this is the boundary radial
     * For CF legs this is the course to the specified fix
     */
    trueCourse?: DegreesTrue,
}

export enum AltitudeDescriptor {
    None,
    /**
     * @, At in altitude1
     */
    AtAlt1,
    /**
     * +, at or above in altitude1
     */
    AtOrAboveAlt1,
    /**
     * -, at or below in altitude1
     */
    AtOrBelowAlt1,
    /**
     * B, range between altitude1 (higher) and altitide2 (lower)
     */
    BetweenAlt1Alt2,
    /**
     * C, at or above in altitude 2
     */
    AtOrAboveAlt2,
    /**
     * G, altitude1 At for FAF, altitude2 is glideslope MSL
     */
    AtAlt1GsMslAlt2,
    /**
     * H, Alt1 is At or above for FAF, Alt2 is glideslope MSL
     */
    AtOrAboveAlt1GsMslAlt2,
    /**
     * I, Alt1 is at for FACF, Alt2 is glidelope intercept
     */
    AtAlt1GsIntcptAlt2,
    /**
     * J, Alt1 is at or above for FACF, Alt2 is glideslope intercept
     */
    AtOrAboveAlt1GsIntcptAlt2,
    /**
     * V, Alt1 is procedure alt for step-down, Alt2 is at alt for vertical path angle
     */
    AtOrAboveAlt1AngleAlt2,
    /**
     * X, Alt 1 is at, Alt 2 is on the vertical angle
     */
    AtAlt1AngleAlt2,
    /**
     * Y, Alt 1 is at or below, Alt 2 is on the vertical angle
     */
    AtOrBelowAlt1AngleAlt2,
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
    /**
     * Arc to a fix (i.e. DME ARC)
     */
    AF = 1,
    /**
     * Course to an Altitude
     */
    CA = 2,
    /**
     * Course to a DME distance
     */
    CD = 3,
    /**
     * Course to a Fix
     */
    CF = 4,
    /**
     * Course to an intercept (next leg)
     */
    CI = 5,
    /**
     * Course to a VOR radial
     */
    CR = 6,
    /**
     * Direct to Fix from PPOS
     */
    DF = 7,
    /**
     * Track from Fix to Altitude
     */
    FA = 8,
    /**
     * Track from Fix to a Distance
     */
    FC = 9,
    /**
     * Track from Fix to a DME distance (not the same fix)
     */
    FD = 10,
    /**
     * Track from Fix to a Manual termination
     */
    FM = 11,
    /**
     * Hippodrome (hold) with Altitude termination
     */
    HA = 12,
    /**
     * Hippodrome (hold), single circuit terminating at the fix
     */
    HF = 13,
    /**
     * Hippodrome (hold) with manual termination
     */
    HM = 14,
    /**
     * Initial Fix
     */
    IF = 15,
    /**
     * Procedure turn
     */
    PI = 16,
    /**
     * Constant radius arc between two fixes, lines tangent to arc and a centre fix
     */
    RF = 17,
    /**
     * Track between fixes
     */
    TF = 18,
    /**
     * Heading to an altitude
     */
    VA = 19,
    /**
     * Heading to a DME distance
     */
    VD = 20,
    /**
     * Heading to an intercept
     */
    VI = 21,
    /**
     * Heading to a manual termination
     */
    VM = 22,
    /**
     * Heading to a VOR radial
     */
    VR = 23,
}
