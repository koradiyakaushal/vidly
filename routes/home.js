const express = require('express');
const router = express.Router()

router.get('/', (req, res) => {
    res.render('index.pug', {title: "vidly", message: "hello"});
});

module.exports = router;
