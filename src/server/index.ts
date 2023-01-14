import express, { Router } from 'express';
import { Coordinates } from 'msfs-geo';
import { NavigraphProvider } from './providers/navigraph_dfd/dfd';
import { DatabaseIdent } from '../shared/types/DatabaseIdent';
import { Airport } from '../shared/types/Airport';
import { Runway } from '../shared/types/Runway';
import { Waypoint } from '../shared/types/Waypoint';
import { ControlledAirspace } from '../shared/types/Airspace';
import { NdbNavaid, NdbClass } from '../shared/types/NdbNavaid';
import { Airway, AirwayLevel } from '../shared/types/Airway';
import { IlsNavaid, RestrictiveAirspace, VhfNavaid, VhfNavaidType, VorClass } from '../shared';

// utility functions to parse user input

class InputError extends Error {
    get json(): Record<string, string> {
        return {
            error: this.message,
        };
    }
}

function errorResponse(error: any, res: any, development: boolean = false) {
    if (error instanceof InputError) {
        if (development) {
            console.warn(error);
        }
        return res.status(400).json(error.json);
    }
    console.error(error);
    return res.status(500).json({ error: (development && error instanceof Error) ? error.message : 'Internal server error' });
}

function parseFlagOptionList(input: string, options: Record<string, number>): number {
    return input.toLowerCase().split(',').reduce((flags, val) => {
        if (options[val] === undefined) {
            throw new Error();
        }
        return flags | options[val];
    }, 0);
}

function parsePpos(ppos: string): Coordinates {
    if (!ppos.match(/^-?[0-9]+(\.[0-9]+)?,-?[0-9]+(\.[0-9]+)?$/)) {
        throw new InputError(`Invalid ppos "${ppos}"`);
    }
    const [lat, long] = ppos.split(',').map((v) => parseFloat(v));
    return { lat, long };
}

function parseRange(range: string): number {
    if (!range.match(/^[0-9]{1,3}$/)) {
        throw new InputError(`Invalid range "${range}"`);
    }
    return parseInt(range);
}

function parseLimit(limit: string): number {
    if (!limit.match(/^[0-9]+$/)) {
        throw new InputError(`Invalid limit "${limit}"`);
    }
    return parseInt(limit);
}

function parseAirportIdent(ident: string): string {
    if (!ident.match(/^[A-Za-z0-9]{4}/)) {
        throw new InputError(`Invalid airport ident "${ident}"`);
    }
    return ident.toUpperCase();
}

function parseRunwayIdent(ident: string): string {
    if (!ident.match(/^[Rr][Ww][0-9]{2}[LCRTlcrt]?$/)) {
        throw new InputError(`Invalid runway ident "${ident}""`);
    }
    return ident.toUpperCase();
}

function parseFixIdent(ident: string): string {
    if (!ident.match(/^[A-Za-z0-9]{1,5}/)) { // TODO min length?
        throw new InputError(`Invalid fix ident "${ident}"`);
    }
    return ident.toUpperCase();
}

function parseVorNdbIdent(ident: string): string {
    if (!ident.match(/^[A-Za-z0-9]{1,4}/)) {
        throw new InputError(`Invalid navaid ident "${ident}"`);
    }
    return ident.toUpperCase();
}

function parseVhfNavaidTypes(types: string): VhfNavaidType {
    try {
        return parseFlagOptionList(types, {
            unknown: VhfNavaidType.Unknown,
            vor: VhfNavaidType.Vor,
            vordme: VhfNavaidType.VorDme,
            dme: VhfNavaidType.Dme,
            tacan: VhfNavaidType.Tacan,
            vortac: VhfNavaidType.Vortac,
            vot: VhfNavaidType.Vot,
            ilsdme: VhfNavaidType.IlsDme,
            ilstacan: VhfNavaidType.Tacan,
        });
    } catch (e) {
        throw new InputError(`Invalid VHF navaid types "${types}"`);
    }
}

