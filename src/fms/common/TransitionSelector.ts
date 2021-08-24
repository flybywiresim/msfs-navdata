import { Leg } from "./legs";
import { AFLeg } from "./legs/AFLeg";
import { CALeg } from "./legs/CALeg";
import { CDLeg } from "./legs/CDLeg";
import { CFLeg } from "./legs/CFLeg";
import { CILeg } from "./legs/CILeg";
import { CRLeg } from "./legs/CRLeg";
import { DFLeg } from "./legs/DFLeg";
import { FALeg } from "./legs/FALeg";
import { FMLeg } from "./legs/FMLeg";
import { HALeg, HFLeg, HMLeg } from "./legs/HXLeg";
import { IFLeg } from "./legs/IFLeg";
import { PILeg } from "./legs/PILeg";
import { RFLeg } from "./legs/RFLeg";
import { TFLeg } from "./legs/TFLeg";
import { VALeg } from "./legs/VALeg";
import { VDLeg } from "./legs/VDLeg";
import { VILeg } from "./legs/VILeg";
import { VMLeg } from "./legs/VMLeg";
import { VRLeg } from "./legs/VRLeg";
import { Discontinuity, Transition } from "./transitions";
import { Type1NextLeg, Type1PreviousLeg, Type1Transition } from "./transitions/Type1";
import { Type2NextLeg, Type2PreviousLeg, Type2Transition } from "./transitions/Type2";
import { Type3NextLeg, Type3PreviousLeg, Type3Transition } from "./transitions/Type3";
import { Type4NextLeg, Type4PreviousLeg, Type4Transition } from "./transitions/Type4";
import { Type5NextLeg, Type5PreviousLeg, Type5Transition } from "./transitions/Type5";
import { Type6NextLeg, Type6PreviousLeg, Type6Transition } from "./transitions/Type6";

export class TransitionSelector {
    getTransition(from: Leg, to: Leg): Transition | Discontinuity | null {
        switch (from.constructor) {
        case AFLeg:
            return this.getTransitionFromAF(from, to);
        case CALeg:
            return this.getTransitionFromCA(from, to);
        case CDLeg:
            return this.getTransitionFromCD(from, to);
        case CFLeg:
            return this.getTransitionFromCF(from, to);
        case CILeg:
            return this.getTransitionFromCI(from, to);
        case CRLeg:
            return this.getTransitionFromCR(from, to);
        case DFLeg:
            return this.getTransitionFromDF(from, to);
        case FALeg:
            return this.getTransitionFromFA(from, to);
        case FMLeg:
            return this.getTransitionFromFM(from, to);
        case HALeg:
        case HFLeg:
        case HMLeg:
            return this.getTransitionFromHX(from, to);
        case IFLeg:
            return null;
        case PILeg:
            return this.getTransitionFromPI(from, to);
        case RFLeg:
            return this.getTransitionFromRF(from, to);
        case TFLeg:
            return this.getTransitionFromTF(from, to);
        case VALeg:
            return this.getTransitionFromVA(from, to);
        case VILeg:
            return this.getTransitionFromVI(from, to);
        case VDLeg:
            return this.getTransitionFromVD(from, to);
        case VMLeg:
            return this.getTransitionFromVM(from, to);
        case VRLeg:
            return this.getTransitionFromVR(from, to);
        default:
            throw new Error(`Unknown leg sequence ${from} -> ${to}`);
        }
    }

    getTransitionFromAF(from: Leg, to: Leg): Transition | Discontinuity | null {
        switch (to.constructor) {
            case AFLeg:
            case RFLeg:
                return null;
            case CFLeg:
            case FALeg:
            case FMLeg:
            case TFLeg:
                return new Type6Transition(from as Type6PreviousLeg, to as Type6NextLeg)
            case HALeg:
            case HFLeg:
            case HMLeg:
                return new Type5Transition(from as Type5PreviousLeg, to as Type5NextLeg);
            case CALeg:
            case CDLeg:
            case CILeg:
            case CRLeg:
            case VALeg:
            case VDLeg:
            case VILeg:
            case VMLeg:
            case VRLeg:
                return new Type3Transition(from as Type3PreviousLeg, to as Type4NextLeg);
            case IFLeg:
                return new Discontinuity();
            default:
                throw new Error(`Unknown leg sequence ${from} -> ${to}`);
        }
    }

