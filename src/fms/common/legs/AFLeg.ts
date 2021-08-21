import { AltitudeConstraint, Leg, SpeedConstraint } from "./index";
import { Waypoint } from "../Waypoint";
import { Degrees, Location, NauticalMiles } from "../../../shared/types/Common";

export class AFLeg extends Leg {

    public to: Waypoint;

    private readonly theta: number;

    private readonly rho: number;

    private centerCoords: Location;

    get identifier(): string {
        return this.to.identifier;
    }

    constructor(fix: Waypoint, theta: number, rho: number, centerCoords: Location)
    {
        super();
        this.to = fix;
        this.theta = theta;
        this.rho = rho;
        this.centerCoords = centerCoords;
    }

    get altitudeConstraint(): AltitudeConstraint | undefined
    {
        return undefined;
    }

    get bearing(): Degrees
    {
        return 0;
    }

    get distance(): NauticalMiles
    {
        return 0;
    }

    getDistanceToGo(ppos: Location): NauticalMiles
    {
        return 0;
    }

    getGuidanceParameters(ppos: Location, trueTrack: Degrees)
    {
        return undefined as any;
    }

    getNominalRollAngle(gs: number): Degrees
    {
        return 0;
    }

    getPseudoWaypointLocation(distanceBeforeTerminator: number): Location | undefined
    {
        return undefined;
    }

    get initialLocation(): Location | undefined
    {
        return undefined;
    }

    isAbeam(ppos: Location)
    {
        return false;
    }

    get isCircularArc(): boolean
    {
        return false;
    }

    get speedConstraint(): SpeedConstraint | undefined
    {
        return undefined;
    }

    get terminatorLocation(): Location | undefined
    {
        return undefined;
    }
}
