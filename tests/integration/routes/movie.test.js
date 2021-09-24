const request = require('supertest');
const { Movie } = require('../../../models/movie');
const { User } = require('../../../models/user');
const mongoose = require('mongoose');
const { Genre } = require('../../../models/genre');

let server;

describe('/api/movies', () => {
    beforeEach(() => { 
        server = require('../../../index');
    });

    afterEach(async () => {
        await server.close();
        await Movie.deleteMany({});
    });

    describe("GET /", () => {

        it("should return all movie", async () => {
            await Movie.collection.insertOne({ title: "movie1", genre: { name: "Action"}, numberInStock: 10, dailyRentalRate: 2 });

            const res = await request(server).get('/api/movies');
            expect(res.status).toBe(200);
            expect(res.body.some(c => c.title === 'movie1')).toBeTruthy();
            expect(res.body.length).toBe(1);
        });
    });

    describe("GET /:id", () => {
        it("should return 404 if movie isInvalid", async () => {
            const id = new mongoose.Types.ObjectId()
            const res = await request(server).get('/api/movies/' + id);

            expect(res.status).toBe(404);
        });

        it("should return a movie if valid id is passed", async () => {
            const movie = new Movie({ title: "movie1", genre: { name: "Action"}, numberInStock: 10, dailyRentalRate: 2 });
            await movie.save()

            const res = await request(server).get('/api/movies/' + movie._id);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('title', movie.title);
            expect(res.body).toHaveProperty('numberInStock', movie.numberInStock);
            expect(res.body).toHaveProperty('dailyRentalRate', movie.dailyRentalRate);
            expect(res.body).toHaveProperty('genre.name', movie.genre.name);
        });
    });

    describe("POST /", () => {
        let token;
        let title;
        let genreId;
        let numberInStock;
        let dailyRentalRate;

        beforeEach(async () => {
            title = "movie1"
            numberInStock = 10
            dailyRentalRate = 2
            token = new User().generateAuthToken();
            genreId = mongoose.Types.ObjectId().toHexString();

            const genre = await new Genre({ _id: genreId, name: "Action" })
            genre.save()
        });
        
        afterEach(async () => {
            await Movie.deleteMany({});
            await Genre.deleteMany({});
        })

        // cleaning repetitive task
        const exec = async () => {
            return await request(server).post('/api/movies').set('x-auth-token', token).send({ title: title, genreId: genreId, numberInStock: numberInStock, dailyRentalRate: dailyRentalRate });
        };
        
        it("should return 401 if client is not logged in", async () => {
            token = ""
            const res = await exec();

            expect(res.status).toBe(401);
        });

        it("should return 400 if genreId is invalid", async () => {
            genreId = mongoose.Types.ObjectId();
            const res = await exec();

            expect(res.status).toBe(400);

        });

        it("should return 400 if title is less than 5 char", async () => {
            title = "1234";
            const res = await exec();

            expect(res.status).toBe(400);
        });

        it("should return 400 if numberInStock is less than zero", async () => {
            numberInStock = -2
            const res = await exec();

            expect(res.status).toBe(400);
        });

        it("should return 400 if dailyRentalRate is less than zero", async () => {
            dailyRentalRate = -2
            const res = await exec();

            expect(res.status).toBe(400);
        });

        it("should save the movie if it is valid", async () => {
            const res = await exec();
            const movie = await Movie.find({title: "movie1"});

            expect(res.status).toBe(200);
            expect(movie).not.toBeNull();
        });

        it("should return the movie if it is valid", async () => {
            const res = await exec();

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('title');
            expect(res.body).toHaveProperty('numberInStock');
            expect(res.body).toHaveProperty('genre');
            expect(res.body).toHaveProperty('dailyRentalRate');
        });

    });

    describe("PUT /:id", () => {
        let id = mongoose.Types.ObjectId().toHexString();    
        let token;
        let title;
        let genreId;
        let numberInStock;
        let dailyRentalRate;

        beforeEach(async () => {
            title = "movie1"
            numberInStock = 10
            dailyRentalRate = 2
            token = new User().generateAuthToken();
            genreId = mongoose.Types.ObjectId().toHexString();
        });
        
        afterEach(async () => {
            await Movie.deleteMany({});
            await Genre.deleteMany({});
        })

        const exec = async () => {
            return await request(server).put('/api/movies/' + id).set('x-auth-token', token).send({ title: title, genreId: genreId, numberInStock: numberInStock, dailyRentalRate: dailyRentalRate });
        };

        it("should return 401 if client is not logged in", async () => {
            token = ""
            const res = await exec();

            expect(res.status).toBe(401);
        });

        it("should return 400 if genreId is invalid", async () => {
            genreId = mongoose.Types.ObjectId();
            const res = await exec();

            expect(res.status).toBe(400);

        });

        it("should return 400 if title is less than 5 char", async () => {
            title = "1234";
            const res = await exec();

            expect(res.status).toBe(400);
        });

        it("should return 400 if numberInStock is less than zero", async () => {
            numberInStock = -2
            const res = await exec();

            expect(res.status).toBe(400);
        });

        it("should return 400 if dailyRentalRate is less than zero", async () => {
            dailyRentalRate = -2
            const res = await exec();

            expect(res.status).toBe(400);
        });

        it("should return 404 if movie not found", async () => {
            let genre = new Genre({ name: "Action" })
            genre = await genre.save()
            genreId = genre._id
            
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it("should update the movie if it is valid", async () => {
            let genre = new Genre({ name: "Action" })
            genre = await genre.save()

            let movie = new Movie({
                title: "Dhoom",
                genre: { _id: genre._id, name: genre.name},
                numberInStock: 10,
                dailyRentalRate: 2
            })
            movie = await movie.save()

            id = movie._id
            title = "dhoom2"
            dailyRentalRate = 5
            genreId = genre._id

            const res = await exec();
            
            expect(res.status).toBe(200);
            expect(res).not.toBeNull();
            expect(res.body.title).toBe(title);
            expect(res.body).toHaveProperty('dailyRentalRate', dailyRentalRate);
            expect(res.body).toHaveProperty('numberInStock', numberInStock);
        });
    });

    describe('DELETE /:id', () => {
        let id;

        beforeEach(() => {
            token = new User().generateAuthToken();

        });
        
        afterEach(async () => {
            await Movie.deleteMany({});
            await Genre.deleteMany({});
        })

        const exec = () => {
            return request(server).delete('/api/movies/'+id).set('x-auth-token', token).send();
        };

        it("should return 404 if invalid id is given", async () => {
            id = 1
            const res = await exec();

            expect(res.status).toBe(404);

        });
        it("should return 404 if movie with given id doesn't exist", async () => {
            id = mongoose.Types.ObjectId();
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it("should return 200 if movie is deleted", async () => {
            let genre = new Genre({ name: "Action" })
            genre = await genre.save()

            let movie = new Movie({
                title: "Dhoom",
                genre: { _id: genre._id, name: genre.name},
                numberInStock: 10,
                dailyRentalRate: 2
            })
            movie = await movie.save()

            id = movie._id
            const res = await exec();

            expect(res.status).toBe(200);
        });
    });
});
