import { Coordinates, NauticalMiles } from 'msfs-geo';
import {
    Airport,
    AirwayLevel,
    Approach,
    Arrival,
    Departure,
    Runway,
    Airway,
    IlsNavaid,
    NdbNavaid,
    NdbClass,
    Marker,
    ProcedureLeg,
    VhfNavaid,
    VhfNavaidType,
    VorClass,
    Waypoint,
    DatabaseIdent,
    DataInterface,
    RestrictiveAirspace,
    Fix,
    StandaloneFix,
    EnrouteFix,
    AirportFix,
    Navaid,
    FixTypeFlags,
} from '../shared';
import { AirportCommunication } from '../shared/types/Communication';
import { ControlledAirspace } from '../shared/types/Airspace';
import { Gate } from '../shared/types/Gate';

export class Database {
    backend: DataInterface;

    constructor(backend: DataInterface) {
        this.backend = backend;
    }

    public getDatabaseIdent(): Promise<DatabaseIdent> {
        return this.backend.getDatabaseIdent();
    }

    public getEnrouteFixes<T extends FixTypeFlags>(idents: string[], type?: T): Promise<EnrouteFix[]> {
        const promises: Promise<EnrouteFix[]>[] = [];
        if ((!type || (type & FixTypeFlags.NdbNavaid) > 0) && idents.find((ident) => ident.length <= 4)) {
            promises.push(this.backend.getNdbNavaids(idents));
        }
        if ((!type || (type & FixTypeFlags.VhfNavaid) > 0) && idents.find((ident) => ident.length <= 4)) {
            promises.push(this.backend.getVhfNavaids(idents));
        }
        if ((!type || (type & FixTypeFlags.Waypoint) > 0) && idents.find((ident) => ident.length <= 5)) {
            promises.push(this.backend.getWaypoints(idents));
        }
        return Promise.all(promises).then((data) => data.flat());
    }

    public getFixes<T extends FixTypeFlags>(idents: string[], type?: T): Promise<StandaloneFix[]> {
        const promises: Promise<StandaloneFix[]>[] = [this.getEnrouteFixes(idents, type)];
        if ((!type || (type & FixTypeFlags.Airport) > 0) && idents.find((ident) => ident.length === 4)) {
            promises.push(this.backend.getAirports(idents));
        }

        return Promise.all(promises).then((data) => data.flat());
    }

    public getAirportFixes<T extends FixTypeFlags>(idents: string[], airportIdentifier: string, type?: T): Promise<AirportFix[]> {
        const promises: Promise<AirportFix[]>[] = [];
        // Todo get GLS
        if ((!type || (type & FixTypeFlags.IlsNavaid) > 0) && idents.find((ident) => ident.length <= 4)) {
            promises.push(this.backend.getIlsAtAirport(airportIdentifier).then((data) => data.filter((ils) => idents.includes(ils.ident))));
        }
        if ((!type || (type & FixTypeFlags.Runway) > 0) && idents.find((ident) => ident.length > 3 && ident.length <= 5)) {
            promises.push(this.backend.getRunways(airportIdentifier).then((data) => data.filter((runway) => idents.includes(runway.ident))));
        }

        return Promise.all(promises).then((data) => data.flat());
    }

    public getNavaids<T extends FixTypeFlags>(idents: string[], airportIdentifier?: string, type?: T): Promise<Navaid[]> {
        const promises: Promise<Navaid[]>[] = [];
        // Todo get GLS
        if (airportIdentifier && (!type || (type & FixTypeFlags.IlsNavaid) > 0) && idents.find((ident) => ident.length <= 4)) {
            promises.push(this.backend.getIlsAtAirport(airportIdentifier).then((data) => data.filter((ils) => idents.includes(ils.ident))));
        }
        if (airportIdentifier && (!type || (type & FixTypeFlags.NdbNavaid) > 0) && idents.find((ident) => ident.length <= 4)) {
            promises.push(this.backend.getNdbNavaids(idents));
        }
        if (airportIdentifier && (!type || (type & FixTypeFlags.VhfNavaid) > 0) && idents.find((ident) => ident.length <= 4)) {
            promises.push(this.backend.getVhfNavaids(idents));
        }
        return Promise.all(promises).then((data) => data.flat());
    }

    public getAirports(idents: string[]): Promise<Airport[]> {
        return this.backend.getAirports(idents);
    }

    public async getRunways(airportIdentifier: string, procedure?: Departure | Arrival): Promise<Runway[]> {
        let runways = await this.backend.getRunways(airportIdentifier);
        if (procedure) {
            runways = runways.filter((runway) => procedure.runwayTransitions.find((trans) => trans.ident === runway.ident));
        }
        return runways;
    }

    public async getDepartures(airportIdentifier: string, runwayIdentifier?: string): Promise<Departure[]> {
        let departures = await this.backend.getDepartures(airportIdentifier);
        if (runwayIdentifier) {
            departures = departures.filter((departure) => departure.runwayTransitions.find((trans) => trans.ident === runwayIdentifier));
        }
        return departures;
    }

