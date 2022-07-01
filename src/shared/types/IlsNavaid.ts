import { Coordinates, Degrees, DegreesMagnetic, Feet } from 'msfs-geo';
import { Fix, FixType, LsCategory, MegaHertz } from './Common';

export interface IlsNavaid extends Fix {
    fixType: FixType.IlsNavaid;
    frequency: MegaHertz;
    category: LsCategory;
    runwayIdent: string;
    location: Coordinates;
    locBearing: DegreesMagnetic;
    gsLocation?: Coordinates & { alt?: Feet };
    gsSlope?: Degrees;
    /**
     * Beware: this is NOT the same as magnetic variation
     */
    stationDeclination: Degrees;
}
