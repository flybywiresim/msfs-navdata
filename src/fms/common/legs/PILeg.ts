import { Leg, SpeedConstraint } from '.';
import { Degrees, Location, NauticalMiles } from "../../../shared/types/Common";

export class PILeg implements Leg {

    private readonly mHeading: Degrees;

    private readonly mDistance: NauticalMiles;

    get identifier(): string {
        return '(PILeg)'
    }

    constructor(heading: Degrees, distance: NauticalMiles) {
        this.mHeading = heading;
        this.mDistance = distance;
    }

    get altitudeConstraint(): undefined
    {
        return undefined;
    }

    get bearing(): Degrees
    {
        return this.mHeading;
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
