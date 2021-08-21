export type Gate = {
    /** geographical area of the gate */
    areaCode: string;
    /** four character ICAO location identifier */
    airportIdentifier: string;
    /** location indicator of the gate */
    icaoCode: string;
    /** Airport Gate identifier */
    gateIdentifier: string;
    /** latitude in degrees decimal floating point (N positive, S negative) */
    gateLatitude: number;
    /** longitude in degrees decimal floating point (E positive, W negative) */
    gateLongitude: number;
    /** name of the gate */
    name: string;
}
