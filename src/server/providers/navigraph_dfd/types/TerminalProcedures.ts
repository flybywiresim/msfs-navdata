import { WaypointDescriptionCode } from './WaypointDescriptionCode';

type SidRouteType =
    /** Engine out SID */
    | '0'
    /** SID Runway Transition */
    | '1'
    /** SID Or SID Common Route */
    | '2'
    /** SID Enroute Transition */
    | '3'
    /** RNAV SID Runway Transition */
    | '4'
    /** RNAV SID or SID Common Route */
    | '5'
    /** RNAV SID Enroute Transition */
    | '6'
    /** FMS SID Runway Transition */
    | 'F'
    /** FMS SID or SID Common Route */
    | 'M'
    /** FMS SID Enroute Transition */
    | 'S'
    /** Vector SID Runway Transition */
    | 'T'
    /** Vector SID Enroute Transition */
    | 'V';
type StarRouteType =
    /** STAR Enroute Transition */
    | '1'
    /** STAR or STAR Common Route */
    | '2'
    /** STAR Runway Transition */
    | '3'
    /** RNAV STAR Enroute Transition */
    | '4'
    /** RNAV STAR or STAR Common Route */
    | '5'
    /** RNAV STAR Runway Transition */
    | '6'
    /** Profile Descent Enroute Transition */
    | '7'
    /** Profile Descent Common Route */
    | '8'
    /** Profile Descent Runway Transition */
    | '9'
    /** FMS STAR Enroute Transition */
    | 'F'
    /** FMS STAR or STAR Common Route */
    | 'M'
    /** FMS STAR Runway Transition */
    | 'S';
type IAPRouteType =
    /** Approach Transition */
    | 'A'
    /** Localizer/Back course Approach	 */
    | 'B'
    /** VORDME Approach */
    | 'D'
    /** FMS Approach */
    | 'F'
    /** IGS Approach */
    | 'G'
    /** ILS Approach */
    | 'I'
    /** GLS Approach */
    | 'J'
    /** LOC only Approach */
    | 'L'
    /** MLS Approach */
    | 'M'
    /** NDB Approach */
    | 'N'
    /** GPS Approach */
    | 'P'
    /** NDB DME Approach */
    | 'Q'
    /** RNAV Approach */
    | 'R'
    /** VOR Approach using VORDME/VORTAC */
    | 'S'
    /** TACAN Approach */
    | 'T'
    /** SDF Approach */
    | 'U'
    /** VOR Approach */
    | 'V'
    /** MLS Type A Approach */
    | 'W'
    /** LDA Approach */
    | 'X'
    /** MLS Type B and C Approach */
    | 'Y'
    /** Missed Approach */
    | 'Z';

type PathTermination =
    /** Initial Fix */
    | 'IF'
    /** Track to a Fix */
    | 'TF'
    /** Course to a Fix */
    | 'CF'
    /** Direc to a Fix */
    | 'DF'
    /** Fix to an Altitude */
    | 'FA'
    /** Track from a Fix for a Distance */
    | 'FC'
    /** Track from a Fix to a DME Distance */
    | 'FD'
    /** From a Fix to a Manual termination */
    | 'FM'
    /** Course to an Altitude */
    | 'CA'
    /** Course to a DME Distance */
    | 'CD'
    /** Course to an Intercept */
    | 'CI'
    /** Course to a Radial termination */
    | 'CR'
    /** Constant Radius Arc */
    | 'RF'
    /** Arc to Fix */
    | 'AF'
    /** Heading to an Altitude */
    | 'VA'
    /** Heading to a DME Distance termination */
    | 'VD'
    /** Heading to an Intercept */
    | 'VI'
    /** Heading to a Manual termination */
    | 'VM'
    /** Heading to a Radial termination */
    | 'VR'
    /** 045/180 Procedure turn */
    | 'PI'
    /** Holding in lieu of Procedure Turn */
    | 'HA'
    /** ^ */
    | 'HF'
    /** ^ */
    | 'HM';
