export type MarkerType =
    /** Inner Marker */
    'IM' |
    /** Middle Marker */
    'MM' |
    /** Outer Marker */
    'OM' |
    /** Back Marker */
    'BM'

export type LocalizerMarker = {
    /** geographical area of the marker */
    areaCode: string;
    /** location indicator of the marker */
    icaoCode: string;
    /** four character ICAO location identifier */
    airportIdentifier: string;
    /** runway identifier */
    runwayIdentifier: string;
    /** identification code of the LLZ, MLS facility or GLS reference path */
    llzIdentifier: string;
    /** marker identifier */
    markerIdentifier: string;
    /** defines the type of marker */
    markerType: `${'L' | ' '}${MarkerType}`
    /** marker latitude in degrees decimal floating point (N positive, S negative) */
    markerLatitude: number;
    /** marker longitude in degrees decimal floating point (E positive, W negative) */
    markerLongitude: number;
}
