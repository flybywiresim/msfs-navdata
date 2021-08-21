import { Leg } from "./index";
import { Degrees, Location, NauticalMiles } from "../../../shared/types/Common";
import { ControlLaw, GuidanceParameters } from "../ControlLaws";

export class VDLeg implements Leg {

    private readonly mHeading: Degrees;

    private readonly mDistance: NauticalMiles;

    get identifier(): string {
        return '(VDLeg)'
    }

    constructor(heading: Degrees, distance: NauticalMiles) {
        this.mHeading = heading;
        this.mDistance = distance;
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

    get terminatorLocation(): undefined {
        return undefined;
    }

    getPseudoWaypointLocation(distanceBeforeTerminator: NauticalMiles): undefined {
        return undefined;
    }

    getGuidanceParameters(ppos: Location): GuidanceParameters | null {
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
