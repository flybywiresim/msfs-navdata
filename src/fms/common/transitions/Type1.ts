import { CFLeg } from '../legs/CFLeg';
import { DFLeg } from '../legs/DFLeg';
import { TFLeg } from '../legs/TFLeg';
import { FALeg } from '../legs/FALeg';
import { FMLeg } from '../legs/FMLeg';
import { PILeg } from '../legs/PILeg';
import {Transition} from "./index";
import {Degrees, Location, NauticalMiles} from "../../../shared/types/Common";
import {ControlLaw, GuidanceParameters} from "../ControlLaws";
import {MathUtils} from "../MathUtils";
import {computeDestinationPoint, getDistance, getGreatCircleBearing} from "geolib";

const mod = (x: number, n: number) => x - Math.floor(x / n) * n;

export type Type1PreviousLeg = CFLeg | DFLeg | TFLeg;
export type Type1NextLeg = CFLeg | FALeg | FMLeg | PILeg | TFLeg;
declare const SimVar: any;
/**
 * A type I transition uses a fixed turn radius between two fix-referenced legs.
 */
 export class Type1Transition extends Transition {
    public previousLeg: Type1PreviousLeg;

    public nextLeg: Type1NextLeg;

    public radius: NauticalMiles;

    public clockwise: boolean;

    constructor(
        previousLeg: Type1PreviousLeg,
        nextLeg: Type1NextLeg,
    ) {
        super();
        this.previousLeg = previousLeg;
        this.nextLeg = nextLeg;

        // TODO vnav to provide predicted speed at leg termination
        const kts = Math.max(this.previousLeg.speedConstraint?.speed ?? SimVar.GetSimVarValue('AIRSPEED TRUE', 'knots'), 150); // knots, i.e. nautical miles per hour;

        const courseChange = mod(nextLeg.bearing - previousLeg.bearing + 180, 360) - 180;

        // Always at least 5 degrees turn
        const minBankAngle = 5;

        // Start with half the track change
        const bankAngle = Math.abs(courseChange) / 2

        // Bank angle limits, always assume limit 2 for now @ 25 degrees between 150 and 300 knots
        let maxBankAngle = 25;
        if (kts < 150) {
            maxBankAngle = 15 + Math.min(kts / 150, 1) * (25 - 15);
        } else if (kts > 300) {
            maxBankAngle = 25 - Math.min((kts - 300) / 150, 1) * (25 - 19);
        }

        const finalBankAngle = Math.max(Math.min(bankAngle, maxBankAngle), minBankAngle);

        // Turn radius
        this.radius = (kts ** 2 / (9.81 * Math.tan(finalBankAngle * MathUtils.DEEGREES_TO_RADIANS))) / 6080.2;

        // Turn direction
        this.clockwise = courseChange >= 0;
    }

    get isCircularArc(): boolean {
        return true;
    }

    get angle(): Degrees {
        const bearingFrom = this.previousLeg.bearing;
        const bearingTo = this.nextLeg.bearing;
        return Math.abs(MathUtils.diffAngle(bearingFrom, bearingTo));
    }

    /**
     * Returns the center of the turning circle, with radius distance from both
     * legs, i.e. min_distance(previous, center) = min_distance(next, center) = radius.
     */
    get center(): Location {
        const bisecting = (180 - this.angle) / 2;
        const distanceCenterToWaypoint = this.radius / Math.sin(bisecting * MathUtils.DEEGREES_TO_RADIANS);

        const inboundReciprocal = mod(this.previousLeg.bearing + 180, 360);
        const { latitude: lat, longitude: lon} = computeDestinationPoint(this.previousLeg.to.coordinates, distanceCenterToWaypoint, mod(inboundReciprocal + (this.clockwise ? -bisecting : bisecting), 360));
        return  { lat, lon};
    }

    isAbeam(ppos: Location): boolean {
        const [inbound] = this.getTurningPoints();

        const bearingAC = getGreatCircleBearing(inbound, ppos);
        const headingAC = Math.abs(MathUtils.diffAngle(this.previousLeg.bearing, bearingAC));
        return headingAC <= 90;
    }

    get distance(): NauticalMiles {
        const circumference = 2 * Math.PI * this.radius;
        return circumference / 360 * this.angle;
    }

    getTurningPoints(): [Location, Location] {
        const bisecting = (180 - this.angle) / 2;
        const distanceTurningPointToWaypoint = this.radius / Math.tan(bisecting * MathUtils.DEEGREES_TO_RADIANS);

        const inbound = computeDestinationPoint(this.previousLeg.to.coordinates, distanceTurningPointToWaypoint, mod(this.previousLeg.bearing + 180, 360));

        const outbound = computeDestinationPoint(this.previousLeg.to.coordinates, distanceTurningPointToWaypoint, this.nextLeg.bearing);

        return [{ lat: inbound.latitude, lon: inbound.longitude }, { lat: outbound.latitude, lon: outbound.longitude }];
    }

    /**
     * Returns the distance to the termination point
     *
     * @param _ppos
     */
    getDistanceToGo(_ppos: Location): NauticalMiles {
        return 0;
    }

    getTrackDistanceToTerminationPoint(ppos: Location): NauticalMiles {
        // In order to make the angles easier, we rotate the entire frame of reference so that the line from the center
        // towards the intersection point (the bisector line) is at 180°. Thus, the bisector is crossed when the
        // aircraft reaches 180° (rotated) bearing as seen from the center point.

        const brgInverseBisector = getGreatCircleBearing(this.center, this.previousLeg.to.coordinates);

        const correctiveFactor = 180 - brgInverseBisector;

        const minBearing = this.clockwise ? 180 - this.angle / 2 : 180;
        const maxBearing = this.clockwise ? 180 : 180 + this.angle / 2;
        const rotatedBearing = mod(getGreatCircleBearing(this.center, ppos) + correctiveFactor, 360);
        const limitedBearing = Math.min(Math.max(rotatedBearing, minBearing), maxBearing);
        const remainingArcDegs = this.clockwise ? 180 - limitedBearing : limitedBearing - 180;

        return (2 * Math.PI * this.radius) / 360 * remainingArcDegs;
    }

    getGuidanceParameters(ppos: Location, trueTrack: number): GuidanceParameters | null {
        const { center } = this;

        const bearingPpos = getGreatCircleBearing(center, ppos);

        const desiredTrack = mod(
            this.clockwise ? bearingPpos + 90 : bearingPpos - 90,
            360,
        );
        const trackAngleError = mod(desiredTrack - trueTrack + 180, 360) - 180;

        const distanceFromCenter = getDistance(center, ppos);

        const crossTrackError = this.clockwise
            ? distanceFromCenter - this.radius
            : this.radius - distanceFromCenter;

        const groundSpeed = SimVar.GetSimVarValue('GPS GROUND SPEED', 'meters per second');
        const phiCommand = this.angle > 3 ? this.getNominalRollAngle(groundSpeed) : 0;

        return {
            law: ControlLaw.LATERAL_PATH,
            trackAngleError,
            crossTrackError,
            phiCommand,
        };
    }

    getNominalRollAngle(gs: number): Degrees {
        return (this.clockwise ? 1 : -1) * Math.atan((gs ** 2) / (this.radius * 1852 * 9.81)) * (180 / Math.PI);
    }

    toString(): string {
        return `Type1Transition<radius=${this.radius} clockwisew=${this.clockwise}>`;
    }
}
