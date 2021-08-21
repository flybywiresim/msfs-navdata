import LatLon from 'geodesy/latlon-ellipsoidal-vincenty';
import { Waypoint } from '../Waypoint';
import {AltitudeConstraint, Leg, SpeedConstraint} from "./index";
import {Degrees, NauticalMiles} from "../../../shared/types/Common";

export class CFLeg implements Leg {

    public to: Waypoint;

    private readonly mDistance: NauticalMiles;

    private readonly mCourse: Degrees;

    constructor(to: Waypoint, course: number, distance: number) {
        this.to = to;
        this.mCourse = course;
        this.mDistance = distance;
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

    isAbeam(ppos: LatLon) {
        return false;
    }

    get isCircularArc(): boolean
    {
        return false;
    }

    get speedConstraint(): SpeedConstraint | undefined
    {
        return this.to.speedConstraint;
    }

    get terminatorLocation(): LatLon | undefined
    {
        return this.to.coordinates;
    }
}
