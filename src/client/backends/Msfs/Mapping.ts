// Copyright (c) 2021, 2022 FlyByWire Simulations
// SPDX-License-Identifier: GPL-3.0

/* eslint-disable camelcase */
import { distanceTo, placeBearingDistance } from 'msfs-geo';
import {
    AirportCommunication,
    Airway,
    AirwayDirection,
    AirwayLevel,
    AltitudeDescriptor,
    ApproachType,
    ApproachWaypointDescriptor,
    CommunicationType,
    FigureOfMerit,
    FrequencyUnits,
    IlsNavaid,
    LegType,
    LevelOfService,
    LsCategory,
    NdbClass,
    NdbNavaid,
    ProcedureLeg,
    ProcedureTransition,
    SpeedDescriptor,
    TurnDirection,
    VhfNavaid,
    VhfNavaidType,
    VorClass,
    Waypoint,
    WaypointArea,
    WaypointDescriptor,
} from '../../../shared';
import { Airport } from '../../../shared/types/Airport';
import { Approach } from '../../../shared/types/Approach';
import { Arrival } from '../../../shared/types/Arrival';
import { Departure } from '../../../shared/types/Departure';
import { Runway, RunwaySurfaceType } from '../../../shared/types/Runway';
import {
    AltitudeDescriptor as MSAltitudeDescriptor,
    ApproachType as MSApproachType,
    FixTypeFlags,
    FrequencyType,
    IcaoSearchFilter,
    JS_Approach,
    JS_ApproachTransition,
    JS_EnRouteTransition,
    JS_Facility,
    JS_FacilityAirport,
    JS_FacilityIntersection,
    JS_FacilityNDB,
    JS_FacilityVOR,
    JS_Leg,
    JS_Procedure,
    JS_Runway,
    JS_RunwayTransition,
    LegType as MsLegType,
    NdbType,
    RnavTypeFlags,
    RouteType,
    RunwayDesignatorChar,
    RunwaySurface,
    TurnDirection as MSTurnDirection,
    VorClass as MSVorClass,
    VorType,
} from './FsTypes';
import { FacilityCache, LoadType } from './FacilityCache';
import { Gate } from '../../../shared/types/Gate';
import { AirportSubsectionCode, EnrouteSubsectionCode, NavaidSubsectionCode, SectionCode } from '../../../shared/types/SectionCode';

type FacilityType<T> =
        T extends JS_FacilityIntersection ? Waypoint
        : T extends JS_FacilityNDB ? NdbNavaid
        : T extends JS_FacilityVOR ? VhfNavaid
        : never;

export class MsfsMapping {
    private static letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    // eslint-disable-next-line no-useless-constructor
    constructor(
        private cache: FacilityCache,
    // eslint-disable-next-line no-empty-function
    ) {}

    private mapRunwaySurface(surface?: RunwaySurface): RunwaySurfaceType {
        // TODO
        switch (surface) {
        default:
            return RunwaySurfaceType.Hard;
        }
    }

    public mapAirport(msAirport: JS_FacilityAirport): Airport {
        const elevations: number[] = [];
        let longestRunway: [number, JS_Runway | undefined] = [0, undefined];
        msAirport.runways.forEach((runway) => {
            if (runway.length > longestRunway[0]) {
                longestRunway = [runway.length, runway];
            }
            elevations.push(runway.elevation / 0.3048);
        });

        // MSFS doesn't give the airport elevation... so we take the mean of the runway elevations
        const elevation = elevations.reduce((a, b) => a + b) / elevations.length;

        return {
            databaseId: msAirport.icao,
            sectionCode: SectionCode.Airport,
            subSectionCode: AirportSubsectionCode.ReferencePoints,
            ident: msAirport.icao.substring(7, 11),
            icaoCode: msAirport.icao.substring(1, 3), // TODO
            name: Utils.Translate(msAirport.name),
            location: { lat: msAirport.lat, long: msAirport.lon, alt: elevation },
            longestRunwayLength: longestRunway[0],
            longestRunwaySurfaceType: this.mapRunwaySurface(longestRunway[1]?.surface),
        };
    }

