import LatLon from 'geodesy/latlon-ellipsoidal-vincenty';
import { GuidanceParameters } from "../ControlLaws";
import { Guidable } from "../Guidable";
import { AltitudeDescriptor, SpeedDescriptor } from "../../../shared/types/ProcedureLeg";
import { Degrees, Feet, Knots, NauticalMiles } from "../../../shared/types/Common";

export interface AltitudeConstraint {
    type: AltitudeDescriptor,
    altitude1: Feet,
    altitude2: Feet | undefined,
}

export interface SpeedConstraint {
    type: SpeedDescriptor,
    speed: Knots,
}

export abstract class Leg implements Guidable {
    abstract isCircularArc: boolean;

    abstract bearing: Degrees;

    abstract distance: NauticalMiles;

    abstract speedConstraint: SpeedConstraint | undefined;

    abstract altitudeConstraint: AltitudeConstraint | undefined;

    abstract initialLocation: LatLon | undefined;

    abstract terminatorLocation: LatLon | undefined;

    abstract getPseudoWaypointLocation(distanceBeforeTerminator: NauticalMiles): LatLon | undefined;

    abstract getGuidanceParameters(ppos: LatLon, trueTrack: Degrees): GuidanceParameters;

    public getNominalRollAngle(gs: number): Degrees {
        return 0;
    }

    abstract getDistanceToGo(ppos: LatLon): NauticalMiles;

    abstract isAbeam(ppos: LatLon): boolean;
}
