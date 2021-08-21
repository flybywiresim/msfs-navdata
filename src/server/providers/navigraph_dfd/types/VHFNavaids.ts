export type VHFNavaid = {
    /** geographical area of the navaid */
    areaCode: string;
    /** four character ICAO location identifier */
    airportIdentifier: string;
    /** location indicator of the navaid */
    icaoCode: string;
    /** navaid identifier */
    vorIdentifier: string;
    /** navaid name */
    vorName: string;
    /** navaid frequency in kHz */
    vorFrequency: number;
    /** navaid type, range/power, additional information & collocation */
    navaidClass: string;
    /** navaid latitude in degrees decimal floating point (N positive, S negative) */
    vorLatitude: number;
    /** navaid longitude in degrees decimal floating point (E positive, W negative) */
    vorLongitude: number;
    /** identification of a DME facility, a TACAN facility or the DME (or TACAN) component of a VORDME or VORTAC facility */
    dmeIdent: string;
    /** DME latitude in degrees decimal floating point (N positive, S negative) */
    dmeLatitude: number;
    /** DME longitude in degrees decimal floating point (E positive, W negative) */
    dmeLongitude: number;
    /** DME elevation in feet AMSL */
    dmeElevation: number;
    /** specify the DME offset */
    ilsdmeBias: number;
    /** navaid usable range in nautical miles */
    range: number;
    /** angular difference between true north and the zero degree radial of the navaid in degrees */
    stationDeclination: number;
}
