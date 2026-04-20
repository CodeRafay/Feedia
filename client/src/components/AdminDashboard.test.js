import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import axios from 'axios';

jest.mock('axios');

describe('AdminDashboard', () => {
    beforeEach(() => {
        localStorage.setItem('token', 'admin-token');
        localStorage.setItem('userRole', 'admin');
    });

    afterEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    test('renders overview cards', async () => {
        axios.get.mockResolvedValue({
            data: {
                totalUsers: 2,
                totalDonations: 1,
                totalPickups: 0,
                totalDropOffs: 1,
                usersByRole: { donor: 1, pickup: 1, admin: 1 },
                donationsByStatus: { available: 1 },
                recentDonations: [],
                recentUsers: []
            }
        });

        render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );

        await waitFor(() => expect(axios.get).toHaveBeenCalled());

        expect(await screen.findByText(/Total Users/)).toBeInTheDocument();
        expect(screen.getByText(/Total Donations/)).toBeInTheDocument();
    });
});
