export type AirportMSA = {
    /** geographical area */
    areaCode: string;
    /** location indicator of the airport */
    icaoCode: string;
    /** four character ICAO location identifier */
    airportIdentifier: string;
    /** MSA center fix */
    msaCenter: string;
    /** MSA Center fix latitude in degrees decimal floating point (N positive, S negative) */
    msaCenterLatitude: number;
    /** MSA Center fix longitude in degrees decimal floating point (E positive, W negative) */
    msaCenterLongitude: number;
    magneticTrueIndicator: string;
    /** indicate Restrictive Airspace having the same designator but subdivided or differently divided by lateral and/or vertical detail */
    multipleCode: string;
    radiusLimit: number;
    /** Sector Bearing in degrees */
    sectorBearing1: number;
    /** Sector Altitude in feet */
    sectorAltitude1: number;

    /** ^^ */
    sectorBearing2: number;
    sectorAltitude2: number;
    sectorBearing3: number;
    sectorAltitude3: number;
    sectorBearing4: number;
    sectorAltitude4: number;
    sectorBearing5: number;
    sectorAltitude5: number;
};