    getTransitionFromCA(from: Leg, to: Leg): Transition | Discontinuity | null {
        switch (to.constructor) {
        case DFLeg:
            if (Math.abs(Avionics.Utils.diffAngle(from.bearing, to.bearing)) < 3) {
                return null;
            }
            // TODO can't just pass true here
            return new Type4Transition(from as Type4PreviousLeg, to as Type4NextLeg, true);
        case CALeg:
        case CDLeg:
        case CILeg:
        case CRLeg:
        case VALeg:
        case VDLeg:
        case VILeg:
        case VMLeg:
        case VRLeg:
            return new Type3Transition(from as Type3PreviousLeg, to as Type3NextLeg);
        case CFLeg:
        case FALeg:
        case FMLeg:
            return new Type2Transition(from, to, turnDirection);
        case IFLeg:
            return new Discontinuity();
        default:
            throw new Error(`Unknown leg sequence ${from} -> ${to}`);
        }
    }

    getTransitionFromCD(from: Leg, to: Leg): Transition | Discontinuity | null {
        switch (to.constructor) {
        case AFLeg:
            return new Type6Transition(from as Type6PreviousLeg, to as Type6NextLeg);
        case DFLeg:
            if (Math.abs(Avionics.Utils.diffAngle(from.bearing, to.bearing)) < 3) {
                return null;
            }
            // TODO can't just pass true here
            return new Type4Transition(from as Type4PreviousLeg, to as Type4NextLeg, true);
        case CALeg:
        case CDLeg:
        case CILeg:
        case CRLeg:
        case VALeg:
        case VDLeg:
        case VILeg:
        case VMLeg:
        case VRLeg:
            return new Type3Transition(from as Type3PreviousLeg, to as Type3NextLeg);
        case CFLeg:
        case FALeg:
        case FMLeg:
            return new Type2Transition(from, to, turnDirection);
        case IFLeg:
            return new Discontinuity();
        default:
            throw new Error(`Unknown leg sequence ${from} -> ${to}`);
        }
    }

    getTransitionFromCF(from: Leg, to: Leg): Transition | Discontinuity | null {
        switch (to.constructor) {
        case AFLeg:
        case RFLeg:
            return new Type6Transition(from as Type6PreviousLeg, to as Type6NextLeg);
        case HALeg:
        case HFLeg:
        case HMLeg:
            return new Type5Transition(from as Type5PreviousLeg, to as Type5NextLeg);
        case DFLeg:
            if (Math.abs(Avionics.Utils.diffAngle(from.bearing, to.bearing)) < 3) {
                return null;
            }
            // TODO can't just pass true here
            return new Type4Transition(from as Type4PreviousLeg, to as Type4NextLeg, true);
        case CALeg:
        case CDLeg:
        case CILeg:
        case CRLeg:
        case VALeg:
        case VDLeg:
        case VILeg:
        case VMLeg:
        case VRLeg:
            return new Type3Transition(from as Type3PreviousLeg, to as Type3NextLeg);
        case CFLeg:
        case FALeg:
        case FMLeg:
        case PILeg:
        case TFLeg:
            return new Type1Transition(from as Type1PreviousLeg, to as Type1NextLeg);
        case IFLeg:
            return new Discontinuity();
        default:
            throw new Error(`Unknown leg sequence ${from} -> ${to}`);
        }
    }

    getTransitionFromCI(from: Leg, to: Leg): Transition | Discontinuity | null {
        switch (to.constructor) {
        case AFLeg:
            return new Type6Transition(from as Type6PreviousLeg, to as Type6NextLeg);
        case CFLeg:
        case FALeg:
        case FMLeg:
            if (Math.abs(Avionics.Utils.diffAngle(from.bearing, to.bearing)) < 3) {
                return null;
            }
            // TODO can't just pass true here
            return new Type4Transition(from as Type4PreviousLeg, to as Type4NextLeg, true);
        default:
            throw new Error(`Unknown leg sequence ${from} -> ${to}`);
        }
    }

