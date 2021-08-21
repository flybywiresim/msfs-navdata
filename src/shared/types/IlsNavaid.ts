import { DatabaseItem, Degrees, DegreesMagnetic, KiloHertz, Location, LsCategory } from "./Common";

export interface IlsNavaid extends DatabaseItem {
    frequency: KiloHertz;
    category: LsCategory;
    runwayIdent: string;
    locLocation: Location;
    locBearing: DegreesMagnetic;
    gsLocation: Location;
    gsSlope: Degrees;
    stationDeclination: Degrees;
}
