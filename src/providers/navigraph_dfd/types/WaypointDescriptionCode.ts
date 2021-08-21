type Column1 =
    | ' '
    /** Airport as Waypoint */
    | 'A'
    /** Essential Waypoint */
    | 'E'
    /** Off Airway Waypoint */
    | 'F'
    /** Runway as Waypoint */
    | 'G'
    /** Heliport as Waypoint */
    | 'H'
    /** NDB Navaid as Waypoint */
    | 'N'
    /** Phantom Waypoint */
    | 'P'
    /** Non-Essential Waypoint */
    | 'R'
    /** Transition Essential Waypoint */
    | 'T'
    /** VHF Navaid as Waypoint */
    | 'V';
type Column2 =
    | ' '
    /** End of SID/STAR/IAP route type */
    | 'B'
    /** End of enRoute Airway or terminal procedure */
    | 'E'
    /** Uncharted Airway Waypoint */
    | 'U'
    /** Fly-Over Waypoint */
    | 'Y';
type Column3 =
    | ' '
    /** Unnamed Step-down Fix After final Approach Fix */
    | 'A'
    /** Unnamed Step-down Fix before Final Approach Fix */
    | 'B'
    /** ATC Compulsory Waypoint */
    | 'C'
    /** Oceanic Gateway Waypoint */
    | 'G'
    /** First leg of Missed Approach Procedure */
    | 'M'
    /** Path Point Fix */
    | 'P'
    /** Named Step-down Fix */
    | 'S';
type Column4 =
    | ' '
    /** Initial Approach Fix */
    | 'A'
    /** Intermediate Approach Fix */
    | 'B'
    /** Initial Approach Fix with Holding */
    | 'C'
    /** Initial Approach with Final Approach Course Fix */
    | 'D'
    /** Final End Point Fix */
    | 'E'
    /** Published Final Approach Fix or Database Final Approach Fix */
    | 'F'
    /** Holding Fix */
    | 'H'
    /** Final Approach Course Fix */
    | 'I'
    /** Published Missed Approach Point Fix */
    | 'M';
export type WaypointDescriptionCode = `${Column1}${Column2}${Column3}${Column4}`;