type AltitudeDescription =
    /** at or above altitude specified in Altitude1 field */
    '+' |
    /** at or below altitude specified in Altitude1 field */
    '-' |
    /** at altitude specified in Altitude1 field */
    '@' | '' |
    /** at or above to at or below altitudes in Altitude1 field and Altitude2 field */
    'B' |
    /** at or above altitude specified in Altitude2 field */
    'C' |
    /** Glide Slope altitude (MSL) specified in Altitude2 field and at altitude specified in Altitude1 field */
    'G' |
    /** Glide Slope altitude (MSL) specified in Altitude2 field and at or above altitude specified in Altitude1 field */
    'H' |
    /** Glide Slope Intercept Altitude specified in Altitude2 field and at altitude specified in Altitude1 field */
    'I' |
    /** Glide Slope Intercept Altitude specified in Altitude2 field and at or above altitude specified in Altitude1 field */
    'J' |
    /** at altitude on the coded vertical angle in the Altitude2 field and at or above altitude specified in Altitude1 field */
    'V' |
    /** at altitude on the coded vertical angle in Altitude2 field and at altitude specified in Altitude1 field */
    'X' |
    /** at altitude on the coded vertical angle in Altitude2 field and at or below altitude specified in the Altitude1 field */
    'Y'
type SpeedLimitDescription =
    /** Mandatory Speed, cross fix at speed specified in the Speed Limit field */
    '@' |
    /** ^ */
    '' |
    /** Minimum Speed, cross fix at or above speed specified in Speed Limit field */
    '+' |
    /** Maximum Speed, cross fix at or below speed specified in Speed Limit field */
     '-'
export type TerminalProcedure = {

    /**  Geographical area of the marker */
    areaCode: string;
    /**  Location indicator of the marker */
    waypointIcaoCode: string;
    /** four character ICAO location identifier */
    airportIdentifier: string;
    /** name of the terminal procedure */
    procedureIdentifier: string;
    /** element of the terminal procedure */
    routeType: SidRouteType | StarRouteType | IAPRouteType;
     /** describes the type of transition to be made from the enroute environment into the terminal area and vice versa */
    transitionIdentifier: string;
    /** sequence definition phase of the terminal procedure */
    seqno: number;
    /** navaid or waypoint identifier */
    waypointIdentifier: string;
    /** navaid or waypoint latitude in degrees decimal floating point (N positive, S negative) */
    waypointLatitude: number;
    /** navaid or waypoint longitude in degrees decimal floating point (E positive, W negative) */
    waypointLongitude: number;
    /** the field provides information on the type of fix */
    waypointDescriptionCode: WaypointDescriptionCode;
    /** turn direction */
    turnDirection: 'L' | 'R';
    /** statement of the Navigation Performance necessary for operation within a defined airspace in accordance with ICAO Annex 15 and/or State published rules */
    rnp: number;
    /** defines the path geometry for a single record of an terminal procedure */
    pathTermination: PathTermination;
    /** reference facility for the fix */
    recommandedNavaid: string;
    /** recommended navaid latitude in degrees decimal floating point (N positive, S negative) */
    recommandedNavaidLatitude: number;
    /** recommended navaid longitude in degrees decimal floating point (E positive, W negative) */
    recommandedNavaidLongitude: number;
    /**  used to define the radius of a precision turn */
    arcRadius: number;
    /** defined as the magnetic bearing to the waypoint identified in the record's "Fix Identifier" field from the Navaid in the "Recommended Navaid" field */
    theta: number;
    /** defined as the geodesic distance in nautical miles to the waypoint identified in the record's "Fix Identifier" field from the NAVAID in the "Recommended Navaid" field */
    rho: number;
    /** outbound magnetic course from the waypoint identified in the record's "Fix Identifier" field */
    magneticCourse: number;
    /** contain segment distances/along track distances/excursion distances/DME distances */
    routeDistanceHoldingDistanceTime: number;
    /** indicates, if the value in the "Route Distance/Holding" column references to a time value, or distance value */
    distanceTime: 'T' | 'D';
    /** designate whether a waypoint should be crossed */
    altitudeDescription: AltitudeDescription;
    /** contain altitudes in feet or flight level */
    altitude1: number;
    /** contain altitudes in feet or flight level */
    altitude2: number;
    /** transition altitude in feet */
    transitionAltitude: number;
    /**  designate whether the speed limit coded at a fix in a terminal procedure description is a mandatory, minimum or maximum speed */
    speedLimitDescription: SpeedLimitDescription;
    /** speed limit in knots */
    speedLimit: number;
    /** defines the vertical navigation path prescribed for the procedure */
    verticalAngle: number;
    /** represents the MSA Center, that point (Navaid or Waypoint) on which the MSA is predicated */
    centerWaypoint: string;
    /** center fix latitude in degrees decimal floating point (N positive, S negative) */
    centerWaypointLatitude: number;
    /** center fix longitude in degrees decimal floating point (E positive, W negative) */
    centerWaypointLongitude: number;
    /** Table reference for the waypoint */
    id: string;
    /** Table reference for the recommended navaid */
    recommandedId: string;
    /** Table reference for the arc centre fix */
    centerId: string;
};
