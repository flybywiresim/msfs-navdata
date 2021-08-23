import { DatabaseItem, Location } from "./Common";

export enum WaypointType {
    // TODO
    Unknown,
}

export interface Waypoint extends DatabaseItem {
    location: Location,
    name?: string,
    type: WaypointType,
    // TODO more...
}
