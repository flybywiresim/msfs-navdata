import LatLon from 'geodesy/latlon-ellipsoidal-vincenty';
import {Leg} from "./index";
import {Degrees, NauticalMiles} from "../../../shared/types/Common";
import {ControlLaw, GuidanceParameters} from "../ControlLaws";

export class VRLeg implements Leg {

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

    get initialLocation(): LatLon {
        return undefined as any;
    }

    // No terminator location since manual legs are infinite
    get terminatorLocation(): undefined {
        return undefined;
    }

    getPseudoWaypointLocation(distanceBeforeTerminator: NauticalMiles): undefined {
        return undefined;
    }

    getGuidanceParameters(ppos: LatLon): GuidanceParameters | null {
        return {
            law: ControlLaw.HEADING,
            heading: this.mHeading,
        };
    }

    getNominalRollAngle(gs): Degrees {
        return 0;
    }

    getDistanceToGo(ppos: LatLon): NauticalMiles {
        return 1;
    }

    isAbeam(ppos: LatLon): boolean {
        return true;
    }
}
