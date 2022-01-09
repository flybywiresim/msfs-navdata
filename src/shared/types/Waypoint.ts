import { DatabaseItem, Location, NauticalMiles } from './Common';

export enum WaypointArea {
    Enroute,
    Terminal,
}

export interface Waypoint extends DatabaseItem {
    location: Location,
    name?: string,
    area: WaypointArea,
    // TODO more...

    /**
     * Distance from centre location for nearby airport query
     */
    distance?: NauticalMiles,
}
