import express from 'express';
import { NavigraphDfd } from './providers/navigraph_dfd/dfd';
import { DatabaseIdent } from '../shared/types/DatabaseIdent';
import { Provider } from './providers/provider';
import { Airport } from '../shared/types/Airport';
import { Runway } from "../shared/types/Runway";
import cors from 'cors';
import { Waypoint } from "../shared/types/Waypoint";

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
    if (!req.params.idents.match(/^[A-Z0-9]{4}(,[A-Z0-9]{4})*$/)) {
        return res.status(400).send('Invalid idents');
    }
    provider.getAirportsByIdents(req.params.idents.split(',')).then((airports: Airport[]) => {
        res.json(airports);
    });
});

app.get('/airport/:ident', (req, res) => {
    if (!req.params.ident.match(/^[A-Z0-9]{4}/)) {
        return res.status(400).send('Invalid ident');
    }
    provider.getAirportsByIdents([req.params.ident]).then((airports: Airport[]) => {
        res.json(airports[0]);
    });
});

app.get('/airport/:ident/runways', (req, res) => {
    if (!req.params.ident.match(/^[A-Z0-9]{4}/)) {
        return res.status(400).send('Invalid ident');
    }
    provider.getRunwaysAtAirport(req.params.ident).then((runways: Runway[]) => {
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

app.listen(5000, () => {
    console.log('The application is listening on port 3000!');
})
