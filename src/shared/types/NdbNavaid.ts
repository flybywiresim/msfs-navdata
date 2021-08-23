import { DatabaseItem, Degrees, KiloHertz, Location } from "./Common";
import {VhfNavaidType} from "./VhfNavaid";

export interface NdbNavaid extends DatabaseItem {
    frequency: KiloHertz;
    stationDeclination: Degrees;
    location: Location;
    class: NdbClass;
    type: VhfNavaidType;
}

export enum NdbClass {
    Unknown,
    CompassLocator,
    Mh,
    H,
    Hh,
}
