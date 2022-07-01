import { NauticalMiles } from 'msfs-geo';
import { Fix, FixType } from './Common';

export enum WaypointArea {
    Enroute,
    Terminal,
}

export interface Waypoint extends Fix {
    fixType: FixType.Waypoint;
    name?: string,
    area: WaypointArea,
    // TODO more...

    /**
     * Distance from centre location for nearby airport query
     */
    distance?: NauticalMiles,
}
