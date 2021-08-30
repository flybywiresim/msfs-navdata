import {
    AltitudeDescriptor,
    LegType,
    ProcedureLeg,
    SpeedDescriptor,
    TurnDirection
} from "../../../shared/types/ProcedureLeg";
import {TerminalProcedure as NaviProcedure} from "./types/TerminalProcedures";
import {WaypointType} from "../../../shared/types/Waypoint";
import {Departure} from "../../../shared/types/Departure";
import {Arrival} from "../../../shared/types/Arrival";
import {Approach, ApproachType} from "../../../shared/types/Approach";
import {Airway, AirwayDirection, AirwayLevel} from "../../../shared/types/Airway";
import {EnRouteAirway as NaviAirwayFix} from "./types/EnrouteAirways";
import {Airport as NaviAirport} from "./types/Airports";
import {Airport} from "../../../shared/types/Airport";
import {Runway, RunwaySurfaceType} from "../../../shared/types/Runway";
import {IlsMlsGlsCategory} from "./types/LocalizerGlideslopes";
import {LsCategory} from "../../../shared/types/Common";
import {Runway as NaviRunway} from "./types/Runways";
import {TerminalNDBNavaid} from "./types/NDBNavaids";
import {NdbClass, NdbNavaid} from "../../../shared/types/NdbNavaid";
import {VhfNavaidType} from "../../../shared/types/VhfNavaid";
import {NavigraphDfd} from "./dfd";

export class DFDMappers {
    private queries: NavigraphDfd;

    constructor(queries: NavigraphDfd) {
        this.queries = queries;
    }

    public mapTerminalNdb(ndb: TerminalNDBNavaid): NdbNavaid {
        return {
            icaoCode: ndb.icaoCode,
            ident: ndb.ndbIdentifier,
            databaseId: `N${ndb.icaoCode}${ndb.airportIdentifier}${ndb.ndbIdentifier}`,
            frequency: ndb.ndbFrequency,
            stationDeclination: 0,
            location: { lat: ndb.ndbLatitude, lon: ndb.ndbLongitude },
            class: NdbClass.Unknown,
            type: VhfNavaidType.Unknown,
        }
    }

    public mapAirport(airport: NaviAirport): Airport {
        let surfaceCode = RunwaySurfaceType.Unknown;
        switch (airport.longestRunwaySurfaceCode) {
            case 'H':
                surfaceCode = RunwaySurfaceType.Hard;
                break;
            case 'S':
                surfaceCode = RunwaySurfaceType.Soft;
                break;
            case 'W':
                surfaceCode = RunwaySurfaceType.Water;
                break;
        }
        return {
            databaseId: DFDMappers.airportDatabaseId(airport),
            ident: airport.airportIdentifier,
            icaoCode: airport.icaoCode,
            airportName: airport.airportName,
            location: { lat: airport.airportRefLatitude, lon: airport.airportRefLongitude, alt: airport.elevation },
            speedLimit: airport.speedLimit || undefined,
            speedLimitAltitude: airport.speedLimitAltitude || undefined,
            transitionAltitude: airport.transitionAltitude || undefined,
            transitionLevel: airport.transitionLevel / 100 || undefined,
            longestRunwaySurfaceType: surfaceCode,
        };
    }

    public mapLsCategory(naviCategory: IlsMlsGlsCategory): LsCategory {
        switch(naviCategory) {
            case '0':
                return LsCategory.LocOnly;
            case '1':
                return LsCategory.Category1;
            case '2':
                return LsCategory.Category2;
            case '3':
                return LsCategory.Category3;
            case "I":
                return LsCategory.IgsOnly;
            case "L":
                return LsCategory.LdaGlideslope;
            case "A":
                return LsCategory.LdaOnly;
            case "S":
                return LsCategory.SdfGlideslope;
            case "F":
                return LsCategory.SdfOnly;
        }
        return LsCategory.None;
    }

