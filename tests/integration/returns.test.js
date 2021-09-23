const request = require('supertest');
const { Rental } = require('../../models/rental');
const { User } = require('../../models/user');
const mongoose = require('mongoose');
const moment = require('moment');
const { Movie } = require('../../models/movie');

let server;

describe("/api/return", () => {
    let customerId;
    let movieId;
    let rental;
    let token;

    beforeEach(async () => { 
        server = require('../../index');
    
        customerId = mongoose.Types.ObjectId().toHexString();
        movieId = mongoose.Types.ObjectId().toHexString();

        movie = new Movie({
            _id: movieId,
            title: "12345",
            dailyRentalRate: 2,
            genre: {name: "12345"},
            numberInStock: 10
        })
        await movie.save();

        rental = new Rental({
            customer: {
                _id: customerId, name: "12345", phone: "12345", isGold: true
            },
            movie: {
                _id: movieId, title: "12345", dailyRentalRate: 2
            }
        });
        await rental.save();


        token = new User().generateAuthToken();

    });
    afterEach(async () => { 
        await server.close();
        await Rental.deleteMany();
        await Movie.deleteMany();
    });

    const exec = async () => {
        return request(server).post('/api/return').set('x-auth-token', token).send({ customerId: customerId, movieId: movieId})
    }

    it("should return 401 if client is not logged in", async () => {
        token = ""
        const res = await exec();

        expect(res.status).toBe(401);
        // const result = await Rental.findById(rental.id);
        // expect(result).not.toBeNull();
    });

    it("should return 400 if customerId is not provided", async () => {
        customerId = ""
        const res = await exec();

        expect(res.status).toBe(400);
    });

    it("should return 400 if movieId is not provided", async () => {
        movieId = ""
        const res = await exec();

        expect(res.status).toBe(400);
    });

    it("should return 404 if no rental found for customer/movie", async () => {
        await Rental.deleteMany();

        const res = await exec();

        expect(res.status).toBe(404);
    });

    it("should return 400 if return is already proccessed", async () => {
        rental.dateReturned = new Date();
        await rental.save();

        const res = await exec();

        expect(res.status).toBe(400);
    });

    it("should return 200 if return is valid request", async () => {
        const res = await exec();

        expect(res.status).toBe(200);
    });

    it("should set the returnDate if input is valid", async () => {
        const res = await exec();
        const rentalInDb = await Rental.findById(rental._id);

        const diff = new Date() - rentalInDb.dateReturned

        expect(diff).toBeLessThan(10 * 1000);
    });

    it("should set the calculate rentalFee if input is valid", async () => {
        
        rental.dateOut = moment().add(-7, 'days').toDate();
        await rental.save()

        const res = await exec();
        const rentalInDb = await Rental.findById(rental._id);

        expect(rentalInDb.rentalFee).toBeDefined();
    });

    it("should increase the movie stock if input is valid", async () => {
        
        const res = await exec();
        
        const movieInDb = await Movie.findById(movieId);

        expect(movieInDb.numberInStock).toBe(movie.numberInStock + 1);
    });

    it("should return rental if input is valid", async () => {
        
        const res = await exec();
        const rentalInDb = await Rental.findById(rental._id);

        expect(Object.keys(res.body)).toEqual(expect.arrayContaining(['dateOut', 'dateReturned', 'customer', 'movie', 'rentalFee']));

    });

});
