import { Degrees, DegreesMagnetic } from 'msfs-geo';
import { DatabaseItem, ElevatedCoordinates, LsCategory } from './Common';

export interface GlsNavaid extends DatabaseItem {
    channel: number;
    category: LsCategory;
    runwayIdent: string;
    location: ElevatedCoordinates;
    bearing: DegreesMagnetic;
    slope: Degrees;
    type: GlsType;
}

export enum GlsType {
    Unknown,
    LaasGls,
    Scat1,
}
