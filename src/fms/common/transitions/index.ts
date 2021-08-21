import LatLon from "geodesy/latlon-ellipsoidal-vincenty";
import {Degrees, NauticalMiles} from "../types/common";
import {GuidanceParameters} from "../ControlLaws";
import { Guidable } from "../guidable";

export abstract class Transition implements Guidable {
    abstract isAbeam(ppos: LatLon): boolean;

    abstract getGuidanceParameters(ppos: LatLon, trueTrack: Degrees): GuidanceParameters;

    abstract getNominalRollAngle(gs: number): Degrees;

    abstract get isCircularArc(): boolean;

    abstract getDistanceToGo(ppos: LatLon): NauticalMiles;

    abstract getTrackDistanceToTerminationPoint(ppos: LatLon): NauticalMiles;

    abstract getTurningPoints(): [LatLon, LatLon]

    abstract identifier: string;
}
