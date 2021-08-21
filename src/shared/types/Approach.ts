import { DatabaseItem, ProcedureTransition } from "./Common";
import { ProcedureLeg } from "./ProcedureLeg";

export interface Approach extends DatabaseItem {
    transitions: ProcedureTransition[],
    legs: ProcedureLeg[],
    missedLegs: ProcedureLeg[],
}
