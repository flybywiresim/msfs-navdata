import { Transition } from ".";
import { k2, maxRollRate } from '../GuidanceConstants';
import { CALeg } from "../legs/CALeg";
import { CDLeg } from "../legs/CDLeg";
import { CFLeg } from "../legs/CFLeg";
import { CILeg } from "../legs/CILeg";
import { CRLeg } from "../legs/CRLeg";
import { DFLeg } from "../legs/DFLeg";
import { FALeg } from "../legs/FALeg";
import { FMLeg } from "../legs/FMLeg";
import { HALeg, HFLeg, HMLeg } from "../legs/HXLeg";
import { TFLeg } from "../legs/TFLeg";
import { VALeg } from "../legs/VALeg";
import { VDLeg } from "../legs/VDLeg";
import { VILeg } from "../legs/VILeg";
import { VMLeg } from "../legs/VMLeg";
import { VRLeg } from "../legs/VRLeg";

export type Type4PreviousLeg = CALeg | CDLeg | CFLeg | CILeg | CRLeg | DFLeg | FALeg | FMLeg | HALeg | HFLeg | HMLeg | TFLeg | VALeg | VILeg | VDLeg | VMLeg | VRLeg;
export type Type4NextLeg = DFLeg | FALeg | FMLeg;

export class Type4Transition extends Transition {
    public previousLeg: Type4PreviousLeg;

    public nextLeg: Type4NextLeg;

    public radius: NauticalMiles;

    public clockwise: boolean;

    private centre: LatLongData;
    private itp: LatLongData;
    public ftp: LatLongData;
    private angle: Degrees;
    public distance: NauticalMiles = 0;

    constructor(
        previousLeg: Type4PreviousLeg,
        nextLeg: Type4NextLeg,
        active: boolean,
    ) {
        super();
        this.previousLeg = previousLeg;
        this.nextLeg = nextLeg;

        // TODO vnav to provide predicted speed at leg termination
        const kts = Math.max(this.previousLeg.speedConstraint?.speed ?? SimVar.GetSimVarValue('AIRSPEED TRUE', 'knots'), 150); // knots, i.e. nautical miles per hour;
        const gs = kts;

        // TODO forced turn direction
        const courseChange = Avionics.Utils.diffAngle(previousLeg.bearing, nextLeg.bearing);
        this.clockwise = courseChange >= 0;

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
        this.radius = (kts ** 2 / (9.81 * Math.tan(finalBankAngle * Avionics.Utils.DEG2RAD))) / 6080.2;

        const initialBankAngle = active ? SimVar.GetSimVarValue('PLANE BANK DEGREES', 'radians') * 180 / Math.PI : 0;
        const deltaPhi = Math.abs((this.clockwise ? 1 : -1) * finalBankAngle - initialBankAngle);

        // calculate RAD
        const rad = gs / 3600 * (Math.sqrt(1 + 2 * k2 * 9.81 * deltaPhi / maxRollRate) - 1) / (k2 * 9.81);

        if (rad < 0.05) {
            this.itp = this.previousLeg.terminatorLocation;
        } else {
            this.itp = Avionics.Utils.bearingDistanceToCoordinates(this.previousLeg.bearing, rad, this.previousLeg.terminatorLocation.lat, this.previousLeg.terminatorLocation.long);
            this.distance += rad;
        }

        this.centre = Avionics.Utils.bearingDistanceToCoordinates(Avionics.Utils.clampAngle(this.previousLeg.bearing + 90), this.radius, this.previousLeg.terminatorLocation.lat, this.previousLeg.terminatorLocation.long);

        // TODO direct solution
        for (let i = 0; i < 360; i += 0.2) {
            const ftpBearingOut = Avionics.Utils.clampAngle(this.previousLeg.bearing + (this.clockwise ? i : -i));
            const centreFtp = Avionics.Utils.clampAngle(ftpBearingOut + (this.clockwise ? -90 : 90));
            this.ftp = Avionics.Utils.bearingDistanceToCoordinates(centreFtp, this.radius, this.centre.lat, this.centre.long);
            const ftpTp = Avionics.Utils.computeGreatCircleHeading(this.ftp, this.nextLeg.terminatorLocation);
            if (Avionics.Utils.diffAngle(ftpBearingOut, ftpTp) < 0.4) {
                //console.log('type 3 converged');
                break;
            }
        }

        //this.ftp = tangent(this.centre, this.nextLeg.terminatorLocation, this.radius, this.clockwise);

        // TODO what about forced turn
        this.angle = Math.abs(Avionics.Utils.computeGreatCircleHeading(this.centre, this.ftp) - Avionics.Utils.computeGreatCircleHeading(this.centre, this.itp));
        this.distance += this.angle / 360 * Math.PI * this.radius;
    }

