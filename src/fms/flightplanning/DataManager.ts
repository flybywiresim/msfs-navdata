import {Airport} from "../../shared/types/Airport";
import {Departure} from "../../shared/types/Departure";
import {Runway} from "../../shared/types/Runway";
import {Arrival} from "../../shared/types/Arrival";
import {Approach} from "../../shared/types/Approach";

export class DataManager {
    public static async fetchData(route: string): Promise<any> {
        return await (await fetch(`https://localhost:3000${route}`)).json();
    }

    public static async getAirport(ident: string): Promise<Airport> {
        return await this.fetchData(`/airports/${ident}`);
    }

    public static async getRunway(runwayIdentifier: string, airportIdentifier: string): Promise<Runway> {
        return await this.fetchData(`/runways/${airportIdentifier}/${runwayIdentifier}`);
    }

    public static async getDeparture(procedureIdentifier: string, airportIdentifier: string): Promise<Departure> {
        return await this.fetchData(`/departures/${airportIdentifier}/${procedureIdentifier}`);
    }

    public static async getArrival(procedureIdentifier: string, airportIdentifier: string): Promise<Arrival> {
        return await this.fetchData(`/arrivals/${airportIdentifier}/${procedureIdentifier}`);
    }

    public static async getApproach(procedureIdentifier: string, airportIdentifier: string): Promise<Approach> {
        return await this.fetchData(`/approaches/${airportIdentifier}/${procedureIdentifier}`);
    }
}