    getTransitionFromCR(from: Leg, to: Leg): Transition | Discontinuity | null {
        switch (to.constructor) {
        case DFLeg:
            if (Math.abs(Avionics.Utils.diffAngle(from.bearing, to.bearing)) < 3) {
                return null;
            }
            // TODO can't just pass true here
            return new Type4Transition(from as Type4PreviousLeg, to as Type4NextLeg, true);
        case CALeg:
        case CDLeg:
        case CILeg:
        case CRLeg:
        case VALeg:
        case VDLeg:
        case VILeg:
        case VMLeg:
        case VRLeg:
            return new Type3Transition(from as Type3PreviousLeg, to as Type3NextLeg);
        case CFLeg:
        case FALeg:
        case FMLeg:
            return new Type2Transition(from, to, turnDirection);
        case IFLeg:
            return new Discontinuity();
        default:
            throw new Error(`Unknown leg sequence ${from} -> ${to}`);
        }
    }

    getTransitionFromDF(from: Leg, to: Leg): Transition | Discontinuity | null {
        switch (to.constructor) {
        case RFLeg:
            return null;
        case AFLeg:
            return new Type6Transition(from as Type6PreviousLeg, to as Type6NextLeg);
        case HALeg:
        case HFLeg:
        case HMLeg:
            return new Type5Transition(from as Type5PreviousLeg, to as Type5NextLeg);
        case DFLeg:
            if (Math.abs(Avionics.Utils.diffAngle(from.bearing, to.bearing)) < 3) {
                return null;
            }
            // TODO can't just pass true here
            return new Type4Transition(from as Type4PreviousLeg, to as Type4NextLeg, true);
        case CALeg:
        case CDLeg:
        case CILeg:
        case CRLeg:
        case VALeg:
        case VDLeg:
        case VILeg:
        case VMLeg:
        case VRLeg:
            return new Type3Transition(from as Type3PreviousLeg, to as Type3NextLeg);
        case CFLeg:
        case FALeg:
        case FMLeg:
        case PILeg:
        case TFLeg:
            return new Type1Transition(from as Type1PreviousLeg, to as Type1NextLeg);
        case IFLeg:
            return new Discontinuity();
        default:
            throw new Error(`Unknown leg sequence ${from} -> ${to}`);
        }
    }

    getTransitionFromFA(from: Leg, to: Leg): Transition | Discontinuity | null {
        switch (to.constructor) {
        case DFLeg:
            if (Math.abs(Avionics.Utils.diffAngle(from.bearing, to.bearing)) < 3) {
                return null;
            }
            // TODO can't just pass true here
            return new Type4Transition(from as Type4PreviousLeg, to as Type4NextLeg, true);
        case CALeg:
        case CDLeg:
        case CILeg:
        case CRLeg:
        case VALeg:
        case VDLeg:
        case VILeg:
        case VMLeg:
        case VRLeg:
            return new Type3Transition(from as Type3PreviousLeg, to as Type3NextLeg);
        case CFLeg:
        case FALeg:
        case FMLeg:
            return new Type1Transition(from as Type1PreviousLeg, to as Type1NextLeg);
        case IFLeg:
            return new Discontinuity();
        default:
            throw new Error(`Unknown leg sequence ${from} -> ${to}`);
        }
    }

    getTransitionFromFM(from: Leg, to: Leg): Transition | Discontinuity | null {
        switch (to.constructor) {
        case CFLeg:
        case FALeg:
        case FMLeg:
            return null;
        case DFLeg:
            if (Math.abs(Avionics.Utils.diffAngle(from.bearing, to.bearing)) < 3) {
                return null;
            }
            // TODO can't just pass true here
            return new Type4Transition(from as Type4PreviousLeg, to as Type4NextLeg, true);
        case CALeg:
        case CDLeg:
        case CILeg:
        case CRLeg:
        case VALeg:
        case VDLeg:
        case VILeg:
        case VMLeg:
        case VRLeg:
            return new Type3Transition(from as Type3PreviousLeg, to as Type3NextLeg);
        case IFLeg:
            return new Discontinuity();
        default:
            throw new Error(`Unknown leg sequence ${from} -> ${to}`);
        }
    }

