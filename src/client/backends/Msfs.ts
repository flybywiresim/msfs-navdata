import { Airport } from "../../shared/types/Airport";
import { Approach } from "../../shared/types/Approach";
import { Arrival } from "../../shared/types/Arrival";
import { DatabaseItem } from "../../shared/types/Common";
import { Departure } from "../../shared/types/Departure";
import { Runway, RunwaySurfaceType } from "../../shared/types/Runway";
import { DatabaseBackend } from "./Backend";

type PendingRequest = {
    resolve: Function,
    reject: Function,
    pendingFacilities: string[],
    results: DatabaseItem[],
};

export class MsfsBackend extends DatabaseBackend {
    private listener;
    private pendingRequests: PendingRequest[] = [];
    private cache: Map<string, DatabaseItem> = {};

    constructor() {
        super();
        this.listener = RegisterViewListener('JS_LISTENER_FACILITY');

        Coherent.on('SendAirport', this.receiveFacility.bind(this));
    }

    private mapLla(lla) {
        return {
            lat: lla.lat,
            lon: lla.lon,
            alt: lla.alt,
        };
    }

    private mapRunwaySurface(surface): RunwaySurfaceType {
        switch (surface) {
        default:
            return RunwaySurfaceType.Hard;
        }
    }

    private mapAirport(msAirport): Airport {
        let elevations: number[] = [];
        let longestRunway = [0, undefined];
        msAirport.infos.runways.forEach((runway) => {
            if (runway.length > longestRunway[0]) {
                longestRunway = [runway.length, runway];
            }
            elevations.push(runway.elevation);
        });
        // MSFS doesn't give the airport elevation... so we take the mean of the runway elevations
        const elevation = elevations.reduce((a, b) => a + b) / elevations.length;
        return {
            databaseId: msAirport.icao,
            ident: msAirport.icao.substring(7, 11),
            icaoCode: msAirport.icao.substring(0, 2),
            airportName: gettranslation thing... msAirport.name,
            location: { lat: msAirport.lat, lon: msAirport.lon, alt: elevation },
            longestRunwaySurfaceType: this.mapRunwaySurface(longestRunway[1]),
        };
    }

    private receiveFacility(facility): void {
        let item: DatabaseItem;
        switch (facility.icao.charAt(0)) {
        case 'A':
            item = this.mapAirport(facility);
            break;
        default:
            console.error(`Unknown facility ${facility.icao}`);
            return;
        }

        this.cache.set(facility.icao, item);

        for (let i = this.pendingRequests.length - 1; i >= 0; i--) {
            const request = this.pendingRequests[i];
            const index = request.pendingFacilities.findIndex(facility.icao);
            if (index !== -1) {
                request.results.push(item);
                request.pendingFacilities.splice(index, 1);

                if (request.pendingFacilities.length === 0) {
                    request.resolve(request.results);
                    this.pendingRequests.splice(i, 1);
                }
            }
        }
    }

    public async getAirportsByIdent(idents: string[]): Promise<Airport[]> {
        return new Promise((resolve, reject) => {
            const icaos = idents.map((ident) => `A      ${ident}`);
            const results: DatabaseItem[] = [];
            for (let i = icaos.length - 1; i >= 0; i--) {
                if (this.cache.has(icaos[i])) {
                    icaos.splice(i, 1);
                    results.push(this.cache.get(icaos[i]));
                }
            }

            if (icaos.length === 0) {
                resolve(results);
            }

            const index = this.pendingRequests.push({
                resolve: resolve,
                reject: reject,
                pendingFacilities: icaos,
                results: results,
            }) - 1;
            const result: boolean[] = await Coherent.call('LOAD_AIRPORTS', icaos);
            if (result.length < icaos.length) {
                this.pendingRequests[index].reject();
                this.pendingRequests.splice(index, 1);
            }
        });
    }

    public async getNearbyAirports(lat: number, lon: number, range?: number): Promise<Airport[]> {
        throw new Error('computer says no');
    }

    public async getRunways(airportIdentifier: string): Promise<Runway[]> {
        throw new Error('computer says no');
    }

    public async getDepartures(airportIdentifier: string): Promise<Departure[]> {
        throw new Error('computer says no');
    }

    public async getArrivals(airportIdentifier: string): Promise<Arrival[]> {
        throw new Error('computer says no');
    }

    public async getApproaches(airportIdentifier: string): Promise<Approach[]> {
        throw new Error('computer says no');
    }
}
