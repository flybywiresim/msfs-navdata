import express from 'express';
import { NavigraphDfd } from './providers/navigraph_dfd/dfd';
import { DatabaseIdent } from '../shared/types/DatabaseIdent';

const app = express();

// TODO config file/env
const navigraph_db_name = 'D:/dev/navdata-server/navigraph-demo/e_dfd_2107.s3db';

app.get('/', (req, res) => {
    const dfd = new NavigraphDfd(navigraph_db_name);
    dfd.getDatabaseIdent().then((databaseIdent: DatabaseIdent) => {
        res.send(databaseIdent);
    });
})

app.listen(3000, () => {
    console.log('The application is listening on port 3000!');
})
