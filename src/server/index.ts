import express, { Router } from 'express';
import { NavigraphProvider } from './providers/navigraph_dfd/dfd';
import { DatabaseIdent } from '../shared/types/DatabaseIdent';
import { Airport } from '../shared/types/Airport';
import { Runway } from '../shared/types/Runway';
import { Waypoint } from '../shared/types/Waypoint';
import { NdbNavaid } from '../shared/types/NdbNavaid';
import { Airway } from '../shared/types/Airway';
import { IlsNavaid, VhfNavaid } from '../shared';
import { HeightSearchRange, ZoneSearchRange } from '../shared/DataInterface';

export function msfsNavdataRouter(provider: NavigraphProvider): Router {
    const router: Router = express.Router();

    router.get('/', (req, res) => {
        provider.getDatabaseIdent().then((databaseIdent: DatabaseIdent) => {
            res.json(databaseIdent);
        });
    });

    router.get('/airports/:idents', (req, res) => {
        if (!req.params.idents.match(/^[A-Za-z0-9]{4}(,[A-Za-z0-9]{4})*$/)) {
            res.status(400).send('Invalid idents');
        }
        provider.getAirports(req.params.idents.split(',').map((ident) => ident.toUpperCase())).then((airports: Airport[]) => {
            res.json(airports);
        });
    });

    router.get('/nearby/airports/:ppos/:range', (req, res) => {
        if (!req.params.ppos.match(/^-?[0-9]+(\.[0-9]+)?,-?[0-9]+(\.[0-9]+)?$/)) {
            res.status(400).send('Invalid ppos');
        }
        const [lat, lon] = req.params.ppos.split(',').map((v) => parseFloat(v));
        const range = parseInt(req.params.range ?? '381');
        provider.getAirportsInRange({ lat, lon }, range).then((airports: Airport[]) => {
            res.json(airports);
        }).catch((err) => {
            res.status(500).send(err);
        });
    });

    router.get('/nearby/airways/:ppos/:range/:searchRange?', (req, res) => {
        if (!req.params.ppos.match(/^-?[0-9]+(\.[0-9]+)?,-?[0-9]+(\.[0-9]+)?$/)) {
            res.status(400).send('Invalid ppos');
        }
        const [lat, lon] = req.params.ppos.split(',').map((v) => parseFloat(v));
        const range = parseInt(req.params.range);
        const searchRange: HeightSearchRange = parseInt(req.params.searchRange ?? '0');
        provider.getAirwaysInRange({ lat, lon }, range, searchRange).then((airways: Airway[]) => {
            res.json(airways);
        }).catch((err) => {
            res.status(500).send(err);
        });
    });

    router.get('/nearby/navaids/:ppos/:range/:searchRange?', (req, res) => {
        if (!req.params.ppos.match(/^-?[0-9]+(\.[0-9]+)?,-?[0-9]+(\.[0-9]+)?$/)) {
            res.status(400).send('Invalid ppos');
        }
        const [lat, lon] = req.params.ppos.split(',').map((v) => parseFloat(v));
        const range = parseInt(req.params.range);
        const searchRange: HeightSearchRange = parseInt(req.params.searchRange ?? '0');
        provider.getNavaidsInRange({ lat, lon }, range, searchRange).then((navaids: VhfNavaid[]) => {
            res.json(navaids);
        }).catch((err) => {
            res.status(500).send(err);
        });
    });

    router.get('/nearby/ndbs/:ppos/:range/:searchRange?', (req, res) => {
        if (!req.params.ppos.match(/^-?[0-9]+(\.[0-9]+)?,-?[0-9]+(\.[0-9]+)?$/)) {
            res.status(400).send('Invalid ppos');
        }
        const [lat, lon] = req.params.ppos.split(',').map((v) => parseFloat(v));
        const range = parseInt(req.params.range);
        const searchRange: ZoneSearchRange = parseInt(req.params.searchRange ?? '0');
        provider.getNDBsInRange({ lat, lon }, range, searchRange).then((ndbs: NdbNavaid[]) => {
            res.json(ndbs);
        }).catch((err) => {
            res.status(500).send(err);
        });
    });

    router.get('/nearby/waypoints/:ppos/:range/:searchRange?', (req, res) => {
        if (!req.params.ppos.match(/^-?[0-9]+(\.[0-9]+)?,-?[0-9]+(\.[0-9]+)?$/)) {
            res.status(400).send('Invalid ppos');
        }
        const [lat, lon] = req.params.ppos.split(',').map((v) => parseFloat(v));
        const range = parseInt(req.params.range);
        const searchRange: ZoneSearchRange = parseInt(req.params.searchRange ?? '0');
        provider.getWaypointsInRange({ lat, lon }, range, searchRange).then((waypoints: Waypoint[]) => {
            res.json(waypoints);
        }).catch((err) => {
            res.status(500).send(err);
        });
    });

    router.get('/airport/:ident/runways', (req, res) => {
        if (!req.params.ident.match(/^[A-Za-z0-9]{4}/)) {
            res.status(400).send('Invalid ident');
        }
        provider.getRunways(req.params.ident.toUpperCase()).then((runways: Runway[]) => {
            res.json(runways);
        });
    });

    router.get('/airport/:ident/waypoints', (req, res) => {
        if (!req.params.ident.match(/^[A-Z0-9]{4}/)) {
            res.status(400).send('Invalid ident');
        }
        provider.getWaypointsAtAirport(req.params.ident).then((waypoints: Waypoint[]) => {
            res.json(waypoints);
        });
    });

    router.get('/airport/:ident/ndbs', (req, res) => {
        if (!req.params.ident.match(/^[A-Z0-9]{4}/)) {
            res.status(400).send('Invalid ident');
        }
        provider.getNDBsAtAirport(req.params.ident).then((ndbs: NdbNavaid[]) => {
            res.json(ndbs);
        });
    });

    router.get('/airport/:ident/ils', (req, res) => {
        if (!req.params.ident.match(/^[A-Z0-9]{4}/)) {
            res.status(400).send('Invalid ident');
        }
        provider.getIlsAtAirport(req.params.ident).then((ils: IlsNavaid[]) => {
            res.json(ils);
        });
    });

    router.get('/waypoints/:idents', (req, res) => {
        if (!req.params.idents.match(/^[A-Za-z0-9]{5}(,[A-Za-z0-9]{5})*$/)) {
            res.status(400).send('Invalid idents');
        }
        provider.getWaypoints(req.params.idents.split(',').map((ident) => ident.toUpperCase())).then((waypoints: Waypoint[]) => {
            res.json(waypoints);
        });
    });

    router.get('/ndbs/:idents', (req, res) => {
        if (!req.params.idents.match(/^[A-Za-z0-9]{1,3}(,[A-Za-z0-9]{1,3})*$/)) {
            res.status(400).send('Invalid idents');
        }
        provider.getNDBs(req.params.idents.split(',').map((ident) => ident.toUpperCase())).then((ndbs: NdbNavaid[]) => {
            res.json(ndbs);
        });
    });

    router.get('/fix/:ident/airways', (req, res) => {
        if (!req.params.ident.match(/^[A-Za-z0-9]{1,5}/)) {
            res.status(400).send('Invalid idents');
        }
        provider.getAirwaysByFix(req.params.ident).then((airways: Airway[]) => {
            res.json(airways);
        });
    });

    router.get('/navaids/:idents', (req, res) => {
        if (!req.params.idents.match(/^[A-Za-z0-9]{1,5}(,[A-Za-z0-9]{1,5})*$/)) {
            res.status(400).send('Invalid idents');
        }
        provider.getNavaids(req.params.idents.split(',').map((ident) => ident.toUpperCase())).then((navaids: VhfNavaid[]) => {
            res.json(navaids);
        });
    });

    router.get('/airport/:ident/departures', (req, res) => {
        if (!req.params.ident.match(/^[A-Z0-9]{4}/)) {
            res.status(400).send('Invalid ident');
        }
        provider.getDepartures(req.params.ident.toUpperCase()).then((departures) => {
            res.json(departures);
        }).catch((err) => {
            res.status(500).send(err);
        });
    });

    router.get('/airport/:ident/arrivals', (req, res) => {
        if (!req.params.ident.match(/^[A-Z0-9]{4}/)) {
            res.status(400).send('Invalid ident');
        }
        provider.getArrivals(req.params.ident.toUpperCase()).then((arrivals) => {
            res.json(arrivals);
        }).catch((err) => {
            res.status(500).send(err);
        });
    });

    router.get('/airport/:ident/communications', (req, res) => {
        if (!req.params.ident.match(/^[A-Z0-9]{4}/)) {
            res.status(400).send('Invalid ident');
        }
        provider.getCommunicationsAtAirport(req.params.ident.toUpperCase()).then((communications) => {
            res.json(communications);
        }).catch((err) => {
            res.status(500).send(err);
        });
    });

    router.get('/airport/:ident/approaches', (req, res) => {
        if (!req.params.ident.match(/^[A-Z0-9]{4}/)) {
            res.status(400).send('Invalid ident');
        }
        provider.getApproaches(req.params.ident.toUpperCase()).then((routerroaches) => {
            res.json(routerroaches);
        }).catch((err) => {
            res.status(500).send(err);
        });
    });

    router.get('/airways/:idents', (req, res) => {
        if (!req.params.idents.match(/^[A-Z0-9]{1,5}(,[A-Z0-9]{1,5})*$/)) {
            res.status(400).send('Invalid idents');
        }
        provider.getAirways(req.params.idents.split(',').map((ident) => ident.toUpperCase())).then((airways: Airway[]) => {
            res.json(airways);
        }).catch((err) => {
            res.status(500).send(err);
        });
    });
    return router;
}
