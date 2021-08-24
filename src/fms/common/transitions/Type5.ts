import { Transition } from ".";
import { AFLeg } from "../legs/AFLeg";
import { CFLeg } from "../legs/CFLeg";
import { DFLeg } from "../legs/DFLeg";
import { HALeg, HFLeg, HMLeg } from "../legs/HXLeg";
import { RFLeg } from "../legs/RFLeg";
import { TFLeg } from "../legs/TFLeg";

export type Type5PreviousLeg = AFLeg | CFLeg | DFLeg | RFLeg | TFLeg;
export type Type5NextLeg = HALeg | HFLeg | HMLeg;

/**
 * A Type V transition is used to go into a hippodrome (hold)
 */
export class Type5Transition extends Transition {
    constructor(
        previousLeg: Type5PreviousLeg,
        nextLeg: Type5NextLeg,
    ) {
        super()
    }
}
