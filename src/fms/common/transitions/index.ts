import LatLon from "geodesy/latlon-ellipsoidal-vincenty";
import {Degrees, NauticalMiles} from "../types/common";
import {GuidanceParameters} from "../ControlLaws";
import { Guidable } from "../Guidable";
import { PathVector } from "../legs";
import { Feet, FeetPerMinute, Knots } from "../../../shared/types/Common";

export abstract class Transition implements Guidable {
    abstract isAbeam(ppos: LatLon): boolean;

    abstract getGuidanceParameters(ppos: LatLon, trueTrack: Degrees): GuidanceParameters;

    abstract getNominalRollAngle(gs: number): Degrees;

    abstract get isCircularArc(): boolean;

    abstract getDistanceToGo(ppos: LatLon): NauticalMiles;

    abstract getTrackDistanceToTerminationPoint(ppos: LatLon): NauticalMiles;

    abstract getTurningPoints(): [LatLon, LatLon]

    getPredictedPath(isActive: boolean, ppos: Location, altitude: Feet, groundSpeed: Knots, verticalSpeed: FeetPerMinute): PathVector[] {
        return [];
    }
}

// TODO does this even make sense???
export class Discontinuity {

}
