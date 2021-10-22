import { DatabaseItem, Degrees, Location, MegaHertz, NauticalMiles } from './Common';

export interface VhfNavaid extends DatabaseItem {
    frequency: MegaHertz;
    figureOfMerit: number;
    vorName?: string,
    /**
     * Beware: this is NOT the same as magnetic variation
     */
    stationDeclination: Degrees;
    vorLocation: Location;
    dmeLocation?: Location;
    type: VhfNavaidType;
    class?: VorClass;

    /**
     * Distance from center of search if queried using a range search
     */
    distance?: NauticalMiles;
}

export enum VhfNavaidType {
    Unknown,
    Vor,
    VorDme,
    Dme,
    Tacan,
    Vortac,
    Vot,
    IlsDme,
    IlsTacan,
}

export enum VorClass {
    Unknown,
    Terminal,
    LowAlt,
    HighAlt,
}
