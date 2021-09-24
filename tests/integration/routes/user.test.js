const { User } = require('../../../models/user');
const request = require('supertest');

let server;

describe('user register', () => {
    let email;
    let name;
    let password;

    beforeEach(() => { 
        server = require('../../../index');
        email = "test@gmail.com"
        name = "abcdefg"
        password = "abcdefghijkl"
    });

    afterEach(async () => { 
        await server.close();
        await User.deleteMany({});
    });
    
    const exec = () => {
        return request(server).post('/api/users').send({name: name, email: email, password: password})
    }

    it('should return 400 if email is not provided', async () => {
        email = '';
        const res = await exec();
    
        expect(res.status).toBe(400);

    });

    it('should return 400 if password is not provided', async () => {
        password = '';
        const res = await exec();
    
        expect(res.status).toBe(400);

    });

    it('should return 400 if name is not provided', async () => {
        name = '';
        const res = await exec();
        expect(res.status).toBe(400);

    });

    it('should return 400 if email is already registered', async () => {
        user = new User({email: email, name: name, password: password})
        await user.save()

        const res = await exec();
    
        expect(res.status).toBe(400);

    });

    it('should return 200 if user input is valid', async () => {
        const res = await exec();
    
        expect(res.status).toBe(200);

    });

    it('should return user payload with id', async () => {
        const res = await exec();
    
        expect(res.body._id).toBeDefined();

    });

});
