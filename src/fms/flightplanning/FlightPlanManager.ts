import { FlightPlan } from "./FlightPlan";
import {Database} from "../../client/Database";

declare const SimVar: any;

export class FlightPlanManager {
    public currentFlightPlan: FlightPlan;

    public alternateFlightPlan: FlightPlan | undefined;

    public temporaryFlightPlan: FlightPlan | undefined;

    public secondaryFlightPlan: FlightPlan | undefined;

    public static get FlightPlanStorageKey() { return 'FPM_STORAGE_KEY' };
    public static get FlightPlanVersionKey() { return 'L:FPM_VERSION_KEY' };

    private flightPlanVersion = 0;

    private database: Database;

    constructor(database: Database) {
        this.database = database;
        this.currentFlightPlan = new FlightPlan(database);
    }

    public confirmTemporaryFlightPlan() {
        if(!this.temporaryFlightPlan)
            return;
        this.currentFlightPlan = this.temporaryFlightPlan;
        this.temporaryFlightPlan = undefined;
        this.saveFlightPlans();
    }

    public async setOrigin(ident: string) {
        const airport = await this.database.getAirportByIdent(ident);
        if(!airport)
            return;
        this.currentFlightPlan = new FlightPlan(this.database, airport);
        this.temporaryFlightPlan = undefined;
        this.secondaryFlightPlan = undefined;
        this.alternateFlightPlan = undefined;
        this.saveFlightPlans();
    }

    public async setDestination(ident: string) {
        const airport = await this.database.getAirportByIdent(ident);
        if(!this.currentFlightPlan || !airport)
            return;
        this.currentFlightPlan.destinationAirport = airport;
        this.temporaryFlightPlan = undefined;
        this.secondaryFlightPlan = undefined;
        this.saveFlightPlans();
    }

    public checkTemporaryExists() {
        if(!this.temporaryFlightPlan)
            this.temporaryFlightPlan = this.currentFlightPlan.copy();
    }

    public async setDepartureRunwayIdentifier(ident: string) {
        this.checkTemporaryExists();
        // @ts-ignore
        this.temporaryFlightPlan.procedureDetails.departureRunwayIdentifier = ident;
        await this.temporaryFlightPlan?.buildDeparture();
        this.saveFlightPlans();
    }

    public async setDepartureIdentifier(ident: string) {
        this.checkTemporaryExists();
        // @ts-ignore
        this.temporaryFlightPlan.procedureDetails.departureIdentifier = ident;
        await this.temporaryFlightPlan?.buildDeparture();
        this.saveFlightPlans();
    }

    public async setDepartureTransitionIdentifier(ident: string) {
        this.checkTemporaryExists();
        // @ts-ignore
        this.temporaryFlightPlan.procedureDetails.departureTransitionIdentifier = ident;
        await this.temporaryFlightPlan?.buildDeparture();
        this.saveFlightPlans();
    }

    public async setArrivalTransitionIdentifier(ident: string) {
        this.checkTemporaryExists();
        // @ts-ignore
        this.temporaryFlightPlan.procedureDetails.arrivalTransitionIdentifier = ident;
        await this.temporaryFlightPlan?.buildArrival();
        this.saveFlightPlans();
    }

    public async setArrivalIdentifier(ident: string) {
        this.checkTemporaryExists();
        // @ts-ignore
        this.temporaryFlightPlan.procedureDetails.arrivalIdentifier = ident;
        await this.temporaryFlightPlan?.buildArrival();
        this.saveFlightPlans();
    }

    public async setApproachTransitionIdentifier(ident: string) {
        this.checkTemporaryExists();
        // @ts-ignore
        this.temporaryFlightPlan.procedureDetails.approachTransitionIdentifier = ident;
        await this.temporaryFlightPlan?.buildApproach();
        this.saveFlightPlans();
    }

    public async setApproachIdentifier(ident: string) {
        this.checkTemporaryExists();
        // @ts-ignore
        this.temporaryFlightPlan.procedureDetails.approachIdentifier = ident;
        this.temporaryFlightPlan?.buildApproach();
        this.saveFlightPlans();
    }

    public async loadFlightPlans() {
        //TODO: Add functionality with ViewListeners
    }

    public async saveFlightPlans() {
        //TODO: Add functionality with ViewListeners
        SimVar.SetSimVarValue(FlightPlanManager.FlightPlanVersionKey, 'number', ++this.flightPlanVersion);
    }
}
