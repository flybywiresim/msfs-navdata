import { DatabaseItem, Location } from "./Common";
import { TerminalWaypointType } from "../../server/providers/navigraph_dfd/types/TerminalWaypoints";
import { EnRouteWaypointType } from "../../server/providers/navigraph_dfd/types/EnrouteWaypoints";

export interface Waypoint extends DatabaseItem {
    location: Location,
    name: string,
    type: TerminalWaypointType | EnRouteWaypointType,
    // TODO more...
}
