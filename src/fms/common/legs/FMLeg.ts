import LatLon from 'geodesy/latlon-ellipsoidal-vincenty';
import { Waypoint } from '../Waypoint';
import {AltitudeConstraint, Leg, SpeedConstraint} from "./index";
import {Degrees, NauticalMiles} from "../../../shared/types/Common";

export class FMLeg implements Leg {

    public from: Waypoint;

    private readonly mCourse: number;

    public readonly identifier = '(VECT)';

    constructor(fix: Waypoint, course: number) {
        this.from = fix;
        this.mCourse = course;
    }

    get altitudeConstraint(): AltitudeConstraint | undefined {
        return this.from.altitudeConstraint;
    }

    get bearing(): Degrees
    {
        return this.mCourse;
    }

    get distance(): NauticalMiles {
        return 1;
    }

    getDistanceToGo(ppos: LatLon): NauticalMiles {
        return 1;
    }

    getGuidanceParameters(ppos: LatLon, trueTrack: Degrees) {
        return undefined as any;
    }

    getNominalRollAngle(gs: number): Degrees {
        return 0;
    }

    getPseudoWaypointLocation(distanceBeforeTerminator: number): LatLon | undefined {
        return undefined;
    }

    get initialLocation(): LatLon | undefined {
        return this.from.coordinates;
    }

    isAbeam(ppos: LatLon) {
        return true;
    }

    get isCircularArc(): boolean {
        return false;
    }

    get speedConstraint(): SpeedConstraint | undefined {
        return this.from.speedConstraint;
    }

    get terminatorLocation(): LatLon | undefined {
        return undefined;
    }
}
