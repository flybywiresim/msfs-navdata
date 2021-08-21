import { IlsMlsGlsCategory } from "./LocalizerGlideslopes";

export type Runway = {
    /** geographical area of the runway */
    areaCode: string;
    /** location indicator of the runway */
    icaoCode: string;
    /** four character ICAO location identifier */
    airportIdentifier: string;
    /** runway identifier */
    runwayIdentifier: string;
    /** runway latitude in degrees decimal floating point (N positive, S negative) */
    runwayLatitude: number;
    /** runway longitude in degrees decimal floating point (E positive, W negative) */
    runwayLongitude: number;
    /** overall gradient in percent (positive is upward, negative is downward) */
    runwayGradient: number;
    /** magnetic bearing of the runway identifier */
    runwayMagneticBearing: number;
    /** True bearing of the runway identifier */
    runwayTrueBearing: number;
    /** elevation of the landing threshold in feet */
    landingThresholdElevation: number;
    /** distance from the extremity of a runway to a threshold in feet */
    displacedThresholdDistance: number;
    /** height above the landing threshold on a normal glide path */
    thresholdCrossingHeight: number;
    /** runway length in feet */
    runwayLength: number;
    /** runway width in feet */
    runwayWidth: number;
    /** ILS/MLS/GLS facility */
    llzIdentifier: string;
    /** ILS/MLS/GLS performance categories */
    llzMlsGlsCategory: IlsMlsGlsCategory;
}
