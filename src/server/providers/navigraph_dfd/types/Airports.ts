type IFRCapability =
    /** Instrument Approach Procedure published */
    'Y' |
    /** No Instrument Approach Procedure published */
    'N';
type LongestRunwaySurfaceCode =
    /** Hard Surface (asphalt or concrete) */
    'H' |
    /** Soft Surface (gravel, grass or soil) */
    'S' |
    /** Water Runway */
    'W' |
    /** undefined */
    'U';

export type Airport = {

    /** Geographical Area of the Airport */
    areaCode: string;

    /** Location Indicator Of the airport */
    icaoCode: string;

    /** Four Letter ICAO location identifier */
    airportIdentifier: string;

    /** Three character ICAO continental location identifier for USA and CAN airports */
    airportIdentifier3letter: string;

    /** Offical Airport Name */
    airportName: string;

    /** airport reference latitude in degrees decimal floating point (N positive, S negative) */
    airportRefLatitude: number;

    /** airport reference longitude in degrees decimal floating point (E positive, W negative) */
    airportRefLongitude: number;

    /** Indicates if the airport has a published IAP */
    ifrCapability: IFRCapability;

    /** defines if there is a hard runway or not */
    longestRunwaySurfaceCode: LongestRunwaySurfaceCode;

    /** elevation in feet above MSL */
    elevation: number;

    /** transition altitude in feet */
    transitionAltitude: number;

    /** transition level altitude in feet */
    transitionLevel: number;

    /** speed limit in knots */
    speedLimit: number;

    /** altitude below which speed limit may be imposed (feet or flight level) */
    speedLimitAltitude: number;

    /** IATA/ATA airport designator code */
    iataAtaDesignator: string;

    /** Length of the longest runway in feet */
    longestRunwayLength: number;
}
