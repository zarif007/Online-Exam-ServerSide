const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const mysql = require('mysql');

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    user: process.env.DB_USER,
    host: 'localhost',
    password: process.env.DB_PASS,
    database: 'hail_online',
});


const port = process.env.PORT || 5000;



app.listen(port, () => {
    console.log('ok!')
})