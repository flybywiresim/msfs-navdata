import LatLon from 'geodesy/latlon-ellipsoidal-vincenty';
import {AltitudeConstraint, Leg, SpeedConstraint} from "./index";
import {Degrees, NauticalMiles} from "../../../shared/types/Common";

export class CRLeg implements Leg {

    private readonly mCourse: Degrees;

    constructor(course: number) {
        this.mCourse = course;
    }

    get identifier(): string {
        return '(CRLEG)';
    }

    get altitudeConstraint(): AltitudeConstraint | undefined
    {
        return undefined;
    }

    get bearing(): Degrees
    {
        return this.mCourse;
    }

    get distance(): NauticalMiles
    {
        return 0;
    }

    getDistanceToGo(ppos: LatLon): NauticalMiles
    {
        return 0;
    }

    getGuidanceParameters(ppos: LatLon, trueTrack: Degrees)
    {
        return undefined as any;
    }

    getNominalRollAngle(gs: number): Degrees
    {
        return 0;
    }

    getPseudoWaypointLocation(distanceBeforeTerminator: number): LatLon | undefined
    {
        return undefined;
    }

    get initialLocation(): LatLon | undefined
    {
        return undefined;
    }

    isAbeam(ppos: LatLon) {
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

    get terminatorLocation(): LatLon | undefined
    {
        return undefined;
    }
}
