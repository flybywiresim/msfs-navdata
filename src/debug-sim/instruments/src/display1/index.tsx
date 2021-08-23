import {render} from "../render";
import {FlightPlanProvider} from "../common/flightplans";
import React, {useState} from "react";
import {Init} from "./init";
import {Fpln} from "./fpln";
import {Search} from "./search";

const DebugDisplay1 = () => {
    const [page, setPage] = useState(0);
    const content = () => {
        switch(page) {
            case(0):
                return <Init/>
            case(1):
                return <Fpln/>
            case(2):
                return <Search/>
        }
    }
    return(
        <div>
            <select>
                <option onClick={() => setPage(0)}>INIT</option>
                <option onClick={() => setPage(1)}>F-PLN</option>
                <option onClick={() => setPage(2)}>SEARCH</option>
            </select>
            {content()}
        </div>
    );
}

render(<FlightPlanProvider><DebugDisplay1/></FlightPlanProvider>)
