import { Coordinates, NauticalMiles } from 'msfs-geo';
import { DatabaseItem } from './Common';

export enum WaypointArea {
    Enroute,
    Terminal,
}

export interface Waypoint extends DatabaseItem {
    location: Coordinates,
    name?: string,
    area: WaypointArea,
    // TODO more...

    /**
     * Distance from centre location for nearby airport query
     */
    distance?: NauticalMiles,
}