    public mapRunway(runway: NaviRunway): Runway {
        return {
            icaoCode: runway.icaoCode,
            ident: runway.runwayIdentifier,
            databaseId: `R  ${runway.airportIdentifier}${runway.runwayIdentifier}`,
            airportIdent: runway.airportIdentifier,
            thresholdLocation: { lat: runway.runwayLatitude, lon: runway.runwayLongitude },
            bearing: runway.runwayTrueBearing,
            magneticBearing: runway.runwayMagneticBearing,
            gradient: runway.runwayGradient,
            thresholdCrossingHeight: runway.thresholdCrossingHeight,
            length: runway.runwayLength,
            width: runway.runwayWidth,
            lsIdent: runway.llzIdentifier,
            lsCategory: this.mapLsCategory(runway.llzMlsGlsCategory),
            surfaceType: RunwaySurfaceType.Unknown, // navigraph pls
        }
    }

    public mapLegType(legType: string): LegType {
        switch (legType) {
            case 'IF':
                return LegType.IF;
            case 'TF':
                return LegType.TF;
            case 'CF':
                return LegType.CF;
            case 'DF':
                return LegType.DF;
            case 'FA':
                return LegType.FA;
            case 'FC':
                return LegType.FC;
            case 'FD':
                return LegType.FD;
            case 'FM':
                return LegType.FM;
            case 'CA':
                return LegType.CA;
            case 'CD':
                return LegType.CD;
            case 'CI':
                return LegType.CI;
            case 'CR':
                return LegType.CR;
            case 'RF':
                return LegType.RF;
            case 'AF':
                return LegType.AF;
            case 'VA':
                return LegType.VA;
            case 'VD':
                return LegType.VD;
            case 'VI':
                return LegType.VI;
            case 'VM':
                return LegType.VM;
            case 'VR':
                return LegType.VR;
            case 'PI':
                return LegType.PI;
            case 'HA':
                return LegType.HA;
            case 'HF':
                return LegType.HF;
            case 'HM':
                return LegType.HM;
        }
        return LegType.Unknown;
    }

    public mapAltitudeDescriptor(desc: string): AltitudeDescriptor {
        switch (desc) {
            case '+':
                return AltitudeDescriptor.AtOrAboveAlt1;
            case '-':
                return AltitudeDescriptor.AtOrBelowAlt1;
            case '@':
            case null:
                return AltitudeDescriptor.AtAlt1;
            case 'B':
                return AltitudeDescriptor.BetweenAlt1Alt2;
            case 'C':
                return AltitudeDescriptor.AtOrAboveAlt2;
            case 'G':
                return AltitudeDescriptor.AtAlt1GsMslAlt2;
            case 'H':
                return AltitudeDescriptor.AtOrAboveAlt1GsMslAlt2;
            case 'I':
                return AltitudeDescriptor.AtAlt1GsIntcptAlt2;
            case 'J':
                return AltitudeDescriptor.AtOrAboveAlt1GsIntcptAlt2;
            case 'V':
                return AltitudeDescriptor.AtOrAboveAlt1AngleAlt2;
            case 'X':
                return AltitudeDescriptor.AtAlt1AngleAlt2;
            case 'Y':
                return AltitudeDescriptor.AtOrBelowAlt1AngleAlt2;
        }
        return AltitudeDescriptor.None;
    }

    public mapSpeedLimitDescriptor(desc: string): SpeedDescriptor {
        switch (desc) {
            case '@':
            case '':
                return SpeedDescriptor.Mandatory;
            case '+':
                return SpeedDescriptor.Minimum;
            case '-':
                return SpeedDescriptor.Maximum;
        }
        return SpeedDescriptor.Mandatory;
    }

    public mapTurnDirection(dir: string): TurnDirection {
        switch (dir) {
            case 'L':
                return TurnDirection.Left;
            case 'R':
                return TurnDirection.Right;
        }
        return TurnDirection.Unknown;
    }

    public mapLegIdent(leg: NaviProcedure): string {
        return leg.waypointIdentifier ?? leg.seqno.toFixed(0); // TODO proper format
    }

