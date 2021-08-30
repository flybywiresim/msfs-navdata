# MSFS Navdata Client
By FlyByWire & Synaptic Simulations
- - -
The Msfs Navdata Client is a package that normalises the access of navdata in MSFS by loading default navdata and parsing it to a common format.

The client is also capable of loading external data through a local server. This allows developers to build their FMS using a common format which is compatible with multiple different sources.

## Classes
- - - -
# `Database`
The database class is the interface between the FMS and the backend. When Intialising a Database you must parse in a Backend for the database to use.
`Please Note: All functions on the database class are asyncronous`

### `getAirportByIdent(ident: string): Airport`
This will load the first airport found from the current Backend with a given identifier

### `getRunways(airportIdentifier: string, procedure?: Departure | Arrival): Runway[]`
This will load all runways at a given airport, this result can be narrowed down by parsing in a Departure or Arrival procedure in order to return only runways which are compatible with the given procedure.

### `getDepartures(airportIdentifier: string, runwayIdentifier?: string): Departure[]`
This will load all departures at a given airport, this result can be narrowed down by parsing in a runwayIdentifier in order to only return departures which are compatible with the given runway.

### `getArrivals(airportIdentifier: string, approach?: Approach): Arrival[]`
This will load all arrivals at a given airport, this result can be narrowed down by parsing in an Approach in order to only return arrivals compatible with the given Approach

### `getApproaches(airportIdentifier: string, arrival?: Arrival): Approach[]`
This will load all approaches at a given airport, this result can be narrowed down by parsing in an Arrival in order to only return Approaches compatible with the given Arrival

## Types
- - - -
### Location
* lat: `Degrees`
* lon: `Degrees`
* alt?: `Feet`

### RunwaySurfaceType
0. Unknown
1. Hard
2. Soft
3. Water

### Airport
property                 | type                | example                 | description
-------------------------|---------------------|-------------------------| -------
ident                    | `string`            | KDFW                    | 4 Letter identifier of the airport
databaseId               | `string`            | A      KDFW             | Unique database item identifier
icaoCode                 | `string`            | K4                      | ICAO region Code (2 letter)
airportName              | `string`            | DALLAS-FT WORTH INTL    | Public name of the airport
location                 | `Location`          | lat: 33 lon: alt: 606   | Reference location of the airport                       
speedLimit?              | `Knots`             | 250                     | Airspeed limit at airport
speedLimitAltitude?      | `Feet`              | 10000                   | Altitude up until which the speed limit applies
transitionAltitude?      | `Feet`              | 18000                   | Transition Altitude in the airports location
transitionLevel?         | `FlightLevel`       | 180                     | Transition Level in the airports location
longestRunwaySurfaceType | `RunwaySurfaceType` | 1: Hard                 | Surface type of the longest runway at airport


### Airway 
property                | type              | example   | description
------------------------| ------------------|-----------|-----------
ident                   | `string`          | A1        | Identifier of the airway
databaseId              | `string`          | ERJ    A1 | Unique database item identifier
icaoCode                | `string`          | RJ        | Region code of the airway (2 Letter)
level                   | `AirwayLevel`     | 0: All    | Level of the airway (All, High, or Low)
fixes                   | `Waypoint[]`      | [...]     | Array of fixes within the given airway
turnRadius?             | `NauticalMiles`   | undefined | Turn radius of transitions between legs within the given airway
rnp?                    | `NauticalMiles`   | undefined | 
direction               | `AirwayDirection` | 0: Either | Direction through which the airway can be flown(Either, Forward, Backward)
minimumAltitudeForward  | `Feet`            | 8000      | Minimum altitude when flying the airway forward
minimumAltitudeBackward | `Feet`            | null      | Minimum altitude when flying the airway backward
maximumAltitude         | `Feet`            | 99999     | Maximum altitude when flying the airway  

