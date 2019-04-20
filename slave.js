const axios = require('axios');

axios({
    url: 'http://127.0.0.1:3000/job',
    method: 'PUT',
    data: {uuid: '1111111111'}
}).catch(err => console.log(err))