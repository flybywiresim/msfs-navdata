type char = 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K'
    | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X'
    | 'Y' | 'Z';
type dualChar = 'BB' | 'CC' | 'DD' | 'EE' | 'FF' | 'GG' | 'HH' | 'II' | 'JJ' | 'KK'
    | 'LL' | 'MM' | 'NN' | 'OO' | 'PP' | 'QQ' | 'RR' | 'SS' | 'TT' | 'UU' | 'VV' | 'WW' | 'XX'
    | 'YY' | 'ZZ';
export type CruiseTableIdentifier =
    /** ICAO standard cruise table */
    'AA' |
    /** Exception to ICAO cruise table */
    'AO' |
    /** Modified cruise table */
    dualChar |
    /** Exception to modified cruise table */
    `${char}O`;

export type CruisingTable = {
    /** indicates the cruising table */
    cruiseTableIdentifier: CruiseTableIdentifier;
    /** sort order of each cruise table, no duplicate sequences per cruise table are possible */
    seqno: number;
    /** indicate the lowest course for which a block of cruising levels are prescribed */
    courseFrom: number;
    /** indicate the highest course for which a block of cruising levels is prescribed */
    courseTo: number;
    /** course from/to in magnetic or true degrees */
    magTrue: string;
    /** indicates the lowest cruising level prescribed for use within the Course From/To fields */
    cruiseLevelFrom1: number;
    /** indicates the minimum separation prescribed to be maintained between the cruising levels */
    verticalSeperation1: number;
    /** indicate the highest cruising level prescribed for use within the Course From/To fields */
    cruiseLevelTo1: number;

    /** ^^ */
    cruiseLevelFrom2: number;
    verticalSeperation2: number;
    cruiseLevelTo2: number;
    cruiseLevelFrom3: number;
    verticalSeperation3: number;
    cruiseLevelTo3: number;
    cruiseLevelFrom4: number;
    verticalSeperation4: number;
    cruiseLevelTo4: number;

}
