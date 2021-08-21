import express from 'express';
import { NavigraphDfd } from './providers/navigraph_dfd/dfd';
import { DatabaseIdent } from '../shared/types/DatabaseIdent';
import { Provider } from './providers/provider';
import { Airport } from '../shared/types/Airport';

const app = express();

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

app.get('/airport/:ident', (req, res) => {
    provider.getAirportByIdent(req.params.ident).then((airport: Airport) => {
        res.json(airport);
    });
});

app.get('/nearby/airports/:ppos/:range?', (req, res) => {
    if (!req.params.ppos.match(/^-?[0-9]+(\.[0-9]+)?,-?[0-9]+(\.[0-9]+)?$/)) {
        res.status(400);
        return;
    }
    const [lat, lon] = req.params.ppos.split(',').map((v) => parseFloat(v));
    const range = parseInt(req.params.range ?? '381');
    provider.getNearbyAirports(lat, lon, range).then((airports: Airport[]) => {
        res.json(airports);
    }).catch((err) => {
        res.status(500).send(err);
    });
});

app.listen(3000, () => {
    console.log('The application is listening on port 3000!');
})
