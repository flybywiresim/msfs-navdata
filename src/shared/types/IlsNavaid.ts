import { Coordinates, Degrees, DegreesMagnetic, Feet } from 'msfs-geo';
import { DatabaseItem, LsCategory, MegaHertz } from './Common';

export interface IlsNavaid extends DatabaseItem {
    frequency: MegaHertz;
    category: LsCategory;
    runwayIdent: string;
    locLocation: Coordinates;
    locBearing: DegreesMagnetic;
    gsLocation?: Coordinates & { alt?: Feet };
    gsSlope?: Degrees;
    /**
     * Beware: this is NOT the same as magnetic variation
     */
    stationDeclination: Degrees;
}
