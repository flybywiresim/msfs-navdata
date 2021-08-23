import React, { useContext, useEffect, useState } from 'react';
import { useSimVar } from './simvars';
import { FlightPlanManager } from '../../../../fms/flightplanning/FlightPlanManager';
import { FlightPlan } from '../../../../fms/flightplanning/FlightPlan';
import {Database} from "../../../../client/Database";
import {ExternalBackend} from "../../../../client/backends/External";

const FlightPlanContext = React.createContext<{ flightPlanManager: FlightPlanManager, database: Database }>(undefined as any);

export const FlightPlanProvider: React.FC = ({ children }) => {
    const [database] = useState(() => new Database(new ExternalBackend('http://localhost:5000')));
    const [flightPlanManager] = useState(() => new FlightPlanManager(database));

    return (
        <FlightPlanContext.Provider value={{ flightPlanManager, database }}>
            {children}
        </FlightPlanContext.Provider>
    );
};

export const useFlightPlanManager = (): FlightPlanManager => useContext(FlightPlanContext).flightPlanManager;
export const useNavDatabase = (): Database => useContext(FlightPlanContext).database;

export const useFlightPlanVersion = (): number => {
    const [version] = useSimVar(FlightPlanManager.FlightPlanVersionKey, 'number');

    return version;
};
export const useFlightPlans = (): { activeFlightPlan: FlightPlan, modFlightPlan?: FlightPlan } => {
    const flightPlanManager = useFlightPlanManager();

    const flightPlanVersion = useFlightPlanVersion();
    const [activeFlightPlan, setActiveFlightPlan] = useState<FlightPlan>(flightPlanManager.currentFlightPlan);
    const [modFlightPlan, setModFlightPlan] = useState<FlightPlan | undefined>(flightPlanManager.temporaryFlightPlan);

    useEffect(() => {
        console.log('updading flight plans');
        flightPlanManager.loadFlightPlans().then(() => {
            setActiveFlightPlan(flightPlanManager.currentFlightPlan);
            setModFlightPlan(flightPlanManager.temporaryFlightPlan);
        });
    }, [flightPlanVersion]);

    return { activeFlightPlan, modFlightPlan };
};
