import React from "react";
import {useCurrentOrTemporaryFlightPlan} from "../common/flightplans";

export const Fpln = () => {
    const [flightPlan] = useCurrentOrTemporaryFlightPlan();
    return(
        <div>
            {flightPlan.legs.map(leg => <h4>{leg.identifier}</h4>)}
        </div>
    );
}
