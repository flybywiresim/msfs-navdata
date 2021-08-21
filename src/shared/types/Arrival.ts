import { DatabaseItem, ProcedureTransition } from "./Common";
import { ProcedureLeg } from "./ProcedureLeg";

export interface Arrival extends DatabaseItem {
    enrouteTransitions: ProcedureTransition[],
    commonLegs: ProcedureLeg[],
    runwayTransitions: ProcedureTransition[],
}
