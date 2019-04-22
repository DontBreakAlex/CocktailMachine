const axios = require('axios');



axios({
    url: 'http://127.0.0.1:3000/job',
    method: 'GET',
}).catch(err => console.log(err)).then(response=> {
    axios({
    url: 'http://127.0.0.1:3000/job',
    method: 'PUT',
    data: {uuid: response.data[1]}
}).catch(err => console.log(err))
})