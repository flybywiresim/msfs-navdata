import { DatabaseItem, Degrees, KiloHertz, Location } from "./Common";

export interface NdbNavaid extends DatabaseItem {
    frequency: KiloHertz;
    stationDeclination: Degrees;
    location: Location;
    class: NdbClass;
}

export enum NdbClass {
    Unknown,
    CompassLocator,
    Mh,
    H,
    Hh,
}
