// Copyright (c) 2022 FlyByWire Simulations
// SPDX-License-Identifier: GPL-3.0

import { Coordinates } from 'msfs-geo';
import { DatabaseItem } from './Common';

export interface Gate extends DatabaseItem {
    /** The airport this gate belongs to */
    airportIcao: string,

    /** location of the parking position at the gate */
    location: Coordinates
}
