import { SerializedFlightPlan} from "./serialization/SerializedFlightPlan";
import { Leg } from "../common/legs";
import { Transition } from "../common/transitions";
import { Airport } from "../../shared/types/Airport";
import { IFLeg } from "../common/legs/IFLeg";
import { Waypoint } from "../common/Waypoint";
import {DataManager} from "./DataManager";
import {FlightPlanUtils} from "./FlightPlanUtils";

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

    public departureSegment: Segment = { legs: [], transitions: [] };

    public enRouteSegments: Segment[] = [];

    public arrivalSegment: Segment = { legs: [], transitions: [] };

    public approachSegment: Segment = { legs: [], transitions: [] };

    public missedSegment: Segment = { legs: [], transitions: [] };

    constructor(origin?: Airport) {
        this.originAirport = origin;
    }

    public async buildDeparture() {
        if(!this.originAirport)
            return;

        const legs: Leg[] = [];
        const departureDetails = await DataManager.getDeparture(this.procedureDetails.departureIdentifier, this.originAirport.ident);

        if(this.procedureDetails.departureRunwayIdentifier) {
            const runwayIdentifier = this.procedureDetails.departureRunwayIdentifier
            const runway = await DataManager.getRunway(runwayIdentifier, this.originAirport.ident);

            const initialFix = new IFLeg(new Waypoint(
                `${this.originAirport.ident}${runwayIdentifier.substr(2)}`,
                { lat: runway.centreLocation.lat, lon: runway.centreLocation.lon }));
            legs.push(initialFix);

            const transition = departureDetails.runwayTransitions.find(trans => trans.ident === runwayIdentifier);
            if(transition)
                legs.push(...FlightPlanUtils.fromProcedureLegs(transition.legs));
        }

        legs.push(...FlightPlanUtils.fromProcedureLegs(departureDetails.commonLegs));

        if(this.procedureDetails.departureTransitionIdentifier) {
            const transition = departureDetails.enrouteTransitions.find(trans => trans.ident === this.procedureDetails.departureTransitionIdentifier);
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
        const arrivalDetails = await DataManager.getArrival(this.procedureDetails.arrivalIdentifier, this.destinationAirport.ident);

        if(this.procedureDetails.arrivalTransitionIdentifier) {
            const transition = arrivalDetails.enrouteTransitions.find(trans => trans.ident === this.procedureDetails.arrivalTransitionIdentifier);
            if(transition)
                legs.push(...FlightPlanUtils.fromProcedureLegs(transition.legs))
        }

        legs.push(...FlightPlanUtils.fromProcedureLegs(arrivalDetails.commonLegs));

        if(this.procedureDetails.approachIdentifier) {
            const runwayIdentifier = FlightPlanUtils.getRunwayFromApproachIdent(this.procedureDetails.approachIdentifier);
            if(runwayIdentifier) {
                const transition = arrivalDetails.runwayTransitions.find(trans => trans.ident === runwayIdentifier);
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
        const approachDetails = await DataManager.getApproach(this.procedureDetails.approachIdentifier, this.destinationAirport.ident);

        if(this.procedureDetails.approachTransitionIdentifier) {
            const transition = approachDetails.transitions.find(trans => trans.ident === this.procedureDetails.approachTransitionIdentifier);
            if(transition)
                legs.push(...FlightPlanUtils.fromProcedureLegs(transition.legs))
        }

        legs.push(...FlightPlanUtils.fromProcedureLegs(approachDetails.legs));

        this.approachSegment.legs = legs;
        this.approachSegment.transitions = FlightPlanUtils.buildTransitionsFromLegs(this.approachSegment.legs);

        this.missedSegment.legs = FlightPlanUtils.fromProcedureLegs(approachDetails.missedLegs);
        this.missedSegment.transitions = FlightPlanUtils.buildTransitionsFromLegs(this.missedSegment.legs);
    }

    public copy(): FlightPlan {
        //TODO: Make this a deep copy
        return Object.assign(new FlightPlan(), this);
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
