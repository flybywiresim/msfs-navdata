import { Coordinates } from 'msfs-geo';
import { DatabaseItem } from './Common';
import { VhfNavaid } from './VhfNavaid';
import { SectionCode, SubSectionEnumMap } from './SectionCode';
import { Waypoint } from './Waypoint';
import { NdbNavaid } from './NdbNavaid';

export interface BaseFix<T extends SectionCode> extends DatabaseItem {
    sectionCode: T,
    subSectionCode: SubSectionEnumMap[T],

    location: Coordinates,
}

/**
 * Union of all possible fix interfaces
 */
export type Fix =
    | VhfNavaid
    | NdbNavaid
    | Waypoint
