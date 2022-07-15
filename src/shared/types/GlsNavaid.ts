import { Degrees, DegreesMagnetic } from 'msfs-geo';
import { ElevatedCoordinates, LsCategory } from './Common';
import { Fix, FixType } from './Fix';

export interface GlsNavaid extends Fix {
    fixType: FixType.GlsNavaid;
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
