import { Coordinates, Degrees, DegreesMagnetic } from 'msfs-geo';
import { DatabaseItem, LsCategory } from './Common';

export interface GlsNavaid extends DatabaseItem {
    channel: number;
    category: LsCategory;
    runwayIdent: string;
    location: Coordinates;
    bearing: DegreesMagnetic;
    slope: Degrees;
    type: GlsType;
}

export enum GlsType {
    Unknown,
    LaasGls,
    Scat1,
}
