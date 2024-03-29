/**
 * Helpers to map Navigraph DFD data types to our data types
 * Notes:
 *  - Prefix all Navigraph types with "Navi" to avoid any bugs due to confusion
 */

/* eslint-disable no-await-in-loop */

import { Coordinates, distanceTo } from 'msfs-geo';
import {
    Airport,
    Airway,
    AirwayDirection,
    AirwayLevel,
    AltitudeDescriptor,
    Approach,
    ApproachType,
    ApproachWaypointDescriptor,
    Arrival,
    Departure,
    ElevatedCoordinates,
    FigureOfMerit,
    IlsNavaid,
    LegType,
    LsCategory,
    Marker,
    MarkerType,
    NdbClass,
    NdbNavaid,
    ProcedureLeg,
    RestrictiveAirspaceType,
    Runway,
    RunwaySurfaceType,
    SpeedDescriptor,
    TurnDirection,
    VhfNavaid,
    VhfNavaidType,
    VorClass,
    Waypoint,
    WaypointArea,
    WaypointDescriptor,
} from '../../../shared';
import { BoundaryPath, ControlledAirspace, ControlledAirspaceType, PathType, RestrictiveAirspace } from '../../../shared/types/Airspace';
import { AirportCommunication, CommunicationType, EnRouteCommunication, FirUirIndicator, FrequencyUnits } from '../../../shared/types/Communication';

// Navigraph types... all must be imported with "Navi" prefix to avoid any confusion in the code
import { TerminalProcedure as NaviProcedure } from './types/TerminalProcedures';
import { EnRouteAirway as NaviAirwayFix } from './types/EnrouteAirways';
import { Airport as NaviAirport } from './types/Airports';
import { Runway as NaviRunway } from './types/Runways';
import { EnrouteNDBNavaid as NaviEnrouteNdbNavaid, TerminalNDBNavaid as NaviTerminalNdbNavaid } from './types/NDBNavaids';
import { IlsMlsGlsCategory as NaviIlsMlsGlsCategory, LocalizerGlideslope as NaviIls } from './types/LocalizerGlideslopes';
import { VHFNavaid as NaviVhfNavaid } from './types/VHFNavaids';
import { NavigraphProvider } from './dfd';
import { TerminalWaypoint as NaviTerminalWaypoint } from './types/TerminalWaypoints';
import { EnrouteWaypoint as NaviEnrouteWaypoint } from './types/EnrouteWaypoints';
import { AirportCommunication as NaviAirportCommunication } from './types/AirportCommunication';
import { CommunicationType as NaviCommunicationType, FrequencyUnits as NaviFrequencyUnits } from './types/CommonCommunicationTypes';
import { EnrouteCommunication as NaviEnRouteCommunication } from './types/EnrouteCommunication';
import { AirspaceType as NaviAirspaceType, BoundaryVia as NaviBoundaryVia, ControlledAirspace as NaviControlledAirspace } from './types/ControlledAirspace';
import { RestrictiveAirspace as NaviRestrictiveAirspace, RestrictiveAirspaceType as NaviRestrictiveAirspaceType } from './types/RestrictiveAirspace';
import { Holding as NaviHolding } from './types/Holdings';
import { LocalizerMarker as NaviMarker } from './types/LocalizerMarker';
import { Gate as NaviGate } from './types/Gates';
import { Gate } from '../../../shared/types/Gate';
import { AirportSubsectionCode, EnrouteSubsectionCode, NavaidSubsectionCode, SectionCode } from '../../../shared/types/SectionCode';

type NaviWaypoint = NaviTerminalWaypoint | NaviEnrouteWaypoint;
type NaviNdbNavaid = NaviTerminalNdbNavaid | NaviEnrouteNdbNavaid;

type FixInfo = {
    icaoCode: string,
    airportIdent: string,
    ident: string,
    area: WaypointArea,
    prefix: string,
    suppressIcaoCode: boolean,
};

export class DFDMappers {
    private queries: NavigraphProvider;

    constructor(queries: NavigraphProvider) {
        this.queries = queries;
    }

    public mapIls(ils: NaviIls): IlsNavaid {
        return {
            sectionCode: SectionCode.Airport,
            subSectionCode: AirportSubsectionCode.LocalizerGlideSlope,
            icaoCode: ils.icaoCode,
            ident: ils.llzIdentifier,
            databaseId: DFDMappers.ilsNavaidDatabaseId(ils),
            frequency: ils.llzFrequency,
            stationDeclination: 0,
            locLocation: { lat: ils.llzLatitude, long: ils.llzLongitude },
            gsLocation: { lat: ils.gsLatitude, long: ils.gsLongitude, alt: ils.gsElevation },
            runwayIdent: ils.runwayIdentifier,
            locBearing: ils.llzBearing,
            gsSlope: ils.gsAngle,
            category: this.mapLsCategory(ils.ilsMlsGlsCategory),
        };
    }