    public async mapAirportRunways(msAirport: JS_FacilityAirport): Promise<Runway[]> {
        const runways: Runway[] = [];

        const icaoCode = this.getIcaoCodeFromAirport(msAirport);

        const navaidIcaos = msAirport.approaches.map((appr) => appr.finalLegs[appr.finalLegs.length - 1].originIcao).filter((icao) => icao.charAt(0) === 'V');
        const navaids = await this.cache.getFacilities(Array.from(new Set(navaidIcaos)), LoadType.Vor);

        const magVar = Facilities.getMagVar(msAirport.lat, msAirport.lon);

        msAirport.runways.forEach((msRunway) => {
            const gradient = Math.asin((msRunway.primaryElevation - msRunway.secondaryElevation)
                    / (msRunway.length - msRunway.primaryThresholdLength - msRunway.secondaryThresholdLength)) * 180 / Math.PI;

            msRunway.designation.split('-').forEach((designation, index) => {
                const primary = index === 0;

                const airportIdent = FacilityCache.ident(msAirport.icao);
                const runwayNumber = parseInt(designation);
                const runwayDesignator = primary ? msRunway.designatorCharPrimary : msRunway.designatorCharSecondary;
                const ident = `RW${designation.padStart(2, '0')}${this.mapRunwayDesignator(runwayDesignator)}`;
                const databaseId = `R${icaoCode}${airportIdent}${ident}`;
                const bearing = primary ? msRunway.direction : (msRunway.direction + 180) % 360;
                const startDistance = msRunway.length / 2;
                const thresholdDistance = primary ? msRunway.primaryThresholdLength : msRunway.secondaryThresholdLength;
                const startLocation = placeBearingDistance({ lat: msRunway.latitude, long: msRunway.longitude }, this.oppositeBearing(bearing), startDistance / 1852);
                const thresholdLocation = {
                    ...(thresholdDistance > 0 ? placeBearingDistance(startLocation, bearing, thresholdDistance / 1852) : startLocation),
                    alt: (primary ? msRunway.primaryElevation : msRunway.secondaryElevation) / 0.3048,
                };
                // TODO we could get this from approach data...
                const thresholdCrossingHeight = 50 + (primary ? msRunway.primaryElevation : msRunway.secondaryElevation) / 0.3048;
                const lsAppr = msAirport.approaches.find(
                    (appr) => appr.runwayNumber === runwayNumber && appr.runwayDesignator === runwayDesignator && appr.approachType === MSApproachType.Ils,
                );
                const lsIdent = lsAppr ? FacilityCache.ident(lsAppr.finalLegs[lsAppr.finalLegs.length - 1].originIcao) : '';
                const lsFrequencyChannel = lsAppr ? navaids.get(lsAppr.finalLegs[lsAppr.finalLegs.length - 1].originIcao)?.freqMHz ?? 0 : 0;

                runways.push({
                    sectionCode: SectionCode.Airport,
                    subSectionCode: AirportSubsectionCode.Runways,
                    databaseId,
                    icaoCode,
                    ident,
                    location: thresholdLocation,
                    area: WaypointArea.Terminal,
                    airportIdent,
                    bearing,
                    magneticBearing: this.trueToMagnetic(bearing, magVar),
                    gradient: primary ? gradient : -gradient,
                    startLocation,
                    thresholdLocation,
                    thresholdCrossingHeight,
                    length: msRunway.length,
                    width: msRunway.width,
                    lsFrequencyChannel,
                    lsIdent,
                    surfaceType: this.mapRunwaySurface(msRunway.surface),
                });
            });
        });

        return runways;
    }

    // TODO unify with the version that gets navaids
    private mapAirportRunwaysPartial(msAirport: JS_FacilityAirport): Runway[] {
        const runways: Runway[] = [];

        const icaoCode = this.getIcaoCodeFromAirport(msAirport);

        const magVar = Facilities.getMagVar(msAirport.lat, msAirport.lon);

        msAirport.runways.forEach((msRunway) => {
            const gradient = Math.asin((msRunway.primaryElevation - msRunway.secondaryElevation)
                    / (msRunway.length - msRunway.primaryThresholdLength - msRunway.secondaryThresholdLength)) * 180 / Math.PI;

            msRunway.designation.split('-').forEach((designation, index) => {
                const primary = index === 0;

                const airportIdent = FacilityCache.ident(msAirport.icao);
                const runwayNumber = parseInt(designation);
                const runwayDesignator = primary ? msRunway.designatorCharPrimary : msRunway.designatorCharSecondary;
                const ident = `RW${designation.padStart(2, '0')}${this.mapRunwayDesignator(runwayDesignator)}`;
                const databaseId = `R${icaoCode}${airportIdent}${ident}`;
                const bearing = primary ? msRunway.direction : (msRunway.direction + 180) % 360;
                const startDistance = msRunway.length / 2;
                const thresholdDistance = primary ? msRunway.primaryThresholdLength : msRunway.secondaryThresholdLength;
                const startLocation = placeBearingDistance({ lat: msRunway.latitude, long: msRunway.longitude }, this.oppositeBearing(bearing), startDistance / 1852);
                const thresholdLocation = {
                    ...(thresholdDistance > 0 ? placeBearingDistance(startLocation, bearing, thresholdDistance / 1852) : startLocation),
                    alt: (primary ? msRunway.primaryElevation : msRunway.secondaryElevation) / 0.3048,
                };
                // TODO we could get this from approach data...
                const thresholdCrossingHeight = 50 + (primary ? msRunway.primaryElevation : msRunway.secondaryElevation) / 0.3048;
                const lsAppr = msAirport.approaches.find(
                    (appr) => appr.runwayNumber === runwayNumber && appr.runwayDesignator === runwayDesignator && appr.approachType === MSApproachType.Ils,
                );
                const lsIdent = lsAppr ? FacilityCache.ident(lsAppr.finalLegs[lsAppr.finalLegs.length - 1].originIcao) : '';

                runways.push({
                    sectionCode: SectionCode.Airport,
                    subSectionCode: AirportSubsectionCode.Runways,
                    databaseId,
                    icaoCode,
                    ident,
                    location: thresholdLocation,
                    area: WaypointArea.Terminal,
                    airportIdent,
                    bearing,
                    magneticBearing: this.trueToMagnetic(bearing, magVar),
                    gradient: primary ? gradient : -gradient,
                    startLocation,
                    thresholdLocation,
                    thresholdCrossingHeight,
                    length: msRunway.length,
                    width: msRunway.width,
                    lsIdent,
                    surfaceType: this.mapRunwaySurface(msRunway.surface),
                });
            });
        });

        return runways;
    }

    public async mapAirportWaypoints(msAirport: JS_FacilityAirport): Promise<Waypoint[]> {
        const icaoSet: Set<string> = new Set();

        const legs: JS_Leg[] = [];

        for (const procedures of [msAirport.arrivals, msAirport.approaches, msAirport.departures]) {
            for (const proc of procedures) {
                // eslint-disable-next-line no-underscore-dangle
                if (proc.__Type === 'JS_Approach') {
                    legs.push(...proc.finalLegs);
                    legs.push(...proc.missedLegs);
                    proc.transitions.forEach((trans) => legs.push(...trans.legs));
                } else {
                    legs.push(...proc.commonLegs);
                    proc.enRouteTransitions.forEach((trans) => legs.push(...trans.legs));
                    proc.runwayTransitions.forEach((trans) => legs.push(...trans.legs));
                }
            }
        }

        for (const leg of legs) {
            if (FacilityCache.validFacilityIcao(leg.fixIcao, 'W')) {
                icaoSet.add(leg.fixIcao);
            }
            if (FacilityCache.validFacilityIcao(leg.originIcao, 'W')) {
                icaoSet.add(leg.originIcao);
            }
            if (FacilityCache.validFacilityIcao(leg.arcCenterFixIcao, 'W')) {
                icaoSet.add(leg.arcCenterFixIcao);
            }
        }

        const icaos = Array.from(icaoSet);

        const wps = await this.cache.getFacilities(icaos, LoadType.Intersection);

        return Array.from(wps.values()).filter((wp) => !!wp).map((wp) => this.mapFacilityToWaypoint(wp));
    }

