import express from 'express';
import { NavigraphDfd } from './providers/navigraph_dfd/dfd';
import { DatabaseIdent } from '../shared/types/DatabaseIdent';

const app = express();

// TODO config file/env
const navigraph_db_name = process.argv[2];
if (!navigraph_db_name) {
    console.error('Please provide path to the navigraph DFD sqlite db!');
    process.exit(1);
}

app.get('/', (req, res) => {
    const dfd = new NavigraphDfd(navigraph_db_name);
    dfd.getDatabaseIdent().then((databaseIdent: DatabaseIdent) => {
        res.send(databaseIdent);
    });
})

app.listen(3000, () => {
    console.log('The application is listening on port 3000!');
})
