import express from 'express';
import { NavigraphDfd } from './providers/navigraph_dfd/dfd';
import { DatabaseIdent } from '../shared/types/DatabaseIdent';
import { Provider } from './providers/provider';
import { Airport } from '../shared/types/Airport';
import { Runway } from "../shared/types/Runway";
import cors from 'cors';
import { Waypoint } from "../shared/types/Waypoint";
import { NdbNavaid } from "../shared/types/NdbNavaid";
import { Airway } from '../shared/types/Airway';
import { IlsNavaid } from '../shared';

const app = express();

app.use(cors());

// TODO config file/env
const navigraph_db_name = process.argv[2];
if (!navigraph_db_name) {
    console.error('Please provide path to the navigraph DFD sqlite db!');
    process.exit(1);
}

const provider: Provider = new NavigraphDfd(navigraph_db_name);

app.get('/', (req, res) => {
    provider.getDatabaseIdent().then((databaseIdent: DatabaseIdent) => {
        res.json(databaseIdent);
    });
});

app.get('/airports/:idents', (req, res) => {
    if (!req.params.idents.match(/^[A-Za-z0-9]{4}(,[A-Za-z0-9]{4})*$/)) {
        return res.status(400).send('Invalid idents');
    }
    provider.getAirportsByIdents(req.params.idents.split(',').map((ident) => ident.toUpperCase())).then((airports: Airport[]) => {
        res.json(airports);
    });
});

app.get('/nearby/airports/:ppos/:range?', (req, res) => {
    if (!req.params.ppos.match(/^-?[0-9]+(\.[0-9]+)?,-?[0-9]+(\.[0-9]+)?$/)) {
        return res.status(400).send('Invalid ppos');
    }
    const [lat, lon] = req.params.ppos.split(',').map((v) => parseFloat(v));
    const range = parseInt(req.params.range ?? '381');
    provider.getNearbyAirports(lat, lon, range).then((airports: Airport[]) => {
        res.json(airports);
    }).catch((err) => {
        res.status(500).send(err);
    });
});

app.get('/airport/:ident/runways', (req, res) => {
    if (!req.params.ident.match(/^[A-Za-z0-9]{4}/)) {
        return res.status(400).send('Invalid ident');
    }
    provider.getRunwaysAtAirport(req.params.ident.toUpperCase()).then((runways: Runway[]) => {
        res.json(runways);
    });
});

app.get('/airport/:ident/waypoints', (req, res) => {
    if (!req.params.ident.match(/^[A-Z0-9]{4}/)) {
        return res.status(400).send('Invalid ident');
    }
    provider.getWaypointsAtAirport(req.params.ident).then((waypoints: Waypoint[]) => {
        res.json(waypoints);
    });
});

app.get('/airport/:ident/ndbs', (req, res) => {
    if (!req.params.ident.match(/^[A-Z0-9]{4}/)) {
        return res.status(400).send('Invalid ident');
    }
    provider.getNDBsAtAirport(req.params.ident).then((ndbs: NdbNavaid[]) => {
        res.json(ndbs);
    });
});

app.get('/airport/:ident/ils', (req, res) => {
    if (!req.params.ident.match(/^[A-Z0-9]{4}/)) {
        return res.status(400).send('Invalid ident');
    }
    provider.getIlsAtAirport(req.params.ident).then((ils: IlsNavaid[]) => {
        res.json(ils);
    });
});


app.get('/enroute/waypoints/:ident', (req, res) => {
    if (!req.params.ident.match(/^[A-Z0-9]{4}/)) {
        return res.status(400).send('Invalid ident');
    }
    provider.getWaypointsByIdent(req.params.ident).then((waypoints: Waypoint[]) => {
        res.json(waypoints);
    });
});

app.get('/airport/:ident/departures', (req, res) => {
    if (!req.params.ident.match(/^[A-Z0-9]{4}/)) {
        return res.status(400).send('Invalid ident');
    }
    provider.getDepartures(req.params.ident.toUpperCase()).then((departures) => {
        res.json(departures);
    }).catch((err) => {
        res.status(500).send(err);
    })
});

app.get('/airport/:ident/arrivals', (req, res) => {
    if (!req.params.ident.match(/^[A-Z0-9]{4}/)) {
        return res.status(400).send('Invalid ident');
    }
    provider.getArrivals(req.params.ident.toUpperCase()).then((arrivals) => {
        res.json(arrivals);
    }).catch((err) => {
        res.status(500).send(err);
    })
});

app.get('/airport/:ident/approaches', (req, res) => {
    if (!req.params.ident.match(/^[A-Z0-9]{4}/)) {
        return res.status(400).send('Invalid ident');
    }
    provider.getApproaches(req.params.ident.toUpperCase()).then((approaches) => {
        res.json(approaches);
    }).catch((err) => {
        res.status(500).send(err);
    })
});

app.get('/airways/:idents', (req, res) => {
    if (!req.params.idents.match(/^[A-Z][0-9]{0,3}(,[A-Z][0-9]{0,3})*$/)) {
        return res.status(400).send('Invalid idents');
    }
    provider.getAirwaysByIdents(req.params.idents.split(',').map((ident) => ident.toUpperCase())).then((airways: Airway[]) => {
        res.json(airways);
    }).catch((err) => {
        res.status(500).send(err);
    });
});

app.listen(5000, () => {
    console.log('The application is listening on port 5000!');
})