    public mapLsMarker(marker: NaviMarker): Marker {
        return {
            sectionCode: SectionCode.Airport,
            subSectionCode: AirportSubsectionCode.LocalizerMarker,
            icaoCode: marker.icaoCode,
            databaseId: `M${marker.icaoCode}${marker.airportIdentifier}${marker.markerIdentifier}`,
            airportIdentifier: marker.airportIdentifier,
            runwayIdentifier: marker.runwayIdentifier,
            lsIdentifier: marker.llzIdentifier,
            ident: marker.markerIdentifier,
            location: { lat: marker.markerLatitude, long: marker.markerLongitude },
            type: marker.markerType.substring(1) as MarkerType,
            locator: marker.markerType.charAt(0) === 'L',
        };
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
        default:
            surfaceCode = RunwaySurfaceType.Unknown;
        }
        return {
            sectionCode: SectionCode.Airport,
            subSectionCode: AirportSubsectionCode.ReferencePoints,
            databaseId: DFDMappers.airportDatabaseId(airport),
            ident: airport.airportIdentifier,
            icaoCode: airport.icaoCode,
            name: airport.airportName,
            location: { lat: airport.airportRefLatitude, long: airport.airportRefLongitude, alt: airport.elevation },
            speedLimit: airport.speedLimit || undefined,
            speedLimitAltitude: airport.speedLimitAltitude || undefined,
            transitionAltitude: airport.transitionAltitude || undefined,
            transitionLevel: airport.transitionLevel / 100 || undefined,
            longestRunwaySurfaceType: surfaceCode,
            longestRunwayLength: airport.longestRunwayLength * 0.3048,
        };
    }

    public mapLsCategory(naviCategory: NaviIlsMlsGlsCategory): LsCategory {
        switch (naviCategory) {
        case '0':
            return LsCategory.LocOnly;
        case '1':
            return LsCategory.Category1;
        case '2':
            return LsCategory.Category2;
        case '3':
            return LsCategory.Category3;
        case 'I':
            return LsCategory.IgsOnly;
        case 'L':
            return LsCategory.LdaGlideslope;
        case 'A':
            return LsCategory.LdaOnly;
        case 'S':
            return LsCategory.SdfGlideslope;
        case 'F':
            return LsCategory.SdfOnly;
        default:
            return LsCategory.None;
        }
    }

    public mapRunway(runway: NaviRunway): Runway {
        return {
            sectionCode: SectionCode.Airport,
            subSectionCode: AirportSubsectionCode.Runways,
            icaoCode: runway.icaoCode,
            ident: runway.runwayIdentifier,
            databaseId: `R  ${runway.airportIdentifier}${runway.runwayIdentifier}`,
            area: WaypointArea.Terminal,
            airportIdent: runway.airportIdentifier,
            startLocation: { lat: runway.runwayLatitude, long: runway.runwayLongitude }, // FIXME
            thresholdLocation: { lat: runway.runwayLatitude, long: runway.runwayLongitude, alt: runway.landingThresholdElevation }, // FIXME
            location: { lat: runway.runwayLatitude, long: runway.runwayLongitude }, // FIXME
            bearing: runway.runwayTrueBearing,
            magneticBearing: runway.runwayMagneticBearing,
            gradient: runway.runwayGradient,
            thresholdCrossingHeight: runway.thresholdCrossingHeight,
            length: runway.runwayLength * 0.3048,
            width: runway.runwayWidth * 0.3048,
            lsIdent: runway.llzIdentifier,
            lsFrequencyChannel: runway.llzFrequency,
            lsCategory: this.mapLsCategory(runway.llzMlsGlsCategory),
            surfaceType: RunwaySurfaceType.Unknown, // navigraph pls
        };
    }

    public mapAltitudeDescriptor(desc: string): AltitudeDescriptor {
        switch (desc) {
        case '+':
            return AltitudeDescriptor.AtOrAboveAlt1;
        case '-':
            return AltitudeDescriptor.AtOrBelowAlt1;
        case '@':
        case null:
        default:
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
    }

    public mapSpeedLimitDescriptor(desc: string): SpeedDescriptor {
        switch (desc) {
        default:
            return SpeedDescriptor.Mandatory;
        case '+':
            return SpeedDescriptor.Minimum;
        case '-':
            return SpeedDescriptor.Maximum;
        }
    }

    public mapLocalizerGlideslope(leg: NaviProcedure): string {
        return leg.waypointIdentifier ?? leg.seqno.toFixed(0); // TODO proper format
    }

    public mapApproachWaypointDescriptor(waypointDescriptor: string) {
        switch ((waypointDescriptor ?? '').charAt(3)) {
        case 'A':
            return ApproachWaypointDescriptor.InitialApproachFix;
        case 'B':
            return ApproachWaypointDescriptor.IntermediateApproachFix;
        case 'C':
            return ApproachWaypointDescriptor.InitialApproachFixWithHold;
        case 'D':
            return ApproachWaypointDescriptor.InitialApproachFixWithFacf;
        case 'E':
            return ApproachWaypointDescriptor.FinalEndpointFix;
        case 'F':
            return ApproachWaypointDescriptor.FinalApproachFix;
        case 'H':
            return ApproachWaypointDescriptor.HoldingFix;
        case 'I':
            return ApproachWaypointDescriptor.FinalApproachCourseFix;
        case 'M':
            return ApproachWaypointDescriptor.MissedApproachPoint;
        default:
            return undefined;
        }
    }

    public mapWaypointDescriptor(waypointDescriptor: string) {
        switch ((waypointDescriptor ?? '').charAt(0)) {
        case 'A':
            return WaypointDescriptor.Airport;
        case 'E':
            return WaypointDescriptor.Essential;
        case 'F':
            return WaypointDescriptor.OffAirway;
        case 'G':
            return WaypointDescriptor.Runway;
        case 'N':
            return WaypointDescriptor.NdbNavaid;
        case 'P':
            return WaypointDescriptor.Phantom;
        case 'R':
            return WaypointDescriptor.NonEssential;
        case 'T':
            return WaypointDescriptor.TransitionEssential;
        case 'V':
            return WaypointDescriptor.VhfNavaid;
        default:
            return undefined;
        }
    }

    public mapLeg(leg: NaviProcedure): ProcedureLeg {
        const waypoint = DFDMappers.decodeIdColumn(leg.id);
        const recNavaid = DFDMappers.decodeIdColumn(leg.recommandedId);
        const arcCentreFix = DFDMappers.decodeIdColumn(leg.centerId);

        return {
            procedureIdent: leg.procedureIdentifier,
            type: leg.pathTermination as LegType,
            overfly: leg.waypointDescriptionCode?.charAt(1) === 'B' || leg.waypointDescriptionCode?.charAt(1) === 'Y',
            waypoint: (leg.waypointIdentifier) ? {
                sectionCode: SectionCode.Enroute,
                subSectionCode: EnrouteSubsectionCode.Waypoints,
                icaoCode: leg.waypointIcaoCode,
                ident: leg.waypointIdentifier,
                location: { lat: leg.waypointLatitude, long: leg.waypointLongitude },
                databaseId: DFDMappers.mapFixDatabaseId(waypoint) ?? '',
                name: leg.waypointIdentifier,
                area: waypoint?.area,
            } : undefined,
            recommendedNavaid: (leg.recommandedNavaid) ? {
                sectionCode: SectionCode.Enroute,
                subSectionCode: EnrouteSubsectionCode.Waypoints,
                ident: leg.recommandedNavaid,
                databaseId: DFDMappers.mapFixDatabaseId(recNavaid) ?? '',
                name: '',
                area: recNavaid?.area,
                icaoCode: recNavaid?.icaoCode,
                location: {
                    lat: leg.recommandedNavaidLatitude,
                    long: leg.recommandedNavaidLongitude,
                },
            } : undefined,
            rho: leg.rho ?? undefined,
            theta: leg.theta ?? undefined,
            arcCentreFix: (leg.centerWaypoint) ? {
                sectionCode: SectionCode.Enroute,
                subSectionCode: EnrouteSubsectionCode.Waypoints,
                ident: leg.centerWaypoint,
                databaseId: DFDMappers.mapFixDatabaseId(arcCentreFix) ?? '',
                name: '',
                area: arcCentreFix?.area,
                icaoCode: arcCentreFix?.icaoCode,
                location: {
                    lat: leg.centerWaypointLatitude,
                    long: leg.centerWaypointLongitude,
                },
            } : undefined,
            arcRadius: leg.arcRadius ?? undefined,
            length: leg.distanceTime === 'D' ? leg.routeDistanceHoldingDistanceTime : undefined,
            lengthTime: leg.distanceTime === 'T' ? leg.routeDistanceHoldingDistanceTime : undefined,
            rnp: leg.rnp ?? undefined,
            transitionAltitude: leg.transitionAltitude ?? undefined,
            altitudeDescriptor: (!leg.altitude1 && !leg.altitude2) ? undefined : this.mapAltitudeDescriptor(leg.altitudeDescription),
            altitude1: leg.altitude1 ?? undefined,
            altitude2: leg.altitude2 ?? undefined,
            speed: leg.speedLimit ?? undefined,
            speedDescriptor: leg.speedLimit ? this.mapSpeedLimitDescriptor(leg.speedLimitDescription) : undefined,
            turnDirection: leg.turnDirection as TurnDirection ?? undefined,
            magneticCourse: leg.magneticCourse ?? undefined,
            verticalAngle: leg.verticalAngle ?? undefined,
            approachWaypointDescriptor: this.mapApproachWaypointDescriptor(leg.waypointDescriptionCode),
            waypointDescriptor: this.mapWaypointDescriptor(leg.waypointDescriptionCode),
        };
    }

    public async mapDepartures(legs: NaviProcedure[], airport: Airport): Promise<Departure[]> {
        const departures: Map<string, Departure> = new Map();

        // legs are sorted in sequence order by the db... phew
        for (const leg of legs) {
            if (!departures.has(leg.procedureIdentifier)) {
                departures.set(leg.procedureIdentifier, {
                    sectionCode: SectionCode.Airport,
                    subSectionCode: AirportSubsectionCode.SIDs,
                    icaoCode: airport.icaoCode,
                    databaseId: DFDMappers.procedureDatabaseId(leg, airport.icaoCode),
                    ident: leg.procedureIdentifier,
                    authorisationRequired: false, // flag not available
                    runwayTransitions: [],
                    commonLegs: [],
                    enrouteTransitions: [],
                    engineOutLegs: [],
                });
            }

            const apiLeg = this.mapLeg(leg);
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
                if (leg.transitionIdentifier[4] === 'B') {
                    const runways = (await this.queries.getRunways(leg.airportIdentifier))
                        .filter((runway) => runway.ident.substr(0, 4) === leg.transitionIdentifier.substring(0, 4));
                    runways.forEach((runway) => {
                        transition = departure?.runwayTransitions.find((t) => t.ident === runway.ident);
                        if (!transition) {
                            transition = {
                                ident: runway.ident,
                                legs: [],
                            };
                            departure?.runwayTransitions.push(transition);
                        }
                        transition.legs.push(apiLeg);
                    });
                } else {
                    transition = departure?.runwayTransitions.find((t) => t.ident === leg.transitionIdentifier);
                    if (!transition) {
                        transition = {
                            ident: leg.transitionIdentifier,
                            legs: [],
                        };
                        departure?.runwayTransitions.push(transition);
                    }
                    transition.legs.push(apiLeg);
                }
                break;
            case '2':
            case '5':
            case 'M':
                if (leg.transitionIdentifier === 'ALL') {
                    const runways = await this.queries.getRunways(leg.airportIdentifier);
                    runways.forEach((runway) => {
                        transition = departure?.runwayTransitions.find((t) => t.ident === runway.ident);
                        if (!transition) {
                            transition = {
                                ident: runway.ident,
                                legs: [],
                            };
                            departure?.runwayTransitions.push(transition);
                        }
                        transition.legs.push(apiLeg);
                    });
                } else if (leg.transitionIdentifier?.[4] === 'B') {
                    const runways = (await this.queries.getRunways(leg.airportIdentifier))
                        .filter((runway) => runway.ident.substr(0, 4) === leg.transitionIdentifier.substring(0, 4));
                    runways.forEach((runway) => {
                        transition = departure?.runwayTransitions.find((t) => t.ident === runway.ident);
                        if (!transition) {
                            transition = {
                                ident: runway.ident,
                                legs: [],
                            };
                            departure?.runwayTransitions.push(transition);
                        }
                        transition.legs.push(apiLeg);
                    });
                } else if (leg.transitionIdentifier) {
                    transition = departure?.runwayTransitions.find((t) => t.ident === leg.transitionIdentifier);
                    if (!transition) {
                        transition = {
                            ident: leg.transitionIdentifier,
                            legs: [],
                        };
                        departure?.runwayTransitions.push(transition);
                    }
                    transition.legs.push(apiLeg);
                } else departure?.commonLegs.push(apiLeg);
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
                    };
                    departure?.enrouteTransitions.push(transition);
                }
                transition.legs.push(apiLeg);
                break;
            default:
                console.error(`Unmappable leg ${leg.procedureIdentifier}.${leg.seqno}: ${leg.pathTermination} in ${leg.procedureIdentifier}: SID`);
            }
        }

        return Array.from(departures.values());
    }

    public async mapArrivals(legs: NaviProcedure[], airport: Airport): Promise<Arrival[]> {
        const arrivals: Map<string, Arrival> = new Map();

        // legs are sorted in sequence order by the db... phew
        for (const leg of legs) {
            if (!arrivals.has(leg.procedureIdentifier)) {
                arrivals.set(leg.procedureIdentifier, {
                    sectionCode: SectionCode.Airport,
                    subSectionCode: AirportSubsectionCode.STARs,
                    icaoCode: airport.icaoCode,
                    databaseId: DFDMappers.procedureDatabaseId(leg, airport.icaoCode),
                    ident: leg.procedureIdentifier,
                    runwayTransitions: [],
                    commonLegs: [],
                    enrouteTransitions: [],
                });
            }

            const apiLeg = this.mapLeg(leg);
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
                    };
                    arrival?.enrouteTransitions.push(transition);
                }
                transition.legs.push(apiLeg);
                break;
            case '2':
            case '5':
            case '8':
            case 'M':
                if (leg.transitionIdentifier === 'ALL') {
                    const runways = await this.queries.getRunways(leg.airportIdentifier);
                    runways.forEach((runway) => {
                        transition = arrival?.runwayTransitions.find((t) => t.ident === runway.ident);
                        if (!transition) {
                            transition = {
                                ident: runway.ident,
                                legs: [],
                            };
                            arrival?.runwayTransitions.push(transition);
                        }
                        transition.legs.push(apiLeg);
                    });
                } else if (leg.transitionIdentifier?.[4] === 'B') {
                    const runways = (await this.queries.getRunways(leg.airportIdentifier))
                        .filter((runway) => runway.ident.substr(0, 4) === leg.transitionIdentifier.substring(0, 4));
                    runways.forEach((runway) => {
                        transition = arrival?.runwayTransitions.find((t) => t.ident === runway.ident);
                        if (!transition) {
                            transition = {
                                ident: runway.ident,
                                legs: [],
                            };
                            arrival?.runwayTransitions.push(transition);
                        }
                        transition.legs.push(apiLeg);
                    });
                } else if (leg.transitionIdentifier) {
                    transition = arrival?.runwayTransitions.find((t) => t.ident === leg.transitionIdentifier);
                    if (!transition) {
                        transition = {
                            ident: leg.transitionIdentifier,
                            legs: [],
                        };
                        arrival?.runwayTransitions.push(transition);
                    }
                    transition.legs.push(apiLeg);
                } else arrival?.commonLegs.push(apiLeg);
                break;
            case '3':
            case '6':
            case '9':
            case 'S':
                if (leg.transitionIdentifier[4] === 'B') {
                    const runways = (await this.queries.getRunways(leg.airportIdentifier))
                        .filter((runway) => runway.ident.substr(0, 4) === leg.transitionIdentifier.substring(0, 4));
                    runways.forEach((runway) => {
                        transition = arrival?.runwayTransitions.find((t) => t.ident === runway.ident);
                        if (!transition) {
                            transition = {
                                ident: runway.ident,
                                legs: [],
                            };
                            arrival?.runwayTransitions.push(transition);
                        }
                        transition.legs.push(apiLeg);
                    });
                } else {
                    transition = arrival?.runwayTransitions.find((t) => t.ident === leg.transitionIdentifier);
                    if (!transition) {
                        transition = {
                            ident: leg.transitionIdentifier,
                            legs: [],
                        };
                        arrival?.runwayTransitions.push(transition);
                    }
                    transition.legs.push(apiLeg);
                }
                break;
            default:
                console.error(`Unmappable leg ${leg.procedureIdentifier}.${leg.seqno}: ${leg.pathTermination} in ${leg.procedureIdentifier}: STAR`);
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
        default:
            return ApproachType.Unknown;
        }
    }

    public mapApproaches(legs: NaviProcedure[], airport: Airport): Approach[] {
        const approaches: Map<string, Approach> = new Map();

        let missedApproachStarted = false;
        let finalApproachStarted = false;
        // legs are sorted in sequence order by the db... phew
        legs.forEach((leg) => {
            if (!approaches.has(leg.procedureIdentifier)) {
                const match = leg.procedureIdentifier.match(/^[A-Z]([0-9]{2}[LCRT]?)(-?([A-Z]))?$/);
                const runwayIdent = match !== null ? `RW${match[1]}` : undefined;
                const multipleIndicator = match !== null ? match[3] ?? '' : '';
                approaches.set(leg.procedureIdentifier, {
                    sectionCode: SectionCode.Airport,
                    subSectionCode: AirportSubsectionCode.ApproachProcedures,
                    icaoCode: airport.icaoCode,
                    databaseId: DFDMappers.procedureDatabaseId(leg, airport.icaoCode),
                    ident: leg.procedureIdentifier,
                    runwayIdent,
                    multipleIndicator,
                    authorisationRequired: false,
                    type: ApproachType.Unknown,
                    transitions: [],
                    legs: [],
                    missedLegs: [],
                });
                missedApproachStarted = false;
                finalApproachStarted = false;
            }

            const apiLeg = this.mapLeg(leg);
            const approach = approaches.get(leg.procedureIdentifier);

            if (leg.waypointDescriptionCode?.charAt(2) === 'M') {
                missedApproachStarted = true;
            }

            // the AR flag is not available so we do our best guess
            // if there's an RF leg in the final approach it's classed AR
            if (finalApproachStarted && approach && leg.pathTermination === 'RF') {
                approach.authorisationRequired = true;
            }

            if (leg.waypointDescriptionCode?.charAt(3) === 'F') {
                finalApproachStarted = true;
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
                        };
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
                    console.error(`Unmappable leg ${leg.procedureIdentifier}.${leg.seqno}: ${leg.pathTermination} in ${leg.procedureIdentifier}: Approach`);
                }
            }
        });

        return Array.from(approaches.values());
    }

    public mapGates(gates: NaviGate[]): Gate[] {
        return gates.map((gate) => ({
            sectionCode: SectionCode.Airport,
            subSectionCode: AirportSubsectionCode.Gates,
            databaseId: `G${gate.icaoCode}${gate.airportIdentifier}${gate.gateIdentifier}`,
            icaoCode: gate.icaoCode,
            ident: gate.gateIdentifier,
            airportIcao: gate.airportIdentifier,
            location: { lat: gate.gateLatitude, long: gate.gateLongitude },
        }));
    }

    public mapHolds(holds: NaviHolding[]): ProcedureLeg[] {
        return holds.map((hold) => {
            let alt1;
            let alt2;
            let altDesc;
            if (hold.minimumAltitude && hold.maximumAltitude) {
                altDesc = AltitudeDescriptor.BetweenAlt1Alt2;
                alt1 = hold.maximumAltitude;
                alt2 = hold.minimumAltitude;
            } else if (hold.minimumAltitude) {
                altDesc = AltitudeDescriptor.AtOrAboveAlt1;
                alt1 = hold.minimumAltitude;
            } else if (hold.maximumAltitude) {
                altDesc = AltitudeDescriptor.AtOrBelowAlt1;
                alt1 = hold.maximumAltitude;
            }

            return {
                procedureIdent: hold.waypointIdentifier,
                type: LegType.HM,
                overfly: false,
                waypoint: {
                    sectionCode: SectionCode.Enroute,
                    subSectionCode: EnrouteSubsectionCode.Waypoints,
                    icaoCode: 'TODO',
                    ident: hold.waypointIdentifier,
                    databaseId: `W${hold.icaoCode ?? '  '}${hold.regionCode}${hold.waypointIdentifier}`,
                    location: { lat: hold.waypointLatitude, long: hold.waypointLongitude },
                    area: WaypointArea.Terminal,
                },
                length: hold.legLength,
                lengthTime: hold.legTime,
                altitudeDescriptor: altDesc,
                altitude1: alt1,
                altitude2: alt2,
                speed: hold.holdingSpeed ?? undefined,
                speedDescriptor: hold.holdingSpeed ? SpeedDescriptor.Mandatory : undefined,
                turnDirection: hold.turnDirection === 'L' ? TurnDirection.Left : TurnDirection.Right,
                magneticCourse: hold.inboundHoldingCourse,
            };
        });
    }

    public mapAirwayLevel(level: string): AirwayLevel {
        switch (level) {
        case 'H':
            return AirwayLevel.High;
        case 'L':
            return AirwayLevel.Low;
        default:
        case 'B':
            return AirwayLevel.Both;
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
            if (!index || fixes[index - 1]?.waypointDescriptionCode[1] === 'E') {
                airways.push({
                    databaseId: DFDMappers.airwayDatabaseIdent(fix),
                    ident: fix.routeIdentifier,
                    level: this.mapAirwayLevel(fix.flightlevel),
                    fixes: [],
                    direction: this.mapAirwayDirection(fix.directionRestriction),
                    minimumAltitudeForward: fix.minimumAltitude1,
                    minimumAltitudeBackward: fix.minimumAltitude2,
                    maximumAltitude: fix.maximumAltitude,
                });
            }
            airways[airways.length - 1].fixes.push({
                sectionCode: SectionCode.Enroute,
                subSectionCode: EnrouteSubsectionCode.Waypoints,
                icaoCode: fix.icaoCode,
                databaseId: `W${fix.icaoCode}    ${fix.waypointIdentifier}`, // TODO function
                ident: fix.waypointIdentifier,
                location: { lat: fix.waypointLatitude, long: fix.waypointLongitude },
                area: WaypointArea.Enroute, // TODO
            });
        });
        return airways;
    }

    public mapAirportCommunication(communication: NaviAirportCommunication): AirportCommunication {
        return ({
            icaoCode: communication.icaoCode,
            communicationType: this.mapCommunicationType(communication.communicationType),
            frequency: communication.communicationFrequency,
            frequencyUnits: this.mapFrequencyUnits(communication.frequencyUnits),
            callsign: communication.callsign,
            location: {
                lat: communication.latitude,
                long: communication.longitude,
            },
            airportIdentifier: communication.airportIdentifier,
        });
    }

    public mapEnRouteCommunication(communication: NaviEnRouteCommunication): EnRouteCommunication {
        return ({
            communicationType: this.mapCommunicationType(communication.communicationType),
            frequency: communication.communicationFrequency,
            frequencyUnits: this.mapFrequencyUnits(communication.frequencyUnits),
            callsign: communication.callsign,
            location: {
                lat: communication.latitude,
                long: communication.longitude,
            },
            firRdoIdent: communication.firRdoIdent,
            firUirIndicator: this.mapFirUirIndicator(communication.firUirIndicator),
        });
    }

    public mapRestrictiveAirspaceBoundaries(boundaries: NaviRestrictiveAirspace[]): RestrictiveAirspace[] {
        if (boundaries.length === 0) {
            return [];
        }
        const airspaces: RestrictiveAirspace[] = [this.mapRestrictiveAirspace(boundaries[0])];

        boundaries.forEach((boundary, index) => {
            if (boundaries[index - 1]?.boundaryVia[1] === 'E') {
                airspaces.push(this.mapRestrictiveAirspace(boundary));
            }
            const currentAirspace = airspaces[airspaces.length - 1];
            currentAirspace.boundaryPaths.push(this.mapAirspaceBoundary(boundary));
        });
        return airspaces;
    }

    public mapRestrictiveAirspace(data: NaviRestrictiveAirspace): RestrictiveAirspace {
        return {
            icaoCode: data.icaoCode,
            designation: data.restrictiveAirspaceDesignation,
            name: data.restrictiveAirspaceName,
            type: this.mapRestrictiveAirspaceType(data.restrictiveType),
            level: this.mapAirwayLevel(data.flightlevel),
            boundaryPaths: [],
        };
    }

    public mapRestrictiveAirspaceType(type: NaviRestrictiveAirspaceType): RestrictiveAirspaceType {
        switch (type) {
        case 'A':
            return RestrictiveAirspaceType.Alert;
        case 'C':
            return RestrictiveAirspaceType.Caution;
        case 'D':
            return RestrictiveAirspaceType.Danger;
        case 'M':
            return RestrictiveAirspaceType.Military;
        case 'P':
            return RestrictiveAirspaceType.Prohibited;
        case 'R':
            return RestrictiveAirspaceType.Restricted;
        case 'T':
            return RestrictiveAirspaceType.Training;
        case 'W':
            return RestrictiveAirspaceType.Warning;
        case 'U':
        default:
            return RestrictiveAirspaceType.Unknown;
        }
    }

    public mapControlledAirspaceBoundaries(boundaries: NaviControlledAirspace[]): ControlledAirspace[] {
        if (boundaries.length === 0) {
            return [];
        }
        const airspaces: ControlledAirspace[] = [this.mapControlledAirspace(boundaries[0])];

        boundaries.forEach((boundary, index) => {
            if (boundaries[index - 1]?.boundaryVia[1] === 'E') {
                airspaces.push(this.mapControlledAirspace(boundary));
            }
            const currentAirspace = airspaces[airspaces.length - 1];
            currentAirspace.boundaryPaths.push(this.mapAirspaceBoundary(boundary));
        });
        return airspaces;
    }

    public mapAirspaceBoundary(data: NaviControlledAirspace | NaviRestrictiveAirspace): BoundaryPath {
        return {
            sequenceNumber: data.seqno,
            pathType: this.mapAirspacePathType(data.boundaryVia[0] as NaviBoundaryVia),
            location: data.latitude && data.longitude ? {
                lat: data.latitude,
                long: data.longitude,
            } : undefined,
            arc: data.arcOriginLatitude && data.arcOriginLongitude && data.arcDistance ? {
                origin: {
                    lat: data.arcOriginLatitude,
                    long: data.arcOriginLongitude,
                },
                distance: data.arcDistance,
                bearing: data.arcBearing,
            } : undefined,
        };
    }

    public mapControlledAirspace(data: NaviControlledAirspace): ControlledAirspace {
        return {
            icaoCode: data.icaoCode,
            center: data.airspaceCenter,
            name: data.controlledAirspaceName,
            type: this.mapControlledAirspaceType(data.airspaceType),
            classification: data.airspaceClassification,
            level: this.mapAirwayLevel(data.flightlevel),
            boundaryPaths: [],
        };
    }

    public mapAirspacePathType(type: NaviBoundaryVia): PathType {
        switch (type) {
        default:
        case 'C':
            return PathType.Circle;
        case 'G':
            return PathType.GreatCircle;
        case 'H':
            return PathType.RhumbLine;
        case 'L':
            return PathType.CounterClockwiseArc;
        case 'R':
            return PathType.ClockwiseArc;
        }
    }

    public mapControlledAirspaceType(type: NaviAirspaceType): ControlledAirspaceType {
        switch (type) {
        default:
        case 'A':
            return ControlledAirspaceType.ClassC;
        case 'C':
        case 'K':
            return ControlledAirspaceType.ControlArea;
        case 'M':
            return ControlledAirspaceType.IcaoTerminalControlArea;
        case 'Q':
            return ControlledAirspaceType.MilitaryControlZone;
        case 'R':
            return ControlledAirspaceType.RadarZone;
        case 'T':
            return ControlledAirspaceType.ClassB;
        case 'W':
            return ControlledAirspaceType.TerminalControlArea;
        case 'X':
            return ControlledAirspaceType.TerminalArea;
        case 'Y':
            return ControlledAirspaceType.TerminalRadarServiceArea;
        case 'Z':
            return ControlledAirspaceType.ClassD;
        }
    }

    public mapFirUirIndicator(indicator: string): FirUirIndicator {
        switch (indicator) {
        default:
            return FirUirIndicator.Unknown;
        case 'F':
            return FirUirIndicator.Fir;
        case 'U':
            return FirUirIndicator.Uir;
        case 'B':
            return FirUirIndicator.Combined;
        }
    }

    public mapFrequencyUnits(units: NaviFrequencyUnits): FrequencyUnits {
        switch (units) {
        default:
            return FrequencyUnits.Unknown;
        case 'H':
            return FrequencyUnits.High;
        case 'V':
            return FrequencyUnits.VeryHigh;
        case 'U':
            return FrequencyUnits.UltraHigh;
        }
    }

    public mapCommunicationType(units: NaviCommunicationType): CommunicationType {
        switch (units) {
        default:
            return CommunicationType.Unknown;
        case 'ACC':
            return CommunicationType.AreaControlCenter;
        case 'ACP':
            return CommunicationType.AirliftCommandPost;
        case 'AIR':
            return CommunicationType.AirToAir;
        case 'APP':
            return CommunicationType.ApproachControl;
        case 'ARR':
            return CommunicationType.ArrivalControl;
        case 'ASO':
            return CommunicationType.Asos;
        case 'ATI':
            return CommunicationType.Atis;
        case 'AWI':
            return CommunicationType.Awib;
        case 'AWO':
            return CommunicationType.Awos;
        case 'AWS':
            return CommunicationType.Awis;
        case 'CLD':
            return CommunicationType.ClearanceDelivery;
        case 'CPT':
            return CommunicationType.ClearancePreTaxi;
        case 'CTA':
            return CommunicationType.ControlArea;
        case 'CTL':
            return CommunicationType.Control;
        case 'DEP':
            return CommunicationType.DepartureControl;
        case 'DIR':
            return CommunicationType.Director;
        case 'EFS':
            return CommunicationType.Efas;
        case 'EMR':
            return CommunicationType.Emergency;
        case 'FSS':
            return CommunicationType.FlightServiceStation;
        case 'GCO':
            return CommunicationType.GroundCommOutlet;
        case 'GND':
            return CommunicationType.GroundControl;
        case 'GET':
            return CommunicationType.GateControl;
        case 'HEL':
            return CommunicationType.HelicopterFrequency;
        case 'INF':
            return CommunicationType.Information;
        case 'MIL':
            return CommunicationType.MilitaryFrequency;
        case 'MUL':
            return CommunicationType.Multicom;
        case 'OPS':
            return CommunicationType.Operations;
        case 'PAL':
            return CommunicationType.PilotActivatedLighting;
        case 'RDO':
            return CommunicationType.Radio;
        case 'RDR':
            return CommunicationType.Radar;
        case 'RFS':
            return CommunicationType.Rfss;
        case 'RMP':
            return CommunicationType.RampTaxiControl;
        case 'RSA':
            return CommunicationType.Arsa;
        case 'TCA':
            return CommunicationType.Tca;
        case 'TMA':
            return CommunicationType.Tma;
        case 'TML':
            return CommunicationType.Terminal;
        case 'TRS':
            return CommunicationType.Trsa;
        case 'TWE':
            return CommunicationType.Tweb;
        case 'TWR':
            return CommunicationType.Tower;
        case 'UAC':
            return CommunicationType.UpperAreaControl;
        case 'UNI':
            return CommunicationType.Unicom;
        case 'VOL':
            return CommunicationType.Volmet;
        }
    }

    public mapWaypoint(waypoint: NaviWaypoint, distanceFrom?: Coordinates): Waypoint {
        return {
            sectionCode: SectionCode.Enroute,
            subSectionCode: EnrouteSubsectionCode.Waypoints,
            databaseId: DFDMappers.waypointDatabaseId(waypoint),
            ident: waypoint.waypointIdentifier,
            icaoCode: waypoint.icaoCode,
            location: DFDMappers.mapCoordinates(waypoint.waypointLatitude, waypoint.waypointLongitude),
            name: waypoint.waypointName,
            area: DFDMappers.isTerminalWaypoint(waypoint) ? WaypointArea.Terminal : WaypointArea.Enroute,
            distance: distanceFrom ? distanceTo(distanceFrom, { lat: waypoint.waypointLatitude, long: waypoint.waypointLongitude }) : undefined,
        };
    }

    public mapVhfNavaid(navaid: NaviVhfNavaid, distanceFrom?: Coordinates): VhfNavaid {
        return {
            sectionCode: SectionCode.Navaid,
            subSectionCode: NavaidSubsectionCode.VhfNavaid,
            databaseId: DFDMappers.vhfNavaidDatabaseId(navaid),
            ident: navaid.vorIdentifier ?? navaid.dmeIdent,
            name: navaid.vorName,
            icaoCode: navaid.icaoCode,
            frequency: navaid.vorFrequency,
            figureOfMerit: this.mapFigureOfMerit(navaid),
            range: navaid.range,
            stationDeclination: navaid.stationDeclination,
            type: this.mapVhfType(navaid),
            location: DFDMappers.mapCoordinates(navaid.vorLatitude, navaid.vorLongitude),
            dmeLocation: navaid.dmeLatitude !== null ? DFDMappers.mapElevatedCoordinates(navaid.dmeLatitude, navaid.dmeLongitude, navaid.dmeElevation) : undefined,
            class: this.mapVorClass(navaid),
            ilsDmeBias: navaid.ilsdmeBias || undefined,
            distance: distanceFrom ? distanceTo(distanceFrom, { lat: navaid.vorLatitude, long: navaid.vorLongitude }) : undefined,
            area: DFDMappers.isTerminalVhfNavaid(navaid) ? WaypointArea.Terminal : WaypointArea.Enroute,
        };
    }

    public mapFigureOfMerit(navaid: NaviVhfNavaid): FigureOfMerit {
        if (navaid.range <= 40 || navaid.navaidClass[2] === 'T') {
            return 0;
        } if (navaid.range <= 70 || navaid.navaidClass[2] === 'L') {
            return 1;
        } if (navaid.range <= 130) {
            return 2;
        }
        return 3;
    }

    public mapVhfType(navaid: NaviVhfNavaid): VhfNavaidType {
        const vor = navaid.navaidClass.charAt(0) === 'V';
        switch (navaid.navaidClass.charAt(1)) {
        case 'D':
            return vor ? VhfNavaidType.VorDme : VhfNavaidType.Dme;
        case 'T':
        case 'M': // TODO should we include these military ones?
            return vor ? VhfNavaidType.Vortac : VhfNavaidType.Tacan;
        case 'I':
            return VhfNavaidType.IlsDme;
        case 'N':
        case 'P':
            return VhfNavaidType.Unknown;
        default:
            return vor ? VhfNavaidType.Vor : VhfNavaidType.Unknown;
        }
    }

    public mapVorClass(navaid: NaviVhfNavaid): VorClass {
        switch (navaid.navaidClass.charAt(2)) {
        case 'T':
            return VorClass.Terminal;
        case 'L':
            return VorClass.LowAlt;
        case 'H':
            return VorClass.HighAlt;
        case 'U':
        case 'C':
        default:
            return VorClass.Unknown;
        }
    }

    public mapNdbNavaid(navaid: NaviNdbNavaid, distanceFrom?: Coordinates): NdbNavaid {
        return {
            sectionCode: SectionCode.Navaid,
            subSectionCode: NavaidSubsectionCode.NdbNavaid,
            databaseId: DFDMappers.ndbNavaidDatabaseId(navaid),
            ident: navaid.ndbIdentifier,
            icaoCode: navaid.icaoCode,
            frequency: navaid.ndbFrequency,
            location: DFDMappers.mapCoordinates(navaid.ndbLatitude, navaid.ndbLongitude),
            class: this.mapNdbClass(navaid),
            bfoOperation: navaid.navaidClass.charAt(4) === 'B',
            distance: distanceFrom ? distanceTo(distanceFrom, { lat: navaid.ndbLatitude, long: navaid.ndbLongitude }) : undefined,
            area: DFDMappers.isTerminalNdbNavaid(navaid) ? WaypointArea.Terminal : WaypointArea.Enroute,
        };
    }

    public mapNdbClass(navaid: NaviNdbNavaid): NdbClass {
        switch (navaid.navaidClass.charAt(0)) {
        case 'H': // >= 2000 W
            return NdbClass.High;
        case 'M': // 25 - 50 W
            return NdbClass.Medium;
        case ' ': // 50 - 1999 W
            return NdbClass.Normal;
        case 'L': // < 25 W
            return NdbClass.Low;
        default:
            return NdbClass.Unknown;
        }
    }

    public static mapCoordinates(lat: number, long: number): Coordinates {
        return { lat, long };
    }

    public static mapElevatedCoordinates(lat: number, long: number, alt: number): ElevatedCoordinates {
        return { lat, long, alt };
    }

    private static isTerminalWaypoint(waypoint: NaviWaypoint): waypoint is NaviTerminalWaypoint {
        // @ts-ignore
        // eslint-disable-next-line no-prototype-builtins,dot-notation
        return waypoint.hasOwnProperty('regionCode') && waypoint['regionCode'] !== null;
    }

    private static isTerminalNdbNavaid(navaid: NaviNdbNavaid): navaid is NaviTerminalNdbNavaid {
        // @ts-ignore
        // eslint-disable-next-line no-prototype-builtins,dot-notation
        return navaid.hasOwnProperty('airportIdentifier') && navaid['airportIdentifier'] !== null;
    }

    private static isTerminalVhfNavaid(navaid: NaviVhfNavaid): boolean {
        return (navaid.navaidClass ?? '').charAt(2) === 'T';
    }

    // The MSFS "icao" code is a pretty clever globally unique ID, so we follow it, and extend it where needed
    // It is important to ensure that these are truly globally unique
    public static airportDatabaseId(airport: NaviAirport): string {
        return `A      ${airport.airportIdentifier}`;
    }

    public static procedureDatabaseId(procedure: NaviProcedure, icaoCode: string): string {
        return `P${icaoCode}${procedure.airportIdentifier}${procedure.procedureIdentifier}`;
    }

    public static airwayDatabaseIdent(airway: NaviAirwayFix): string {
        return `E      ${airway.routeIdentifier}${airway.waypointIdentifier}`;
    }

    public static waypointDatabaseId(waypoint: NaviWaypoint): string {
        return `W${waypoint.icaoCode}${(this.isTerminalWaypoint(waypoint) ? waypoint.regionCode : null) ?? '    '}${waypoint.waypointIdentifier}`;
    }

    public static vhfNavaidDatabaseId(navaid: NaviVhfNavaid): string {
        // TODO airportIdentifier is always blank... ask Navi
        return `V${navaid.icaoCode}${(this.isTerminalVhfNavaid(navaid) ? navaid.airportIdentifier : null) ?? '    '}${navaid.vorIdentifier ?? navaid.dmeIdent}`;
    }

    public static ndbNavaidDatabaseId(navaid: NaviNdbNavaid): string {
        return `N${navaid.icaoCode}${(this.isTerminalNdbNavaid(navaid) ? navaid.airportIdentifier : null) ?? '    '}${navaid.ndbIdentifier}`;
    }

    public static ilsNavaidDatabaseId(navaid: NaviIls): string {
        return `V${navaid.icaoCode}${navaid.airportIdentifier ?? '    '}${navaid.llzIdentifier}`;
    }

    public static decodeIdColumn(id: string): FixInfo | undefined {
        if (!id) {
            return undefined;
        }

        const [table, mapping] = id.split('|', 2);

        const terminal = table.indexOf('terminal') !== -1 || table === 'tbl_runways' || table === 'tbl_localizers_glideslopes' || table === 'tbl_gls';
        const area = terminal ? WaypointArea.Terminal : WaypointArea.Enroute;
        const suppressIcaoCode = table === 'tbl_localizers_glideslopes' || table === 'tbl_gls';
        const icaoCode = terminal ? mapping.substring(4, 6) : mapping.substring(0, 2);
        const airportIdent = terminal ? mapping.substring(0, 4) : '    ';
        const ident = terminal ? mapping.substring(6) : mapping.substring(2);

        let prefix = 'W';
        if (table.indexOf('vhfnavaid') !== -1 || table === 'tbl_localizers_glideslopes') {
            prefix = 'V';
        } else if (table === 'tbl_gls') {
            prefix = 'J';
        } else if (table.indexOf('ndbnavaid') !== -1) {
            prefix = 'N';
        } else if (table === 'tbl_airports') {
            prefix = 'A';
        }

        return {
            icaoCode,
            airportIdent,
            ident,
            area,
            prefix,
            suppressIcaoCode,
        };
    }

    public static mapFixDatabaseId(fixIdent?: FixInfo): string | undefined {
        if (!fixIdent) {
            return undefined;
        }

        return `${fixIdent.prefix}${fixIdent.suppressIcaoCode ? '  ' : fixIdent.icaoCode ?? '  '}${fixIdent.airportIdent ?? '    '}${fixIdent.ident ?? ''}`;
    }
}
