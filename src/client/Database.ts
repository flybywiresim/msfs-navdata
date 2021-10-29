import {
    Airport,
    Approach,
    Arrival,
    Departure,
    Runway,
    Airway,
    IlsNavaid,
    NdbNavaid,
    VhfNavaid,
    Waypoint,
    Location,
    DatabaseIdent,
    DataInterface,
    HeightSearchRange,
    ZoneSearchRange,
} from '../shared';
import { AirportCommunication } from '../shared/types/Communication';

export class Database {
    backend: DataInterface;

    constructor(backend: DataInterface) {
        this.backend = backend;
    }

    public getDatabaseIdent(): Promise<DatabaseIdent> {
        return this.backend.getDatabaseIdent();
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

    public getIlsAtAirport(airportIdentifier: string): Promise<IlsNavaid[]> {
        return this.backend.getIlsAtAirport(airportIdentifier);
    }

    public getNDBsAtAirport(airportIdentifier: string): Promise<NdbNavaid[]> {
        return this.backend.getNDBsAtAirport(airportIdentifier);
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

    public getNavaids(idents: string[]): Promise<VhfNavaid[]> {
        return this.backend.getNavaids(idents);
    }

    public getNDBs(idents: string[]): Promise<NdbNavaid[]> {
        return this.backend.getNDBs(idents);
    }

    public async getAirways(idents: string[]): Promise<Airway[]> {
        return this.backend.getAirways(idents);
    }

    public async getAirwaysByFix(fix: Waypoint | NdbNavaid | VhfNavaid): Promise<Airway[]> {
        return this.backend.getAirwaysByFix(fix.ident, fix.icaoCode);
    }

    public getNearbyAirports(center: Location, range: number): Promise<Airport[]> {
        return this.backend.getAirportsInRange(center, range);
    }

    public getNearbyAirways(center: Location, range: number, searchRange?: HeightSearchRange): Promise<Airway[]> {
        return this.backend.getAirwaysInRange(center, range, searchRange);
    }

    public getNearbyNavaids(center: Location, range: number, searchRange?: HeightSearchRange): Promise<VhfNavaid[]> {
        return this.backend.getNavaidsInRange(center, range, searchRange);
    }

    public getNearbyNDBs(center: Location, range: number, searchRange?: ZoneSearchRange): Promise<NdbNavaid[]> {
        return this.backend.getNDBsInRange(center, range, searchRange);
    }

    public getWaypointsInRange(center: Location, range: number, searchRange?: ZoneSearchRange): Promise<Waypoint[]> {
        return this.backend.getWaypointsInRange(center, range, searchRange);
    }

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
