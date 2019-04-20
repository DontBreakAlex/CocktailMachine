const express = require('express');
const router = express.Router();
const uuidv4 = require('uuid/v4');

router.get('/job', (req, res) => { //This may break if 2 workers ask for a job at the same time
    let jobs = req.app.get('jobs'), uuid = uuidv4();
    for (let i=0, len=jobs.length; i<len; ++i) {
        if (jobs[i][1] == 'waiting') {
            jobs[i][1] = 'distributed';
            jobs[i][2] = uuid;
            console.log(jobs)
            res.send([jobs[i][0], uuid]);
            return 1;
        }
    }
    res.status(500).send('No more jobs !');
});

router.put('/job', (req, res) => {
    console.log(req.body)
    res.send('ok')
})

module.exports = router