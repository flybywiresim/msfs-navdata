import { AltitudeConstraint, SpeedConstraint } from "./legs";
import { Location } from "../../shared/types/Common";
import { ProcedureLeg } from "../../shared/types/ProcedureLeg";

export class Waypoint {
    identifier: string;

    coordinates: Location;

    altitudeConstraint: AltitudeConstraint | undefined;

    speedConstraint: SpeedConstraint | undefined;

    constructor(identifier?: string, coordinates?: Location) {
        this.identifier = identifier ?? '';
        this.coordinates = coordinates ?? undefined as any;
    }

    static fromTerminalLeg(data: ProcedureLeg): Waypoint {
        const waypoint = new Waypoint(data.ident, { lat: data.waypoint?.location.lat ?? 0, lon: data.waypoint?.location.lon ?? 0 });
        waypoint.altitudeConstraint = { altitude1: data.altitude1, altitude2: data.altitude2, type: data.altitudeDescriptor };
        waypoint.speedConstraint = { speed: data.speed ?? 0, type: data.speedDescriptor ?? 0 };
        return waypoint;
    }
}