    getTransitionFromHX(from: Leg, to: Leg): Transition | Discontinuity | null {
        switch (to.constructor) {
        case RFLeg:
            return null;
        case DFLeg:
            if (Math.abs(Avionics.Utils.diffAngle(from.bearing, to.bearing)) < 3) {
                return null;
            }
            // TODO can't just pass true here
            return new Type4Transition(from as Type4PreviousLeg, to as Type4NextLeg, true);
        case CALeg:
        case CDLeg:
        case CILeg:
        case CRLeg:
        case VALeg:
        case VDLeg:
        case VILeg:
        case VMLeg:
        case VRLeg:
            return new Type3Transition(from as Type3PreviousLeg, to as Type3NextLeg);
        case AFLeg:
        case CFLeg:
        case FALeg:
        case FMLeg:
        case TFLeg:
            return new Type2Transition(from as Type2PreviousLeg, to as Type2NextLeg);
        case IFLeg:
            return new Discontinuity();
        default:
            throw new Error(`Unknown leg sequence ${from} -> ${to}`);
        }
    }

    getTransitionFromPI(from: Leg, to: Leg): Transition | Discontinuity | null {
        switch (to.constructor) {
        case CFLeg:
            return null;
        default:
            throw new Error(`Unknown leg sequence ${from} -> ${to}`);
        }
    }

    getTransitionFromRF(from: Leg, to: Leg): Transition | Discontinuity | null {
        switch (to.constructor) {
        case AFLeg:
        case CFLeg:
        case RFLeg:
        case TFLeg:
            // no transition (i.e. not needed)
            return null;
        case HALeg:
        case HFLeg:
        case HMLeg:
            return new Type5Transition(from as Type5PreviousLeg, to as Type5NextLeg);
        case DFLeg:
            if (Math.abs(Avionics.Utils.diffAngle(from.bearing, to.bearing)) < 3) {
                return null;
            }
            // TODO can't just pass true here
            return new Type4Transition(from as Type4PreviousLeg, to as Type4NextLeg, true);
        case CALeg:
        case CDLeg:
        case CILeg:
        case CRLeg:
            return new Type3Transition(from as Type3PreviousLeg, to as Type3NextLeg);
        case FALeg:
        case FMLeg:
            return new Type2Transition(from, to, turnDirection);
        case IFLeg:
            return new Discontinuity();
        default:
            throw new Error(`Unknown leg sequence ${from} -> ${to}`);
        }
    }

    getTransitionFromTF(from: Leg, to: Leg): Transition | Discontinuity | null {
        switch (to.constructor) {
        case RFLeg:
            // no transition (i.e. not needed)
            return null;
        case AFLeg:
            return new Type6Transition(from as Type6PreviousLeg, to as Type6NextLeg);
        case HALeg:
        case HFLeg:
        case HMLeg:
            return new Type5Transition(from as Type5PreviousLeg, to as Type5NextLeg);
        case DFLeg:
            if (Math.abs(Avionics.Utils.diffAngle(from.bearing, to.bearing)) < 3) {
                return null;
            }
            // TODO can't just pass true here
            return new Type4Transition(from as Type4PreviousLeg, to as Type4NextLeg, true);
        case CALeg:
        case CDLeg:
        case CILeg:
        case CRLeg:
        case VALeg:
        case VDLeg:
        case VILeg:
        case VMLeg:
        case VRLeg:
            return new Type3Transition(from as Type3PreviousLeg, to as Type3NextLeg);
        case CFLeg:
        case FALeg:
        case FMLeg:
        case PILeg:
        case TFLeg:
            return new Type1Transition(from as Type1PreviousLeg, to as Type1NextLeg);
        case IFLeg:
            return new Discontinuity();
        default:
            throw new Error(`Unknown leg sequence ${from} -> ${to}`);
        }
    }

