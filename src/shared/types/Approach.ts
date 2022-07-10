import { DatabaseItem, ProcedureTransition } from './Common';
import { ProcedureLeg } from './ProcedureLeg';

export enum ApproachType {
    Unknown = 'UKN',
    LocBackcourse = 'LOCBC',
    VorDme = 'VDME',
    Fms = 'FMS',
    Igs = 'IGS',
    Ils = 'ILS',
    Gls = 'GLS',
    Loc = 'LOC',
    Mls = 'MLS',
    Ndb = 'NDB',
    Gps = 'GPS',
    NdbDme = 'NDME',
    Rnav = 'RNV',
    Vortac = 'VTAC',
    Tacan = 'TCN',
    Sdf = 'SDN',
    Vor = 'VOR',
    MlsTypeA = 'MLSA',
    Lda = 'LDA',
    MlsTypeBC = 'MLSBC',
    Visual = 'VIS',
}

export enum LevelOfService {
    Lpv = 1 << 0,
    Lpv200 = 1 << 1,
    Lp = 1 << 2,
    Lnav = 1 << 3,
    LnavVnav = 1 << 4,
}

export interface Approach extends DatabaseItem {
    /**
     * Runway this approach is to, or not if multiple runways
     */
    runwayIdent?: string,

    /**
     * Multiple indicator
     */
    multipleIndicator: string,

    /**
     * Type of approach guidance
     */
    type: ApproachType,

    /**
     * RNP-AR approach?
     */
    authorisationRequired: boolean,

    /**
     * SBAS level of service authorised bitfield
     * not available for all backends
     */
    levelOfService?: LevelOfService,

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
