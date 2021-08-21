import { DatabaseItem, Location, Feet, Knots, FlightLevel } from "./Common";
import { RunwaySurfaceType } from "./Runway";

export interface Airport extends DatabaseItem {
    location: Location;
    speedLimit?: Knots;
    speedLimitAltitude?: Feet;
    transitionAltitude?: Feet;
    transitionLevel?: FlightLevel;
    longestRunwaySurfaceType: RunwaySurfaceType;
}