    public async mapAirportIls(msAirport: JS_FacilityAirport): Promise<IlsNavaid[]> {
        const icaoSet: Set<string> = new Set();
        const bearings = new Map<string, number>();
        const runways = new Map<string, string>();
        const icaoCode = this.getIcaoCodeFromAirport(msAirport);

        msAirport.approaches.filter((appr) => appr.approachType === MSApproachType.Ils).forEach((appr) => {
            const lastLeg = appr.finalLegs[appr.finalLegs.length - 1];
            if (FacilityCache.validFacilityIcao(lastLeg.originIcao, 'V')) {
                const icao = lastLeg.originIcao.trim();
                icaoSet.add(lastLeg.originIcao);
                // FIXME check if magnetic
                bearings.set(icao, lastLeg.course);
                runways.set(icao, `RW${appr.runwayNumber.toFixed(0).padStart(2, '0')}${this.mapRunwayDesignator(appr.runwayDesignator)}`);
            }
        });

        // TODO try guess cat from runway frequencies

        const icaos = Array.from(icaoSet);

        const ils = await this.cache.getFacilities(icaos, LoadType.Vor);

        return Array.from(ils.values()).filter((ils) => !!ils).map((ils) => {
            const icao = ils.icao.trim();
            return {
                sectionCode: SectionCode.Airport,
                subSectionCode: AirportSubsectionCode.LocalizerGlideSlope,
                databaseId: ils.icao,
                icaoCode,
                ident: FacilityCache.ident(ils.icao),
                frequency: ils.freqMHz,
                category: LsCategory.None,
                runwayIdent: runways.get(icao)!,
                locLocation: { lat: ils.lat, long: ils.lon },
                locBearing: bearings.get(icao) ?? -1,
                stationDeclination: ils.magneticVariation,
            };
        });
    }

    public async mapAirportCommunications(msAirport: JS_FacilityAirport): Promise<AirportCommunication[]> {
        const icaoCode = this.getIcaoCodeFromAirport(msAirport);

        const location = { lat: msAirport.lat, long: msAirport.lon };

        return msAirport.frequencies.map((freq) => ({
            communicationType: this.mapMsfsFrequencyToType(freq.type),
            frequency: freq.freqMHz,
            frequencyUnits: FrequencyUnits.VeryHigh,
            callsign: freq.name,
            location,
            icaoCode,
            airportIdentifier: FacilityCache.ident(msAirport.icao),
        }));
    }

    private mapMsfsFrequencyToType(type: FrequencyType): CommunicationType {
        switch (type) {
        case FrequencyType.ASOS:
            return CommunicationType.Asos;
        case FrequencyType.ATIS:
            return CommunicationType.Atis;
        case FrequencyType.AWOS:
            return CommunicationType.Awos;
        case FrequencyType.Approach:
            return CommunicationType.ApproachControl;
        case FrequencyType.CTAF:
            return CommunicationType.AirToAir;
        case FrequencyType.Center:
            return CommunicationType.AreaControlCenter;
        case FrequencyType.Clearance:
            return CommunicationType.ClearanceDelivery;
        case FrequencyType.ClearancePreTaxi:
            return CommunicationType.ClearancePreTaxi;
        case FrequencyType.Departure:
            return CommunicationType.DepartureControl;
        case FrequencyType.FSS:
            return CommunicationType.FlightServiceStation;
        case FrequencyType.Ground:
            return CommunicationType.GroundControl;
        case FrequencyType.Multicom:
            return CommunicationType.Multicom;
        case FrequencyType.RemoteDeliveryClearance:
            return CommunicationType.ClearanceDelivery;
        case FrequencyType.Tower:
            return CommunicationType.Tower;
        case FrequencyType.Unicom:
            return CommunicationType.Unicom;
        default:
            return CommunicationType.Unknown;
        }
    }

    public async mapApproaches(msAirport: JS_FacilityAirport): Promise<Approach[]> {
        const icaoCode = this.getIcaoCodeFromAirport(msAirport);
        const airportIdent = FacilityCache.ident(msAirport.icao);

        const facilities = await this.loadFacilitiesFromProcedures(msAirport.approaches);

        return msAirport.approaches.map((approach) => {
            const approachName = this.mapApproachName(approach);

            // the AR flag is not available so we use this heuristic based on analysing the MSFS data
            const authorisationRequired = approach.runwayNumber !== 0 && approach.rnavTypeFlags === 0;
            const rnp = authorisationRequired ? 0.3 : undefined;

            const runwayIdent = `RW${approach.runwayNumber.toString().padStart(2, '0')}${this.mapRunwayDesignator(approach.runwayDesignator)}`;

            const levelOfService = this.mapRnavTypeFlags(approach.rnavTypeFlags);

            return {
                sectionCode: SectionCode.Airport,
                subSectionCode: AirportSubsectionCode.ApproachProcedures,
                databaseId: `P${icaoCode}${airportIdent}${approach.name}`,
                icaoCode,
                ident: approachName,
                runwayIdent,
                multipleIndicator: approach.approachSuffix,
                type: this.mapApproachType(approach.approachType),
                authorisationRequired,
                levelOfService,
                transitions: approach.transitions.map((trans) => this.mapApproachTransition(trans, facilities, msAirport, approachName, icaoCode)),
                legs: approach.finalLegs.map((leg) => this.mapLeg(leg, facilities, msAirport, approachName, icaoCode, approach.approachType, rnp)),
                missedLegs: approach.missedLegs.map((leg) => this.mapLeg(leg, facilities, msAirport, approachName, icaoCode)),
            };
        });
    }

