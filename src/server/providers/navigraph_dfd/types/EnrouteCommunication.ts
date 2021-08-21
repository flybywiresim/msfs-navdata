import { CommunicationType, FrequencyUnits } from "./CommonCommunicationTypes";

export type EnrouteCommunication = {
    /** geographical area of the facility */
    areaCode: string;
    /** identifies the Flight Information Region or Upper Information Region */
    firRdoIdent: string;
    /** contains the identifier of a FIR, UIR or combined FIR/UIR */
    firUirIndicator: string;
    /** specifies the type of communication unit */
    communicationType: CommunicationType;
    /** specifies a frequency for the facility identified in the communicaton type field */
    communicationFrequency: number;
    /** designates the frequency spectrum area for the frequency */
    frequencyUnits: FrequencyUnits;
    /** defines the use of the frequency for the specified communication type */
    serviceIndicator: string;
    /** name of unmanned air/ground facility */
    remoteName: string;
    /** name of the facility being called */
    callsign: string;
    /** latitude in degrees decimal floating point (N positive, S negative) */
    latitude: number;
    /** longitude in degrees decimal floating point (E positive, W negative) */
    longitude: number;
}
