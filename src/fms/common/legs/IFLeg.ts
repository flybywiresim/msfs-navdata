import LatLon from 'geodesy/latlon-ellipsoidal-vincenty';
import { Waypoint } from '../Waypoint';
import {Degrees, NauticalMiles} from "../../../shared/types/Common";
import {AltitudeConstraint, Leg, SpeedConstraint} from '.';

export class IFLeg implements Leg {

    public fix: Waypoint;

    constructor(fix: Waypoint) {
        this.fix = fix;
    }

    get identifier(): string {
        return this.fix.identifier;
    }

    get altitudeConstraint(): AltitudeConstraint | undefined {
        return this.fix.altitudeConstraint;
    }

    get bearing(): Degrees {
        return 0;
    }

    get distance(): NauticalMiles {
        return 0;
    }

    getDistanceToGo(ppos: LatLon): NauticalMiles {
        return 0;
    }

    getGuidanceParameters(ppos: LatLon, trueTrack: Degrees) {
        return undefined as any;
    }

    getNominalRollAngle(gs: number): Degrees    {
        return 0;
    }

    getPseudoWaypointLocation(distanceBeforeTerminator: number): LatLon | undefined {
        return undefined;
    }

    get initialLocation(): LatLon | undefined {
        return this.fix.coordinates;
    }

    isAbeam(ppos: LatLon) {
        return false;
    }

    get isCircularArc(): boolean {
        return false;
    }

    get speedConstraint(): SpeedConstraint | undefined
    {
        return this.fix.speedConstraint;
    }

    get terminatorLocation(): LatLon | undefined {
        return this.fix.coordinates;
    }
}