    public async mapArrivals(msAirport: JS_FacilityAirport): Promise<Arrival[]> {
        const icaoCode = this.getIcaoCodeFromAirport(msAirport);
        const airportIdent = FacilityCache.ident(msAirport.icao);

        const facilities = await this.loadFacilitiesFromProcedures(msAirport.arrivals);

        return msAirport.arrivals.map((arrival) => ({
            sectionCode: SectionCode.Airport,
            subSectionCode: AirportSubsectionCode.STARs,
            databaseId: `P${icaoCode}${airportIdent}${arrival.name}`,
            icaoCode,
            ident: arrival.name,
            commonLegs: arrival.commonLegs.map((leg) => this.mapLeg(leg, facilities, msAirport, arrival.name, icaoCode)),
            enrouteTransitions: arrival.enRouteTransitions.map((trans) => this.mapEnrouteTransition(trans, facilities, msAirport, arrival.name, icaoCode)),
            runwayTransitions: arrival.runwayTransitions.map((trans) => this.mapRunwayTransition(trans, facilities, msAirport, arrival.name, icaoCode)),
        }));
    }

    public async mapDepartures(msAirport: JS_FacilityAirport): Promise<Departure[]> {
        const icaoCode = this.getIcaoCodeFromAirport(msAirport);
        const airportIdent = FacilityCache.ident(msAirport.icao);

        const facilities = await this.loadFacilitiesFromProcedures(msAirport.departures);

        return msAirport.departures.map((departure) => {
            const commonLegsAreAr = this.isAnyRfLegPresent(departure.commonLegs);
            const commonLegsRnp = commonLegsAreAr ? 0.3 : undefined;
            const authorisationRequired = commonLegsAreAr || this.isAnyRfLegPresent(departure.runwayTransitions) || this.isAnyRfLegPresent(departure.enRouteTransitions);

            return {
                sectionCode: SectionCode.Airport,
                subSectionCode: AirportSubsectionCode.SIDs,
                databaseId: `P${icaoCode}${airportIdent}${departure.name}`,
                icaoCode,
                ident: departure.name,
                authorisationRequired,
                commonLegs: departure.commonLegs.map((leg) => this.mapLeg(leg, facilities, msAirport, departure.name, icaoCode, undefined, commonLegsRnp)),
                engineOutLegs: [],
                enrouteTransitions: departure.enRouteTransitions.map((trans) => this.mapEnrouteTransition(trans, facilities, msAirport, departure.name, icaoCode)),
                runwayTransitions: departure.runwayTransitions.map((trans) => this.mapRunwayTransition(trans, facilities, msAirport, departure.name, icaoCode)),
            };
        });
    }

    public async mapGates(msAirport: JS_FacilityAirport): Promise<Gate[]> {
        const icaoCode = this.getIcaoCodeFromAirport(msAirport);
        const airportIcao = FacilityCache.ident(msAirport.icao);

        return msAirport.gates.map((msGate) => {
            // values less than 12 are gate types, which we don't care for... 12 or greater are alphabetical chars which we do care for
            const prefix = msGate.name >= 12 && msGate.name < 38 ? MsfsMapping.letters[msGate.name - 12] : '';
            const suffix = msGate.suffix >= 12 && msGate.suffix < 38 ? MsfsMapping.letters[msGate.suffix - 12] : '';
            const ident = `${prefix}${msGate.number.toString()}${suffix}`;

            const databaseId = `G${icaoCode}${airportIcao}${ident}`;

            // the lat/lon are encoded as an offset from the airport reference point in meteres
            // circumference of the earth at average MSL
            const earthCircumference = 2 * Math.PI * 6371000;
            const latOffset = 360 * msGate.latitude / earthCircumference;
            const longOffset = 360 * msGate.longitude / (earthCircumference * Math.cos(msAirport.lat / 180 * Math.PI));

            const location = {
                lat: msAirport.lat + latOffset,
                long: msAirport.lon + longOffset,
            };

            return {
                sectionCode: SectionCode.Airport,
                subSectionCode: AirportSubsectionCode.Gates,
                databaseId,
                icaoCode,
                ident,
                airportIcao,
                location,
            };
        });
    }

    private async loadFacilitiesFromProcedures(procedures: JS_Procedure[]): Promise<Map< string, JS_Facility>> {
        const icaoSet: Set<string> = new Set();

        const legs: JS_Leg[] = [];

        for (const proc of procedures) {
            // eslint-disable-next-line no-underscore-dangle
            if (proc.__Type === 'JS_Approach') {
                legs.push(...proc.finalLegs);
                legs.push(...proc.missedLegs);
                proc.transitions.forEach((trans) => legs.push(...trans.legs));
            } else {
                legs.push(...proc.commonLegs);
                proc.enRouteTransitions.forEach((trans) => legs.push(...trans.legs));
                proc.runwayTransitions.forEach((trans) => legs.push(...trans.legs));
            }
        }

        for (const leg of legs) {
            if (FacilityCache.validFacilityIcao(leg.fixIcao)) {
                icaoSet.add(leg.fixIcao);
            }
            if (FacilityCache.validFacilityIcao(leg.originIcao)) {
                icaoSet.add(leg.originIcao);
            }
            if (FacilityCache.validFacilityIcao(leg.arcCenterFixIcao)) {
                icaoSet.add(leg.arcCenterFixIcao);
            }
        }

        const icaos = Array.from(icaoSet);

        const vors = await this.cache.getFacilities(icaos.filter((icao) => icao.charAt(0) === 'V'), LoadType.Vor);
        const ndbs = await this.cache.getFacilities(icaos.filter((icao) => icao.charAt(0) === 'N'), LoadType.Ndb);
        const wps = await this.cache.getFacilities(icaos.filter((icao) => icao.charAt(0) === 'W'), LoadType.Intersection);

        return new Map<string, JS_Facility>([...wps, ...ndbs, ...vors]);
    }

