import LatLon from 'geodesy/latlon-ellipsoidal-vincenty';
import {Degrees, NauticalMiles} from "../../../shared/types/Common";
import {Leg, SpeedConstraint} from "./index";

export class VILeg implements Leg {

    private readonly mHeading: Degrees;

    get identifier(): string {
        return '(INTC)'
    }

    constructor(heading: Degrees) {
        this.mHeading = heading;
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
