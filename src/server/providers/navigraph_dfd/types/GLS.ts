import { IlsMlsGlsCategory } from './LocalizerGlideslopes';

type StationType =
    /** LAAS/GLS ground station */
    'L  ' |
    /** SCAT-1 station */
    'C  ';
export type GLS = {
    /** geographical area of the GLS */
    areaCode: string;
    /** four character ICAO location identifier */
    airportIdentifier: string;
    /** location indicator of the GLS */
    icaoCode: string;
    /** Identification code of the GLS Reference Path */
    glsRefPathIdentifier: string;
    /** ILS/MLS/GLS performance categories */
    glsCategory: IlsMlsGlsCategory;
    /** identifies the channel that will be decoded to identify the augmentation system used. 20001 – 39999 for GBAS, 40000 – 99999 for SBAS */
    glsChannel: number;
    /** runway identifier */
    runwayIdentifier: string;
    /** magnetic bearing of the GLS course */
    glsApproachBearing: number;
    /** latitude in degrees decimal floating point (N positive, S negative) */
    stationLatitude: number;
    /** longitude in degrees decimal floating point (E positive, W negative) */
    stationLongitude: number;
    /** identification code for retrieval of such a transmitter (not a transmitted identifier) */
    glsStationIdent: string;
    /** glide slope angle of an GLS approach in degrees */
    glsApproachSlope: number;
    /** specifies the angular difference between true north and magnetic north at the location */
    magneticVariation: number;
    /** elevation of GLS ground station in feet */
    stationElevation: number;
    /** identifies the type of the different ground station */
    stationType: StationType;
}