    private mapApproachTransition(
        trans: JS_ApproachTransition,
        facilities: Map<string, JS_Facility>,
        airport: JS_FacilityAirport,
        procedureIdent: string,
        icaoCode: string,
    ): ProcedureTransition {
        return {
            ident: trans.name,
            legs: trans.legs.map((leg) => this.mapLeg(leg, facilities, airport, procedureIdent, icaoCode)),
        };
    }

    private mapEnrouteTransition(
        trans: JS_EnRouteTransition,
        facilities: Map<string, JS_Facility>,
        airport: JS_FacilityAirport,
        procedureIdent: string,
        icaoCode: string,
    ): ProcedureTransition {
        const rnp = this.isAnyRfLegPresent(trans.legs) ? 0.3 : undefined;
        return {
            ident: trans.name,
            legs: trans.legs.map((leg) => this.mapLeg(leg, facilities, airport, procedureIdent, icaoCode, undefined, rnp)),
        };
    }

    private mapRunwayTransition(trans: JS_RunwayTransition, facilities: Map<string, JS_Facility>, airport: JS_FacilityAirport, procedureIdent: string, icaoCode: string): ProcedureTransition {
        const rnp = this.isAnyRfLegPresent(trans.legs) ? 0.3 : undefined;
        return {
            ident: `RW${trans.runwayNumber.toFixed(0).padStart(2, '0')}${this.mapRunwayDesignator(trans.runwayDesignation)}`,
            legs: trans.legs.map((leg) => this.mapLeg(leg, facilities, airport, procedureIdent, icaoCode, undefined, rnp)),
        };
    }

    private mapLeg(
        leg: JS_Leg,
        facilities: Map<string, JS_Facility>,
        airport: JS_FacilityAirport,
        procedureIdent: string,
        icaoCode: string,
        approachType?: MSApproachType,
        rnp?: number,
    ): ProcedureLeg {
        const arcCentreFixFacility = FacilityCache.validFacilityIcao(leg.arcCenterFixIcao) ? facilities.get(leg.arcCenterFixIcao) : undefined;
        const arcCentreFix = arcCentreFixFacility ? this.mapFacilityToWaypoint(arcCentreFixFacility) : undefined;
        let waypoint;
        if (leg.fixIcao.charAt(0) === 'R') {
            waypoint = this.mapRunwayWaypoint(airport, leg.fixIcao);
        } else {
            const waypointFacility = FacilityCache.validFacilityIcao(leg.fixIcao) ? facilities.get(leg.fixIcao) : undefined;
            waypoint = waypointFacility ? this.mapFacilityToWaypoint(waypointFacility) : undefined;
        }
        const recommendedNavaidFacility = FacilityCache.validFacilityIcao(leg.originIcao) ? facilities.get(leg.originIcao) : undefined;
        const recommendedNavaid = recommendedNavaidFacility ? this.mapFacilityToWaypoint(recommendedNavaidFacility) : undefined;

        let arcRadius: number | undefined;
        if (leg.type === MsLegType.RF) {
            if (!arcCentreFix || !waypoint) {
                throw new Error('Missing data for RF leg!');
            }
            arcRadius = distanceTo(arcCentreFix.location, waypoint.location);
        }

        // TODO for approach, pass approach type to mapMsAltDesc
        return {
            procedureIdent,
            type: this.mapMsLegType(leg.type),
            overfly: leg.flyOver,
            waypoint,
            recommendedNavaid,
            rho: leg.rho / 1852,
            theta: leg.theta,
            arcCentreFix,
            arcRadius,
            length: leg.distanceMinutes ? undefined : leg.distance / 1852,
            lengthTime: leg.distanceMinutes ? leg.distance : undefined,
            altitudeDescriptor: this.mapMsAltDesc(leg.altDesc, leg.fixTypeFlags, approachType),
            altitude1: Math.round(leg.altitude1 / 0.3048),
            altitude2: Math.round(leg.altitude2 / 0.3048),
            speed: leg.speedRestriction > 0 ? leg.speedRestriction : undefined,
            speedDescriptor: leg.speedRestriction > 0 ? SpeedDescriptor.Maximum : undefined,
            turnDirection: this.mapMsTurnDirection(leg.turnDirection),
            magneticCourse: leg.course, // TODO check magnetic/true
            waypointDescriptor: this.mapMsIcaoToWaypointDescriptor(leg.fixIcao),
            approachWaypointDescriptor: approachType !== undefined ? this.mapMsLegToApproachWaypointDescriptor(leg) : undefined,
            verticalAngle: Math.abs(leg.verticalAngle) > Number.EPSILON ? leg.verticalAngle - 360 : undefined,
            rnp,
        };
    }

    private mapRunwayWaypoint(airport: JS_FacilityAirport, icao: string): Waypoint | undefined {
        const runwayIdent = `${icao.substring(7).trim()}`;
        const runways = this.mapAirportRunwaysPartial(airport);

        for (const runway of runways) {
            if (runway.ident === runwayIdent) {
                return {
                    sectionCode: SectionCode.Enroute,
                    subSectionCode: EnrouteSubsectionCode.Waypoints,
                    databaseId: icao,
                    icaoCode: icao.substring(1, 3),
                    ident: `${runway.ident}`,
                    location: runway.thresholdLocation,
                    area: WaypointArea.Terminal,
                };
            }
        }
        return undefined;
    }

