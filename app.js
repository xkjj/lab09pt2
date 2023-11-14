const express = require('express');
const app = express();
const mysql = require('mysql2');
const cookieParser = require('cookie-parser');
const sessions = require('express-session');
const oneHour = 1000 * 60 * 60 * 1;

app.use(cookieParser());
app.use(sessions({
    secret: "myshows14385899",
    saveUninitialized: true,
    cookie: { maxAge: oneHour },
    resave: false
}));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');


const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'kjarosz02',  //change to your DB name
    port: '3306'
});


db.connect((err) => {
    if (err) throw err;
});


app.get('/', (req, res) => {

    res.render('login');

});


app.post('/', (req, res) => {
    const useremail = req.body.emailField;

    const checkuser = `SELECT * FROM my_users WHERE email = "${useremail}" `;

    db.query(checkuser, (err, rows) => {
        if (err) throw err;
        const numRows = rows.length;

        if (numRows > 0) {
            const sessionobj = req.session;
            sessionobj.authen = rows[0].id;
            res.redirect('/dashboard');
        } else {
            res.redirect('/');
        }

    });
});


app.get('/shows', (req, res) => {

    const showsql = `SELECT * FROM my_shows LIMIT 6`;

    db.query(showsql, (err, rows1) => {
        if (err) throw err;
        const actorsql = `SELECT * FROM my_actors ORDER BY actorname DESC LIMIT 4`;

        db.query(actorsql, (err2, rows2) => {
            if (err) throw err2;
            res.render('tv', { shows: rows1, actors: rows2 });

        });
    });
});


app.get('/dashboard', (req, res) => {
    const sessionobj = req.session;
    if (sessionobj.authen) {
        const uid = sessionobj.authen;
        const user = `SELECT * FROM my_users WHERE id = "${uid}" `;
        
        db.query(user, (err, row)=>{ 
            const firstrow = row[0];
            res.render('dashboard', {userdata:firstrow});
        });
    } else {
        res.send("denied");
    }
});


app.listen(3000, () => {
    console.log('Server on port 3000');
});