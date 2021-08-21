import { Waypoint } from '../Waypoint';
import { Degrees, Location, NauticalMiles } from "../../../shared/types/Common";
import { AltitudeConstraint, Leg, SpeedConstraint } from '.';

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

    getDistanceToGo(ppos: Location): NauticalMiles {
        return 0;
    }

    getGuidanceParameters(ppos: Location, trueTrack: Degrees) {
        return undefined as any;
    }

    getNominalRollAngle(gs: number): Degrees    {
        return 0;
    }

    getPseudoWaypointLocation(distanceBeforeTerminator: number): Location | undefined {
        return undefined;
    }

    get initialLocation(): Location | undefined {
        return this.fix.coordinates;
    }

    isAbeam(ppos: Location) {
        return false;
    }

    get isCircularArc(): boolean {
        return false;
    }

    get speedConstraint(): SpeedConstraint | undefined
    {
        return this.fix.speedConstraint;
    }

    get terminatorLocation(): Location | undefined {
        return this.fix.coordinates;
    }
}