    public mapLeg(leg: NaviProcedure, icaoCode: string): ProcedureLeg {
        return {
            databaseId: DFDMappers.procedureDatabaseId(leg, icaoCode) + leg.seqno,
            icaoCode: icaoCode,
            ident: this.mapLegIdent(leg),
            procedureIdent: leg.procedureIdentifier,
            type: this.mapLegType(leg.pathTermination),
            overfly: leg.waypointDescriptionCode?.charAt(1) === 'Y',
            waypoint: leg.waypointIdentifier ? {
                icaoCode: icaoCode,
                ident: leg.waypointIdentifier,
                location: { lat: leg.waypointLatitude, lon: leg.waypointLongitude },
                databaseId: `W${leg.icaoCode}${leg.airportIdentifier}${leg.waypointIdentifier}`,
                name: leg.waypointIdentifier,
                type: WaypointType.Unknown,
            } : undefined, // TODO fetch these
            recommendedNavaid: undefined, // TODO fetch these
            rho: leg.rho,
            theta: leg.theta,
            arcCentreFix: undefined, // TODO fetch these
            arcRadius: leg.arcRadius,
            length: leg.distanceTime === 'D' ? leg.routeDistanceHoldingDistanceTime : undefined,
            lengthTime: leg.distanceTime === 'T' ? leg.routeDistanceHoldingDistanceTime : undefined,
            rnp: leg.rnp,
            transitionAltitude: leg.transitionAltitude,
            altitudeDescriptor: (!leg.altitude1 && !leg.altitude2) ? AltitudeDescriptor.None : this.mapAltitudeDescriptor(leg.altitudeDescription),
            altitude1: leg.altitude1,
            altitude2: leg.altitude2,
            speed: leg.speedLimit,
            speedDescriptor: leg.speedLimit ? this.mapSpeedLimitDescriptor(leg.speedLimitDescription) : undefined,
            turnDirection: this.mapTurnDirection(leg.turnDirection),
            magneticCourse: leg.magneticCourse,
        };
    }

