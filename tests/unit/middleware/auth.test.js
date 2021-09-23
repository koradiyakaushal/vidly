// const jwt = require('jsonwebtoken');
const auth = require('../../../middleware/auth');
const { User } = require('../../../models/user');
const mongoose = require('mongoose');
// const request = require('supertest');


describe('auth middleware', () => {

    it('should populate req.user with the payload of the valid JWT', async () => {
        const user = { _id: new mongoose.Types.ObjectId().toHexString(), isAdmin: true }
        const token = new User(user).generateAuthToken();
        const req = {
            header : jest.fn().mockReturnValue(token)
        };
        const res = {};
        const next = jest.fn();

        auth(req, res, next);

        expect(req.user).toMatchObject(user);

    });

});
