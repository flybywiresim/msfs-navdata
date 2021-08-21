import LatLon from 'geodesy/latlon-ellipsoidal-vincenty';
import {AltitudeConstraint, SpeedConstraint} from "./legs";
import { NauticalMiles } from "../../shared/types/Common";
import {ProcedureLeg} from "../../shared/types/ProcedureLeg";

export class Waypoint {
    identifier: string;

    coordinates: LatLon;

    altitudeConstraint: AltitudeConstraint | undefined;

    speedConstraint: SpeedConstraint | undefined;

    constructor(identifier: string, coordinates: LatLon) {
        this.identifier = identifier;
        this.coordinates = coordinates;
    }

    distanceTo(to: Waypoint): NauticalMiles {
        return this.coordinates.distanceTo(to.coordinates) / 1852;
    }

    bearingTo(to: Waypoint): NauticalMiles {
        let course = this.coordinates.initialBearingTo(to.coordinates);

        course =
            course < 0
                ? 360 + course
                : course;

        return course;
    }

    static fromTerminalLeg(data: ProcedureLeg): Waypoint {
        const waypoint = new Waypoint(data.ident, new LatLon(data.waypoint?.location.lat ?? 0, data.waypoint?.location.long ?? 0));
        waypoint.altitudeConstraint = { altitude1: data.altitude1, altitude2: data.altitude2, type: data.altitudeDescriptor };
        waypoint.speedConstraint = { speed: data.speed, type: data.speedDescriptor ?? 0 };
        return waypoint;
    }
}