    public async mapDepartures(legs: NaviProcedure[], icaoCode: string): Promise<Departure[]> {
        const departures: Map<string, Departure> = new Map();

        // legs are sorted in sequence order by the db... phew
        for(const leg of legs) {
            if (!departures.has(leg.procedureIdentifier)) {
                departures.set(leg.procedureIdentifier, {
                    icaoCode: icaoCode,
                    databaseId: DFDMappers.procedureDatabaseId(leg, icaoCode),
                    ident: leg.procedureIdentifier,
                    runwayTransitions: [],
                    commonLegs: [],
                    enrouteTransitions: [],
                    engineOutLegs: [],
                });
            }

            const apiLeg = this.mapLeg(leg, icaoCode);
            const departure = departures.get(leg.procedureIdentifier);
            let transition;
            switch (leg.routeType) {
                case '0':
                    departure?.engineOutLegs.push(apiLeg);
                    break;
                case '1':
                case '4':
                case 'F':
                case 'T':
                    if(leg.transitionIdentifier[4] === 'B') {
                        const runways = (await this.queries.getRunwaysAtAirport(leg.airportIdentifier))
                            .filter(runway => runway.ident.substr(0, 4) === leg.transitionIdentifier.substring(0, 4));
                        runways.forEach(runway => {
                            transition = departure?.runwayTransitions.find((t) => t.ident === runway.ident);
                            if (!transition) {
                                transition = {
                                    ident: runway.ident,
                                    legs: [],
                                }
                                departure?.runwayTransitions.push(transition);
                            }
                            transition.legs.push(apiLeg);
                        })
                    }
                    else {
                        transition = departure?.runwayTransitions.find((t) => t.ident === leg.transitionIdentifier);
                        if (!transition) {
                            transition = {
                                ident: leg.transitionIdentifier,
                                legs: [],
                            }
                            departure?.runwayTransitions.push(transition);
                        }
                        transition.legs.push(apiLeg);
                    }
                    break;
                case '2':
                case '5':
                case 'M':
                    if(leg.transitionIdentifier === 'ALL') {
                        const runways = await this.queries.getRunwaysAtAirport(leg.airportIdentifier);
                        runways.forEach(runway => {
                            transition = departure?.runwayTransitions.find((t) => t.ident === runway.ident);
                            if (!transition) {
                                transition = {
                                    ident: runway.ident,
                                    legs: [],
                                }
                                departure?.runwayTransitions.push(transition);
                            }
                            transition.legs.push(apiLeg);
                        });
                    }
                    else if(leg.transitionIdentifier?.[4] === 'B') {
                        const runways = (await this.queries.getRunwaysAtAirport(leg.airportIdentifier))
                            .filter(runway => runway.ident.substr(0, 4) === leg.transitionIdentifier.substring(0, 4));
                        runways.forEach(runway => {
                            transition = departure?.runwayTransitions.find((t) => t.ident === runway.ident);
                            if (!transition) {
                                transition = {
                                    ident: runway.ident,
                                    legs: [],
                                }
                                departure?.runwayTransitions.push(transition);
                            }
                            transition.legs.push(apiLeg);
                        })
                    }
                    else if(leg.transitionIdentifier) {
                        transition = departure?.runwayTransitions.find((t) => t.ident === leg.transitionIdentifier);
                        if (!transition) {
                            transition = {
                                ident: leg.transitionIdentifier,
                                legs: [],
                            }
                            departure?.runwayTransitions.push(transition);
                        }
                        transition.legs.push(apiLeg);
                    }
                    else
                        departure?.commonLegs.push(apiLeg);
                    break;
                case '3':
                case '6':
                case 'S':
                case 'V':
                    transition = departure?.enrouteTransitions.find((t) => t.ident === leg.transitionIdentifier);
                    if (!transition) {
                        transition = {
                            ident: leg.transitionIdentifier,
                            legs: [],
                        }
                        departure?.enrouteTransitions.push(transition);
                    }
                    transition.legs.push(apiLeg);
                    break;
                default:
                    console.error(`Unmappable leg ${apiLeg.ident}: ${leg.pathTermination} in ${leg.procedureIdentifier}: SID`);
            }
        }

        return Array.from(departures.values());
    }

