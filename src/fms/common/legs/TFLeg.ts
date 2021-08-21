import LatLon from 'geodesy/latlon-ellipsoidal-vincenty';
import { Waypoint } from '../Waypoint';
import {AltitudeConstraint, Leg, SpeedConstraint} from "./index";
import {Degrees, NauticalMiles} from "../../../shared/types/Common";
import {MathUtils} from "../MathUtils";
import {ControlLaw} from "../ControlLaws";

export class TFLeg implements Leg {

    public from: Waypoint;

    public to: Waypoint;

    private readonly mDistance: NauticalMiles;

    private readonly mBearing: Degrees;

    constructor(from: Waypoint, to: Waypoint) {
        this.from = from;
        this.to = to;
        this.mDistance = from.distanceTo(to);
        this.mBearing = from.bearingTo(to);
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
     * @param ppos {LatLong} the current position of the aircraft
     */
    getAircraftToLegBearing(ppos: LatLon): number {
        const aircraftToTerminationBearing = ppos.initialBearingTo(this.to.coordinates);

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

    getDistanceToGo(ppos: LatLon): NauticalMiles {
        const aircraftLegBearing = this.getAircraftToLegBearing(ppos);

        const absDtg = ppos.distanceTo(this.to.coordinates);

        // @todo should be abeam distance
        if (aircraftLegBearing >= 90 && aircraftLegBearing <= 270) {
            // Since a line perpendicular to the leg is formed by two 90 degree angles, an aircraftLegBearing outside
            // (North - 90) and (North + 90) is in the lower quadrants of a plane centered at the TO fix. This means
            // the aircraft is NOT past the TO fix, and DTG must be positive.

            return absDtg;
        }

        return -absDtg;    }

    getGuidanceParameters(ppos: LatLon, trueTrack: Degrees) {
        const fromLatLongAlt = this.from.coordinates;

        const desiredTrack = this.bearing;
        const trackAngleError = MathUtils.mod(desiredTrack - trueTrack + 180, 360) - 180;

        // crosstrack error
        const bearingAC = fromLatLongAlt.initialBearingTo(ppos);
        const bearingAB = desiredTrack;
        const distanceAC = fromLatLongAlt.distanceTo(ppos);

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

    getPseudoWaypointLocation(distanceBeforeTerminator: number): LatLon | undefined {
        return undefined;
    }

    get initialLocation(): LatLon | undefined {
        return this.from.coordinates;
    }

    isAbeam(ppos: LatLon) {
        const bearingAC = this.from.coordinates.initialBearingTo(ppos);
        const headingAC = Math.abs(MathUtils.diffAngle(this.bearing, bearingAC));
        if (headingAC > 90) {
            // if we're even not abeam of the starting point
            return false;
        }
        const distanceAC = this.from.coordinates.distanceTo(ppos);
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

    get terminatorLocation(): LatLon | undefined {
        return this.to.coordinates;
    }
}
