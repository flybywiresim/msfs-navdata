import { FixTypeFlags } from '../shared';
import { ExternalBackend } from './backends/External';
import { Database } from './Database';

const db = new Database(new ExternalBackend('http://localhost:5000'));

describe('Database', () => {
    it('Enroute Fixes', async () => {
        let res = await db.getEnrouteFixes(['GUTBU', 'NS', 'NP'], []);
        expect(res.length).toBe(10);
        res = await db.getEnrouteFixes(['GUTBU', 'NS', 'NP'], ['EPTM']);
        expect(res.length).toBe(11);
        res = await db.getEnrouteFixes(['GUTBU', 'NS', 'NP'], ['EPTM', 'NZCH']);
        expect(res.length).toBe(12);
        res = await db.getEnrouteFixes(['GUTBU', 'NS', 'NP'], ['EPTM', 'NZCH'], FixTypeFlags.Waypoint | FixTypeFlags.NdbNavaid);
        expect(res.length).toBe(9);
        res = await db.getEnrouteFixes(['GUTBU', 'NS', 'NP'], undefined);
        expect(res.length).toBe(12);
    });
    it('Standalone Fixes', async () => {
        let res = await db.getFixes(['NZCH', 'GUTBU']);
        expect(res.length).toBe(2);
        res = await db.getFixes(['NZCH', 'GUTBU'], undefined, FixTypeFlags.Airport);
        expect(res.length).toBe(1);
    });
    it('Airport Fixes', async () => {
        let res = await db.getAirportFixes(['RW02', 'ICH'], 'NZCH');
        expect(res.length).toBe(2);
        res = await db.getAirportFixes(['RW02', 'ICH'], 'NZCH', FixTypeFlags.Runway);
        expect(res.length).toBe(1);
    });
    it('DatabaseId', async () => {
        const res = await db.getDatabaseIdent();
        expect(res.provider).toBe('Navigraph');
    });
});
