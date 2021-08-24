import { Degrees, Location, NauticalMiles } from "../../../shared/types/Common";
import { ControlLaw, GuidanceParameters } from "../ControlLaws";
import { Leg } from "./index";

export class VMLeg implements Leg {

    private readonly mHeading: Degrees;

    get identifier(): string {
        return '(VECT)'
    }

    constructor(heading: Degrees) {
        this.mHeading = heading;
    }

    get isCircularArc(): boolean {
        return false;
    }

    get bearing(): Degrees {
        return this.mHeading;
    }

    get distance(): NauticalMiles {
        return 1;
    }

    get speedConstraint(): undefined {
        return undefined;
    }

    get altitudeConstraint(): undefined {
        return undefined;
    }

    get initialLocation(): Location {
        return undefined as any;
    }

    // No terminator location since manual legs are infinite
    get terminatorLocation(): undefined {
        return undefined;
    }

    getPseudoWaypointLocation(distanceBeforeTerminator: NauticalMiles): undefined {
        return undefined;
    }

    getGuidanceParameters(ppos: Location): GuidanceParameters {
        return {
            law: ControlLaw.HEADING,
            heading: this.mHeading,
        };
    }

    getNominalRollAngle(gs: number): Degrees {
        return 0;
    }

    getDistanceToGo(ppos: Location): NauticalMiles {
        return 1;
    }

    isAbeam(ppos: Location): boolean {
        return true;
    }
}
