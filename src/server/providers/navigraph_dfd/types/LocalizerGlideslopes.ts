export type IlsMlsGlsCategory =
    /** ILS Localizer Only, no glideslope */
     '0' |
    /** ILS Localizer/MLS/GLS Category I */
     '1' |
    /** ILS Localizer/MLS/GLS Category II */
     '2' |
    /** ILS Localizer/MLS/GLS Category III */
     '3' |
    /** IGS Facility */
     'I' |
    /** LDA Facility with Glideslope */
     'L' |
    /** LDA Facility no Glideslope */
     'A' |
    /** SDF Facility with Glideslope */
     'S' |
    /** SDF Facility no Glideslope */
     'F';

export type LocalizerGlideslope = {
    /**  geographical area of the localizer */
    areaCode: string;
    /** location indicator of the localizer */
    icaoCode: string;
    /** four character ICAO location identifier */
    airportIdentifier: string;
    /** runway identifier */
    runwayIdentifier: string;
    /** identification code of the LLZ, MLS facility or GLS reference path */
    llzIdentifier: string;
    /** LLZ latitude in degrees decimal floating point (N positive, S negative) */
    llzLatitude: number;
    /** LLZ longitude in degrees decimal floating point (E positive, W negative) */
    llzLongitude: number;
    /** VHF frequency of the facility in MHz */
    llzFrequency: number;
    /** magnetic bearing of the localizer course */
    llzBearing: number;
    /** specifies the localizer course width (in degrees) of the ILS facility */
    llzWidth: number;
    /** ILS/MLS/GLS performance categories */
    ilsMlsGlsCategory: IlsMlsGlsCategory;
    /** GS latitude in degrees decimal floating point (N positive, S negative) */
    gsLatitude: number;
    /** GS longitude in degrees decimal floating point (E positive, W negative) */
    gsLongitude: number;
    /** glide slope angle of an ILS facility/GLS approach in degrees */
    gsAngle: number;
    /** elevation of LLZ in feet */
    gsElevation: number;
    /** angular difference between true north and the zero degree radial of the LLZ in degrees */
    stationDeclination: number;
}
