export type EnrouteNDBNavaid = {
    /** Geographical area of the NDB */
    areaCode: string;
    /** Location indicator of the NDB */
    icaoCode: string;
    /** NDB identifier */
    ndbIdentifier: string;
    /** NDB name */
    ndbName: string;
    /** NDB frequency in Mhz */
    ndbFrequency: number;
    /** NDB type, range/power, additional information & collocation */
    navaidClass: string;
    /** NDB latitude in degrees decimal floating point (N positive, S negative) */
    ndbLatitude: number;
    /** NDB longitude in degrees decimal floating point (E positive, W negative) */
    ndbLongitude: number;
}
export type TerminalNDBNavaid = EnrouteNDBNavaid & { airportIdentifier: string }
