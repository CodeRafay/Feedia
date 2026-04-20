import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Reviews from './Reviews';
import axios from 'axios';

jest.mock('axios');

describe('Reviews component', () => {
    beforeEach(() => {
        localStorage.setItem('token', 'test-token');
        localStorage.setItem('userRole', 'donor');
    });

    afterEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    test('renders review form and sections', async () => {
        axios.get
            .mockResolvedValueOnce({ data: { reviews: [] } }) // given
            .mockResolvedValueOnce({ data: { reviews: [] } }); // received

        render(
            <MemoryRouter>
                <Reviews />
            </MemoryRouter>
        );

        await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));

        const heading = await screen.findByRole('heading', { name: 'Reviews' });
        expect(heading).toBeInTheDocument();
        expect(screen.getByText(/Create Review/)).toBeInTheDocument();
        expect(screen.getByText(/Reviews I Received/)).toBeInTheDocument();
        expect(screen.getByText(/Reviews I Wrote/)).toBeInTheDocument();
    });
});
