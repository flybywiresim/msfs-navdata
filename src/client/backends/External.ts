import { Airport } from '../../shared/types/Airport';
import { Airway } from '../../shared/types/Airway';
import { Approach } from '../../shared/types/Approach';
import { Arrival } from '../../shared/types/Arrival';
import { Departure } from '../../shared/types/Departure';
import { Runway } from '../../shared/types/Runway';
import { DatabaseBackend } from './Backend';
import { IlsNavaid, NdbNavaid, Waypoint } from '../../shared';

export class ExternalBackend extends DatabaseBackend {
    private apiBase: string;

    /**
     *
     * @param apiBase base URL for the
     */
    constructor(apiBase: string) {
        super();
        this.apiBase = apiBase;
    }

    private async fetchApi<T>(path: string): Promise<T[]> {
        const resp = fetch(`${this.apiBase}/${path}`);
        return (await resp).json();
    }

    public getAirportsByIdent(idents: string[]): Promise<Airport[]> {
        return this.fetchApi(`airports/${idents.join()}`);
    }

    public getNearbyAirports(lat: number, lon: number, range?: number): Promise<Airport[]> {
        return this.fetchApi<Airport>(`nearby/airports/${lat},${lon}${range ? `/${range}` : ''}`);
    }

    public getRunways(airportIdentifier: string): Promise<Runway[]> {
        return this.fetchApi<Runway>(`airport/${airportIdentifier}/runways`);
    }

    public getDepartures(airportIdentifier: string): Promise<Departure[]> {
        return this.fetchApi<Departure>(`airport/${airportIdentifier}/departures`);
    }

    public getArrivals(airportIdentifier: string): Promise<Arrival[]> {
        return this.fetchApi<Arrival>(`airport/${airportIdentifier}/arrivals`);
    }

    public getApproaches(airportIdentifier: string): Promise<Approach[]> {
        return this.fetchApi<Approach>(`airport/${airportIdentifier}/approaches`);
    }

    public getAirwaysByIdents(idents: string[]): Promise<Airway[]> {
        return this.fetchApi(`airways/${idents.join(',')}`);
    }

    public getAirwaysByFix(ident: string): Promise<Airway[]> {
        return this.fetchApi(`fix/${ident}/airways`);
    }

    public getNdbsAtAirport(ident: string): Promise<NdbNavaid[]> {
        return this.fetchApi(`airport/${ident}/ndbs`);
    }

    public getWaypointsAtAirport(ident: string): Promise<Waypoint[]> {
        return this.fetchApi(`airport/${ident}/waypoints`);
    }

    public getIlsAtAirport(ident: string): Promise<IlsNavaid[]> {
        return this.fetchApi(`airport/${ident}/ils`);
    }
}
