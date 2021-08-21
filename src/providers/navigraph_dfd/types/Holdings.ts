export type Holding = {
    /** Geographical area of the waypoint */
    areaCode: string;
    /** Static text ENRT or airport identification code */
    regionCode: string;
    /** Location indicator of the waypoint */
    icaoCode: string;
    /** Navaid or Waypoint identifier */
    fixIdentifier: string;
    /** Holding name */
    holdingName: string;
    /** Navaid or Waypoint latitude in degrees decimal floating point (N positive, S negative) */
    fixLatitude: number;
    /** Navaid or Waypoint longitude in degrees decimal floating point (E positive, W negative) */
    fixLongitude: number;
    /** Used for more than one holding patterns for a single Navaid or Waypoint */
    dublicateIdentifier: string;
    /** Inbound magnetic course in degrees floating point */
    inboundHoldingCourse: number;
    /** Holding turn direction */
    turnDirection: 'L' | 'R';
    /** Inbound leg length in nautical miles, decimal floating point */
    legLength: number;
    /** Inbound leg time in minutes, decimal floating point */
    legTime: number;
    /** Contain altitudes in feet or flight level */
    minimumAltitude: number;
    /** Contain altitudes in feet or flight level */
    maximumAltitude: number;
    /** Holding speed limit in knots */
    holdingSpeed: number;
}
