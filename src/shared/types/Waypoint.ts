import { DatabaseItem, Location } from "./Common";

export interface Waypoint extends DatabaseItem {
    location: Location,
    // TODO more...
}
