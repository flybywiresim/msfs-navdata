import { DatabaseItem, Degrees, DegreesMagnetic, Location, LsCategory } from './Common';

export interface GlsNavaid extends DatabaseItem {
    channel: number;
    category: LsCategory;
    runwayIdent: string;
    location: Location;
    bearing: DegreesMagnetic;
    slope: Degrees;
    type: GlsType;
}

export enum GlsType {
    Unknown,
    LaasGls,
    Scat1,
}
