import { GuidanceParameters } from "./ControlLaws";
import {Degrees, Location, NauticalMiles} from "../../shared/types/Common";

export interface Guidable {
    getGuidanceParameters(ppos: Location, trueTrack: Degrees): GuidanceParameters | null;
    getDistanceToGo(ppos: Location): NauticalMiles;
    isAbeam(ppos: Location): boolean;
}