    private mapApproachName(approach: JS_Approach): string {
        let prefix = ' ';
        switch (approach.approachType) {
        case MSApproachType.Backcourse:
            prefix = 'B';
            break;
        case MSApproachType.VorDme:
            prefix = 'D';
            break;
        case MSApproachType.Ils:
            prefix = 'I';
            break;
        case MSApproachType.Loc:
            prefix = 'L';
            break;
        case MSApproachType.Ndb:
            prefix = 'N';
            break;
        case MSApproachType.Gps:
            prefix = 'P';
            break;
        case MSApproachType.NdbDme:
            prefix = 'Q';
            break;
        case MSApproachType.Rnav:
            prefix = 'R';
            break;
        case MSApproachType.Sdf:
            prefix = 'U';
            break;
        case MSApproachType.Vor:
            prefix = 'V';
            break;
        case MSApproachType.Lda:
            prefix = 'X';
            break;
        default:
            break;
        }
        let suffix = '';
        if (approach.approachSuffix) {
            suffix = `${this.mapRunwayDesignator(approach.runwayDesignator, '-')}${approach.approachSuffix}`;
        } else if (approach.runwayDesignator > 0) {
            suffix = this.mapRunwayDesignator(approach.runwayDesignator);
        }
        return `${prefix}${approach.runwayNumber.toFixed(0).padStart(2, '0')}${suffix}`;
    }

    private getIcaoCodeFromAirport(msAirport: JS_FacilityAirport): string {
        const mapIcaos = msAirport.approaches.map((appr) => appr.finalLegs[appr.finalLegs.length - 1].fixIcao);
        // we do a little hack...
        return mapIcaos.length > 0 ? mapIcaos[0].substring(1, 3) : '  ';
    }

    public mapFacilityToWaypoint<T extends JS_Facility>(facility: T): FacilityType<T> {
        const databaseItem = {
            databaseId: facility.icao,
            icaoCode: facility.icao.substring(1, 3),
            ident: FacilityCache.ident(facility.icao),
            name: Utils.Translate(facility.name),
            location: { lat: facility.lat, long: facility.lon },
            area: facility.icao.substring(3, 7).trim().length > 0 ? WaypointArea.Terminal : WaypointArea.Enroute,
        };

        switch (facility.icao.charAt(0)) {
        case 'N':
            const ndb = facility as any as JS_FacilityNDB;
            return {
                ...databaseItem,
                sectionCode: SectionCode.Navaid,
                subSectionCode: NavaidSubsectionCode.NdbNavaid,
                frequency: ndb.freqMHz, // actually kHz
                class: this.mapNdbType(ndb.type),
                bfoOperation: false, // TODO can we?
            } as unknown as FacilityType<T>;
        case 'V':
            const vor = facility as any as JS_FacilityVOR;

            return {
                ...databaseItem,
                sectionCode: SectionCode.Navaid,
                subSectionCode: NavaidSubsectionCode.VhfNavaid,
                frequency: vor.freqMHz,
                range: this.mapVorRange(vor),
                figureOfMerit: this.mapVorFigureOfMerit(vor),
                stationDeclination: vor.magneticVariation > 180 ? vor.magneticVariation - 360 : vor.magneticVariation,
                dmeLocation: (vor.type & (VorType.DME)) > 0 ? databaseItem.location : undefined,
                type: this.mapVorType(vor),
                class: this.mapVorClass(vor),
            } as unknown as FacilityType<T>;
        case 'W':
        default:
            return databaseItem as FacilityType<T>;
        }
    }

    private mapRunwayDesignator(designatorChar: RunwayDesignatorChar, blankChar = ''): string {
        switch (designatorChar) {
        case RunwayDesignatorChar.A:
            return 'A';
        case RunwayDesignatorChar.B:
            return 'B';
        case RunwayDesignatorChar.C:
            return 'C';
        case RunwayDesignatorChar.L:
            return 'L';
        case RunwayDesignatorChar.R:
            return 'R';
        case RunwayDesignatorChar.W:
            return 'W';
        case RunwayDesignatorChar.None:
        default:
            return blankChar;
        }
    }

    private mapMsLegType(type: MsLegType): LegType {
        switch (type) {
        case MsLegType.AF:
            return LegType.AF;
        case MsLegType.CA:
            return LegType.CA;
        case MsLegType.CD:
            return LegType.CD;
        case MsLegType.CF:
            return LegType.CF;
        case MsLegType.CI:
            return LegType.CI;
        case MsLegType.CR:
            return LegType.CR;
        case MsLegType.DF:
            return LegType.DF;
        case MsLegType.FA:
            return LegType.FA;
        case MsLegType.FC:
            return LegType.FC;
        case MsLegType.FD:
            return LegType.FD;
        case MsLegType.FM:
            return LegType.FM;
        case MsLegType.HA:
            return LegType.HA;
        case MsLegType.HF:
            return LegType.HF;
        case MsLegType.HM:
            return LegType.HM;
        case MsLegType.IF:
            return LegType.IF;
        case MsLegType.PI:
            return LegType.PI;
        case MsLegType.RF:
            return LegType.RF;
        case MsLegType.TF:
            return LegType.TF;
        case MsLegType.VA:
            return LegType.VA;
        case MsLegType.VD:
            return LegType.VD;
        case MsLegType.VI:
            return LegType.VI;
        case MsLegType.VM:
            return LegType.VM;
        case MsLegType.VR:
            return LegType.VR;
        default:
            throw new Error(`Invalid leg type: ${type}`);
        }
    }