    public async mapArrivals(legs: NaviProcedure[], icaoCode: string): Promise<Arrival[]> {
        const arrivals: Map<string, Arrival> = new Map();

        // legs are sorted in sequence order by the db... phew
        for(const leg of legs) {
            if (!arrivals.has(leg.procedureIdentifier)) {
                arrivals.set(leg.procedureIdentifier, {
                    icaoCode: icaoCode,
                    databaseId: DFDMappers.procedureDatabaseId(leg, icaoCode),
                    ident: leg.procedureIdentifier,
                    runwayTransitions: [],
                    commonLegs: [],
                    enrouteTransitions: [],
                });
            }

            const apiLeg = this.mapLeg(leg, icaoCode);
            const arrival = arrivals.get(leg.procedureIdentifier);
            let transition;
            switch (leg.routeType) {
                case '1':
                case '4':
                case 'F':
                    transition = arrival?.enrouteTransitions.find((t) => t.ident === leg.transitionIdentifier);
                    if (!transition) {
                        transition = {
                            ident: leg.transitionIdentifier,
                            legs: [],
                        }
                        arrival?.enrouteTransitions.push(transition);
                    }
                    transition.legs.push(apiLeg);
                    break;
                case '2':
                case '5':
                case '8':
                case 'M':
                    if(leg.transitionIdentifier === 'ALL') {
                        const runways = await this.queries.getRunwaysAtAirport(leg.airportIdentifier);
                        runways.forEach(runway => {
                            transition = arrival?.runwayTransitions.find((t) => t.ident === runway.ident);
                            if (!transition) {
                                transition = {
                                    ident: runway.ident,
                                    legs: [],
                                }
                                arrival?.runwayTransitions.push(transition);
                            }
                            transition.legs.push(apiLeg);
                        });
                    }
                    else if(leg.transitionIdentifier?.[4] === 'B') {
                        const runways = (await this.queries.getRunwaysAtAirport(leg.airportIdentifier))
                            .filter(runway => runway.ident.substr(0, 4) === leg.transitionIdentifier.substring(0, 4));
                        runways.forEach(runway => {
                            transition = arrival?.runwayTransitions.find((t) => t.ident === runway.ident);
                            if (!transition) {
                                transition = {
                                    ident: runway.ident,
                                    legs: [],
                                }
                                arrival?.runwayTransitions.push(transition);
                            }
                            transition.legs.push(apiLeg);
                        })
                    }
                    else if(leg.transitionIdentifier) {
                        transition = arrival?.runwayTransitions.find((t) => t.ident === leg.transitionIdentifier);
                        if (!transition) {
                            transition = {
                                ident: leg.transitionIdentifier,
                                legs: [],
                            }
                            arrival?.runwayTransitions.push(transition);
                        }
                        transition.legs.push(apiLeg);
                    }
                    else
                        arrival?.commonLegs.push(apiLeg);
                    break;
                case '3':
                case '6':
                case '9':
                case 'S':
                    if(leg.transitionIdentifier[4] === 'B') {
                        const runways = (await this.queries.getRunwaysAtAirport(leg.airportIdentifier))
                            .filter(runway => runway.ident.substr(0, 4) === leg.transitionIdentifier.substring(0, 4));
                        runways.forEach(runway => {
                            transition = arrival?.runwayTransitions.find((t) => t.ident === runway.ident);
                            if (!transition) {
                                transition = {
                                    ident: runway.ident,
                                    legs: [],
                                }
                                arrival?.runwayTransitions.push(transition);
                            }
                            transition.legs.push(apiLeg);
                        })
                    }
                    else {
                        transition = arrival?.runwayTransitions.find((t) => t.ident === leg.transitionIdentifier);
                        if (!transition) {
                            transition = {
                                ident: leg.transitionIdentifier,
                                legs: [],
                            }
                            arrival?.runwayTransitions.push(transition);
                        }
                        transition.legs.push(apiLeg);
                    }
                    break;
                default:
                    console.error(`Unmappable leg ${apiLeg.ident}: ${leg.pathTermination} in ${leg.procedureIdentifier}: STAR`);
            }
        }

        return Array.from(arrivals.values());
    }

    public mapApproachType(routeType: string): ApproachType {
        switch (routeType) {
            case 'B':
                return ApproachType.LocBackcourse;
            case 'D':
                return ApproachType.VorDme;
            case 'F':
                return ApproachType.Fms;
            case 'G':
                return ApproachType.Igs;
            case 'I':
                return ApproachType.Ils;
            case 'J':
                return ApproachType.Gls;
            case 'L':
                return ApproachType.Loc;
            case 'M':
                return ApproachType.Mls;
            case 'N':
                return ApproachType.Ndb;
            case 'P':
                return ApproachType.Gps;
            case 'Q':
                return ApproachType.NdbDme;
            case 'R':
                return ApproachType.Rnav;
            case 'S':
                return ApproachType.Vortac;
            case 'T':
                return ApproachType.Tacan;
            case 'U':
                return ApproachType.Sdf;
            case 'V':
                return ApproachType.Vor;
            case 'W':
                return ApproachType.MlsTypeA;
            case 'X':
                return ApproachType.Lda;
            case 'Y':
                return ApproachType.MlsTypeBC;
        }
        return ApproachType.Unknown;
    }

