import { Waypoint } from '../Waypoint';
import { AltitudeConstraint, Leg, PathVector, PathVectorType, SpeedConstraint } from "./index";
import { Degrees, Location, NauticalMiles } from "../../../shared/types/Common";
import { MathUtils } from "../MathUtils";
import { ControlLaw } from "../ControlLaws";
import { getDistance, getGreatCircleBearing } from "geolib";

export class TFLeg implements Leg {

    public from: Waypoint;

    public to: Waypoint;

    private readonly mDistance: NauticalMiles;

    private readonly mBearing: Degrees;

    constructor(from: Waypoint, to: Waypoint) {
        this.from = from;
        this.to = to;
        this.mDistance = getDistance(from.coordinates, to.coordinates);
        this.mBearing = getGreatCircleBearing(from.coordinates, to.coordinates);
    }

    get identifier(): string {
        return this.to.identifier;
    }

    get altitudeConstraint(): AltitudeConstraint | undefined {
        return this.to.altitudeConstraint;
    }

    get bearing(): Degrees {
        return this.mBearing;
    }

    get distance(): NauticalMiles {
        return this.mDistance;
    }

    /**
     * Calculates the angle between the leg and the aircraft PPOS.
     *
     * This effectively returns the angle ABC in the figure shown below:
     *
     * ```
     * * A
     * |
     * * B (TO)
     * |\
     * | \
     * |  \
     * |   \
     * |    \
     * |     \
     * |      \
     * * FROM  * C (PPOS)
     * ```
     *
     * @param ppos {Locationg} the current position of the aircraft
     */
    getAircraftToLegBearing(ppos: Location): number {
        const aircraftToTerminationBearing = getGreatCircleBearing(ppos, this.to.coordinates);

        // Rotate frame of reference to 0deg
        let correctedLegBearing = this.bearing - aircraftToTerminationBearing;
        if (correctedLegBearing < 0) {
            correctedLegBearing = 360 + correctedLegBearing;
        }

        let aircraftToLegBearing = 180 - correctedLegBearing;
        if (aircraftToLegBearing < 0) {
            // if correctedLegBearing was greater than 180 degrees, then its supplementary angle is negative.
            // In this case, we can subtract it from 360 degrees to obtain the bearing.

            aircraftToLegBearing = 360 + aircraftToLegBearing;
        }

        return aircraftToLegBearing;
    }

    getDistanceToGo(ppos: Location): NauticalMiles {
        const aircraftLegBearing = this.getAircraftToLegBearing(ppos);

        const absDtg = getDistance(ppos, this.to.coordinates);

        // @todo should be abeam distance
        if (aircraftLegBearing >= 90 && aircraftLegBearing <= 270) {
            // Since a line perpendicular to the leg is formed by two 90 degree angles, an aircraftLegBearing outside
            // (North - 90) and (North + 90) is in the lower quadrants of a plane centered at the TO fix. This means
            // the aircraft is NOT past the TO fix, and DTG must be positive.

            return absDtg;
        }

        return -absDtg;    }

    getGuidanceParameters(ppos: Location, trueTrack: Degrees) {
        const fromLocationgAlt = this.from.coordinates;

        const desiredTrack = this.bearing;
        const trackAngleError = MathUtils.mod(desiredTrack - trueTrack + 180, 360) - 180;

        // crosstrack error
        const bearingAC = getGreatCircleBearing(fromLocationgAlt, ppos);
        const bearingAB = desiredTrack;
        const distanceAC = getDistance(fromLocationgAlt, ppos);

        const desiredOffset = 0;
        const actualOffset = (
            Math.asin(
                Math.sin(MathUtils.DEEGREES_TO_RADIANS * (distanceAC / MathUtils.EARTH_RADIUS_NM))
                * Math.sin(MathUtils.DEEGREES_TO_RADIANS * (bearingAC - bearingAB)),
            ) / MathUtils.DEEGREES_TO_RADIANS
        ) * MathUtils.EARTH_RADIUS_NM;
        const crossTrackError = desiredOffset - actualOffset;

        return {
            law: ControlLaw.LATERAL_PATH,
            trackAngleError,
            crossTrackError,
            phiCommand: 0,
        };
    }

    getNominalRollAngle(gs: number): Degrees {
        return 0;
    }

    getPseudoWaypointLocation(distanceBeforeTerminator: number): Location | undefined {
        return undefined;
    }

    get initialLocation(): Location | undefined {
        return this.from.coordinates;
    }

    isAbeam(ppos: Location) {
        const bearingAC = getGreatCircleBearing(this.from.coordinates, ppos);
        const headingAC = Math.abs(MathUtils.diffAngle(this.bearing, bearingAC));
        if (headingAC > 90) {
            // if we're even not abeam of the starting point
            return false;
        }
        const distanceAC = getDistance(this.from.coordinates, ppos);
        const distanceAX = Math.cos(headingAC * MathUtils.DEEGREES_TO_RADIANS) * distanceAC;
        // if we're too far away from the starting point to be still abeam of the ending point
        return distanceAX <= this.distance;
    }

    get isCircularArc(): boolean {
        return false;
    }

    get speedConstraint(): SpeedConstraint | undefined {
        return this.to.speedConstraint;
    }

    get terminatorLocation(): Location | undefined {
        return this.to.coordinates;
    }

    public getPredictedPath(isActive: boolean, ppos: Location, altitude: Feet, groundSpeed: Knots, verticalSpeed: FeetPerMinute): PathVector[] {
        return [
            {
                type: PathVectorType.Line,
                startPoint: this.from.coordinates,
                endPoint: this.to.coordinates,
            },
        ];
    }
}
