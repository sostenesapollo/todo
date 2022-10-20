const express = require('express');
const { REGEX_DATE } = require('./constants');
const { v4: generateId } = require('uuid');
const database = require('./database');
const {todayDate} = require('./util')

const app = express();

function requestLogger(req, res, next) {
  res.once('finish', () => {
    const log = [req.method, req.path];
    if (req.body && Object.keys(req.body).length > 0) {
      log.push(JSON.stringify(req.body));
    }
    if (req.query && Object.keys(req.query).length > 0) {
      log.push(JSON.stringify(req.query));
    }
    log.push('->', res.statusCode);
    // eslint-disable-next-line no-console
    console.log(log.join(' '));
  });
  next();
}

app.use(requestLogger);
app.use(require('cors')());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', async (req, res) => {
  let {offset, skip, due_today} = req.query

  offset = parseInt(offset)
  skip   = parseInt(skip)
  due_today = due_today === 'true'

  let filter = {}

  if(due_today) {
    filter['due_date'] = todayDate()
  }

  console.log(filter);

  const todos = database.client.db('todos').collection('todos');
  const todosList = await todos.find(filter).skip(skip).limit(offset).toArray();
  res.status(200);
  res.json({todosList});
});

app.post('/', async (req, res) => {
  const { text, due_date } = req.body;

  if (typeof text !== 'string') {
    res.status(400);
    res.json({ message: "invalid 'text' expected string." });
    return;
  }

  if(text.trim() === '') {
    res.status(400);
    res.json({ message: "Todo message should not be empty." });
    return;
  }

  if(text.length > 40) {
    res.status(400);
    res.json({ message: "Message max length is 40 characters." });
    return;
  }

  if(!REGEX_DATE.test(due_date)) {
    res.status(400);
    res.json({ message: "invalid 'due_date' expected format YYYY-MM-DD." });
    return;
  }

  const todo = { id: generateId(), text, completed: false, due_date };
  await database.client.db('todos').collection('todos').insertOne(todo);
  res.status(201);
  res.json(todo);
});

app.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;

  if (typeof completed !== 'boolean') {
    res.status(400);
    res.json({ message: "invalid 'completed' expected boolean" });
    return;
  }

  const result = await database.client.db('todos').collection('todos').updateOne(
    { id },
    { $set: { completed } },
  );
  console.log(result);
  res.status(200);
  res.end();
});

app.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await database.client.db('todos').collection('todos').deleteOne({ id });
  res.status(203);
  res.end();
});

module.exports = app;
