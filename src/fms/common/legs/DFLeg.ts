import LatLon from 'geodesy/latlon-ellipsoidal-vincenty';
import { Waypoint } from '../Waypoint';
import {AltitudeConstraint, Leg, SpeedConstraint} from "./index";
import {Degrees, NauticalMiles} from "../../../shared/types/Common";

export class DFLeg implements Leg {

    public to: Waypoint;

    constructor(to: Waypoint) {
        this.to = to;
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
        return 0;
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

    getNominalRollAngle(gs: number): Degrees {
        return 0;
    }
}
