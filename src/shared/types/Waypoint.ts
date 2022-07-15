import { NauticalMiles } from 'msfs-geo';
import { Area } from './Common';
import { Fix, FixType } from './Fix';

export interface Waypoint extends Fix {
    fixType: FixType.Waypoint;
    name?: string,
    area: Area,
    // TODO more...

    /**
     * Distance from centre location for nearby airport query
     */
    distance?: NauticalMiles,
}
