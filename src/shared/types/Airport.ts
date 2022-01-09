import { DatabaseItem, Location, Feet, Knots, FlightLevel, NauticalMiles } from './Common';
import { RunwaySurfaceType } from './Runway';

export interface Airport extends DatabaseItem {
    /**
     * Airport long name
     */
    name?: string;
    /**
     * Airport reference location, and elevation
     */
    location: Location;
    /**
     * Speed limit in the airport's terminal area, applicable below the altitude in {@link Airport/speedLimitAltitude}
     */
    speedLimit?: Knots;
    /**
     * Altitude below which the {@link Airport/speedLimit} applies
     */
    speedLimitAltitude?: Feet;
    /**
     * Highest altitude
     */
    transitionAltitude?: Feet;
    /**
     * Lowest flight level
     */
    transitionLevel?: FlightLevel;
    /**
     * Surface type of the longest runway (not necessarily the "best" runway)
     */
    longestRunwaySurfaceType: RunwaySurfaceType;

    /**
     * Distance from centre location for nearby airport query
     */
    distance?: NauticalMiles;
}
