const express = require('express');
const Joi = require('joi');

const app = express();

app.use(express.json());

const genres = [
    { id: 1, name: 'pop'},
    { id: 2, name: 'hip'},
    { id: 3, name: 'rap'},
    { id: 4, name: 'lofi'},
    { id: 5, name: 'culture'}
]

app.get('/api/genres/', (req, res) => {
    res.send(genres);
});

app.get('/api/genres/:id', (req, res) => {
    const genre = genres.find((c) => { return c.id === parseInt(req.params.id) });
    if (!genre) return res.send(404, "Not found")

    res.send(genre);
});

app.post('/api/genres', (req, res) => {
    const { error } = validateGenres(req.body);
    if (error) {
        res.send(400, error);
        console.log(error);
        return;
    }
    const genre = {id : genres.length + 1, name: req.body.name}
    genres.push(genre);
    return res.send(genre);

});

app.put('/api/genres/:id', (req, res) => {
    let genre = genres.find((c) => { return c.id === parseInt(req.params.id) });
    if (!genre) return res.send(404, "Not found")
    
    const { error } = validateGenres(req.body);
    if (error) {
        res.send(400, error);
        console.log(error);
        return;
    }

    genre.name = req.body.name
    return res.send(genre);

})

app.delete('/api/genres/:id', (req, res) => {
    let genre = genres.find((c) => { return c.id === parseInt(req.params.id) });
    if (!genre) return res.send(404, "Not found")

    const index = genres.indexOf(genre);
    genres.splice(index, 1)
    return res.send(genre);
});

function validateGenres(genre){
    const schema = Joi.object({
        name: Joi.string().min(3).required()
    });
    return schema.validate(genre);
};

const port = process.env.PORT || 3000;
app.listen(port, () => { console.log("Server listening request on port 3000...") })
