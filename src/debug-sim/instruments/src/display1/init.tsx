import React, {useEffect, useState} from 'react';
import './index.css';
import { render } from "../render";
import {
    FlightPlanProvider,
    useCurrentOrTemporaryFlightPlan,
    useFlightPlanManager,
    useFlightPlans,
    useNavDatabase
} from "../common/flightplans";
import {Runway} from "../../../../shared/types/Runway";
import {Departure} from "../../../../shared/types/Departure";
import {ProcedureTransition} from "../../../../shared/types/Common";
import {Approach} from "../../../../shared/types/Approach";
import {Arrival} from "../../../../shared/types/Arrival";

export const Init = () => {
    const fpm = useFlightPlanManager();
    const database = useNavDatabase();
    const [flightPlan] = useCurrentOrTemporaryFlightPlan();

    const [originRunways, setOriginRunways] = useState<Runway[]>();
    const [originDepartures, setOriginDepartures] = useState<Departure[]>();
    const [departureTransitions, setDepartureTransitions] = useState<ProcedureTransition[]>();

    const [arrivalTransitions, setArrivalTransitions] = useState<ProcedureTransition[]>();
    const [arrivals, setArrivals] = useState<Arrival[]>();
    const [approachTransitions, setApproachTransitions] = useState<ProcedureTransition[]>();
    const [approaches, setApproaches] = useState<Approach[]>();

    useEffect(() => {
        if(flightPlan.originAirport) {
            database.getRunways(flightPlan.originAirport.ident).then(r => setOriginRunways(r));
            database.getDepartures(flightPlan.originAirport.ident).then(r => setOriginDepartures(r));
        }
    }, [flightPlan.originAirport]);
    useEffect(() => {
        if(flightPlan.originAirport) {
            setDepartureTransitions(flightPlan.departure?.enrouteTransitions);
        }
    }, [flightPlan.departure]);

    useEffect(() => {
        if(flightPlan.destinationAirport) {
            database.getArrivals(flightPlan.destinationAirport.ident).then(r => setArrivals(r));
            database.getApproaches(flightPlan.destinationAirport.ident).then(r => setApproaches(r));
        }
    }, [flightPlan.destinationAirport]);

    useEffect(() => {
        if(flightPlan.destinationAirport) {
            setArrivalTransitions(flightPlan.arrival?.enrouteTransitions);
        }
    }, [flightPlan.arrival]);

    useEffect(() => {
        if(flightPlan.destinationAirport) {
            setApproachTransitions(flightPlan.approach?.transitions);
        }
    }, [flightPlan.approach]);

    return(
        <div style={{ backgroundColor: "white" }}>
            <h2>Origin: {flightPlan.originAirport?.ident}, Runway: {flightPlan.procedureDetails.departureRunwayIdentifier}, Departure: {flightPlan.procedureDetails.departureIdentifier}, Transition: {flightPlan.procedureDetails.departureTransitionIdentifier} </h2>
            <input onChange={(e) => {
                if(e.target.value.length === 4)
                    fpm.setOrigin(e.target.value);
            }} />
            <select>
                {originRunways?.map(runway => <option onClick={() => fpm.setDepartureRunwayIdentifier(runway.ident)}>{runway.ident}</option>)}
            </select>
            <select>
                {originDepartures?.map(departure => <option onClick={() => fpm.setDepartureIdentifier(departure.ident)}>{departure.ident}</option>)}
            </select>
            <select>
                {departureTransitions?.map(trans => <option onClick={() => fpm.setDepartureTransitionIdentifier(trans.ident)}>{trans.ident}</option>)}
            </select>

            <h2>To: {flightPlan.destinationAirport?.ident}, Transition: {flightPlan.procedureDetails.arrivalTransitionIdentifier}, Arrival: {flightPlan.procedureDetails.arrivalIdentifier}, Transition: {flightPlan.procedureDetails.approachTransitionIdentifier}, Approach: {flightPlan.procedureDetails.approachIdentifier}</h2>
            <input onChange={(e) => {
                if(e.target.value.length === 4)
                    fpm.setDestination(e.target.value);
            }} />

            <select>
                {arrivalTransitions?.map(trans => <option onClick={() => fpm.setArrivalTransitionIdentifier(trans.ident)}>{trans.ident}</option>)}
            </select>
            <select>
                {arrivals?.map(arrivals => <option onClick={() => fpm.setArrivalIdentifier(arrivals.ident)}>{arrivals.ident}</option>)}
            </select>
            <select>
                {approachTransitions?.map(trans => <option onClick={() => fpm.setApproachTransitionIdentifier(trans.ident)}>{trans.ident}</option>)}
            </select>
            <select>
                {approaches?.map(approach => <option onClick={() => fpm.setApproachIdentifier(approach.ident)}>{approach.ident}</option>)}
            </select>

        </div>
    );
}
