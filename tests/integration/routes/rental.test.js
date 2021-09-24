const request = require('supertest');
const { Rental } = require('../../../models/rental');
const { User } = require('../../../models/user');
const mongoose = require('mongoose');
const { Genre } = require('../../../models/genre');
const { Customer } = require('../../../models/customer');
const { Movie } = require('../../../models/movie');

let server;

describe('/api/rentals', () => {
    beforeEach(() => { 
        server = require('../../../index');
    });

    afterEach(async () => {
        await server.close();
        await Rental.deleteMany({});
        await Genre.deleteMany({});
        await Customer.deleteMany({});
        await Movie.deleteMany({});
    });

    describe("GET /", () => {

        it("should return all rental", async () => {
            token = new User().generateAuthToken();
            customerId = mongoose.Types.ObjectId();
            movieId = mongoose.Types.ObjectId();
            
            let genre = new Genre({ name: "Action" })
            genre = await genre.save()

            movie = new Movie({
                _id: movieId,
                title: "12345",
                dailyRentalRate: 2,
                genre: { name: genre.name },
                numberInStock: 10
            })
            movie = await movie.save();

            let customer = new Customer({
                _id: customerId,
                name: "customer 1",
                phone: "12345678910",
                isGold: true
            })
            customer = await customer.save()

            let rental = new Rental({
                customer: {
                    _id: customer._id, name: "12345", phone: "12345678910", isGold: true
                },
                movie: {
                    _id: movie._id, title: "12345", dailyRentalRate: 2
                }
            });
            rental = await rental.save()

            const res = await request(server).get('/api/rentals').set('x-auth-token', token);
            expect(res.status).toBe(200);
            expect(res.body.some(c => c.movie.title === '12345')).toBeTruthy();
            expect(res.body.length).toBe(1);
        });
    });

    describe("GET /:id", () => {

        it("should return 401 if client is not logged in", async () => {
            token = ""
            id = 1
            const res = await request(server).get('/api/rentals/' + id).set('x-auth-token', token);

            expect(res.status).toBe(401);
        });

        it("should return 404 if rentalid isInvalid", async () => {
            token = new User().generateAuthToken();

            const id = new mongoose.Types.ObjectId()
            const res = await request(server).get('/api/rentals/' + id).set('x-auth-token', token);

            expect(res.status).toBe(404);
        });

        it("should return a rental if valid id is passed", async () => {
            customerId = mongoose.Types.ObjectId();
            movieId = mongoose.Types.ObjectId();
            
            let genre = new Genre({ name: "Action" })
            genre = await genre.save()

            movie = new Movie({
                _id: movieId,
                title: "12345",
                dailyRentalRate: 2,
                genre: { name: genre.name },
                numberInStock: 10
            })
            movie = await movie.save();

            let customer = new Customer({
                _id: customerId,
                name: "customer 1",
                phone: "12345678910",
                isGold: true
            })
            customer = await customer.save()

            let rental = new Rental({
                customer: {
                    _id: customer._id, name: "12345", phone: "12345678910", isGold: true
                },
                movie: {
                    _id: movie._id, title: "12345", dailyRentalRate: 2
                }
            });
            rental = await rental.save()

            const res = await request(server).get('/api/rentals/' + rental._id).set('x-auth-token', token);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('customer.name');
            expect(res.body).toHaveProperty('customer.phone');
            expect(res.body).toHaveProperty('movie.title');
            expect(res.body).toHaveProperty('movie.dailyRentalRate');
        });
    });

    describe("POST /", () => {
        let token;
        let customerId;
        let movieId;

        beforeEach(async () => {
            customerId = mongoose.Types.ObjectId();
            movieId = mongoose.Types.ObjectId();
            
            let genre = new Genre({ name: "Action" })
            genre = await genre.save()

            movie = new Movie({
                _id: movieId,
                title: "12345",
                dailyRentalRate: 2,
                genre: { name: genre.name },
                numberInStock: 10
            })
            movie = await movie.save();

            let customer = new Customer({
                _id: customerId,
                name: "customer 1",
                phone: "12345678910",
                isGold: true
            })
            customer = await customer.save()

            token = new User().generateAuthToken();
        });
        
        afterEach(async () => {
            await Rental.deleteMany({});
            await Genre.deleteMany({});
            await Movie.deleteMany({});
            await Customer.deleteMany({});
        })

        const exec = () => {
            return request(server).post('/api/rentals').set('x-auth-token', token).send({ movieId, customerId });
        };
        
        it("should return 401 if client is not logged in", async () => {
            token = ""
            const res = await exec();

            expect(res.status).toBe(401);
        });

        it("should return 400 if customer id is invalid", async () => {
            customerId = 1;
            const res = await exec();

            expect(res.status).toBe(400);
        });

        it("should return 400 if movie id is invalid", async () => {
            movieId = 1;
            const res = await exec();

            expect(res.status).toBe(400);
        });

        it("should return 400 if customer is not available", async () => {
            customerId = mongoose.Types.ObjectId();
            const res = await exec();

            expect(res.status).toBe(400);
        });

        it("should return 400 if movie is not available in db", async () => {
            movieId = mongoose.Types.ObjectId();
            const res = await exec();

            expect(res.status).toBe(400);
        });

        it("should return 404 if movie is out of stock", async () => {
            let genre = new Genre({ name: "Action" })
            genre = await genre.save()
            
            movieId = mongoose.Types.ObjectId()
            movie = new Movie({
                _id: movieId,
                title: "12345",
                dailyRentalRate: 2,
                genre: { name: genre.name },
                numberInStock: 0
            })
            movie = await movie.save();

            const res = await exec();
            expect(res.status).toBe(400);
        });

        it("should save the rental if it is valid", async () => {
            const res = await exec();
            let rental = await Rental.findById(res.body._id);

            expect(res.status).toBe(200);

            expect(rental).not.toBeNull();
        });

        it("should return the rental if it is valid", async () => {
            const res = await exec();

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('customer');
            expect(res.body).toHaveProperty('movie');
        });

    });

    describe('DELETE /:id', () => {
        let id;

        beforeEach(() => {
            token = new User().generateAuthToken();

        });
        
        afterEach(async () => {
            await Rental.deleteMany({});
        })

        const exec = () => {
            return request(server).delete('/api/rentals/'+id).set('x-auth-token', token).send();
        };

        it("should return 404 if invalid id is given", async () => {
            id = 1
            const res = await exec();

            expect(res.status).toBe(404);

        });
        it("should return 404 if rental with given id doesn't exist", async () => {
            id = mongoose.Types.ObjectId();
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it("should return 200 if rental is deleted", async () => {
            
            let genre = new Genre({ name: "Action" })
            genre = await genre.save()

            movie = new Movie({
                _id: movieId,
                title: "12345",
                dailyRentalRate: 2,
                genre: { name: genre.name },
                numberInStock: 10
            })
            movie = await movie.save();

            let customer = new Customer({
                _id: customerId,
                name: "customer 1",
                phone: "12345678910",
                isGold: true
            })
            customer = await customer.save()

            rental = new Rental({
                customer: {
                    _id: customer._id, name: "12345", phone: "12345678910", isGold: true
                },
                movie: {
                    _id: movie._id, title: "12345", dailyRentalRate: 2
                }
            });
            rental = await rental.save()

            id = rental._id
            const res = await exec();

            expect(res.status).toBe(200);
        });
    });
});
