import express from 'express';
import cors from 'cors';
import { msfsNavdataRouter } from './index';
import { NavigraphProvider } from './providers/navigraph_dfd/dfd';

const app = express();

app.use(cors());

// TODO config file/env
const databasePath = process.argv[2];
if (!databasePath) {
    console.error('Please provide path to the navigraph DFD sqlite db!');
    process.exit(1);
}

app.use('/', msfsNavdataRouter(new NavigraphProvider(databasePath)));

app.listen(5000, () => {
    console.log('The application is listening on port 5000!');
});
