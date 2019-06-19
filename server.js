'use strict'

// Application Dependencies
const express = require('express');
const pg = require('pg');

// Environment variables
require('dotenv').config();

// Application Setup
const app = express();
const PORT = process.env.PORT || 3000;

// Express middleware

// Utilize ExpressJS functionality to parse the body of the request
app.use(express.urlencoded({extended: true}));

// Specify a directory for static resources
app.use(express.static('./public'));

// Database Setup
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

// Set the view engine for server-side templating
app.set('view engine', 'ejs');

// API Routes
app.get('/', (req, res) => {
  let SQL = `SELECT * FROM tasks`;
  return client.query(SQL)
  .then(results =>{    
    res.render('index', {results: results.rows})
  })

});

app.get('/add', showForm);

app.post('/add', addTask);

// go to a page that shows all the details of one task
app.get('/tasks/:tasks_id_banana', getOneTask);


app.get('*', (req, res) => res.status(404).send('This route does not exist'));


//set server to listen
app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));


// HELPER FUNCTIONS

function getOneTask(request, response){
  console.log('params ', request.params);

  let SQL = `SELECT * FROM tasks where id=${request.params.tasks_id_banana}`

  return client.query(SQL)
  .then(results=>{
    let tasks = results.rows[0]
    response.render('pages/detail-view', {task: results.rows[0]});
  })

}

function showForm(request, response) {
  response.render('pages/add-view');
}

function addTask(request, response) {
  console.log('request body', request.body);

  let {title, description, category, contact, status} = request.body;

  let SQL = 'INSERT INTO tasks (title, description, category, contact, status) VALUES ($1, $2, $3, $4, $5);';
  let values = [title, description, category, contact, status];

  return client.query(SQL, values)
    .then(response.redirect('/'))
    .catch(err => handleError(err, response));
}

function handleError(error, response) {
  response.render('pages/error-view', {error: `Uh Oh, ${error}` });
}
