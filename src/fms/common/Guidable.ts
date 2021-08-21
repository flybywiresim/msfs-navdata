import LatLon from "geodesy/latlon-ellipsoidal-vincenty";
import { GuidanceParameters } from "./ControlLaws";
import { Degrees, NauticalMiles } from "./types/common";

export interface Guidable {
    getGuidanceParameters(ppos: LatLon, trueTrack: Degrees): GuidanceParameters | null;
    getDistanceToGo(ppos: LatLon): NauticalMiles;
    isAbeam(ppos: LatLon): boolean;
}
