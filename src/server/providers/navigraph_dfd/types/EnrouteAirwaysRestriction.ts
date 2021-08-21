type RestrictionType =
    /** Altitude exclusion */
    'AE' |
    /** Cruising Table Replacement */
    'TC' |
    /** Seasonal Restriction */
    'SC' |
    /** Note Restriction */
    'NR';
type UnitsOfAltitude =
    /** Restriction Altitudes are expressed in hundreds of feet */
    'F' |
    /** Restriction Altitudes are expressed in metric Flightlevel */
    'K' |
    /** Restriction Altitudes are expressed in feet Flightlevel */
    'L' |
    /** Restriction Altitudes are expressed in tens of meters */
    'M'
type BlockIndicator =
    /** indicates an altitude block */
    'B' |
    /** indicates an individual altitudes block */
    'I';

export type EnrouteAirwaysRestriction = {
    /** geographical area */
    areaCode: string;
    /** enroute route identifier */
    routeIdentifier: string;
    /** unique restriction identifier */
    restrictionIdentifier: string;
    /** define the type of the restriction */
    restrictionType: RestrictionType;
    /** Starting fix identifier */
    startWaypointIdentifier: string;
    /** starting fix latitude in degrees decimal floating point (N positive, S negative) */
    startWaypointLatitude: number;
    /** starting fix longitude in degrees decimal floating point (E positive, W negative) */
    startWaypointLongitude: number;
    /** end fix identifier */
    endWaypointIdentifier: string;
    /** end fix latitude in degrees decimal floating point (N positive, S negative) */
    endWaypointLatitude: number;
    /** end fix longitude in degrees decimal floating point (E positive, W negative) */
    endWaypointLongitude: number;
    /** starting effective date which does not corresponding with the AIRAC date */
    startDate: string;
    /** ending effective date which does not corresponding with the AIRAC date */
    endDate: string;
    /** indicates the units of measurement for the restriction altitudes */
    unitsOfAltitude: UnitsOfAltitude;
    /** specifies the altitude profile for a specific restriction */
    restrictionAltitude1: number;
    /** specifies the types of block(s) */
    blockIndicator1: BlockIndicator;

    /** ^^ */
    restrictionAltitude2: number;
    blockIndicator2: BlockIndicator;
    restrictionAltitude3: number;
    blockIndicator3: BlockIndicator;
    restrictionAltitude4: number;
    blockIndicator4: BlockIndicator;
    restrictionAltitude5: number;
    blockIndicator5: BlockIndicator;
    restrictionAltitude6: number;
    blockIndicator6: BlockIndicator;
    restrictionAltitude7: number;
    blockIndicator7: BlockIndicator;
};
