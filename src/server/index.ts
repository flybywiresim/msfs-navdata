import express from 'express';
import cors from 'cors';
import { NavigraphProvider } from './providers/navigraph_dfd/dfd';
import { DatabaseIdent } from '../shared/types/DatabaseIdent';
import { Airport } from '../shared/types/Airport';
import { Runway } from '../shared/types/Runway';
import { Waypoint } from '../shared/types/Waypoint';
import { NdbNavaid } from '../shared/types/NdbNavaid';
import { Airway } from '../shared/types/Airway';
import { IlsNavaid, VhfNavaid } from '../shared';
import { DataInterface, HeightSearchRange, ZoneSearchRange } from '../shared/DataInterface';

const app = express();

app.use(cors());

// TODO config file/env
const databasePath = process.argv[2];
if (!databasePath) {
    console.error('Please provide path to the navigraph DFD sqlite db!');
    process.exit(1);
}

const provider: DataInterface = new NavigraphProvider(databasePath);

app.get('/', (req, res) => {
    provider.getDatabaseIdent().then((databaseIdent: DatabaseIdent) => {
        res.json(databaseIdent);
    });
});

app.get('/airports/:idents', (req, res) => {
    if (!req.params.idents.match(/^[A-Za-z0-9]{4}(,[A-Za-z0-9]{4})*$/)) {
        res.status(400).send('Invalid idents');
    }
    provider.getAirports(req.params.idents.split(',').map((ident) => ident.toUpperCase())).then((airports: Airport[]) => {
        res.json(airports);
    });
});

app.get('/nearby/airports/:ppos/:range', (req, res) => {
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

app.get('/nearby/airways/:ppos/:range/:searchRange?', (req, res) => {
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

app.get('/nearby/navaids/:ppos/:range/:searchRange?', (req, res) => {
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

app.get('/nearby/ndbs/:ppos/:range/:searchRange?', (req, res) => {
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

app.get('/nearby/waypoints/:ppos/:range/:searchRange?', (req, res) => {
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

app.get('/airport/:ident/runways', (req, res) => {
    if (!req.params.ident.match(/^[A-Za-z0-9]{4}/)) {
        res.status(400).send('Invalid ident');
    }
    provider.getRunways(req.params.ident.toUpperCase()).then((runways: Runway[]) => {
        res.json(runways);
    });
});

app.get('/airport/:ident/waypoints', (req, res) => {
    if (!req.params.ident.match(/^[A-Z0-9]{4}/)) {
        res.status(400).send('Invalid ident');
    }
    provider.getWaypointsAtAirport(req.params.ident).then((waypoints: Waypoint[]) => {
        res.json(waypoints);
    });
});

app.get('/airport/:ident/ndbs', (req, res) => {
    if (!req.params.ident.match(/^[A-Z0-9]{4}/)) {
        res.status(400).send('Invalid ident');
    }
    provider.getNDBsAtAirport(req.params.ident).then((ndbs: NdbNavaid[]) => {
        res.json(ndbs);
    });
});

app.get('/airport/:ident/ils', (req, res) => {
    if (!req.params.ident.match(/^[A-Z0-9]{4}/)) {
        res.status(400).send('Invalid ident');
    }
    provider.getIlsAtAirport(req.params.ident).then((ils: IlsNavaid[]) => {
        res.json(ils);
    });
});

app.get('/waypoints/:idents', (req, res) => {
    if (!req.params.idents.match(/^[A-Za-z0-9]{5}(,[A-Za-z0-9]{5})*$/)) {
        res.status(400).send('Invalid idents');
    }
    provider.getWaypoints(req.params.idents.split(',').map((ident) => ident.toUpperCase())).then((waypoints: Waypoint[]) => {
        res.json(waypoints);
    });
});

app.get('/ndbs/:idents', (req, res) => {
    if (!req.params.idents.match(/^[A-Za-z0-9]{1,3}(,[A-Za-z0-9]{1,3})*$/)) {
        res.status(400).send('Invalid idents');
    }
    provider.getNDBs(req.params.idents.split(',').map((ident) => ident.toUpperCase())).then((ndbs: NdbNavaid[]) => {
        res.json(ndbs);
    });
});

app.get('/fix/:ident/airways', (req, res) => {
    if (!req.params.ident.match(/^[A-Za-z0-9]{1,5}/)) {
        res.status(400).send('Invalid idents');
    }
    provider.getAirwaysByFix(req.params.ident).then((airways: Airway[]) => {
        res.json(airways);
    });
});

app.get('/navaids/:idents', (req, res) => {
    if (!req.params.idents.match(/^[A-Za-z0-9]{1,5}(,[A-Za-z0-9]{1,5})*$/)) {
        res.status(400).send('Invalid idents');
    }
    provider.getNavaids(req.params.idents.split(',').map((ident) => ident.toUpperCase())).then((navaids: VhfNavaid[]) => {
        res.json(navaids);
    });
});

app.get('/airport/:ident/departures', (req, res) => {
    if (!req.params.ident.match(/^[A-Z0-9]{4}/)) {
        res.status(400).send('Invalid ident');
    }
    provider.getDepartures(req.params.ident.toUpperCase()).then((departures) => {
        res.json(departures);
    }).catch((err) => {
        res.status(500).send(err);
    });
});

app.get('/airport/:ident/arrivals', (req, res) => {
    if (!req.params.ident.match(/^[A-Z0-9]{4}/)) {
        res.status(400).send('Invalid ident');
    }
    provider.getArrivals(req.params.ident.toUpperCase()).then((arrivals) => {
        res.json(arrivals);
    }).catch((err) => {
        res.status(500).send(err);
    });
});

app.get('/airport/:ident/approaches', (req, res) => {
    if (!req.params.ident.match(/^[A-Z0-9]{4}/)) {
        res.status(400).send('Invalid ident');
    }
    provider.getApproaches(req.params.ident.toUpperCase()).then((approaches) => {
        res.json(approaches);
    }).catch((err) => {
        res.status(500).send(err);
    });
});

app.get('/airways/:idents', (req, res) => {
    if (!req.params.idents.match(/^[A-Z0-9]{1,5}(,[A-Z0-9]{1,5})*$/)) {
        res.status(400).send('Invalid idents');
    }
    provider.getAirways(req.params.idents.split(',').map((ident) => ident.toUpperCase())).then((airways: Airway[]) => {
        res.json(airways);
    }).catch((err) => {
        res.status(500).send(err);
    });
});

app.listen(5000, () => {
    console.log('The application is listening on port 5000!');
});
