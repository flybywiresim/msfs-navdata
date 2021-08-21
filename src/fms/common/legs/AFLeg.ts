import LatLon from 'geodesy/latlon-ellipsoidal-vincenty';
import {AltitudeConstraint, Leg, SpeedConstraint} from "./index";
import { Waypoint } from "../Waypoint";
import { Degrees, NauticalMiles } from "../../../shared/types/Common";

export class AFLeg extends Leg {

    public to: Waypoint;

    private readonly theta: number;

    private readonly rho: number;

    private centerCoords: LatLon;

    get identifier(): string {
        return this.to.identifier;
    }

    constructor(fix: Waypoint, theta: number, rho: number, centerCoords: LatLon)
    {
        super();
        this.to = fix;
        this.theta = theta;
        this.rho = rho;
        this.centerCoords = centerCoords;
    }

    get altitudeConstraint(): AltitudeConstraint | undefined
    {
        return undefined;
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
