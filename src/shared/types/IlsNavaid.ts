import { Coordinates, Degrees, DegreesMagnetic } from 'msfs-geo';
import { DatabaseItem, ElevatedCoordinates, KiloHertz, LsCategory } from './Common';

export interface IlsNavaid extends DatabaseItem {
    frequency: KiloHertz;
    category: LsCategory;
    runwayIdent: string;
    locLocation: Coordinates;
    locBearing: DegreesMagnetic;
    gsLocation?: ElevatedCoordinates;
    gsSlope?: Degrees;
    /**
     * Beware: this is NOT the same as magnetic variation
     */
    stationDeclination: Degrees;
}
