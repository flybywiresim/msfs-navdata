import { DatabaseItem, Location, NauticalMiles } from './Common';

export enum WaypointType {
    // TODO
    Unknown,
}

export interface Waypoint extends DatabaseItem {
    location: Location,
    name?: string,
    type: WaypointType,
    // TODO more...

    distance?: NauticalMiles,
}
