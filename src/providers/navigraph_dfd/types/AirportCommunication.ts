import { CommunicationType, FrequencyUnits } from "./CommonCommunicationTypes";

export type AirportCommunication = {
    /** geographical area of the facility */
    areaCode: string;
    /** location indicator of the facility */
    icaoCode: string;
    /** four character ICAO location identifier */
    airportIdentifier: string;
    /** specified the type of communication unit */
    communicationType: CommunicationType;
    /** specifies a frequency for the facility identified in the communicaton type field */
    communicationFrequency: number;
    /** designate the frequency spectrum area for the frequency */
    frequencyUnits: FrequencyUnits;
    /** define the use of the frequency for the specified communication type */
    serviceIndicator: string;
    /** name of the facility being called */
    callsign: string;
    /** latitude in degrees decimal floating point (N positive, S negative) */
    latitude: number;
    /** longitude in degrees decimal floating point (E positive, W negative) */
    longitude: number;
}
