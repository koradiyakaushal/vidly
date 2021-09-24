const { User } = require('../../../models/user');
const request = require('supertest');

let server;

describe('/api/auth : user login', () => {
    let email;
    let password;
    let name;

    beforeEach(async () => { 
        server = require('../../../index');
        email = "test@gmail.com"
        name = "123456"
        password = "abcdefghijkl"

        await request(server).post('/api/users').send({name: name, email: email, password: password})

    });

    afterEach(async () => { 
        await server.close();
        await User.deleteMany({});
    });
    
    const exec = () => {
        return request(server).post('/api/auth').send({ email: email, password: password })
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

    it('should return 400 if email is wrong', async () => {
        email = "wrong@gmail.com";
        const res = await exec();
    
        expect(res.status).toBe(400);
    });

    it('should return 400 if password is wrong', async () => {
        password = "wrong";
        const res = await exec();
    
        expect(res.status).toBe(400);
    });

    it('should return 200 if user input is valid', async () => {
        const res = await exec();

        expect(res.status).toBe(200);
    });

    it('should return token if client is authenticated', async () => {
        const res = await exec();
    
        expect(res.body).toBeDefined();
        expect(res.status).toBe(200);
    });
});
