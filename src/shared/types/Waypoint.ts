import { NauticalMiles } from 'msfs-geo';
import { Area, Fix, FixType } from './Common';

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