    private mapMsAltDesc(altDesc: MSAltitudeDescriptor, fixTypeFlags: FixTypeFlags, approachType?: MSApproachType): AltitudeDescriptor | undefined {
        // TODO can we do more of these for other approach types?
        if (approachType === MSApproachType.Ils) {
            if (fixTypeFlags & FixTypeFlags.FAF) {
                if (altDesc === MSAltitudeDescriptor.At) {
                    return AltitudeDescriptor.AtAlt1GsMslAlt2;
                }
                if (altDesc === MSAltitudeDescriptor.AtOrAbove) {
                    return AltitudeDescriptor.AtOrAboveAlt1GsMslAlt2;
                }
            }
            if (fixTypeFlags & FixTypeFlags.IF) { // FACF
                if (altDesc === MSAltitudeDescriptor.At) {
                    return AltitudeDescriptor.AtAlt1GsIntcptAlt2;
                }
                if (altDesc === MSAltitudeDescriptor.AtOrAbove) {
                    return AltitudeDescriptor.AtOrAboveAlt1GsIntcptAlt2;
                }
            }
        }

        switch (altDesc) {
        case MSAltitudeDescriptor.At:
            return AltitudeDescriptor.AtAlt1;
        case MSAltitudeDescriptor.AtOrAbove:
            return AltitudeDescriptor.AtOrAboveAlt1;
        case MSAltitudeDescriptor.AtOrBelow:
            return AltitudeDescriptor.AtOrBelowAlt1;
        case MSAltitudeDescriptor.Between:
            return AltitudeDescriptor.BetweenAlt1Alt2;
        default:
            return undefined;
        }
    }

    private mapMsTurnDirection(turnDirection: MSTurnDirection): TurnDirection {
        switch (turnDirection) {
        case MSTurnDirection.Left:
            return TurnDirection.Left;
        case MSTurnDirection.Right:
            return TurnDirection.Right;
        default:
            return TurnDirection.Either;
        }
    }

    private mapMsIcaoToWaypointDescriptor(icao: string): WaypointDescriptor {
        const type = icao.charAt(0);

        switch (type) {
        case 'A':
            return WaypointDescriptor.Airport;
        case 'N':
            return WaypointDescriptor.NdbNavaid;
        case 'R':
            return WaypointDescriptor.Runway;
        case 'V':
            return WaypointDescriptor.VhfNavaid;
        case ' ':
        case '':
            return 0;
        case 'W':
        default:
            return WaypointDescriptor.Essential; // we don't have any info to decide anything more granular
        }
    }

    private mapMsLegToApproachWaypointDescriptor(leg: JS_Leg): ApproachWaypointDescriptor {
        if ((leg.fixTypeFlags & FixTypeFlags.FAF) > 0) {
            return ApproachWaypointDescriptor.FinalApproachFix;
        }

        if ((leg.fixTypeFlags & FixTypeFlags.IAF) > 0) {
            return ApproachWaypointDescriptor.InitialApproachFix;
            // FIXME consider IAF with Hold/FACF types
        }

        if ((leg.fixTypeFlags & FixTypeFlags.MAP) > 0) {
            return ApproachWaypointDescriptor.MissedApproachPoint;
        }

        return 0;
    }

    private mapNdbType(type: NdbType): NdbClass {
        // TODO double check these
        switch (type) {
        case NdbType.CompassLocator:
            return NdbClass.Low;
        case NdbType.MH:
            return NdbClass.Medium;
        case NdbType.H:
            return NdbClass.Normal;
        case NdbType.HH:
            return NdbClass.High;
        default:
            return NdbClass.Unknown;
        }
    }

    private mapVorRange(vor: JS_FacilityVOR): number {
        switch (vor.vorClass) {
        case MSVorClass.HighAltitude:
            return 130;
        case MSVorClass.LowAltitude:
            return 40;
        default:
        case MSVorClass.Terminal:
            return 25;
        }
    }

    private mapVorFigureOfMerit(vor: JS_FacilityVOR): FigureOfMerit {
        switch (vor.vorClass) {
        case MSVorClass.LowAltitude:
            return 1;
        case MSVorClass.HighAltitude:
            return 2;
        case MSVorClass.Terminal:
        default:
            return 0;
        }
    }

    private mapVorType(vor: JS_FacilityVOR): VhfNavaidType {
        switch (vor.type) {
        case VorType.DME:
            return VhfNavaidType.Dme;
        case VorType.ILS:
            return VhfNavaidType.IlsDme;
        case VorType.TACAN:
            return VhfNavaidType.Tacan;
        case VorType.VOR:
            return VhfNavaidType.Vor;
        case VorType.VORDME:
            return VhfNavaidType.VorDme;
        case VorType.VORTAC:
            return VhfNavaidType.Vortac;
        case VorType.VOT:
            return VhfNavaidType.Vot;
        case VorType.Unknown:
        default:
            return VhfNavaidType.Unknown;
        }
    }

    private mapVorClass(vor: JS_FacilityVOR): VorClass {
        switch (vor.vorClass) {
        case MSVorClass.LowAltitude:
            return VorClass.LowAlt;
        case MSVorClass.HighAltitude:
            return VorClass.HighAlt;
        case MSVorClass.Terminal:
            return VorClass.Terminal;
        default:
            return VorClass.Unknown;
        }
    }

    private mapApproachType(type: MSApproachType): ApproachType {
        switch (type) {
        case MSApproachType.Gps:
            return ApproachType.Gps;
        case MSApproachType.Vor:
            return ApproachType.Vor;
        case MSApproachType.Ndb:
            return ApproachType.Ndb;
        case MSApproachType.Ils:
            return ApproachType.Ils;
        case MSApproachType.Loc:
            return ApproachType.Loc;
        case MSApproachType.Sdf:
            return ApproachType.Sdf;
        case MSApproachType.Lda:
            return ApproachType.Lda;
        case MSApproachType.VorDme:
            return ApproachType.VorDme;
        case MSApproachType.NdbDme:
            return ApproachType.NdbDme;
        case MSApproachType.Rnav:
            return ApproachType.Rnav;
        case MSApproachType.Backcourse:
            return ApproachType.LocBackcourse;
        default:
            return ApproachType.Unknown;
        }
    }

