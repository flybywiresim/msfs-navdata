import { Coordinates } from 'msfs-geo';
import { Airport } from './Airport';
import { GlsNavaid } from './GlsNavaid';
import { IlsNavaid } from './IlsNavaid';
import { NdbNavaid } from './NdbNavaid';
import { Runway } from './Runway';
import { VhfNavaid } from './VhfNavaid';
import { Waypoint } from './Waypoint';
import { DatabaseItem } from './Common';

export enum FixType {
    Airport = 'A',
    GlsNavaid = 'G',
    IlsNavaid = 'I',
    NdbNavaid = 'N',
    Runway = 'R',
    VhfNavaid = 'V',
    Waypoint = 'W'
}

export enum FixTypeFlags {
    Airport = 1 << 0,
    GlsNavaid = 1 << 1,
    IlsNavaid = 1 << 2,
    NdbNavaid = 1 << 3,
    Runway = 1 << 4,
    VhfNavaid = 1 << 5,
    Waypoint = 1 << 6
}

export type PopulatedFix = Airport | GlsNavaid | IlsNavaid | NdbNavaid | Runway | VhfNavaid | Waypoint;
export type EnrouteFix = NdbNavaid | VhfNavaid | Waypoint;
export type StandaloneFix = EnrouteFix | Airport;
export type Navaid = GlsNavaid | IlsNavaid | NdbNavaid | VhfNavaid;

export interface Fix extends DatabaseItem {
    fixType: FixType;
    location: Coordinates;
    airportIdent?: string;
}
