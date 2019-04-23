const express = require('express')
const router = express.Router();

router.get('/', (req, res) => {res.render('status', {table: req.app.get('jobs')})})

module.exports = router