function parseVorClasses(classes: string): VorClass {
    try {
        return parseFlagOptionList(classes, {
            unknown: VorClass.Unknown,
            terminal: VorClass.Terminal,
            low: VorClass.LowAlt,
            high: VorClass.HighAlt,
        });
    } catch (e) {
        throw new InputError(`Invalid VOR classes "${classes}"`);
    }
}

function parseNdbClasses(classes: string): NdbClass {
    try {
        return parseFlagOptionList(classes, {
            unknown: NdbClass.Unknown,
            low: NdbClass.Low,
            medium: NdbClass.Medium,
            normal: NdbClass.Normal,
            high: NdbClass.High,
        });
    } catch (e) {
        throw new InputError(`Invalid NDB classes "${classes}"`);
    }
}

function parseAirwayIdent(ident: string): string {
    if (!ident.match(/^[A-Za-z0-9]{1,5}/)) { // TODO min length?
        throw new InputError(`Invalid airway ident "${ident}"`);
    }
    return ident.toUpperCase();
}

function parseAirwayLevels(levels: string): AirwayLevel {
    try {
        return parseFlagOptionList(levels, {
            both: AirwayLevel.Both,
            low: AirwayLevel.Low,
            high: AirwayLevel.High,
            all: AirwayLevel.Both | AirwayLevel.Low | AirwayLevel.High,
        });
    } catch (e) {
        throw new InputError(`Invalid airway levels "${levels}"`);
    }
}

function parseIcaoCode(icao: string): string {
    if (!icao.match(/^[A-Za-z0-9]{2}$/)) {
        throw new InputError(`Invalid ICAO code "${icao}"`);
    }
    return icao.toUpperCase();
}

function parseMultipleIdents(idents: string, parser: (ident: string) => string, minimum = 1) {
    const ret = idents.split(',').map((val) => parser(val));
    if (ret.length < minimum) {
        throw new InputError(`At least ${minimum} idents required, ${ret.length} given`);
    }
    return ret;
}

