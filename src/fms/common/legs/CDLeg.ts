import {AltitudeConstraint, Leg, SpeedConstraint} from "./index";
import {Degrees, NauticalMiles} from "../../../shared/types/Common";
import LatLon from "geodesy/latlon-ellipsoidal-vincenty";

export class CDLeg implements Leg {

    private readonly mDistance: NauticalMiles;

    private readonly mCourse: Degrees;

    constructor(course: number, distance: number) {
        this.mCourse = course;
        this.mDistance = distance;
    }

    get identifier(): string {
        return `(CDLeg)`;
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
        return this.mDistance;
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

    isAbeam(ppos: LatLon)
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

    get terminatorLocation(): LatLon | undefined
    {
        return undefined;
    }
}
