import { Coordinates, NauticalMiles } from 'msfs-geo';
import { WaypointArea } from '..';
import { DatabaseItem, KiloHertz } from './Common';
import { NavaidSubsectionCode, SectionCode } from './SectionCode';

export interface NdbNavaid extends DatabaseItem<SectionCode.Navaid> {
    subSectionCode: NavaidSubsectionCode.NdbNavaid,

    frequency: KiloHertz,
    location: Coordinates,
    name?: string,
    class: NdbClass,
    /**
     * Beat frequency oscillator required to make identifier audible
     */
    bfoOperation: boolean,

    /**
     * Distance from centre location for nearby airport query
     */
    distance?: NauticalMiles,
    area: WaypointArea,
}

export enum NdbClass {
    Unknown = 1 << 0,
    /**
     * Low power/compass locator, power < 25 W
     */
    Low = 1 << 1,
    /**
     * Medium, power 25 - 50 W
     */
    Medium = 1 << 2,
    /**
     * Normal, power 50 - 1999 W
     */
    Normal = 1 << 3,
    /**
     * High, power >= 2000 W
     */
    High = 1 << 4,
}