export function msfsNavdataRouter(provider: NavigraphProvider, development: boolean = false): Router {
    const router: Router = express.Router();

    router.get('/', (req, res) => {
        try {
            provider.getDatabaseIdent().then((databaseIdent: DatabaseIdent) => {
                res.json(databaseIdent);
            }).catch((error) => errorResponse(error, res));
        } catch (error) {
            errorResponse(error, res);
        }
    });

    router.get('/airports/:idents', (req, res) => {
        try {
            const idents = parseMultipleIdents(req.params.idents, parseAirportIdent);
            provider.getAirports(idents).then((airports: Airport[]) => {
                res.json(airports);
            }).catch((error) => errorResponse(error, res));
        } catch (error) {
            errorResponse(error, res);
        }
    });

    router.get('/nearby/airports/:ppos/:range', (req, res) => {
        try {
            const location = parsePpos(req.params.ppos);
            const range = parseRange(req.params.range);
            const limit = (req.query.limit && typeof req.query.limit === 'string') ? parseLimit(req.query.limit) : undefined;
            provider.getNearbyAirports(location, range, limit).then((airports: Airport[]) => {
                res.json(airports);
            }).catch((error) => errorResponse(error, res));
        } catch (error) {
            errorResponse(error, res);
        }
    });

    router.get('/nearby/airways/:ppos/:range', (req, res) => {
        try {
            const location = parsePpos(req.params.ppos);
            const range = parseRange(req.params.range);
            const limit = (req.query.limit && typeof req.query.limit === 'string') ? parseLimit(req.query.limit) : undefined;
            const levels = (req.query.levels && typeof req.query.levels === 'string') ? parseAirwayLevels(req.query.levels) : undefined;
            provider.getNearbyAirways(location, range, limit, levels).then((airways: Airway[]) => {
                res.json(airways);
            }).catch((error) => errorResponse(error, res));
        } catch (error) {
            errorResponse(error, res);
        }
    });

    router.get('/nearby/vhfnavaids/:ppos/:range', (req, res) => {
        try {
            const location = parsePpos(req.params.ppos);
            const range = parseRange(req.params.range);
            const limit = (req.query.limit && typeof req.query.limit === 'string') ? parseLimit(req.query.limit) : undefined;
            const types = (req.query.types && typeof req.query.types === 'string') ? parseVhfNavaidTypes(req.query.types) : undefined;
            const classes = (req.query.classes && typeof req.query.classes === 'string') ? parseVorClasses(req.query.classes) : undefined;
            provider.getNearbyVhfNavaids(location, range, classes, limit, types).then((navaids: VhfNavaid[]) => {
                res.json(navaids);
            }).catch((error) => errorResponse(error, res));
        } catch (error) {
            errorResponse(error, res);
        }
    });

    router.get('/nearby/ndbnavaids/:ppos/:range', (req, res) => {
        try {
            const location = parsePpos(req.params.ppos);
            const range = parseRange(req.params.range);
            const limit = (req.query.limit && typeof req.query.limit === 'string') ? parseLimit(req.query.limit) : undefined;
            const classes = (req.query.classes && typeof req.query.classes === 'string') ? parseNdbClasses(req.query.classes) : undefined;
            // TODO area? (terminal or enroute)
            provider.getNearbyNdbNavaids(location, range, limit, classes).then((navaids: NdbNavaid[]) => {
                res.json(navaids);
            }).catch((error) => errorResponse(error, res));
        } catch (error) {
            errorResponse(error, res);
        }
    });

    router.get('/nearby/waypoints/:ppos/:range', (req, res) => {
        try {
            const location = parsePpos(req.params.ppos);
            const range = parseRange(req.params.range);
            const limit = (req.query.limit && typeof req.query.limit === 'string') ? parseLimit(req.query.limit) : undefined;
            // TODO area? (terminal or enroute)
            provider.getNearbyWaypoints(location, range, limit).then((waypoints: Waypoint[]) => {
                res.json(waypoints);
            }).catch((error) => errorResponse(error, res));
        } catch (error) {
            errorResponse(error, res);
        }
    });

    router.get('/nearby/fixes/:ppos/:range', async (req, res) => {
        try {
            const location = parsePpos(req.params.ppos);
            const range = parseRange(req.params.range);
            const limit = (req.query.limit && typeof req.query.limit === 'string') ? parseLimit(req.query.limit) : undefined;
            // TODO area? (terminal or enroute)

            Promise.all([
                provider.getNearbyVhfNavaids(location, range, limit),
                provider.getNearbyNdbNavaids(location, range, limit),
                provider.getNearbyWaypoints(location, range, limit),
            ]).then((results) => {
                res.json([...results[0], ...results[1], ...results[2]]);
            }).catch((error) => errorResponse(error, res));
        } catch (error) {
            errorResponse(error, res);
        }
    });

    router.get('/nearby/airspaces/controlled/:ppos/:range', (req, res) => {
        try {
            const location = parsePpos(req.params.ppos);
            const range = parseRange(req.params.range);
            provider.getControlledAirspaceInRange(location, range).then((airspaces: ControlledAirspace[]) => {
                res.json(airspaces);
            }).catch((error) => errorResponse(error, res));
        } catch (error) {
            errorResponse(error, res);
        }
    });

    router.get('/nearby/airspaces/restrictive/:ppos/:range', (req, res) => {
        try {
            const location = parsePpos(req.params.ppos);
            const range = parseRange(req.params.range);
            provider.getRestrictiveAirspaceInRange(location, range).then((airspaces: RestrictiveAirspace[]) => {
                res.json(airspaces);
            }).catch((error) => errorResponse(error, res));
        } catch (error) {
            errorResponse(error, res);
        }
    });

    router.get('/airport/:ident/runways', (req, res) => {
        try {
            const ident = parseAirportIdent(req.params.ident);
            provider.getRunways(ident).then((runways: Runway[]) => {
                res.json(runways);
            }).catch((error) => errorResponse(error, res));
        } catch (error) {
            errorResponse(error, res);
        }
    });

    // TODO is this a good API (should be able to cover it with a param on general /waypoints endpoint)
    router.get('/airport/:ident/waypoints', (req, res) => {
        try {
            const ident = parseAirportIdent(req.params.ident);
            provider.getWaypointsAtAirport(ident).then((waypoints: Waypoint[]) => {
                res.json(waypoints);
            }).catch((error) => errorResponse(error, res));
        } catch (error) {
            errorResponse(error, res);
        }
    });

    // TODO is this a good API (should be able to cover it with a param on general /ndbnavaids endpoint)
    router.get('/airport/:ident/ndbs', (req, res) => {
        try {
            const ident = parseAirportIdent(req.params.ident);
            provider.getNdbsAtAirport(ident).then((ndbs: NdbNavaid[]) => {
                res.json(ndbs);
            }).catch((error) => errorResponse(error, res));
        } catch (error) {
            errorResponse(error, res);
        }
    });

    router.get('/airport/:ident/ils', (req, res) => {
        try {
            const ident = parseAirportIdent(req.params.ident);
            provider.getIlsAtAirport(ident).then((ils: IlsNavaid[]) => {
                res.json(ils);
            }).catch((error) => errorResponse(error, res));
        } catch (error) {
            errorResponse(error, res);
        }
    });

    router.get('/vhfnavaids/:idents', (req, res) => {
        try {
            const idents = parseMultipleIdents(req.params.idents, parseVorNdbIdent);
            const icaoCode = (req.query.icaoCode && typeof req.query.icaoCode === 'string') ? parseIcaoCode(req.query.icaoCode) : undefined;
            const airport = (req.query.airport && typeof req.query.airport === 'string') ? parseAirportIdent(req.query.airport) : undefined;
            const ppos = (req.query.ppos && typeof req.query.ppos === 'string') ? parsePpos(req.query.ppos) : undefined;

            provider.getVhfNavaids(idents, ppos, icaoCode, airport).then((navaids: VhfNavaid[]) => {
                res.json(navaids);
            }).catch((error) => errorResponse(error, res));
        } catch (error) {
            errorResponse(error, res);
        }
    });

    router.get('/ndbnavaids/:idents', (req, res) => {
        try {
            const idents = parseMultipleIdents(req.params.idents, parseVorNdbIdent);
            const icaoCode = (req.query.icaoCode && typeof req.query.icaoCode === 'string') ? parseIcaoCode(req.query.icaoCode) : undefined;
            const airport = (req.query.airport && typeof req.query.airport === 'string') ? parseAirportIdent(req.query.airport) : undefined;
            const ppos = (req.query.ppos && typeof req.query.ppos === 'string') ? parsePpos(req.query.ppos) : undefined;

            provider.getNdbNavaids(idents, ppos, icaoCode, airport).then((navaids: NdbNavaid[]) => {
                res.json(navaids);
            }).catch((error) => errorResponse(error, res));
        } catch (error) {
            errorResponse(error, res);
        }
    });

    router.get('/waypoints/:idents', (req, res) => {
        try {
            const idents = parseMultipleIdents(req.params.idents, parseFixIdent);
            const icaoCode = (req.query.icaoCode && typeof req.query.icaoCode === 'string') ? parseIcaoCode(req.query.icaoCode) : undefined;
            const airport = (req.query.airport && typeof req.query.airport === 'string') ? parseAirportIdent(req.query.airport) : undefined;
            const ppos = (req.query.ppos && typeof req.query.ppos === 'string') ? parsePpos(req.query.ppos) : undefined;

            provider.getWaypoints(idents, ppos, icaoCode, airport).then((navaids: Waypoint[]) => {
                res.json(navaids);
            }).catch((error) => errorResponse(error, res));
        } catch (error) {
            errorResponse(error, res);
        }
    });

    router.get('/fixes/:idents', (req, res) => {
        try {
            const idents = parseMultipleIdents(req.params.idents, parseFixIdent);
            const icaoCode = (req.query.icaoCode && typeof req.query.icaoCode === 'string') ? parseIcaoCode(req.query.icaoCode) : undefined;
            const airport = (req.query.airport && typeof req.query.airport === 'string') ? parseAirportIdent(req.query.airport) : undefined;
            const ppos = (req.query.ppos && typeof req.query.ppos === 'string') ? parsePpos(req.query.ppos) : undefined;

            Promise.all([
                provider.getVhfNavaids(idents, ppos, icaoCode, airport),
                provider.getNdbNavaids(idents, ppos, icaoCode, airport),
                provider.getWaypoints(idents, ppos, icaoCode, airport),
            ]).then((results) => {
                res.json([...results[0], ...results[1], ...results[2]]);
            }).catch((error) => errorResponse(error, res));
        } catch (error) {
            errorResponse(error, res);
        }
    });

    // FIXME, icao should be first since it has larger significance/scope
    // FIXME can has multiple idents like other endpoints?
    router.get('/fix/:ident/:icaoCode/airways', (req, res) => {
        try {
            const icaoCode = parseIcaoCode(req.params.icaoCode);
            const ident = parseFixIdent(req.params.ident);
            provider.getAirwaysByFix(ident, icaoCode).then((airways: Airway[]) => {
                res.json(airways);
            }).catch((error) => errorResponse(error, res));
        } catch (error) {
            errorResponse(error, res);
        }
    });

    router.get('/airport/:ident/departures', (req, res) => {
        try {
            const ident = parseAirportIdent(req.params.ident);
            provider.getDepartures(ident).then((departures) => {
                res.json(departures);
            }).catch((error) => errorResponse(error, res));
        } catch (error) {
            errorResponse(error, res);
        }
    });

    router.get('/airport/:ident/arrivals', (req, res) => {
        try {
            const ident = parseAirportIdent(req.params.ident);
            provider.getArrivals(ident).then((arrivals) => {
                res.json(arrivals);
            }).catch((error) => errorResponse(error, res));
        } catch (error) {
            errorResponse(error, res);
        }
    });

    router.get('/airport/:ident/communications', (req, res) => {
        try {
            const ident = parseAirportIdent(req.params.ident);
            provider.getCommunicationsAtAirport(ident).then((communications) => {
                res.json(communications);
            }).catch((error) => errorResponse(error, res));
        } catch (error) {
            errorResponse(error, res);
        }
    });

    router.get('/airport/:ident/approaches', (req, res) => {
        try {
            const ident = parseAirportIdent(req.params.ident);
            provider.getApproaches(ident).then((approaches) => {
                res.json(approaches);
            }).catch((error) => errorResponse(error, res));
        } catch (error) {
            errorResponse(error, res);
        }
    });

    router.get('/airport/:ident/gates', (req, res) => {
        try {
            const ident = parseAirportIdent(req.params.ident);
            provider.getGates(ident).then((gates) => {
                res.json(gates);
            }).catch((error) => errorResponse(error, res));
        } catch (error) {
            errorResponse(error, res);
        }
    });

    router.get('/airport/:ident/holds', (req, res) => {
        try {
            const ident = parseAirportIdent(req.params.ident);
            provider.getHolds(ident).then((holds) => {
                res.json(holds);
            }).catch((error) => errorResponse(error, res));
        } catch (error) {
            errorResponse(error, res);
        }
    });

    router.get('/airport/:ident/ls/:ls/markers/:runway', (req, res) => {
        try {
            const airport = parseAirportIdent(req.params.ident);
            const ls = parseVorNdbIdent(req.params.ls);
            const runway = parseRunwayIdent(req.params.runway);
            provider.getLsMarkers(airport, runway, ls).then((markers) => {
                res.json(markers);
            }).catch((error) => errorResponse(error, res));
        } catch (error) {
            errorResponse(error, res);
        }
    });

    router.get('/airways/:idents', (req, res) => {
        try {
            const idents = parseMultipleIdents(req.params.idents, parseAirwayIdent);
            provider.getAirways(idents).then((airways: Airway[]) => {
                res.json(airways);
            }).catch((error) => errorResponse(error, res));
        } catch (error) {
            errorResponse(error, res);
        }
    });

    return router;
}
