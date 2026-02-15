const express = require('express');
const router = express.Router();
const Sleep = require('../models/notSleep'); // adjust path

router.get('/', async (req, res) => {
    try {
        const data = await Sleep.find();
        console.log(data)// fetch all documents
        res.json(data); // send as response
    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = router;
