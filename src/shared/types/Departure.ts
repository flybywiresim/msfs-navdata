import { DatabaseItem, ProcedureTransition } from "./Common";
import { ProcedureLeg } from "./ProcedureLeg";

export interface Departure extends DatabaseItem {
    runwayTransitions: ProcedureTransition[],
    commonLegs: ProcedureLeg[],
    enrouteTransitions: ProcedureTransition[],
    engineOutLegs: ProcedureLeg[],
}
