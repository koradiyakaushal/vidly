const request = require('supertest');
const { Genre } = require('../../models/genre');
const { User } = require('../../models/user');
const mongoose = require('mongoose');

let server;

describe('/api/genres', () => {
    beforeEach(() => { server = require('../../index'); });
    afterEach(async () => { 
        await server.close();
        await Genre.deleteMany({});
        // await Genre.remove({});
    });

    describe("GET /", () => {
        it("should return all genres", async () => {
            await Genre.collection.insertMany([
                { name: "genre1" },
                { name: "genre2" }
            ]);

            const res = await request(server).get('/api/genres');
            expect(res.status).toBe(200);
            expect(res.body.some(g => g.name === 'genre1')).toBeTruthy();
            expect(res.body.length).toBe(2);

        });
    });

    describe("GET /:id", () => {
        it("should return a genre if valid id is passed", async () => {
            const genre = new Genre({ name: "genre1" });
            await genre.save()

            const res = await request(server).get('/api/genres/' + genre._id);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('name', genre.name);

        });
    });

    describe("GET /:id", () => {
        it("should return 404 if invalid id is passed", async () => {
            const res = await request(server).get('/api/genres/1');

            expect(res.status).toBe(404);

        });
        it("should return 404 if no genre with given id exists", async () => {
            id = mongoose.Types.ObjectId();
            const res = await request(server).get('/api/genres/'+id);

            expect(res.status).toBe(404);

        });
    });

    describe("POST /", () => {
        it("should return 401 if client is not logged in", async () => {
            const res = await request(server).post('/api/genres').send({name: "genre1"});

            expect(res.status).toBe(401);

        });
    });

    describe("POST /", () => {
        let token;
        let name;

        // cleaning repetitive task
        const exec = async () => {
            return await request(server).post('/api/genres').set('x-auth-token', token).send({ name });
        };

        beforeEach(() => {
            name = "genre1"
            token = new User().generateAuthToken(); 
        });

        it("should return 400 if genre is less than 5 char", async () => {
            name = "1234";
            const res = await exec();

            expect(res.status).toBe(400);

        });
        it("should return 400 if genre name length is greater than 50 char", async () => {
            name = new Array(52).join('a');
            const res = await exec();

            expect(res.status).toBe(400);

        });
        it("should save the genre if it is valid", async () => {
            const res = await exec();

            const genre = await Genre.find({name: "genre1"});
            
            expect(res.status).toBe(200);
            expect(genre).not.toBeNull();

        });
        it("should return the genre if it is valid", async () => {
            const res = await exec();

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name');

        });
    });

    describe("PUT /:id", () => {
        let id = mongoose.Types.ObjectId().toHexString();
        it("should return 401 if client is not logged in", async () => {
            const res = await request(server).put('/api/genres/'+id).send({name: "123"});

            expect(res.status).toBe(401);

        });
    });

    describe("PUT /:id", () => {
        let token;
        let name;
        let id = mongoose.Types.ObjectId().toHexString();
        // cleaning repetitive task
        const exec = async () => {
            return await request(server).put('/api/genres/'+id).set('x-auth-token', token).send({ name });
        };

        beforeEach(() => {
            name = "genre1"
            token = new User().generateAuthToken(); 
        });

        it("should return 400 if genre is less than 5 char", async () => {
            name = "1234";
            const res = await exec();

            expect(res.status).toBe(400);

        });
        it("should return 400 if genre name length is greater than 50 char", async () => {
            name = new Array(52).join('a');
            const res = await exec();

            expect(res.status).toBe(400);

        });
        it("should update the genre if it is valid", async () => {
            let genre = new Genre({name : name});
            await genre.save();

            id = genre._id
            name = "new_name"

            const res = await exec();
            
            expect(res.status).toBe(200);
            expect(res).not.toBeNull();
            expect(res.body).toHaveProperty('name', name);

        });
        it("should return 404 if the genre not found", async () => {
            const res = await exec();

            expect(res.status).toBe(404);

        });
    });

    describe('DELETE /:id', () => {
        beforeEach(() => {
            token = new User().generateAuthToken(); 
        });

        const exec = async () => {
            return await request(server).delete('/api/genres/'+id).set('x-auth-token', token).send();
        };

        it("should return 404 if invalid id is given", async () => {
            id = 1
            const res = await exec();

            expect(res.status).toBe(404);

        });
        it("should return 404 if no genre with given id exists", async () => {
            id = mongoose.Types.ObjectId();
            const res = await exec();

            expect(res.status).toBe(404);

        });

        it("should return 200 if genre is deleted", async () => {
            let genre = new Genre({name : "new_genre"});
            await genre.save();

            id = genre._id
            const res = await exec();

            expect(res.status).toBe(200);

        });
    });
});
