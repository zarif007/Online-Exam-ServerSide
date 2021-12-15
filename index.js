const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');


const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log('ok!')
})