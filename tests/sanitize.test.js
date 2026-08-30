const { sanitizeRequest } = require('../middleware/validation');

const run = (req) => {
    sanitizeRequest(req, {}, () => { });
    return req;
};

describe('sanitizeRequest', () => {
    test('strips operator and dotted keys at any depth', () => {
        const req = run({
            body: { email: { $ne: null }, nested: { deep: { $where: 'x', ok: 1 } } },
            query: { status: { $gt: '' }, 'location.lat': 1, keep: 'yes' },
            params: {}
        });

        expect(req.body.email).toEqual({});
        expect(req.body.nested.deep).toEqual({ ok: 1 });
        expect(req.query.status).toEqual({});
        expect(req.query['location.lat']).toBeUndefined();
        expect(req.query.keep).toBe('yes');
    });

    test('leaves ordinary values untouched', () => {
        const req = run({
            body: { email: 'a@b.com', rating: 5, tags: ['x', 'y'] },
            query: {},
            params: { id: '507f1f77bcf86cd799439011' }
        });

        expect(req.body).toEqual({ email: 'a@b.com', rating: 5, tags: ['x', 'y'] });
        expect(req.params.id).toBe('507f1f77bcf86cd799439011');
    });
});
