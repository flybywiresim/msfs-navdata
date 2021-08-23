import { DatabaseItem, Location } from "./Common";
import {TerminalWaypointType} from "../../server/providers/navigraph_dfd/types/TerminalWaypoints";

export interface Waypoint extends DatabaseItem {
    location: Location,
    name: string,
    type: TerminalWaypointType,
    // TODO more...
}
