import { Coordinates, Degrees, DegreesMagnetic, Feet } from 'msfs-geo';
import { LsCategory, MegaHertz } from './Common';
import { Fix, FixType } from './FixType';

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
