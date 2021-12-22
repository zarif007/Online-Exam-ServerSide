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
    const {author, exam_id, name, subject, assign_date, last_date} = req.body;

    db.query(
        "INSERT INTO exams (author, exam_id, name, subject, assign_date, last_date) VALUES(?,?,?,?,?,?)",
        [author, exam_id, name, subject, assign_date, last_date],
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

// Getting Questions
app.get('/questions/:id', (req, res) => {
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
});

// Storing user's response
app.post('/response', (req, res) => {

    const { exam_id, ques_id, user_id, answer, userAnswer } = req.body;

    db.query(
        "INSERT INTO response (exam_id, ques_id, user_id, answer, userAnswer) VALUES(?,?,?,?,?)",
        [exam_id, ques_id, user_id, answer, userAnswer],
        (err, result) => {
            if(err)
                console.log(err);
            else 
                console.log('inserted');
        }
    )
});

// Getting ques based user's response
app.get('/questions/:quesId/:userId', (req, res) => {
    
    const ques_id = req.params.quesId, user_id = req.params.userId;

    db.query(
        `SELECT * from response WHERE ques_id="${ques_id}" AND user_id="${user_id}"`,
        (err, result) => {
            if(err)
                console.log(err);
            else 
                res.send(result);
        }
    )
});

// Getting user's grade
app.get('/grades/:exam_id/:user_id', (req, res) => {

    const exam_id = req.params.exam_id, user_id = req.params.user_id;

    let data = {};

    db.query(
        `SELECT * from exams WHERE exam_id="${exam_id}"`,
        (err, result) => {
            if(err)
                console.log(err);
            else {
                data = {
                    name: result[0].name,
                    subject: result[0].subject,
                    author: result[0].author,
                }

                db.query(
                    `SELECT * from questions WHERE exam_id="${exam_id}"`,
                    (err, result) => {
                        if(err)
                            console.log(err);
                        else {
                            let total_ques = result.length, currect_answer = 0;
                            
                            db.query(
                                `SELECT * from response WHERE exam_id="${exam_id}" AND user_id="${user_id}"`,
                                (err, result) => {
                                    if(err)
                                        console.log(err);
                                    else {
                                        data.total_ques = total_ques;
                                        result.map(res => currect_answer += res.answer === res.userAnswer);
                                        
                                        data.currect_answer = currect_answer;

                                        res.send(data);
                                    }
                                }
                            )
                        }
                    }
                );
            }
        }
    );
});

// Storing user's participation
app.post('/participate/:exam_id/:user_id', (req, res) => {

    const exam_id = req.params.exam_id, user_id = req.params.user_id;

    db.query(
        "INSERT INTO participation (exam_id, user_id) VALUES(?,?)",
        [exam_id, user_id],
        (err, result) => {
            if(err)
                console.log(err);
            else 
                console.log('inserted!!');
        }
    )
});

// Getting user's participation in a specific exam
app.get('/participate/:exam_id/:user_id', (req, res) => {

    const exam_id = req.params.exam_id, user_id = req.params.user_id;

    db.query(
        `SELECT * from participation WHERE exam_id="${exam_id}" AND user_id="${user_id}"`,
        (err, result) => {
            if(err)
                console.log(err);
            else 
                res.send(result);
        }
    )
});





app.listen(port, () => {
    console.log('ok!')
})