export interface DatabaseIdent {
    /** who this data comes from */
    provider: string,
    /** yycc where yy = last 2 digits of effective year, cc = sequential cycle number */
    airacCycle: string,
    /** Dates where this data is effective between */
    effectiveFromTo: [Date, Date],
    /** Dates between which the previous cycle was active */
    previousEffectiveFromTo: [Date, Date],
}
