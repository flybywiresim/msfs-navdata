export type Header = {
    /** the current version of the specifications */
    version: string;
    /** the current used ARINC version */
    arincversion: string;
    /** revision of the current AIRAC cycle */
    revision: string;
    /**  indicates the data content - extended */
    recordSet: string;
    /** the current AIRAC cycle */
    currentAirac: string;
    /** when the current AIRAC cycle starts/ends (Format DDMMDDMMYY– DD is the day, MM is the month, YY is the year) */
    effectiveFromto: string;
    /** the previous AIRAC cycle */
    previousAirac: string;
    /** when the previous AIRAC cycle starts/ends (Format DDMMDDMMYY– DD is the day, MM is the month, YY is the year) */
    previousFromto: string;
    /** parsing/creation date of the current AIRAC cycle (Format DD/MM/YY – HH:MM:SS in UTC) */
    parsedAt: string;
}
