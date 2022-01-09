import { DatabaseItem, ProcedureTransition } from './Common';
import { ProcedureLeg } from './ProcedureLeg';

export enum ApproachType {
    Unknown,
    LocBackcourse,
    VorDme,
    Fms,
    Igs,
    Ils,
    Gls,
    Loc,
    Mls,
    Ndb,
    Gps,
    NdbDme,
    Rnav,
    Vortac,
    Tacan,
    Sdf,
    Vor,
    MlsTypeA,
    Lda,
    MlsTypeBC,
}
export interface Approach extends DatabaseItem {
    /**
     * Type of approach guidance
     */
    type: ApproachType,
    /**
     * Arrival transitions
     */
    transitions: ProcedureTransition[],
    /**
     * Approach legs (common legs and runway transition legs), ending at the MAP
     */
    legs: ProcedureLeg[],
    /**
     * Missed approach legs, starting at the MAP
     */
    missedLegs: ProcedureLeg[],
}
