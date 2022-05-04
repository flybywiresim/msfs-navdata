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
    CommunicationType,
    FigureOfMerit,
    FrequencyUnits,
    IlsNavaid,
    LegType,
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
    JS_FacilityAirport,
    JS_Facility,
    JS_Runway,
    RunwaySurface,
    RunwayDesignatorChar,
    ApproachType as MSApproachType,
    JS_Leg,
    LegType as MsLegType,
    AltitudeDescriptor as MSAltitudeDescriptor,
    FixTypeFlags,
    TurnDirection as MSTurnDirection,
    JS_FacilityNDB,
    NdbType,
    JS_FacilityVOR,
    VorClass as MSVorClass,
    VorType,
    JS_EnRouteTransition,
    JS_RunwayTransition,
    JS_Procedure,
    JS_ApproachTransition,
    JS_Approach,
    JS_FacilityIntersection,
    FrequencyType,
    IcaoSearchFilter,
    RouteType,
} from './FsTypes';
import { FacilityCache, LoadType } from './FacilityCache';

type FacilityType<T> =
        T extends JS_FacilityIntersection ? Waypoint
        : T extends JS_FacilityNDB ? NdbNavaid
        : T extends JS_FacilityVOR ? VhfNavaid
        : never;

export class MsfsMapping {
    // eslint-disable-next-line no-useless-constructor
    constructor(private cache: FacilityCache) {}

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
            elevations.push(runway.elevation);
        });
        console.log('map', msAirport);
        // MSFS doesn't give the airport elevation... so we take the mean of the runway elevations
        const elevation = elevations.reduce((a, b) => a + b) / elevations.length;
        return {
            databaseId: msAirport.icao,
            ident: msAirport.icao.substring(7, 11),
            icaoCode: msAirport.icao.substring(1, 3), // TODO
            name: Utils.Translate(msAirport.name),
            location: { lat: msAirport.lat, long: msAirport.lon, alt: elevation },
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
                    ...(thresholdDistance > 0 ? placeBearingDistance(startLocation, this.oppositeBearing(bearing), thresholdDistance / 1852) : startLocation),
                    alt: (primary ? msRunway.primaryElevation : msRunway.secondaryElevation) * 3.28084,
                };
                // TODO we could get this from approach data...
                const thresholdCrossingHeight = 50 + (primary ? msRunway.primaryElevation : msRunway.secondaryElevation) * 3.28084;
                const lsAppr = msAirport.approaches.find(
                    (appr) => appr.runwayNumber === runwayNumber && appr.runwayDesignator === runwayDesignator && appr.approachType === MSApproachType.Ils,
                );
                const lsIdent = lsAppr ? FacilityCache.ident(lsAppr.finalLegs[lsAppr.finalLegs.length - 1].originIcao) : '';
                const lsFrequencyChannel = lsAppr ? navaids.get(lsAppr.finalLegs[lsAppr.finalLegs.length - 1].originIcao)?.freqMHz ?? 0 : 0;

                runways.push({
                    databaseId,
                    icaoCode,
                    ident,
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
                    ...(thresholdDistance > 0 ? placeBearingDistance(startLocation, this.oppositeBearing(bearing), thresholdDistance / 1852) : startLocation),
                    alt: (primary ? msRunway.primaryElevation : msRunway.secondaryElevation) * 3.28084,
                };
                // TODO we could get this from approach data...
                const thresholdCrossingHeight = 50 + (primary ? msRunway.primaryElevation : msRunway.secondaryElevation) * 3.28084;
                const lsAppr = msAirport.approaches.find(
                    (appr) => appr.runwayNumber === runwayNumber && appr.runwayDesignator === runwayDesignator && appr.approachType === MSApproachType.Ils,
                );
                const lsIdent = lsAppr ? FacilityCache.ident(lsAppr.finalLegs[lsAppr.finalLegs.length - 1].originIcao) : '';

                runways.push({
                    databaseId,
                    icaoCode,
                    ident,
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
                databaseId: ils.icao,
                icaoCode,
                ident: FacilityCache.ident(ils.icao),
                frequency: ils.freqMHz,
                category: LsCategory.None,
                runwayIdent: runways.get(icao)!,
                locLocation: { lat: ils.lat, long: ils.lon },
                locBearing: bearings.get(icao),
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

            return {
                databaseId: `P${icaoCode}${airportIdent}${approach.name}`,
                icaoCode,
                ident: approachName,
                type: this.mapApproachType(approach.approachType),
                transitions: approach.transitions.map((trans) => this.mapApproachTransition(trans, facilities, msAirport, approachName, icaoCode)),
                legs: approach.finalLegs.map((leg) => this.mapLeg(leg, facilities, msAirport, approachName, icaoCode, approach.approachType)),
                missedLegs: approach.missedLegs.map((leg) => this.mapLeg(leg, facilities, msAirport, approachName, icaoCode)),
            };
        });
    }

    public async mapArrivals(msAirport: JS_FacilityAirport): Promise<Arrival[]> {
        const icaoCode = this.getIcaoCodeFromAirport(msAirport);
        const airportIdent = FacilityCache.ident(msAirport.icao);

        const facilities = await this.loadFacilitiesFromProcedures(msAirport.arrivals);

        return msAirport.arrivals.map((arrival) => ({
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

        return msAirport.departures.map((departure) => ({
            databaseId: `P${icaoCode}${airportIdent}${departure.name}`,
            icaoCode,
            ident: departure.name,
            commonLegs: departure.commonLegs.map((leg) => this.mapLeg(leg, facilities, msAirport, departure.name, icaoCode)),
            engineOutLegs: [],
            enrouteTransitions: departure.enRouteTransitions.map((trans) => this.mapEnrouteTransition(trans, facilities, msAirport, departure.name, icaoCode)),
            runwayTransitions: departure.runwayTransitions.map((trans) => this.mapRunwayTransition(trans, facilities, msAirport, departure.name, icaoCode)),
        }));
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
        return {
            ident: trans.name,
            legs: trans.legs.map((leg) => this.mapLeg(leg, facilities, airport, procedureIdent, icaoCode)),
        };
    }

    private mapRunwayTransition(trans: JS_RunwayTransition, facilities: Map<string, JS_Facility>, airport: JS_FacilityAirport, procedureIdent: string, icaoCode: string): ProcedureTransition {
        return {
            ident: `RW${trans.runwayNumber.toFixed(0).padStart(2, '0')}${this.mapRunwayDesignator(trans.runwayDesignation)}`,
            legs: trans.legs.map((leg) => this.mapLeg(leg, facilities, airport, procedureIdent, icaoCode)),
        };
    }

    private mapLeg(
        leg: JS_Leg,
        facilities: Map<string, JS_Facility>,
        airport: JS_FacilityAirport,
        procedureIdent: string,
        icaoCode: string,
        approachType?: MSApproachType,
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
            databaseId: 'blahblah', // TODO
            icaoCode,
            ident: 'blahblah', // TODO
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
            waypointDescriptor: WaypointDescriptor.Essential, // TODO
            // TODO for approach verticalAngle and approachWaypointDescriptor
        };
    }

    private mapRunwayWaypoint(airport: JS_FacilityAirport, icao: string): Waypoint | undefined {
        const runwayIdent = `${icao.substring(7).trim()}`;
        const runways = this.mapAirportRunwaysPartial(airport);

        for (const runway of runways) {
            if (runway.ident === runwayIdent) {
                return {
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
                frequency: ndb.freqMHz, // actually kHz
                class: this.mapNdbType(ndb.type),
                bfoOperation: false, // TODO can we?
            } as FacilityType<T>;
        case 'V':
            const vor = facility as any as JS_FacilityVOR;
            return {
                ...databaseItem,
                frequency: vor.freqMHz,
                range: this.mapVorRange(vor),
                figureOfMerit: this.mapVorFigureOfMerit(vor),
                stationDeclination: vor.magneticVariation > 180 ? vor.magneticVariation - 360 : vor.magneticVariation,
                dmeLocation: (vor.type & (VorType.DME)) > 0 ? databaseItem.location : undefined,
                type: this.mapVorType(vor),
                class: this.mapVorClass(vor),
            } as FacilityType<T>;
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
            fixes: [fix],
            direction: AirwayDirection.Either,
        }));

        for (let i = 0; i < 100; i++) {
            const forwardIcaos = routes.map((route) => route.nextIcao);
            const backwardIcaos = routes.map((route) => route.prevIcao);

            // TODO -_-
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
