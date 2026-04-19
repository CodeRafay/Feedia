import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter } from 'react-router-dom';
import { configureAxiosSecurity } from './api/security';
import DonorDashboard from './components/DonorDashboard';

describe('axios security configuration', () => {
    let interceptorIds;

    beforeAll(() => {
        interceptorIds = configureAxiosSecurity(axios);
    });

    afterAll(() => {
        if (interceptorIds?.requestInterceptor !== undefined) {
            axios.interceptors.request.eject(interceptorIds.requestInterceptor);
        }
        if (interceptorIds?.responseInterceptor !== undefined) {
            axios.interceptors.response.eject(interceptorIds.responseInterceptor);
        }
    });

    test('strips sensitive headers on cross-origin requests', () => {
        const handler = axios.interceptors.request.handlers[interceptorIds.requestInterceptor].fulfilled;
        const config = {
            url: 'https://malicious.test/redirect',
            headers: {
                Authorization: 'Bearer test-token',
                'X-API-Key': 'secret-key'
            }
        };

        const updatedConfig = handler(config);

        expect(updatedConfig.headers.Authorization).toBeUndefined();
        expect(updatedConfig.headers['X-API-Key']).toBeUndefined();
    });
});

describe('DonorDashboard input sanitization', () => {
    beforeEach(() => {
        localStorage.setItem('token', 'test-token');
        localStorage.setItem('userRole', 'donor');
    });

    afterEach(() => {
        localStorage.clear();
    });

    test('removes unsafe markup from text inputs', () => {
        render(
            <MemoryRouter>
                <DonorDashboard />
            </MemoryRouter>
        );

        const foodTypeInput = screen.getByLabelText(/Food Type/i);
        fireEvent.change(foodTypeInput, { target: { name: 'foodType', value: '<img src=x onerror=alert(1)>' } });

        expect(foodTypeInput.value).not.toContain('<');
        expect(foodTypeInput.value).not.toContain('onerror');
    });
});