    public mapApproaches(legs: NaviProcedure[], icaoCode: string): Approach[] {
        const approaches: Map<string, Approach> = new Map();

        let missedApproachStarted = false;
        // legs are sorted in sequence order by the db... phew
        legs.forEach((leg) => {
            if (!approaches.has(leg.procedureIdentifier)) {
                approaches.set(leg.procedureIdentifier, {
                    icaoCode: icaoCode,
                    databaseId: DFDMappers.procedureDatabaseId(leg, icaoCode),
                    ident: leg.procedureIdentifier,
                    type: ApproachType.Unknown,
                    transitions: [],
                    legs: [],
                    missedLegs: [],
                });
            }

            const apiLeg = this.mapLeg(leg, icaoCode);
            const approach = approaches.get(leg.procedureIdentifier);

            if (leg.waypointDescriptionCode?.charAt(2) === 'M') {
                missedApproachStarted = true;
            }

            if (missedApproachStarted) {
                approach?.missedLegs.push(apiLeg);
            } else {
                let transition;
                switch (leg.routeType) {
                    case 'A':
                        transition = approach?.transitions.find((t) => t.ident === leg.transitionIdentifier);
                        if (!transition) {
                            transition = {
                                ident: leg.transitionIdentifier,
                                legs: [],
                            }
                            approach?.transitions.push(transition);
                        }
                        transition.legs.push(apiLeg);
                        break;
                    case 'B':
                    case 'D':
                    case 'F':
                    case 'G':
                    case 'I':
                    case 'J':
                    case 'L':
                    case 'M':
                    case 'N':
                    case 'P':
                    case 'Q':
                    case 'R':
                    case 'S':
                    case 'T':
                    case 'U':
                    case 'V':
                    case 'W':
                    case 'X':
                    case 'Y':
                        if (approach?.type === ApproachType.Unknown) {
                            approach.type = this.mapApproachType(leg.routeType);
                        }
                        approach?.legs.push(apiLeg);
                        break;
                    case 'Z':
                        approach?.missedLegs.push(apiLeg);
                        break;
                    default:
                        console.error(`Unmappable leg ${apiLeg.ident}: ${leg.pathTermination} in ${leg.procedureIdentifier}: Approach`);
                }
            }
        });

        return Array.from(approaches.values());
    }

    public mapAirwayLevel(level: string): AirwayLevel {
        switch (level) {
            case 'H':
                return AirwayLevel.High;
            case 'L':
                return AirwayLevel.Low;
            default:
            case 'B':
                return AirwayLevel.All;
        }
    }

    public mapAirwayDirection(direction: string): AirwayDirection {
        switch (direction) {
            case 'F':
                return AirwayDirection.Forward;
            case 'B':
                return AirwayDirection.Backward;
            default:
                return AirwayDirection.Either;
        }
    }

    public mapAirways(fixes: NaviAirwayFix[]): Airway[] {
        const airways: Airway[] = [];
        fixes.forEach((fix, index) => {
            if(!index || fixes[index - 1]?.waypointDescriptionCode[1] === 'E')
                airways.push({
                    databaseId: DFDMappers.mapAirwayIdent(fix),
                    icaoCode: fix.icaoCode,
                    ident: fix.routeIdentifier,
                    level: this.mapAirwayLevel(fix.flightlevel),
                    fixes: [],
                    direction: this.mapAirwayDirection(fix.directionRestriction),
                    minimumAltitudeForward: fix.minimumAltitude1,
                    minimumAltitudeBackward: fix.minimumAltitude2,
                    maximumAltitude: fix.maximumAltitude,
                });
            airways[airways.length - 1].fixes.push({
                icaoCode: fix.icaoCode,
                databaseId: `W${fix.icaoCode}    ${fix.waypointIdentifier}`, // TODO function
                ident: fix.waypointIdentifier,
                location: { lat: fix.waypointLatitude, lon: fix.waypointLongitude },
                type: WaypointType.Unknown, // TODO
            });
        });
        return airways;
    }

    // The MSFS "icao" code is a pretty clever globally unique ID, so we follow it, and extend it where needed
    // It is important to ensure that these are truly globally unique
    public static airportDatabaseId(airport: NaviAirport): string {
        return `A      ${airport.airportIdentifier}`;
    }

    public static procedureDatabaseId(procedure: NaviProcedure, icaoCode: string): string {
        return `P${icaoCode}${procedure.airportIdentifier}${procedure.procedureIdentifier}`;
    }

    public static mapAirwayIdent(airway: NaviAirwayFix): string {
        return `E${airway.icaoCode}    ${airway.routeIdentifier}`;
    }
}
