import { CruiseTableIdentifier } from './CruisingTable';
import {WaypointDescriptionCode} from './WaypointDescriptionCode';


type RouteType =
    /** Control */
    'C' |
    /** Direct Route */
    'D' |
    /** Helicopter Route */
    'H' |
    /** Official Designated Airways expect RNAV Airways */
    'O' |
    /** RNAV Airways */
    'R' |
    /** Un-designated ATS Route */
    'S';
export type FlightLevel =
    /** All Altitudes */
    'B' |
    /** High Level Airways */
    'H' |
    /** Low Level Airways */
    'L';
type DirectionalRestriction  =
    /** One way in direction route is coded (Forward) */
    'F' |
    /** One way in opposite direction route is coded (backwards) */
    'B' |
    /** no restrictions on direction */
    '';


export type EnRouteAirway = {
    /** Geographical area of the waypoint */
    areaCode: string;
    /** EnRoute route identifier */
    routeIdentifer: string;
    /** Sort order of each EnRoute airway, no duplicate sequences per airway are possible */
    seqno: number;
    /** Location indicator of the waypoint */
    icaoCode: string;
    /** Navaid or waypoint identifier */
    fixIdentifier: string;
    /** Navaid or waypoint latitude in degrees decimal floating point (N positive, S negative) */
    fixLatitude: number;
    /** Navaid or waypoint longitude in degrees decimal floating point (E positive, W negative) */
    fixLongitude: number;
    /** Provides information on the type of fix */
    waypointDescriptionCode: WaypointDescriptionCode;
    /** Indicated the route type */
    routeType: RouteType;
    /** Defines the airway structure */
    flightlevel: FlightLevel;
    /** Indicates the flyable direction */
    directionalRestriction: DirectionalRestriction;
    /** Indicates the cruising table */
    cruiseTableIdentifier: CruiseTableIdentifier;
    /** Contains altitudes in feet */
    minimumAltitude1: number;
    /** Contain altitudes in feet */
    minimumAltitude2: number;
    /** Contains altitudes in feet */
    maximumAltitude: number;
    /** Outbound magnetic course from the waypoint identified in the record's "Fix Identifier" field */
    outboundCourse: number;
    /** Inbound magnetic course to the waypoint identified in the record's "Fix Identifier" field */
    inboundCourse: number;
    /** Contains segment distances/along track distances/excursion distances/DME distances in nautical miles */
    inboundDistance: number;
}
