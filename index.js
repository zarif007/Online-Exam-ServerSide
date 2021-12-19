const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const mysql = require('mysql2');

app.use(cors());
app.use(express.json());


// Connecting to MySQL database
const db = mysql.createConnection({
    user: process.env.DB_USER,
    host: 'localhost',
    password: process.env.DB_PASS,
    database: 'hail_online',
});


const port = process.env.PORT || 5000;


// Storing Exam info
app.post('/makeexam', (req, res) => {
    const {exam_id, name, subject, assign_date, last_date} = req.body;

    db.query(
        "INSERT INTO exams (exam_id, name, subject, assign_date, last_date) VALUES(?,?,?,?,?)",
        [exam_id, name, subject, assign_date, last_date],
        (err, result) => {
            if(err)
                console.log(err);
            else 
                res.send('Values Inserted')
        }
    )
});

// Getting exam info
app.get('/exam/:id', (req, res) => {
    const id = req.params.id;

    db.query(
        `SELECT * from exams WHERE exam_id="${id}"`,
        (err, result) => {
            if(err)
                console.log(err);
            else 
                res.send(result);
        }
    )
});

// Storing Questions
app.post('/addquestion', (req, res) => {

    const {exam_id, ques_id, question, option1, option2, option3, option4, answer} = req.body;

    db.query(
        "INSERT INTO questions (exam_id, ques_id, question, option1, option2, option3, option4, answer) VALUES(?,?,?,?,?,?,?,?)",
        [exam_id, ques_id, question, option1, option2, option3, option4, answer],
        (err, result) => {
            if(err)
                console.log(err);
            else 
                res.send('Values Inserted')
        }
    )
});

// Getting Question
app.get('/question/:id', (req, res) => {
    const id = req.params.id;

    db.query(
        `SELECT * from questions WHERE exam_id="${id}"`,
        (err, result) => {
            if(err)
                console.log(err);
            else 
                res.send(result);
        }
    )
})




app.listen(port, () => {
    console.log('ok!')
})