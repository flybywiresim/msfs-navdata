import { Degrees, NauticalMiles } from '@typings/types';
import { MathUtils } from '@shared/MathUtils';
import { Transition } from '@fmgc/guidance/lnav/transitions';
import { ControlLaw, GuidanceParameters, LateralPathGuidance } from '@fmgc/guidance/ControlLaws';
import { TurnDirection } from '@fmgc/types/fstypes/FSEnums';
import { LatLongData } from '@typings/fs-base-ui';
import { CALeg } from '../legs/CALeg';
import { CDLeg } from '../legs/CDLeg';
import { CRLeg } from '../legs/CRLeg';
import { FALeg } from '../legs/FALeg';
import { HALeg, HFLeg, HMLeg } from '../legs/HXLeg';
import { VALeg } from '../legs/VALeg';
import { VDLeg } from '../legs/VDLeg';
import { VRLeg } from '../legs/VRLeg';
import { TFLeg } from '../legs/TFLeg';
import { CFLeg } from '../legs/CFLeg';
import { AFLeg } from '../legs/AFLeg';


export type Type2PreviousLeg = CALeg | CDLeg | CRLeg | FALeg | HALeg | HFLeg | HMLeg | VALeg | VDLeg | VRLeg;
export type Type2NextLeg = AFLeg | CFLeg | FALeg | TFLeg;

/**
 * A type II transition provides no guidance, instead the next leg guidance is used,
 * except in the case where turn direction is unnatural. In the unnatural case the roll command
 * is forced until next leg TAE is lower than 130°
 * For prediction, it uses a fixed turn radius onto a 45° intercept of the next leg
 */
 export class Type2Transition extends Transition {
    public previousLeg: Type2PreviousLeg;

    public nextLeg: Type2NextLeg;

    public radius: NauticalMiles;

    public clockwise: boolean;
    public unnatural: boolean;
    public maxBankAngle: Degrees;

    constructor(
        previousLeg: Type2PreviousLeg,
        nextLeg: Type2NextLeg,
    ) {
        super();
        this.previousLeg = previousLeg;
        this.nextLeg = nextLeg;

        // TODO vnav to provide predicted speed at leg termination
        const kts = Math.max(this.previousLeg.speedConstraint?.speed ?? SimVar.GetSimVarValue('AIRSPEED TRUE', 'knots'), 150); // knots, i.e. nautical miles per hour;

        let courseChange;

        // TODO
        const turnDirection: TurnDirection = TurnDirection.Either;

        switch (turnDirection) {
        case TurnDirection.Left:
            this.clockwise = false;
            courseChange = 0;
            this.unnatural = Math.abs(courseChange) > 180;
            break;
        case TurnDirection.Right:
            this.clockwise = true;
            courseChange = 0;
            this.unnatural = Math.abs(courseChange) > 180;
            break;
        case TurnDirection.Either:
        default:
            courseChange = Avionics.Utils.diffAngle(nextLeg.bearing, previousLeg.bearing);
            this.clockwise = courseChange >= 0;
            this.unnatural = false;
            break;
        }

        // Always at least 5 degrees turn
        const minBankAngle = 5;

        // Start with half the track change
        const bankAngle = Math.abs(courseChange) / 2

        // Bank angle limits, always assume limit 2 for now @ 25 degrees between 150 and 300 knots
        this.maxBankAngle = 25;
        if (kts < 150) {
            this.maxBankAngle = 15 + Math.min(kts / 150, 1) * (25 - 15);
        } else if (kts > 300) {
            this.maxBankAngle = 25 - Math.min((kts - 300) / 150, 1) * (25 - 19);
        }

        const finalBankAngle = Math.max(Math.min(bankAngle, this.maxBankAngle), minBankAngle);

        // Turn radius
        this.radius = (kts ** 2 / (9.81 * Math.tan(finalBankAngle * Avionics.Utils.DEG2RAD))) / 6080.2;

        // Turn direction
        this.clockwise = courseChange >= 0;
    }

    get isCircularArc(): boolean {
        return true;
    }

    isAbeam(ppos: LatLongAlt): boolean {
        // TODO
        const [inbound] = this.getTurningPoints();

        const bearingAC = Avionics.Utils.computeGreatCircleHeading(inbound, ppos);
        const headingAC = Math.abs(MathUtils.diffAngle(this.previousLeg.bearing, bearingAC));
        return headingAC <= 90;
    }

    get distance(): NauticalMiles {
        const circumference = 2 * Math.PI * this.radius;
        return circumference / 360 * this.angle;
    }

    getTurningPoints(): [LatLongData, LatLongData] {
        const bisecting = (180 - this.angle) / 2;
        const distanceTurningPointToWaypoint = this.radius / Math.tan(bisecting * Avionics.Utils.DEG2RAD);

        const { lat, long } = this.nextLeg.from.infos.coordinates.toLatLong();

        // TODO 45 intercept
        const outbound = Avionics.Utils.bearingDistanceToCoordinates(
            this.nextLeg.bearing,
            distanceTurningPointToWaypoint,
            lat,
            long,
        );

        return [this.previousLeg.terminatorLocation, outbound];
    }

    /**
     * Returns the distance to the termination point
     *
     * @param _ppos
     */
    getDistanceToGo(_ppos: LatLongAlt): NauticalMiles {
        return 0;
    }

    getTrackDistanceToTerminationPoint(ppos: LatLongAlt): NauticalMiles {
        // In order to make the angles easier, we rotate the entire frame of reference so that the line from the center
        // towards the intersection point (the bisector line) is at 180°. Thus, the bisector is crossed when the
        // aircraft reaches 180° (rotated) bearing as seen from the center point.

        /*const brgInverseBisector = Avionics.Utils.computeGreatCircleHeading(this.center, this.previousLeg.to.infos.coordinates);

        const correctiveFactor = 180 - brgInverseBisector;

        const minBearing = this.clockwise ? 180 - this.angle / 2 : 180;
        const maxBearing = this.clockwise ? 180 : 180 + this.angle / 2;
        const rotatedBearing = mod(Avionics.Utils.computeGreatCircleHeading(this.center, ppos) + correctiveFactor, 360);
        const limitedBearing = Math.min(Math.max(rotatedBearing, minBearing), maxBearing);
        const remainingArcDegs = this.clockwise ? 180 - limitedBearing : limitedBearing - 180;

        return (2 * Math.PI * this.radius) / 360 * remainingArcDegs;*/

        return 2; // TODO
    }

    getGuidanceParameters(ppos: LatLongAlt, trueTrack: number): LateralPathGuidance | null {
        const guidance = this.nextLeg.getGuidanceParameters(ppos, trueTrack);
        if (!guidance) {
            return null;
        }
        let phiCommand = guidance.phiCommand ?? 0;
        if (this.unnatural && (guidance.trackAngleError ?? 0 > 130)) {
            phiCommand = this.maxBankAngle;
        }
        return {
            law: ControlLaw.LATERAL_PATH,
            trackAngleError: guidance.trackAngleError ?? 0,
            crossTrackError: guidance.crossTrackError ?? 0,
            phiCommand: phiCommand,
        };
    }

    getNominalRollAngle(gs): Degrees {
        return (this.clockwise ? 1 : -1) * Math.atan((gs ** 2) / (this.radius * 1852 * 9.81)) * (180 / Math.PI);
    }

    toString(): string {
        return `Type2Transition<clockwise=${this.clockwise}>`;
    }
}
