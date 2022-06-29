// Copyright (c) 2022 FlyByWire Simulations
// SPDX-License-Identifier: GPL-3.0

import { Coordinates } from 'msfs-geo';

export interface Gate {
    /** The airport this gate belongs to */
    airportIcao: string,

    /** 2-digit ICAO region the airport belongs to */
    icaoCode: string,

    /** identifier name for the gate, up to 5 alpha-numeric chars */
    ident: string,

    /** location of the parking position at the gate */
    location: Coordinates
}
