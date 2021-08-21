import { DatabaseItem, Location, Feet, Knots, FlightLevel, NauticalMiles } from "./Common";
import { RunwaySurfaceType } from "./Runway";

export interface Airport extends DatabaseItem {
    // airport reference location, and elevation
    icaoCode: string;
    airportName: string;
    location: Location;
    speedLimit?: Knots;
    speedLimitAltitude?: Feet;
    transitionAltitude?: Feet;
    transitionLevel?: FlightLevel;
    longestRunwaySurfaceType: RunwaySurfaceType;

    // distance from centre location for nearby airport query
    distance?: NauticalMiles;
}
