import { Airport } from "../../server/providers/navigraph_dfd/types/Airports";
import { SerializedFlightPlan} from "./serialization/SerializedFlightPlan";
import { Leg } from "../common/legs";
import { Transition } from "../common/transitions";

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
type Segment = Map<Transition | undefined, Leg>;

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

    public departureSegment: Segment = new Map<Transition | undefined, Leg>();

    public enRouteSegments: Segment[] = [];

    public arrivalSegment: Segment = new Map<Transition | undefined, Leg>();

    public approachSegment: Segment = new Map<Transition | undefined, Leg>();

    constructor(origin?: Airport) {
        this.originAirport = origin;
    }

    public buildDeparture() {

    }

    public buildArrival() {

    }

    public buildApproach() {

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
