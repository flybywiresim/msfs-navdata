import { AltitudeConstraint, Leg, PathVector, PathVectorType, SpeedConstraint } from "./index";
import { Degrees, Feet, Location, NauticalMiles } from "../../../shared/types/Common";

import { computeDestinationPoint } from "geolib";

export class CALeg implements Leg {

    public from: WayPoint;

    public course: Degrees;
    public altitude: Feet;
    public active: boolean;
    public ident: string;

    public segment: SegmentType;

    constructor(from: Waypoint, course: Degrees, altitude: Feet) {
        this.from = from;
        this.course = course;
        this.altitude = altitude;
        this.active = active;
        this.segment = segment;

        this.ident = Math.round(this.altitude).toFixed(0);
    }

    get bearing(): Degrees {
        return this.course;
    }

    get distance(): NauticalMiles {
        // TODO calc prediction... need previous leg term alt

        if (this.segment === SegmentType.Departure) {
            // assuming starting at 0 feet, yikes
            const dt = this.altitude / 1500;
            return dt * 150;
        }

        return 2;
    }

    get initialLocation(): LatLongData {
        return waypointToLocation(this.from);
    }

    get terminatorLocation(): LatLongData {
        // TODO calculate
        if (this.active) {
            const ppos = {
                lat: SimVar.GetSimVarValue('PLANE LATITUDE', 'degree latitude'),
                long: SimVar.GetSimVarValue('PLANE LONGITUDE', 'degree longitude'),
            };
            const dtg = this.getDistanceToGo(ppos);
            return Avionics.Utils.bearingDistanceToCoordinates(this.course, dtg, ppos.lat, ppos.long);
        }
        return Avionics.Utils.bearingDistanceToCoordinates(this.course, this.distance, this.from.infos.coordinates.lat, this.from.infos.coordinates.long);
    }

    getPredictedPath(isActive: boolean, ppos: Location, altitude: Feet, groundSpeed: Knots, verticalSpeed: FeetPerMinute): PathVector[] {
        const origin = isActive ? ppos : this.from.location;
        if (this.segment === SegmentType.Departure) {
            if (altitude >= this.altitude) {
                return [];
            }
            const dt = (this.altitude - altitude) / (verticalSpeed / 60);
            const end = computeDestinationPoint({ latitude: origin.lat, longitude: origin.lon }, dt * groundSpeed, this.course);
            return [
                {
                    type: PathVectorType.Line,
                    startPoint: origin,
                    endPoint: { lat: end.latitude, lon: end.longitude },
                }
            ];
        } else {
            if (altitude <= this.altitude) {
                return [];
            }
            const dt = (altitude - this.altitude) / (verticalSpeed / 60);
            const end = computeDestinationPoint({ latitude: origin.lat, longitude: origin.lon }, dt * groundSpeed, this.course);
            return [
                {
                    type: PathVectorType.Line,
                    startPoint: origin,
                    endPoint: { lat: end.latitude, lon: end.longitude },
                }
            ];
        }
    }

    getGuidanceParameters(_ppos: LatLongData, _trueTrack: Track): GuidanceParameters | null {
        return {
            law: ControlLaw.TRACK,
            course: this.course,
        };
    }

    getDistanceToGo(_ppos: LatLongData): NauticalMiles {
        // TODO all this stuff should come from FMGC
        const alt = SimVar.GetSimVarValue('PLANE ALTITUDE', 'feet');
        const vs = SimVar.GetSimVarValue('VERTICAL SPEED', 'feet per second');
        const gs = SimVar.GetSimVarValue('GPS GROUND SPEED', 'knots');

        if (this.segment === SegmentType.Departure) {
            if (alt >= this.altitude) {
                return 0;
            }
            const dt = (this.altitude - alt) / vs;
            return dt * gs;
        } else {
            if (alt <= this.altitude) {
                return 0;
            }
            const dt = (alt - this.altitude) / vs;
            return dt * gs;
        }
    }

    getPseudoWaypointLocation(distanceBeforeTerminator: number): Location | undefined {
        return undefined;
    }

    isAbeam(ppos: Location) {
        // TODO
        return true;
    }

    get speedConstraint(): SpeedConstraint | undefined {
        return undefined;
    }

    get altitudeConstraint(): AltitudeConstraint | undefined {
        return undefined;
    }

    toString(): string {
        return `<CALeg course=${this.course} alt=${Math.round(this.altitude)}>`;
    }
}
