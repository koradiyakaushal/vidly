const request = require('supertest');
const { Customer } = require('../../../models/customer');
const { User } = require('../../../models/user');
const mongoose = require('mongoose');

let server;

describe('/api/customers', () => {
    beforeEach(() => { 
        server = require('../../../index');
    });

    afterEach(async () => {
        await server.close();
        await Customer.deleteMany({});
        // await Customer.remove({});
    });

    describe("GET /", () => {
        it("should return 401 if client is not logged in", async () => {
            const res = await request(server).get('/api/customers');

            expect(res.status).toBe(401);
        });

        it("should return all customer", async () => {
            token = new User().generateAuthToken(); 
            await Customer.collection.insertMany([
                { name: "customer1", phone: "12345678910", isGold: true },
                { name: "customer2", phone: "12345678910", isGold: true }
            ]);

            const res = await request(server).get('/api/customers').set('x-auth-token', token);
            expect(res.status).toBe(200);
            expect(res.body.some(c => c.name === 'customer1')).toBeTruthy();
            expect(res.body.length).toBe(2);
        });
    });

    describe("GET /:id", () => {
        it("should return 401 if client is not logged in", async () => {
            const res = await request(server).get('/api/customers/1');

            expect(res.status).toBe(401);
        });

        it("should return 404 if customer isInvalid", async () => {
            const id = new mongoose.Types.ObjectId()
            const res = await request(server).get('/api/customers/' + id).set('x-auth-token', token);

            expect(res.status).toBe(404);
        });

        it("should return a customer if valid id is passed", async () => {
            const customer = new Customer({ name: "customer1", phone: "12345678910", isGold: true });
            await customer.save()

            const res = await request(server).get('/api/customers/' + customer._id).set('x-auth-token', token);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('name', customer.name);
        });
    });

    describe("POST /", () => {
        let token;
        let name;
        let phone;
        let isGold;
    
        beforeEach(() => {
            name = "customer1"
            phone = "12345678910"
            isGold = true
            token = new User().generateAuthToken(); 
        });
        
        afterEach(async () => {
            await Customer.deleteMany({});
        })

        // cleaning repetitive task
        const exec = async () => {
            return await request(server).post('/api/customers').set('x-auth-token', token).send({ name, phone, isGold });
        };
        
        it("should return 401 if client is not logged in", async () => {
            token = ""
            const res = await exec();

            expect(res.status).toBe(401);
        });

        it("should return 400 if customer name is less than 5 char", async () => {
            name = "1234";
            const res = await exec();

            expect(res.status).toBe(400);

        });

        it("should return 400 if customer phone is less than 10 char", async () => {
            phone = "123456789";
            const res = await exec();

            expect(res.status).toBe(400);
        });

        it("should save the customer if it is valid", async () => {
            const res = await exec();

            const customer = await Customer.find({name: "customer1"});
            
            expect(res.status).toBe(200);
            expect(customer).not.toBeNull();
        });

        it("should return the customer if it is valid", async () => {
            const res = await exec();

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name');
            expect(res.body).toHaveProperty('phone');
            expect(res.body).toHaveProperty('isGold');
        });

    });

    describe("PUT /:id", () => {
        let token;
        let name;
        let phone;
        let isGold;
        let id = mongoose.Types.ObjectId().toHexString();
    
        beforeEach(() => {
            name = "customer1"
            phone = "12345678910"
            isGold = true
            token = new User().generateAuthToken(); 
        });

        afterEach(async () => {
            await Customer.deleteMany({});
        })

        const exec = () => {
            return request(server).put('/api/customers/'+ id).set('x-auth-token', token).send({ name, phone, isGold });
        };

        it("should return 401 if client is not logged in", async () => {
            token = ""
            const res = await exec();

            expect(res.status).toBe(401);
        });

        it("should return 400 if customer name is less than 5 char", async () => {
            name = "1234";
            const res = await exec();

            expect(res.status).toBe(400);
        });

        it("should return 400 if customer phone is less than 10 char", async () => {
            phone = "12345";
            const res = await exec();

            expect(res.status).toBe(400);
        });

        it("should return 404 if the customer not found", async () => {
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it("should update the customer if it is valid", async () => {
            let customer = new Customer({ name : name, phone: phone, isGold: isGold });
            await customer.save();

            id = customer._id
            name = "new_name"

            const res = await exec();
            
            expect(res.status).toBe(200);
            expect(res).not.toBeNull();
            expect(res.body.name).toBe(name);
            expect(res.body).toHaveProperty('name', name);
            expect(res.body).toHaveProperty('phone', phone);
            expect(res.body).toHaveProperty('isGold', isGold);
        });
    });

    describe('DELETE /:id', () => {
        let id;

        beforeEach(() => {
            token = new User().generateAuthToken(); 
        });
        
        afterEach(async () => {
            await Customer.deleteMany({});
        })

        const exec = () => {
            return request(server).delete('/api/customers/'+id).set('x-auth-token', token).send();
        };

        it("should return 404 if invalid id is given", async () => {
            id = 1
            const res = await exec();

            expect(res.status).toBe(404);

        });
        it("should return 404 if customer with given id doesn't exist", async () => {
            id = mongoose.Types.ObjectId();
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it("should return 200 if customer is deleted", async () => {
            let customer = new Customer({ name : "12345", phone: "12345678910", isGold: true });
            await customer.save();

            id = customer._id
            const res = await exec();

            expect(res.status).toBe(200);
        });
    });
});
