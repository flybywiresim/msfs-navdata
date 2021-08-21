import { Waypoint } from '../Waypoint';
import { AltitudeConstraint, Leg, SpeedConstraint } from "./index";
import { Degrees, Location, NauticalMiles } from "../../../shared/types/Common";

export class DFLeg implements Leg {

    public to: Waypoint;

    constructor(to: Waypoint) {
        this.to = to;
    }

    get identifier(): string {
        return this.to.identifier;
    }

    get altitudeConstraint(): AltitudeConstraint | undefined
    {
        return this.to.altitudeConstraint;
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

    getNominalRollAngle(gs: number): Degrees {
        return 0;
    }
}
