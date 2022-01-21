import { Coordinates, DegreesTrue, NauticalMiles } from 'msfs-geo';

export enum ControlledAirspaceType {
    ClassC,
    ControlArea,
    TmaOrTca,
    IcaoTerminalControlArea,
    MilitaryControlZone,
    RadarZone,
    ClassB,
    TerminalControlArea,
    TerminalArea,
    TerminalRadarServiceArea,
    ClassD,
}

export enum RestrictiveAirspaceType {
    Unknown,
    Alert,
    Caution,
    Danger,
    Military,
    Prohibited,
    Restricted,
    Training,
    Warning,
}

export enum PathType {
    Circle,
    GreatCircle,
    RhumbLine,
    CounterClockwiseArc,
    ClockwiseArc,
}

export interface BoundaryPath {
    sequenceNumber: number;
    pathType: PathType;
    location?: Coordinates;
    arc?: {
        origin: Coordinates;
        distance: NauticalMiles;
        bearing?: DegreesTrue;
    };
}

export interface ControlledAirspace {
    icaoCode: string,
    center: string;
    name: string;
    type: ControlledAirspaceType;
    classification: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
    level: Level;
    boundaryPaths: BoundaryPath[];
}

export interface RestrictiveAirspace {
    icaoCode: string,
    designation: string;
    name: string;
    type: RestrictiveAirspaceType;
    level: Level;
    boundaryPaths: BoundaryPath[];
}
