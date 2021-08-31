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
    type: ApproachType,
    transitions: ProcedureTransition[],
    legs: ProcedureLeg[],
    missedLegs: ProcedureLeg[],
}