    public async getArrivals(airportIdentifier: string, approach?: Approach): Promise<Arrival[]> {
        let arrivals = await this.backend.getArrivals(airportIdentifier);
        if (approach) {
            const runwayIdentifier = Database.approachToRunway(approach.ident);
            arrivals = arrivals.filter((arrival) => arrival.runwayTransitions.find((trans) => runwayIdentifier === null || trans.ident === runwayIdentifier));
        }
        return arrivals;
    }

    public async getApproaches(airportIdentifier: string, arrival?: Arrival): Promise<Approach[]> {
        let approaches = await this.backend.getApproaches(airportIdentifier);
        if (arrival) {
            approaches = approaches.filter((approach) => arrival.runwayTransitions
                .find((trans) => Database.approachToRunway(approach.ident) === null || trans.ident === Database.approachToRunway(approach.ident)));
        }
        return approaches;
    }

    public async getGates(airportIdentifier: string): Promise<Gate[]> {
        return this.backend.getGates(airportIdentifier);
    }

    public async getHolds(fixIdentifier: string, airportIdentifier: string): Promise<ProcedureLeg[]> {
        return (await this.backend.getHolds(airportIdentifier)).filter((hold) => hold.fix?.ident === fixIdentifier);
    }

    public getIlsAtAirport(airportIdentifier: string): Promise<IlsNavaid[]> {
        return this.backend.getIlsAtAirport(airportIdentifier);
    }

    public getLsMarkers(airportIdentifier: string, runwayIdentifier: string, llzIdentifier: string): Promise<Marker[]> {
        return this.backend.getLsMarkers(airportIdentifier, runwayIdentifier, llzIdentifier);
    }

    public getNDBsAtAirport(airportIdentifier: string): Promise<NdbNavaid[]> {
        return this.backend.getNdbsAtAirport(airportIdentifier);
    }

    public getWaypointsAtAirport(airportIdentifier: string): Promise<Waypoint[]> {
        return this.backend.getWaypointsAtAirport(airportIdentifier);
    }

    getCommunicationsAtAirport(airportIdentifier: string): Promise<AirportCommunication[]> {
        return this.backend.getCommunicationsAtAirport(airportIdentifier);
    }

    public getWaypoints(idents: string[]): Promise<Waypoint[]> {
        return this.backend.getWaypoints(idents);
    }

    public getVhfNavaids(idents: string[]): Promise<VhfNavaid[]> {
        return this.backend.getVhfNavaids(idents);
    }

    public getNdbNavaids(idents: string[]): Promise<NdbNavaid[]> {
        return this.backend.getNdbNavaids(idents);
    }

    public async getAirways(idents: string[]): Promise<Airway[]> {
        return this.backend.getAirways(idents);
    }

    public async getAirwaysByFix(fix: Fix): Promise<Airway[]> {
        return this.backend.getAirwaysByFix(fix.ident, fix.icaoCode);
    }

    public getNearbyAirports(center: Coordinates, range: number): Promise<Airport[]> {
        return this.backend.getNearbyAirports(center, range);
    }

    public getNearbyAirways(center: Coordinates, range: number, levels?: AirwayLevel): Promise<Airway[]> {
        return this.backend.getNearbyAirways(center, range, levels);
    }

    public getNearbyVhfNavaids(center: Coordinates, range: number, classes?: VorClass, types?: VhfNavaidType): Promise<VhfNavaid[]> {
        return this.backend.getNearbyVhfNavaids(center, range, classes, types);
    }

    public getNearbyNdbNavaids(center: Coordinates, range: number, classes?: NdbClass): Promise<NdbNavaid[]> {
        return this.backend.getNearbyNdbNavaids(center, range, classes);
    }

    public getWaypointsInRange(center: Coordinates, range: number): Promise<Waypoint[]> {
        return this.backend.getNearbyWaypoints(center, range);
    }

    public getControlledAirspacesInRange(center: Coordinates, range: NauticalMiles): Promise<ControlledAirspace[]> {
        return this.backend.getControlledAirspaceInRange(center, range);
    }

    public getRestrictiveAirspacesInRange(center: Coordinates, range: NauticalMiles): Promise<RestrictiveAirspace[]> {
        return this.backend.getRestrictiveAirspaceInRange(center, range);
    }

    // TODO this doesn't belong here (backend/provider specific)
    /** Returns the identifier of the runway attached to the approach, null if it is not specific to any runway */
    public static approachToRunway(ident: string): string | null {
        if (!ident.match(/\d+/g)) return null;
        switch (ident[3]) {
        case 'L':
        case 'C':
        case 'R':
            return (`RW${ident.substr(1, 3)}`);
        default:
            return (`RW${ident.substr(1, 2)}`);
        }
    }
}
