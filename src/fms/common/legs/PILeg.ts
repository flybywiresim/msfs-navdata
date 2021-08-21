import LatLon from 'geodesy/latlon-ellipsoidal-vincenty';
import {Leg, SpeedConstraint} from '.';
import {Degrees, NauticalMiles} from "../../../shared/types/Common";

export class PILeg implements Leg {

    private readonly mHeading: Degrees;

    private readonly mDistance: NauticalMiles;

    get identifier(): string {
        return '(PILeg)'
    }

    constructor(heading: Degrees, distance: NauticalMiles) {
        this.mHeading = heading;
        this.mDistance = distance;
    }

    get altitudeConstraint(): undefined
    {
        return undefined;
    }

    get bearing(): Degrees
    {
        return this.mHeading;
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
