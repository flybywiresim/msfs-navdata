import { Airport } from "../../shared/types/Airport";
import { Airway } from "../../shared/types/Airway";
import { Approach } from "../../shared/types/Approach";
import { Arrival } from "../../shared/types/Arrival";
import { Departure } from "../../shared/types/Departure";
import { Runway } from "../../shared/types/Runway";
import { DatabaseBackend } from "./Backend";

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

    public async getAirportsByIdent(idents: string[]): Promise<Airport[]> {
        return await this.fetchApi(`airports/${idents.join()}`);
    }

    public async getNearbyAirports(lat: number, lon: number, range?: number): Promise<Airport[]> {
        return await this.fetchApi<Airport>(`nearby/airports/${lat},${lon}${range ? '/' + range : ''}`);
    }

    public async getRunways(airportIdentifier: string): Promise<Runway[]> {
        return await this.fetchApi<Runway>(`airport/${airportIdentifier}/runways`);
    }

    public async getDepartures(airportIdentifier: string): Promise<Departure[]> {
        return await this.fetchApi<Departure>(`airport/${airportIdentifier}/departures`);
    }

    public async getArrivals(airportIdentifier: string): Promise<Arrival[]> {
        return await this.fetchApi<Arrival>(`airport/${airportIdentifier}/arrivals`);
    }

    public async getApproaches(airportIdentifier: string): Promise<Approach[]> {
        return await this.fetchApi<Approach>(`airport/${airportIdentifier}/approaches`);
    }

    public async getAirwaysByIdents(idents: string[]): Promise<Airway[]> {
        return await this.fetchApi(`airways/${idents.join()}`);
    }

    public async getAirwaysByFixes(ident: string): Promise<Airway[]> {
        return await this.fetchApi(`fix/${ident}/airways`);
    }
}
