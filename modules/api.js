const express = require('express');
const router = express.Router();
const uuidv4 = require('uuid/v4');

router.get('/job', (req, res) => { //This may break if 2 workers ask for a job at the same time
    let jobs = req.app.get('jobs'), uuid = uuidv4();
    for (let i=0, len=jobs.length; i<len; ++i) {
        if (jobs[i][1] == 'waiting') {
            jobs[i][1] = 'distributed';
            jobs[i][2] = uuid;
            req.app.set('jobs', jobs);
            console.log(jobs)
            res.send([jobs[i][0], uuid]);
            return 1;
        }
    }
    res.status(500).send('No more jobs !');
});

router.put('/job', (req, res) => { //Again, if two workers validate jobs at the same time, one may not be set as completed
    let jobs = req.app.get('jobs');
    for (let i=0, len=jobs.length; i<len; ++i) {
        if (jobs[i][2] == req.body.uuid) {
            jobs[i][1] = 'completed';
            req.app.set('jobs', jobs);
            console.log(jobs)
            console.log(`${jobs[i][0]} has been transcoded`);
            res.status(200).send('ok');
            return 1;
        }
    }
    res.status(500).send('Invalid job')
})

module.exports = router