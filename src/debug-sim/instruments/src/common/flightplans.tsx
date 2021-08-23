import React, { useContext, useEffect, useState } from 'react';
import { useSimVar } from './simvars';
import { FlightPlanManager } from '../../../../fms/flightplanning/FlightPlanManager';
import { FlightPlan } from '../../../../fms/flightplanning/FlightPlan';

const FlightPlanContext = React.createContext<{ flightPlanManager: FlightPlanManager }>(undefined as any);

export const FlightPlanProvider: React.FC = ({ children }) => {
    const [flightPlanManager] = useState(() => new FlightPlanManager());

    return (
        <FlightPlanContext.Provider value={{ flightPlanManager }}>
            {children}
        </FlightPlanContext.Provider>
    );
};

export const useFlightPlanManager = (): FlightPlanManager => useContext(FlightPlanContext).flightPlanManager;

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
        flightPlanManager.loadFlightPlans().then(() => {
            setActiveFlightPlan(flightPlanManager.currentFlightPlan);
            setModFlightPlan(flightPlanManager.temporaryFlightPlan);
        });
    }, [flightPlanVersion]);

    return { activeFlightPlan, modFlightPlan };
};
