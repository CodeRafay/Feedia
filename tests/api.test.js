const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const User = require('../models/User');
const Donation = require('../models/Donation');
const DropOff = require('../models/DropOff');
const Pickup = require('../models/Pickup');
const Review = require('../models/Review');

const oid = (suffix = '11') => `507f1f77bcf86cd7994390${suffix}`;

const setAuth = (role, name = 'Test User') => {
    const userId = oid(role === 'admin' ? '99' : role === 'pickup' ? '98' : '97');
    const token = jwt.sign(
        { userId, role, name },
        process.env.JWT_SECRET
    );
    return { token, userId };
};

const futureDate = () => new Date(Date.now() + 60 * 60 * 1000).toISOString();
const chainable = (data) => ({
    populate: () => Promise.resolve(data),
    select: () => chainable(data),
    sort: () => chainable(data),
    skip: () => chainable(data),
    limit: () => Promise.resolve(data)
});

beforeEach(() => {
    process.env.JWT_SECRET = 'testsecret';
    jest.restoreAllMocks();
});

describe('API integration (mocked DB)', () => {
    test('donation creation accepts imageUrl and nearby route responds', async () => {
        const { token: donorToken } = setAuth('donor');
        const donationDoc = {
            _id: oid('11'),
            foodType: 'Test Meal',
            category: 'hot_meal',
            quantity: 3,
            expirationTime: futureDate(),
            status: 'available',
            location: { latitude: 12.97, longitude: 77.59 },
            image: 'http://example.com/meal.jpg',
            donorId: oid('12')
        };

        jest.spyOn(Donation.prototype, 'save').mockResolvedValue(donationDoc);
        jest.spyOn(Donation, 'find').mockReturnValue(chainable([donationDoc]));

        const createRes = await request(app)
            .post('/api/donations')
            .set('Authorization', `Bearer ${donorToken}`)
            .send({
                foodType: 'Test Meal',
                category: 'hot_meal',
                quantity: 3,
                expirationTime: futureDate(),
                latitude: 12.97,
                longitude: 77.59,
                imageUrl: 'http://example.com/meal.jpg'
            });

        expect(createRes.status).toBe(201);
        expect(Donation.prototype.save).toHaveBeenCalled();

        const nearbyRes = await request(app)
            .get('/api/donations/nearby/12.97/77.59')
            .query({ maxDistance: 5 });

        expect(nearbyRes.status).toBe(200);
        expect(nearbyRes.body.count).toBe(1);
    });

    test('drop-off nearby search uses POST coordinates', async () => {
        const dropOffDoc = {
            _id: oid('13'),
            name: 'Central Point',
            address: '123 Center Rd',
            location: { latitude: 10, longitude: 10 },
            calculateDistance: () => 0.5,
            toObject: function () { return this; }
        };

        jest.spyOn(DropOff, 'findNearest').mockResolvedValue([dropOffDoc]);

        const res = await request(app)
            .post('/api/dropoffs/nearby')
            .send({ latitude: 10.01, longitude: 10.02, maxDistance: 5 });

        expect(res.status).toBe(200);
        expect(res.body.count).toBe(1);
        expect(res.body.dropOffs[0].name).toBe('Central Point');
    });

    test('admin can list users and change roles', async () => {
        const { token: adminToken } = setAuth('admin', 'Admin');
        const targetUser = { _id: oid('14'), name: 'Donor', email: 'donor@example.com', role: 'donor', createdAt: new Date() };
        jest.spyOn(User, 'find').mockReturnValue(chainable([targetUser]));
        jest.spyOn(User, 'countDocuments').mockResolvedValue(1);
        jest.spyOn(User, 'findByIdAndUpdate').mockReturnValue({
            select: () => Promise.resolve({ ...targetUser, role: 'pickup' })
        });
        jest.spyOn(User, 'findByIdAndDelete').mockResolvedValue(targetUser);

        const listRes = await request(app)
            .get('/api/admin/users')
            .set('Authorization', `Bearer ${adminToken}`);
        expect(listRes.status).toBe(200);
        expect(listRes.body.users.length).toBe(1);

        const updateRes = await request(app)
            .put(`/api/admin/users/${targetUser._id}/role`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ role: 'pickup' });
        expect(updateRes.status).toBe(200);
        expect(updateRes.body.user.role).toBe('pickup');
    });

    test('reviews API supports create, update, and delete', async () => {
        const { token: reviewerToken } = setAuth('donor', 'Reviewer');
        const reviewDoc = {
            _id: oid('15'),
            reviewerId: oid('97'),
            revieweeId: oid('16'),
            rating: 5,
            comment: 'Great',
            type: 'donor_to_pickup'
        };

        jest.spyOn(User, 'findById').mockResolvedValue({ _id: oid('16'), name: 'Target' });
        jest.spyOn(Review.prototype, 'save').mockResolvedValue(reviewDoc);
        jest.spyOn(Review, 'findOne').mockResolvedValue(null);
        jest.spyOn(Review, 'findById').mockResolvedValue({ ...reviewDoc, save: jest.fn().mockResolvedValue({ ...reviewDoc, rating: 4 }) });
        jest.spyOn(Review, 'findByIdAndDelete').mockResolvedValue(reviewDoc);

        const createRes = await request(app)
            .post('/api/reviews')
            .set('Authorization', `Bearer ${reviewerToken}`)
            .send({
                revieweeId: oid('16'),
                rating: 5,
                comment: 'Great experience',
                type: 'donor_to_pickup'
            });
        expect(createRes.status).toBe(201);

        const updateRes = await request(app)
            .put(`/api/reviews/${reviewDoc._id}`)
            .set('Authorization', `Bearer ${reviewerToken}`)
            .send({ rating: 4, comment: 'Updated' });
        expect(updateRes.status).toBe(200);

        const deleteRes = await request(app)
            .delete(`/api/reviews/${reviewDoc._id}`)
            .set('Authorization', `Bearer ${reviewerToken}`);
        expect(deleteRes.status).toBe(200);
    });

    test('pickup lifecycle allows accept then complete', async () => {
        const { token: pickupToken, userId: pickupUserId } = setAuth('pickup', 'Courier');
        const { token: donorToken } = setAuth('donor', 'Donor');
        const donationDoc = {
            _id: oid('17'),
            foodType: 'Boxed Meals',
            category: 'packaged',
            quantity: 5,
            expirationTime: futureDate(),
            status: 'available',
            donorId: oid('18'),
            location: { latitude: 40, longitude: -70 },
            save: jest.fn().mockResolvedValue(true)
        };

        jest.spyOn(Donation.prototype, 'save').mockResolvedValue(donationDoc);
        jest.spyOn(Donation, 'findById').mockResolvedValue({ ...donationDoc, save: jest.fn().mockResolvedValue(true) });
        jest.spyOn(Donation, 'findByIdAndUpdate').mockResolvedValue({ ...donationDoc, status: 'delivered' });
        jest.spyOn(Pickup, 'findOne').mockResolvedValue(null);
        jest.spyOn(Pickup.prototype, 'save').mockResolvedValue({ _id: oid('19'), donationId: donationDoc._id, pickupUserId: pickupUserId, status: 'pending' });
        jest.spyOn(Pickup, 'findById').mockResolvedValue({ _id: oid('19'), donationId: donationDoc._id, pickupUserId: pickupUserId, status: 'pending', save: jest.fn().mockResolvedValue({ status: 'accepted' }) });

        const donationRes = await request(app)
            .post('/api/donations')
            .set('Authorization', `Bearer ${donorToken}`)
            .send({
                foodType: 'Boxed Meals',
                category: 'packaged',
                quantity: 5,
                expirationTime: futureDate(),
                latitude: 40,
                longitude: -70
            });
        expect(donationRes.status).toBe(201);

        const pickupCreate = await request(app)
            .post('/api/pickups')
            .set('Authorization', `Bearer ${pickupToken}`)
            .send({ donationId: donationDoc._id });
        expect(pickupCreate.status).toBe(201);

        jest.spyOn(Pickup, 'findById').mockResolvedValue({ _id: oid('19'), donationId: donationDoc._id, pickupUserId: pickupUserId, status: 'accepted', save: jest.fn().mockResolvedValue({ status: 'accepted' }) });

        const acceptRes = await request(app)
            .put(`/api/pickups/${oid('19')}`)
            .set('Authorization', `Bearer ${pickupToken}`)
            .send({ status: 'accepted' });
        expect(acceptRes.status).toBe(200);

        jest.spyOn(Pickup, 'findById').mockResolvedValue({ _id: oid('19'), donationId: donationDoc._id, pickupUserId: pickupUserId, status: 'accepted', save: jest.fn().mockResolvedValue({ status: 'completed' }) });

        const completeRes = await request(app)
            .put(`/api/pickups/${oid('19')}`)
            .set('Authorization', `Bearer ${pickupToken}`)
            .send({ status: 'completed' });
        expect(completeRes.status).toBe(200);
    });
});
