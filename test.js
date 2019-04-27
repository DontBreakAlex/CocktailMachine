const axios = require('axios');

axios({
    url: 'http://127.0.0.1:3000/settings/testvar',
    method: 'PUT',
    data: {setting: 'testvar', value: 'value' }
})