import { Airport, Airway, Approach, Arrival, Departure, Runway, DatabaseIdent, IlsNavaid, Location, NauticalMiles, NdbNavaid, VhfNavaid, Waypoint } from '../../shared';
import { DataInterface, HeightSearchRange, ZoneSearchRange } from '../../shared/DataInterface';

export class ExternalBackend implements DataInterface {
    private readonly apiBase: string;

    /**
     *
     * @param apiBase base URL for the
     */
    constructor(apiBase: string) {
        this.apiBase = apiBase;
    }

    async fetchApi(path: string): Promise<any> {
        const resp = fetch(`${this.apiBase}/${path}`);
        return (await resp).json();
    }

    getAirports(idents: string[]): Promise<Airport[]> {
        return this.fetchApi(`airports/${idents.join()}`);
    }

    getAirportsInRange(center: Location, range: NauticalMiles): Promise<Airport[]> {
        return this.fetchApi(`nearby/airports/${center.lat},${center.lon}/${range}`);
    }

    getRunways(airportIdentifier: string): Promise<Runway[]> {
        return this.fetchApi(`airport/${airportIdentifier}/runways`);
    }

    getDepartures(airportIdentifier: string): Promise<Departure[]> {
        return this.fetchApi(`airport/${airportIdentifier}/departures`);
    }

    getArrivals(airportIdentifier: string): Promise<Arrival[]> {
        return this.fetchApi(`airport/${airportIdentifier}/arrivals`);
    }

    getApproaches(airportIdentifier: string): Promise<Approach[]> {
        return this.fetchApi(`airport/${airportIdentifier}/approaches`);
    }

    getAirways(idents: string[]): Promise<Airway[]> {
        return this.fetchApi(`airways/${idents.join()}`);
    }

    getAirwaysByFix(ident: string): Promise<Airway[]> {
        return this.fetchApi(`fix/${ident}/airways`);
    }

    getNDBsAtAirport(airportIdentifier: string): Promise<NdbNavaid[]> {
        return this.fetchApi(`airport/${airportIdentifier}/ndbs`);
    }

    getWaypointsAtAirport(airportIdentifier: string): Promise<Waypoint[]> {
        return this.fetchApi(`airport/${airportIdentifier}/waypoints`);
    }

    getIlsAtAirport(airportIdentifier: string): Promise<IlsNavaid[]> {
        return this.fetchApi(`airport/${airportIdentifier}/ils`);
    }

    getWaypoints(idents: string[]): Promise<Waypoint[]> {
        return this.fetchApi(`waypoints/${idents.join()}`);
    }

    getNavaids(idents: string[]): Promise<VhfNavaid[]> {
        return this.fetchApi(`navaids/${idents.join()}`);
    }

    getAirwaysInRange(center: Location, range: NauticalMiles, searchRange?: HeightSearchRange): Promise<Airway[]> {
        return this.fetchApi(`nearby/airways/${center.lat},${center.lon}/${range}/${searchRange}`);
    }

    getDatabaseIdent(): Promise<DatabaseIdent> {
        return this.fetchApi('');
    }

    getNDBs(idents: string[]): Promise<NdbNavaid[]> {
        return this.fetchApi(`ndbs/${idents.join()}`);
    }

    getNDBsInRange(center: Location, range: NauticalMiles, searchRange?: ZoneSearchRange): Promise<NdbNavaid[]> {
        return this.fetchApi(`nearby/ndbs/${center.lat},${center.lon}/${range}/${searchRange}`);
    }

    getNavaidsInRange(center: Location, range: NauticalMiles, searchRange?: HeightSearchRange): Promise<VhfNavaid[]> {
        return this.fetchApi(`nearby/navaids/${center.lat},${center.lon}/${range}/${searchRange}`);
    }

    getWaypointsInRange(center: Location, range: NauticalMiles, searchRange?: ZoneSearchRange): Promise<Waypoint[]> {
        return this.fetchApi(`nearby/waypoints/${center.lat},${center.lon}/${range}/${searchRange}`);
    }
}
