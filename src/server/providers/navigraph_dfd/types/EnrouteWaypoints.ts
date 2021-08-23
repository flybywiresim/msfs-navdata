type TypeColumn1 = '' |
    /** Combined named intersection and RNAV */
     'C' |
    /** unnamed, charted intersection */
     'I' |
    /** NDB navaid as waypoint */
     'N' |
    /** named intersection */
     'R' |
    /** uncharted Airway intersection */
     'U' |
    /** VFR Waypoint */
     'V' |
    /** RNAV Waypoint */
     'W'
type TypeColumn2 = '' |
    /** Final Approach Fix */
     'A' |
    /** Initial and Final Approach Fix */
     'B' |
    /** Final Approach Course Fix */
     'C' |
    /** Intermediate Approach Fix */
     'D' |
    /** Off-Route intersection in the FAA National Ref System */
     'E' |
    /** Off-Route Intersection */
     'F' |
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
    /** Oceanic Entry/Exit Waypoint */
     'O' |
    /** Pitch and Catch Point in the FAA High Altitude Redesign */
     'P' |
    /** AACAA and SUA Waypoints in the FAA High Altitude Redesign */
     'S' |
    /** FIR/UIR or Controlled Airspace Intersection */
     'U' |
    /** Latitude/Longitude Intersection Full Degree of Latitude */
     'V' |
    /** Latitude/Longitude Intersection, Half Degree Latitude */
     'W';
type TypeColumn3 = '' |
    /** SID */
    'D' |
    /** STAR */
    'E' |
    /** Approach */
    'F' |
    /** Multiple */
    'Z';

type EnRouteWaypointType = `${TypeColumn1}${TypeColumn2}${TypeColumn3}`;

type WaypointUsage = `${'' | /** RNAV */ 'R'}
    ${
    /** Terminal Use Only */
    '' |
    /** High and Low Altitude */
    'B' |
    /** High Altitude only */
    'H' |
    /** Low Altitude only */
    'L'}
    `;
export type EnrouteWaypoint = {
    /** Geographical area of the Waypoint */
    areaCode: string;
    /** Location indicator of the Waypoint */
    icaoCode: string;
    /** Waypoint identifier */
    waypointIdentifier: string;
    /** Waypoint name */
    waypointName: string;
    /** Waypoint Type */
    waypointType: EnRouteWaypointType;
    /** Waypoint Usage */
    waypointUsage: WaypointUsage;
    /** Waypoint latitude in degrees decimal floating point (N positive, S negative) */
    waypointLatitude: number;
    /** Waypoint longitude in degrees decimal floating point (E positive, W negative) */
    waypointLongitude: number;
}
