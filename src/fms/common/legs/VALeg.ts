import { AltitudeConstraint, Leg, SpeedConstraint } from "./index";
import { Degrees, Location, NauticalMiles } from "../../../shared/types/Common";

export class VALeg implements Leg {

    private readonly mAltitude: number;

    private readonly mHeading: number;

    constructor(altitude: number, course: number) {
        this.mAltitude = altitude;
        this.mHeading = course;
    }

    get identifier(): string {
        return `(${this.mAltitude})`
    }

    get altitudeConstraint(): AltitudeConstraint | undefined
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