### ProcedureLeg
property            | type                                 | example      | description
--------------------|--------------------------------------|--------------|----------
ident               | `string`                             | LAM          | Leg Identifier
databaseId          | `string`                             | PEGEGLLI27L5 | Unique database identifier of the leg
icaoCode            | `string`                             | EG           | Region code of the leg (2 Letter)
procedureIdent      | `string`                             | I27L         | Identifier of the procedure this leg is part of
type                | `LegType`                            | 10: FD       | The type of leg, Path and Termination
overfly             | `boolean`                            | false        | Is this an overfly waypoint leg
waypoint?           | `Waypoint`                           | {...}        | The reference Waypoint of the leg if the Leg Type requires one
recommendedNavaid   | `VhfNavaid or NdbNavaid or Waypoint` | undefined    | Navaid used as reference for arc or fixed radius turns
rho?                | `NauticalMiles`                      | 0            | Distance from the recommended navaid, to the waypoint
theta?              | `DegreesMagnetic`                    | 0            | Magnetic bearing from the recommended navaid, to the waypoint
arcCentreFix?       | `Waypoint`                           | null         | Defines the arc for RF legs
arcRadius?          | `NauticalMiles`                      | 11           | Defines the radius for RF legs
lenght?             | `NauticalMiles`                      | null         | Defines the radius for RF legs
lengthTime?         | `Minutes`                            | undefined    | length if it is specified in distance, exact meaning depends on the leg type, mutually exclusive with lengthTime
rnp?                | `NauticalMiles`                      | null         | 
transitionAltitude? | `Feet`                               | null         | Transition Altitude in the location of this leg(Only present on IF legs)
altitudeDescriptor  | `AltitudeDescriptor`                 | 1: AtAlt1    | Specifies the meaning of the altitude1 and altitude2 properties
altitude1?          | `Feet`                               | 7000         | altitudeDescriptor property specifies the meaning of this property
altitude2?          | `Feet`                               | null         | altitudeDescriptor property specifies the meaning of this property
speed?              | `Knots`                              | 220          | The exact meaning of this is coded in the speedDescriptor property
speedDescriptor?    | `SpeedDescriptor`                    | 2: Maximum   | Specifies the meaning of the speed property
turnDirection?      | `TurnDirection`                      | 0: Unknown   | 
magneticCourse?     | `DegreesMagnetic`                    | 273          | Heading/Course to be flown during Legs which require a specific heading/course


### ProcedureTransition
property | type             | example | description
---------|------------------|---------|------
ident    | `string`         | LAM     | Identifier of the transition
legs     | `ProcedureLeg[]` | [...]   | Array of legs in the transition


### ApproachType
0. Unknown
1. LocBackcourse
2. VorDme
3. Fms
4. Igs
5. Ils
6. Gls
7. Loc
8. Mls
9. Ndb
10. Gps
11. NdbDme
12. Rnav
13. Vortac
14. Tacan
15. Sdf
16. Vor
17. MlsTypeA
18. Lda
19. MlsTypeBC

### Approach
property    | type                    | example     | description
------------|-------------------------|-------------|-----------
ident       | `string`                | I27L        | Identifier of the Approach
icaoCode    | `string`                | EG          | Region code of the approach (2 Letter)
databaseId  | `string`                | PEGEGLLI27L | Unique database item identifier
type        | `ApproachType`          | 5: ILS      | The type of the Approach
transitions | `ProcedureTransition[]` | [...]       | Array of transitions into the Approach
legs        | `ProcedureLeg[]`        | [...]       | Array of Common legs in the approach
missedLegs  | `procedureLeg[]`        | [...]       | Array of missed approach legs in the approach

### Departure
property           | type                    | example      | description                                                           
-------------------|-------------------------|--------------|----------------------------
ident              | `string`                | BPK7F        | Identifier of the departure                                
databaseId         | `string`                | PEGEGLLBPK7F | Unique databaseId of the departure                         
icaoCode           | `string`                | EG           | region code of the departure (2 Letter)                    
runwayTransitions  | `ProcedureTransition[]` | [...]        | List of runway transitions on the departure                
commonLegs         | `ProcedureLeg[]`        | []           | Legs present on the departure not dependant on transitions 
enrouteTransitions | `ProcedureTransition[]` | []           | List of enroute transitions on the departure
engineOutLegs      | `ProcedureLeg[]`        | []           | List of engine out legs on the departure

### Arrival
property           | type                    | example      | description
-------------------|-------------------------|--------------|----------------------------
ident              | `string`                | LAM1X        | Identifier of the Arrival
databaseId         | `string`                | PEGEGLLLAM1X | Unique databaseId of the Arrival
icaoCode           | `string`                | EG           | region code of the Arrival (2 Letter)
enrouteTransitions | `ProcedureTransition[]` | []           | List of enroute transitions on the Arrival
commonLegs         | `ProcedureLeg[]`        | []           | Legs present on the Arrival not dependant on transitions
runwayTransitions  | `ProcedureTransition[]` | [...]        | List of runway transitions on the Arrival
