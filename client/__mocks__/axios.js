import { vi } from 'vitest';

// Manual mock picked up by a bare `vi.mock('axios')`. Vitest resolves module
// mocks from a root-level __mocks__ directory, so both dashboard tests share this
// instead of repeating a factory.
const axios = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    defaults: {
        baseURL: '',
        headers: {
            common: {}
        }
    },
    interceptors: {
        request: { use: vi.fn(), eject: vi.fn() },
        response: { use: vi.fn(), eject: vi.fn() }
    }
};

export default axios;