    getTransitionFromVA(from: Leg, to: Leg): Transition | Discontinuity | null {
        switch (from.constructor) {
        case DFLeg:
            if (Math.abs(Avionics.Utils.diffAngle(from.bearing, to.bearing)) < 3) {
                return null;
            }
            // TODO can't just pass true here
            return new Type4Transition(from as Type4PreviousLeg, to as Type4NextLeg, true);
        case CALeg:
        case CDLeg:
        case CILeg:
        case CRLeg:
        case VALeg:
        case VDLeg:
        case VILeg:
        case VMLeg:
        case VRLeg:
            return new Type3Transition(from as Type3PreviousLeg, to as Type3NextLeg);
        case CFLeg:
        case FALeg:
        case FMLeg:
            return new Type2Transition(from as Type2PreviousLeg, to as Type2NextLeg);
        case IFLeg:
            return new Discontinuity();
        default:
            throw new Error(`Unknown leg sequence ${from} -> ${to}`);
        }
    }

    getTransitionFromVI(from: Leg, to: Leg): Transition | Discontinuity | null {
        switch (from.constructor) {
        case AFLeg:
            return new Type6Transition(from as Type6PreviousLeg, to as Type6NextLeg);
        case CFLeg:
        case FALeg:
        case FMLeg:
            return new Type4Transition(from as Type4PreviousLeg, to as Type4NextLeg, true);
        default:
            throw new Error(`Unknown leg sequence ${from} -> ${to}`);
        }
    }

    getTransitionFromVD(from: Leg, to: Leg): Transition | Discontinuity | null {
        switch (from.constructor) {
        case AFLeg:
            return new Type6Transition(from as Type6PreviousLeg, to as Type6NextLeg);
        case DFLeg:
            if (Math.abs(Avionics.Utils.diffAngle(from.bearing, to.bearing)) < 3) {
                return null;
            }
            // TODO can't just pass true here
            return new Type4Transition(from as Type4PreviousLeg, to as Type4NextLeg, true);
        case CALeg:
        case CDLeg:
        case CILeg:
        case CRLeg:
        case VALeg:
        case VDLeg:
        case VILeg:
        case VMLeg:
        case VRLeg:
            return new Type3Transition(from as Type3PreviousLeg, to as Type3NextLeg);
        case CFLeg:
        case FALeg:
        case FMLeg:
            return new Type2Transition(from as Type2PreviousLeg, to as Type2NextLeg);
        case IFLeg:
            return new Discontinuity();
        default:
            throw new Error(`Unknown leg sequence ${from} -> ${to}`);
        }
    }

    getTransitionFromVM(from: Leg, to: Leg): Transition | Discontinuity | null {
        switch (from.constructor) {
        case CFLeg:
        case FALeg:
        case FMLeg:
            return null;
        case DFLeg:
            if (Math.abs(Avionics.Utils.diffAngle(from.bearing, to.bearing)) < 3) {
                return null;
            }
            // TODO can't just pass true here
            return new Type4Transition(from as Type4PreviousLeg, to as Type4NextLeg, true);
        case CALeg:
        case CDLeg:
        case CILeg:
        case CRLeg:
        case VALeg:
        case VDLeg:
        case VILeg:
        case VMLeg:
        case VRLeg:
            return new Type3Transition(from as Type3PreviousLeg, to as Type3NextLeg);
        case IFLeg:
            return new Discontinuity();
        default:
            throw new Error(`Unknown leg sequence ${from} -> ${to}`);
        }
    }

    getTransitionFromVR(from: Leg, to: Leg): Transition | Discontinuity | null {
        switch (from.constructor) {
        case DFLeg:
            if (Math.abs(Avionics.Utils.diffAngle(from.bearing, to.bearing)) < 3) {
                return null;
            }
            // TODO can't just pass true here
            return new Type4Transition(from as Type4PreviousLeg, to as Type4NextLeg, true);
        case CALeg:
        case CDLeg:
        case CILeg:
        case CRLeg:
        case VALeg:
        case VDLeg:
        case VILeg:
        case VMLeg:
        case VRLeg:
            return new Type3Transition(from as Type3PreviousLeg, to as Type3NextLeg);
        case CFLeg:
        case FALeg:
        case FMLeg:
            return new Type2Transition(from as Type2PreviousLeg, to as Type2NextLeg);
        case IFLeg:
            return new Discontinuity();
        default:
            throw new Error(`Unknown leg sequence ${from} -> ${to}`);
        }
    }
}
