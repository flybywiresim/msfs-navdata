import { FlightPlan } from "./FlightPlan";
import {DataManager} from "./DataManager";

declare const SimVar: any;

export class FlightPlanManager {
    public currentFlightPlan: FlightPlan = new FlightPlan();

    public alternateFlightPlan: FlightPlan | undefined;

    public temporaryFlightPlan: FlightPlan | undefined;

    public secondaryFlightPlan: FlightPlan | undefined;

    public static get FlightPlanStorageKey() { return 'FPM_STORAGE_KEY' };
    public static get FlightPlanVersionKey() { return 'L:FPM_VERSION_KEY' };

    private flightPlanVersion = 0;

    public confirmTemporaryFlightPlan() {
        if(!this.temporaryFlightPlan)
            return;
        this.currentFlightPlan = this.temporaryFlightPlan;
        this.temporaryFlightPlan = undefined;
        this.saveFlightPlans();
    }

    public async setOrigin(ident: string) {
        const airport = await DataManager.getAirport(ident);
        this.currentFlightPlan = new FlightPlan(airport);
        this.temporaryFlightPlan = undefined;
        this.secondaryFlightPlan = undefined;
        this.alternateFlightPlan = undefined;
        this.saveFlightPlans();
    }

    public async setDestination(ident: string) {
        if(!this.currentFlightPlan)
            return;
        const airport = await DataManager.getAirport(ident);
        this.currentFlightPlan.destinationAirport = airport;
        this.temporaryFlightPlan = undefined;
        this.secondaryFlightPlan = undefined;
        this.saveFlightPlans();
    }

    public checkTemporaryExists() {
        if(!this.temporaryFlightPlan)
            this.temporaryFlightPlan = this.currentFlightPlan.copy();
    }

    public setDepartureRunwayIdentifier(ident: string) {
        this.checkTemporaryExists();
        // @ts-ignore
        this.temporaryFlightPlan.procedureDetails.departureRunwayIdentifier = ident;
        this.temporaryFlightPlan?.buildDeparture();
        this.saveFlightPlans();
    }

    public setDepartureIdentifier(ident: string) {
        this.checkTemporaryExists();
        // @ts-ignore
        this.temporaryFlightPlan.procedureDetails.departureIdentifier = ident;
        this.temporaryFlightPlan?.buildDeparture();
        this.saveFlightPlans();
    }

    public setDepartureTransitionIdentifier(ident: string) {
        this.checkTemporaryExists();
        // @ts-ignore
        this.temporaryFlightPlan.procedureDetails.departureTransitionIdentifier = ident;
        this.temporaryFlightPlan?.buildDeparture();
        this.saveFlightPlans();
    }

    public setArrivalTransitionIdentifier(ident: string) {
        this.checkTemporaryExists();
        // @ts-ignore
        this.temporaryFlightPlan.procedureDetails.arrivalTransitionIdentifier = ident;
        this.temporaryFlightPlan?.buildArrival();
        this.saveFlightPlans();
    }

    public setArrivalIdentifier(ident: string) {
        this.checkTemporaryExists();
        // @ts-ignore
        this.temporaryFlightPlan.procedureDetails.arrivalIdentifier = ident;
        this.temporaryFlightPlan?.buildArrival();
        this.saveFlightPlans();
    }

    public setApproachTransitionIdentifier(ident: string) {
        this.checkTemporaryExists();
        // @ts-ignore
        this.temporaryFlightPlan.procedureDetails.approachTransitionIdentifier = ident;
        this.temporaryFlightPlan?.buildApproach();
        this.saveFlightPlans();
    }

    public setApproachIdentifier(ident: string) {
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
