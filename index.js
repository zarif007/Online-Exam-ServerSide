const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const mysql = require('mysql');

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connecting to MySQL database
const db = mysql.createConnection({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE,
});

app.get('/', (req, res) => {
    res.send('les go')
})

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

// Getting exam where user is author
app.get('/examcreatedbyuser/:author', (req, res) => {
    const author = req.params.author;

    db.query(
        `SELECT * from exams WHERE author="${author}"`,
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
app.get('/questions/:examId', (req, res) => {
    const exam_id = req.params.examId;

    db.query(
        `SELECT * from questions WHERE exam_id="${exam_id}"`,
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

// Getting responses of a specific question
app.get('/responses/:quesId', (req, res) => {
    
    const ques_id = req.params.quesId;

    db.query(
        `SELECT * from response WHERE ques_id="${ques_id}"`,
        (err, result) => {
            if(err)
                console.log(err);
            else 
                res.send(result);
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
    const {currect_answer, total_ques, date, exam_name} = req.body;

    let shouldInsert = true;

    db.query(
        `SELECT * from participation WHERE exam_id="${exam_id}" AND user_id="${user_id}"`,
        (err, result) => {
            if(err)
                console.log(err);
            else {
                if(result.length === 0){
                    db.query(
                        "INSERT INTO participation (exam_id, exam_name, user_id, currect_answer, total_ques, date) VALUES(?,?,?,?,?,?)",
                        [exam_id, exam_name, user_id, currect_answer, total_ques, date],
                        (err, result) => {
                            if(err)
                                console.log(err);
                            else 
                                console.log(result);
                        }
                    )
                } else {
                    db.query(
                        `UPDATE participation SET exam_id="${exam_id}", user_id="${user_id}", currect_answer="${currect_answer}", 
                        total_ques="${total_ques}", date="${date}", exam_name="${exam_name}" WHERE exam_id="${exam_id}" AND user_id="${user_id}"`,
                        (err, result) => {
                            if(err)
                                console.log(err);
                            else 
                                console.log(result);
                        }
                    )
                }
            }
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

// Getting all participations in a specific exam
app.get('/participate/:exam_id', (req, res) => {

    const exam_id = req.params.exam_id;

    db.query(
        `SELECT * from participation WHERE exam_id="${exam_id}"`,
        (err, result) => {
            if(err)
                console.log(err);
            else 
                res.send(result);
        }
    )
});

// Getting all exams of a specific user
app.get('/participatedbyuser/:user_id', (req, res) => {

    const user_id = req.params.user_id;

    db.query(
        `SELECT * from participation WHERE user_id="${user_id}"`,
        (err, result) => {
            if(err)
                console.log(err);
            else {
                res.send(result);
            }
             
        }
    ) 
});

// Updating a question
app.patch('/updatequestion', (req, res) => {

    const {exam_id, ques_id, question, option1, option2, option3, option4, answer} = req.body;

    db.query(
        `UPDATE questions SET question="${question}", option1="${option1}", option2="${option2}", 
        option3="${option3}", option4="${option4}", answer="${answer}" WHERE ques_id="${ques_id}"`,
        (err, result) => {
            if(err)
                console.log(err);
            else {
                db.query(
                    `UPDATE response SET answer="${answer}" WHERE ques_id="${ques_id}"`,
                    (err, result) => {
                        if(err)
                            console.log(err);
                        else 
                            res.send(result);
                    }
                )
            }
        }
    )
});

// Deleting a question
app.delete('/deletequestion/:ques_id', (req, res) => {

    const ques_id = req.params.ques_id;
    console.log(ques_id)

    db.query(
        `DELETE questions, response from questions inner join response on 
        questions.ques_id = response.ques_id WHERE questions.ques_id="${ques_id}"`,
        (err, result) => {
            if(err)
                console.log(err);
            else 
                res.send(result);
        }
    )
});





app.listen(process.env.PORT || 5000, () => {
    console.log('ok!')
})