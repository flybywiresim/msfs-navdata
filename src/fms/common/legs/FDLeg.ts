import LatLon from 'geodesy/latlon-ellipsoidal-vincenty';
import {Waypoint} from "../Waypoint";
import {AltitudeConstraint, Leg, SpeedConstraint} from "./index";
import {Degrees, NauticalMiles} from "../../../shared/types/Common";

export class FDLeg implements Leg {

    public readonly from: Waypoint;

    private readonly mCourse: number;

    private readonly mDistance: number;

    constructor(from: Waypoint, distance: number, course: number) {
        this.mDistance = distance;
        this.mCourse = course;
        this.from = from;
    }

    get identifier(): string {
        return `(${this.mDistance})`
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