    public async getAirways(fixIdent: string, icaoCode: string): Promise<Airway[]> {
        const fixes = (await this.cache.searchByIdent(fixIdent, IcaoSearchFilter.Intersections, 100)).filter((wp) => wp.icao.substring(1, 3) === icaoCode);
        if (fixes.length < 1 || fixes[0].routes.length < 1) {
            return [];
        }
        if (fixes.length > 1) {
            console.warn(`Multiple fixes named ${fixIdent} in region ${icaoCode}`);
        }

        const fix = this.mapFacilityToWaypoint(fixes[0]);
        const routes = fixes[0].routes;

        const airways = routes.map((route) => ({
            databaseId: `E${icaoCode}    ${route.name}${fixIdent}`,
            ident: route.name,
            level: this.mapAirwayLevel(route.type),
            fixes: [],
            direction: AirwayDirection.Either,
        } as Airway));

        for (let i = 0; i < airways.length; i++) {
            const airway = airways[i];

            const cachedAirwayFixes = this.cache.getCachedAirwayFixes(airway.databaseId);

            if (cachedAirwayFixes) {
                airway.fixes = cachedAirwayFixes;
            }
        }

        for (const route of routes) {
            const id = `E${icaoCode}    ${route.name}${fixIdent}`;

            const airwayObject = airways.find((it) => it.databaseId === id);

            if (!airwayObject) {
                throw new Error(`(getAirways) Airway object not found databaseID=${id}`);
            }

            if (airwayObject.fixes.length > 0) {
                // Fixes were already cached
                continue;
            }

            const previousFacs: JS_FacilityIntersection[] = [];
            const nextFacs: JS_FacilityIntersection[] = [];

            let previousIcao: string | undefined = route.prevIcao;
            // eslint-disable-next-line prefer-destructuring
            let nextIcao: string | undefined = route.nextIcao;

            while (previousIcao?.trim() || nextIcao?.trim()) {
                if (previousIcao?.trim()) {
                    const fac: JS_FacilityIntersection | undefined = await this.cache.getFacility(previousIcao, LoadType.Intersection);

                    if (!fac) {
                        throw new Error(`(getAirways) Facility not loaded while looking back into route: ${previousIcao}`);
                    }

                    previousFacs.unshift(fac);

                    previousIcao = fac.routes.find((it) => it.name === route.name)?.prevIcao;
                }

                if (nextIcao?.trim()) {
                    const fac: JS_FacilityIntersection | undefined = await this.cache.getFacility(nextIcao, LoadType.Intersection);

                    if (!fac) {
                        throw new Error(`(getAirways) Facility not loaded while looking back into route: ${nextIcao}`);
                    }

                    nextFacs.push(fac);

                    nextIcao = fac.routes.find((it) => it.name === route.name)?.nextIcao;
                }
            }

            const allFixes = [
                ...(previousFacs.map((it) => this.mapFacilityToWaypoint(it))),
                fix,
                ...(nextFacs.map((it) => this.mapFacilityToWaypoint(it))),
            ];

            airwayObject.fixes = allFixes;

            this.cache.setCachedAirwayFixes(id, allFixes);
        }

        return airways;
    }

    private mapAirwayLevel(level: RouteType): AirwayLevel {
        switch (level) {
        case RouteType.All:
            return AirwayLevel.Both;
        case RouteType.HighLevel:
            return AirwayLevel.High;
        case RouteType.LowLevel:
            return AirwayLevel.Low;
        default:
            return AirwayLevel.Both;
        }
    }

    private mapRnavTypeFlags(flags: RnavTypeFlags): LevelOfService {
        let levels = 0;
        if (flags & RnavTypeFlags.LNAV) {
            levels |= LevelOfService.Lnav;
        }
        if (flags & RnavTypeFlags.LNAVVNAV) {
            levels |= LevelOfService.LnavVnav;
        }
        if (flags & RnavTypeFlags.LP) {
            levels |= LevelOfService.Lp;
        }
        if (flags & RnavTypeFlags.LPV) {
            levels |= LevelOfService.Lpv;
        }
        return levels;
    }

    /**
     * Checks if any leg in the array or within the array of transitions contains an RF leg.
     * Useful to determine AR/SAAR procedures since MSFS does not have such flags.
     * @param legsOrTransitions legs or transitions to check
     * @returns true if any RF leg is found
     */
    private isAnyRfLegPresent(legsOrTransitions: JS_Leg[] | JS_RunwayTransition[] | JS_EnRouteTransition[]): boolean {
        if (legsOrTransitions.length < 1) {
            return false;
        }

        if ('legs' in legsOrTransitions[0]) {
            const transitions = legsOrTransitions as JS_RunwayTransition[] | JS_EnRouteTransition[];
            return transitions.some((transition) => this.isAnyRfLegPresent(transition.legs));
        }

        const legs = legsOrTransitions as JS_Leg[];
        return legs.some((leg) => leg.type === MsLegType.RF);
    }

    /** @todo move to msfs-geo */
    private trueToMagnetic(bearing: number, magVar: number): number {
        return (360 + bearing - magVar) % 360;
    }

    /** @todo move to msfs-geo */
    private magneticToTrue(bearing: number, magVar: number): number {
        return (360 + bearing + magVar) % 360;
    }

    /** @todo move to msfs-geo */
    private oppositeBearing(bearing: number): number {
        return (bearing + 180) % 360;
    }
}
