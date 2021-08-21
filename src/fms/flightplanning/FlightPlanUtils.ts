import { Leg } from "../common/legs";
import { LegType, ProcedureLeg } from "../../shared/types/ProcedureLeg";
import { Transition } from "../common/transitions";
import { CALeg } from "../common/legs/CALeg";
import { CDLeg } from "../common/legs/CDLeg";
import { CFLeg } from "../common/legs/CFLeg";
import { Waypoint } from "../common/Waypoint";
import { CILeg } from "../common/legs/CILeg";
import { CRLeg } from "../common/legs/CRLeg";
import { DFLeg } from "../common/legs/DFLeg";
import { FALeg } from "../common/legs/FALeg";
import { FCLeg } from "../common/legs/FCLeg";
import { FDLeg } from "../common/legs/FDLeg";
import { FMLeg } from "../common/legs/FMLeg";
import { IFLeg } from "../common/legs/IFLeg";
import { PILeg } from "../common/legs/PILeg";
import { RFLeg } from "../common/legs/RFLeg";
import { TFLeg } from "../common/legs/TFLeg";
import { VALeg } from "../common/legs/VALeg";
import {VDLeg} from "../common/legs/VDLeg";
import {VILeg} from "../common/legs/VILeg";
import {VMLeg} from "../common/legs/VMLeg";
import {VRLeg} from "../common/legs/VRLeg";
import {AFLeg} from "../common/legs/AFLeg";

export class FlightPlanUtils {
    public static fromProcedureLegs(input: ProcedureLeg[]): Leg[] {
        return input.map((leg, index, array) => {
            switch(leg.type) {
                default:
                    return undefined as any;
                case LegType.CA:
                    return new CALeg(leg.altitude1, leg.magneticCourse);
                case LegType.CD:
                    return new CDLeg(leg.magneticCourse, leg.routeDistance);
                case LegType.CF:
                    return new CFLeg(new Waypoint(leg.waypoint?.ident, leg.waypoint?.location), leg.magneticCourse, leg.routeDistance);
                case LegType.CI:
                    return new CILeg(leg.magneticCourse);
                case LegType.CR:
                    return new CRLeg(leg.magneticCourse);
                case LegType.DF:
                    return new DFLeg(new Waypoint(leg.waypoint?.ident, leg.waypoint?.location));
                case LegType.FA:
                    return new FALeg(new Waypoint(leg.waypoint?.ident, leg.waypoint?.location), leg.altitude1, leg.magneticCourse);
                case LegType.FC:
                    return new FCLeg(new Waypoint(leg.waypoint?.ident, leg.waypoint?.location), leg.routeDistance, leg.magneticCourse);
                case LegType.FD:
                    return new FDLeg(new Waypoint(leg.waypoint?.ident, leg.waypoint?.location), leg.routeDistance, leg.magneticCourse);
                case LegType.FM:
                    return new FMLeg(new Waypoint(leg.waypoint?.ident, leg.waypoint?.location), leg.magneticCourse);
                case LegType.HA:
                    break;
                case LegType.HF:
                    break;
                case LegType.HM:
                    break;
                case LegType.IF:
                    return new IFLeg(new Waypoint(leg.waypoint?.ident, leg.waypoint?.location));
                case LegType.PI:
                    return new PILeg(leg.magneticCourse, leg.routeDistance);
                case LegType.RF:
                    return new RFLeg(new Waypoint(leg.waypoint?.ident, leg.waypoint?.location), leg.magneticCourse, leg.routeDistance, leg.arcRadius ?? 0);
                case LegType.TF:
                    return new TFLeg(new Waypoint(array[index - 1].waypoint?.ident, array[index - 1].waypoint?.location), new Waypoint(leg.waypoint?.ident, leg.waypoint?.location));
                case LegType.VA:
                    return new VALeg(leg.altitude1, leg.magneticCourse);
                case LegType.VD:
                    return new VDLeg(leg.magneticCourse, leg.routeDistance);
                case LegType.VI:
                    return new VILeg(leg.magneticCourse);
                case LegType.VM:
                    return new VMLeg(leg.magneticCourse);
                case LegType.VR:
                    return new VRLeg(leg.magneticCourse);
                case LegType.AF:
                    return new AFLeg(new Waypoint(leg.waypoint?.ident, leg.waypoint?.location), leg.theta ?? 0, leg.rho ?? 0, leg.arcCentreFix?.location ?? undefined as any);
            }
        })
    }

    public static buildTransitionsFromLegs(input: Leg[]): Transition[] {
        const transitions: Transition[] = [];

        return transitions;
    }

    public static getRunwayFromApproachIdent(ident: string): string {
        return ident.substr(1);
    }
}
