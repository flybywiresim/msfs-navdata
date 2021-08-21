type Column1 =
    /** ARC Center Fix Waypoint */
     'A' |
    /** Combined Named Intersection and RNAV Waypoint */
     'C' |
    /** Unnamed, Charted Intersection */
     'I' |
    /** Middle Marker as Waypoint */
     'M' |
    /** Terminal NDB Navaid as Waypoint */
     'N' |
    /** Outer Marker as Waypoint */
     'O' |
    /** Named Intersection */
     'R' |
    /** VFR Waypoint */
     'V' |
    /** RNAV Waypoint */
     'W';
type Column2 =
    /** Final Approach Fix */
     'A' |
    /** Initial Approach Fix and Final Approach Fix */
     'B' |
    /** Final Approach Course Fix */
     'C' |
    /** Intermediate Approach Fix */
     'D' |
    /** Initial Approach Fix */
     'I' |
    /** Final Approach Course Fix at Initial Approach Fix */
     'K' |
    /** Final Approach Course Fix at Intermediate Approach Fix */
     'L' |
    /** Missed Approach Fix */
     'M' |
    /** Initial Approach Fix and Missed Approach Fix */
     'N' |
    /** Unnamed Stepdown Fix */
     'P' |
    /** Named Stepdown Fix */
     'S' |
    /** FIR/UIR or Controlled Airspace Intersection */
     'U';
type Column3 =
    /** SID */
     'D' |
    /** STAR */
     'E' |
    /** Approach */
     'F' |
    /** Multiple */
     'Z';
type TerminalWaypointType = `${Column1}${Column2}${Column3}`;

export type EnrouteWaypoint = {
    /** Geographical area of the Waypoint */
    areaSode: string;
    /** airport identification code for the terminal waypoint */
    regionCode: string;
    /** Location indicator of the Waypoint */
    icaoCode: string;
    /** Waypoint identifier */
    waypointIdentifier: string;
    /** Waypoint name */
    waypointName: string;
    /** Waypoint Type */
    waypointType: TerminalWaypointType;
    /** Waypoint latitude in degrees decimal floating point (N positive, S negative) */
    waypointLatitude: number;
    /** Waypoint longitude in degrees decimal floating point (E positive, W negative) */
    waypointLongitude: number;
}
