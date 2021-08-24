import { SerializedFlightPlan} from "./serialization/SerializedFlightPlan";
import { Leg } from "../common/legs";
import { Transition } from "../common/transitions";
import { Airport } from "../../shared/types/Airport";
import { IFLeg } from "../common/legs/IFLeg";
import { Waypoint } from "../common/Waypoint";
import { FlightPlanUtils } from "./FlightPlanUtils";
import {Database} from "../../client/Database";
import {Departure} from "../../shared/types/Departure";
import {Arrival} from "../../shared/types/Arrival";
import {Approach} from "../../shared/types/Approach";

type ProcedureDetails = {
    departureRunwayIdentifier: string;
    departureIdentifier: string;
    departureTransitionIdentifier: string;

    arrivalTransitionIdentifier: string;
    arrivalIdentifier: string;
    approachTransitionIdentifier: string;
    approachIdentifier: string;
}

/** Each Item in the Map contains the transition coming before the given leg */
type Segment = { legs: Leg[], transitions: Transition[] }

export class FlightPlan {
    public originAirport: Airport | undefined;

    public destinationAirport: Airport | undefined;

    public procedureDetails: ProcedureDetails = {
        departureRunwayIdentifier: '',
        departureIdentifier: '',
        departureTransitionIdentifier: '',

        arrivalTransitionIdentifier: '',
        arrivalIdentifier: '',
        approachTransitionIdentifier: '',
        approachIdentifier: ''
    };

    public departure: Departure | undefined;
    public arrival: Arrival | undefined;
    public approach: Approach | undefined;

    private departureSegment: Segment = { legs: [], transitions: [] };

    private enRouteSegments: Segment[] = [];

    private arrivalSegment: Segment = { legs: [], transitions: [] };

    private approachSegment: Segment = { legs: [], transitions: [] };

    private missedSegment: Segment = { legs: [], transitions: [] };

    private database: Database;

    constructor(database: Database, origin?: Airport) {
        this.originAirport = origin;
        this.database = database;
    }

    public get legs() {
        let legs: Leg[] = [...this.departureSegment.legs];
        this.enRouteSegments.forEach(segment => {
            legs.push(...segment.legs);
        })
        legs.push(...[...this.arrivalSegment.legs, ...this.approachSegment.legs]);
        legs = legs.filter((leg, index, array) => !(leg instanceof IFLeg && array[index - 1]?.identifier === leg.identifier));
        return legs;
    }

    public async buildDeparture() {
        if(!this.originAirport)
            return;

        const legs: Leg[] = [];
        this.departure = (await this.database.getDepartures(this.originAirport.ident)).find(departure => departure.ident === this.procedureDetails.departureIdentifier);
        if(!this.departure)
            return;

        if(this.procedureDetails.departureRunwayIdentifier) {
            const runwayIdentifier = this.procedureDetails.departureRunwayIdentifier
            const runway = await (await this.database.getRunways(this.originAirport.ident)).find(runway => runway.ident === runwayIdentifier);
            const initialFix = new IFLeg(new Waypoint(
                `${this.originAirport.ident}${runwayIdentifier.substr(2)}`,
                { lat: runway?.thresholdLocation.lat ?? 0, lon: runway?.thresholdLocation.lon ?? 0 }));
            legs.push(initialFix);

            const transition = this.departure.runwayTransitions.find(trans => trans.ident === runwayIdentifier);
            if(transition)
                legs.push(...FlightPlanUtils.fromProcedureLegs(transition.legs));
        }

        legs.push(...FlightPlanUtils.fromProcedureLegs(this.departure.commonLegs));

        if(this.procedureDetails.departureTransitionIdentifier) {
            const transition = this.departure.enrouteTransitions.find(trans => trans.ident === this.procedureDetails.departureTransitionIdentifier);
            if(transition)
                legs.push(...FlightPlanUtils.fromProcedureLegs(transition.legs))
        }
        this.departureSegment.legs = legs;
        this.departureSegment.transitions = FlightPlanUtils.buildTransitionsFromLegs(this.departureSegment.legs);
    }

    public async buildArrival() {
        if(!this.destinationAirport)
            return;

        const legs: Leg[] = [];
        this.arrival = (await this.database.getArrivals(this.destinationAirport.ident)).find(arrival => arrival.ident === this.procedureDetails.arrivalIdentifier);
        if(!this.arrival)
            return;

        if(this.procedureDetails.arrivalTransitionIdentifier) {
            const transition = this.arrival.enrouteTransitions.find(trans => trans.ident === this.procedureDetails.arrivalTransitionIdentifier);
            if(transition)
                legs.push(...FlightPlanUtils.fromProcedureLegs(transition.legs))
        }

        legs.push(...FlightPlanUtils.fromProcedureLegs(this.arrival.commonLegs));

        if(this.procedureDetails.approachIdentifier) {
            const runwayIdentifier = FlightPlanUtils.getRunwayFromApproachIdent(this.procedureDetails.approachIdentifier);
            if(runwayIdentifier) {
                const transition = this.arrival.runwayTransitions.find(trans => trans.ident === runwayIdentifier);
                if (transition)
                    legs.push(...FlightPlanUtils.fromProcedureLegs(transition.legs));
            }
        }

        this.arrivalSegment.legs = legs;
        this.arrivalSegment.transitions = FlightPlanUtils.buildTransitionsFromLegs(this.arrivalSegment.legs);
    }

    public async buildApproach() {
        if(!this.destinationAirport)
            return;

        const legs: Leg[] = [];
        this.approach = (await this.database.getApproaches(this.destinationAirport.ident)).find(approach => approach.ident === this.procedureDetails.approachIdentifier);
        if(!this.approach)
            return;
        if(this.procedureDetails.approachTransitionIdentifier) {
            const transition = this.approach.transitions.find(trans => trans.ident === this.procedureDetails.approachTransitionIdentifier);
            if(transition)
                legs.push(...FlightPlanUtils.fromProcedureLegs(transition.legs))
        }

        legs.push(...FlightPlanUtils.fromProcedureLegs(this.approach.legs));

        this.approachSegment.legs = legs;
        //Build Arrival At this point so the legs are present in the approach to connect to, and before transitions so the approach can connect to the arrival
        this.buildArrival();
        this.approachSegment.transitions = FlightPlanUtils.buildTransitionsFromLegs(this.approachSegment.legs);

        this.missedSegment.legs = FlightPlanUtils.fromProcedureLegs(this.approach.missedLegs);
        this.missedSegment.transitions = FlightPlanUtils.buildTransitionsFromLegs(this.missedSegment.legs);
    }

    public copy(): FlightPlan {
        //TODO: Make this a deep copy
        return Object.assign(new FlightPlan(this.database), this);
    }

    public static unSerialize(object: SerializedFlightPlan): FlightPlan {
        //TODO: Convert convert flight plan to serialized object
        return undefined as any;
    }

    public serialize(): SerializedFlightPlan {
        //TODO: Convert convert flight plan to serialized object
        return undefined as any;
    }
}