    get isCircularArc(): boolean {
        return true;
    }

    isAbeam(ppos: LatLongAlt): boolean {
        const bearingAC = Avionics.Utils.computeGreatCircleHeading(this.itp, ppos);
        const headingAC = Math.abs(MathUtils.diffAngle(this.previousLeg.bearing, bearingAC));
        return headingAC <= 90;
    }

    getTurningPoints(): [LatLongData, LatLongData] {
        return [this.itp, this.ftp];
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
        const bearingPpos = Avionics.Utils.computeGreatCircleHeading(
            this.centre,
            ppos
        );

        const bearingItp = Avionics.Utils.computeGreatCircleHeading(
            this.centre,
            this.itp
        )

        const diff = this.clockwise ? Avionics.Utils.diffAngle(bearingPpos, bearingItp) : Avionics.Utils.diffAngle(bearingItp, bearingPpos);
        if (diff < 0) {
            return Avionics.Utils.computeGreatCircleDistance(ppos, this.itp) + 2 * Math.PI * this.radius * this.angle / 360;
        } else {
            const bearingFtp = Avionics.Utils.computeGreatCircleHeading(this.centre, this.ftp);
            const angleToGo = this.clockwise ? Avionics.Utils.diffAngle(bearingPpos, bearingFtp) : Avionics.Utils.diffAngle(bearingFtp, bearingPpos);

            const circumference = 2 * Math.PI * this.radius;
            return circumference / 360 * angleToGo;
        }
    }

    getGuidanceParameters(ppos: LatLongAlt, trueTrack: number): GuidanceParameters | null {
        const bearingPpos = Avionics.Utils.computeGreatCircleHeading(
            this.centre,
            ppos
        );

        const bearingItp = Avionics.Utils.computeGreatCircleHeading(
            this.centre,
            this.itp
        )

        let desiredTrack;
        let crossTrackError;
        let phiCommand;

        const distanceFromCenter = Avionics.Utils.computeGreatCircleDistance(
            this.centre,
            ppos,
        );

        const diff = this.clockwise ? Avionics.Utils.diffAngle(bearingPpos, bearingItp) : Avionics.Utils.diffAngle(bearingItp, bearingPpos);
        if (diff < 0) {
            desiredTrack = this.previousLeg.bearing;
            const bearingItpPpos = Avionics.Utils.computeGreatCircleHeading(
                ppos,
                this.itp
            );
            const delta = Math.abs(Avionics.Utils.diffAngle(bearingItpPpos, desiredTrack));
            crossTrackError = distanceFromCenter * Math.sin(delta * Math.PI / 180);
            phiCommand = 0;
        } else {
            desiredTrack = mod(
                this.clockwise ? bearingPpos + 90 : bearingPpos - 90,
                360,
            );
            crossTrackError = this.clockwise
                ? distanceFromCenter - this.radius
                : this.radius - distanceFromCenter;
            const groundSpeed = SimVar.GetSimVarValue('GPS GROUND SPEED', 'meters per second');
            phiCommand = this.getNominalRollAngle(groundSpeed);
        }

        const trackAngleError = mod(desiredTrack - trueTrack + 180, 360) - 180;

        return {
            law: ControlLaw.LATERAL_PATH,
            trackAngleError,
            crossTrackError,
            phiCommand,
        };
    }

    getNominalRollAngle(gs): Degrees {
        return (this.clockwise ? 1 : -1) * Math.atan((gs ** 2) / (this.radius * 1852 * 9.81)) * (180 / Math.PI);
    }

    toString(): string {
        return `Type4Transition<radius=${this.radius} clockwisew=${this.clockwise}>`;
    }

    public getPredictedPath(): PathVector[] {
        const vectors: PathVector[] = [];

        if (this.radSegment) {
            vectors.push({
                type: PathVectorType.Line,
                startPoint: this.from.coordinates,
                endPoint: this.itp.coordinates,
            });
        }

        vectors.push({
            type: PathVectorType.Arc,
            startPoint: this.itp.coordinates,
            centrePoint: this.turnCentre.coordinates,
            sweepAngle: (this.clockwise ? -1 : 1) * this.angle,
        });

        return vectors;
    }
}