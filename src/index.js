const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find(user => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found!" });
  }
  request.user = user;
  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  const userExists = users.find(user => user.username === username);

  if (userExists) {
    return response.status(400).json({ error: "User already exists!" });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };
  
  users.push(user);
  
  return response.status(201).json(user);  
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const userTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(userTodo);
  return response.status(201).json(userTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;
  const { user } = request;

  const userTodo = user.todos.find(userTodo => userTodo.id === id);

  if (!userTodo) {
    return response.status(404).json({error: "Todo not found!"})
  }

  userTodo.title = title;
  userTodo.deadline = deadline;
  return response.status(201).json(userTodo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const userTodo = user.todos.find(userTodo => userTodo.id === id);

  if (!userTodo) {
    return response.status(404).json({ error: "To-do not found!" });
  }

  userTodo.done = true;
  return response.status(200).json(userTodo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoIndex = user.todos.findIndex(userTodo => userTodo.id === id);

  if (!user.todos[todoIndex]) {
    return response.status(404).json({ error: "To-do not found!" });
  }
  
  user.todos.splice(todoIndex, 1)
  return response.status(204).json(user.todos[todoIndex]);
});

module.exports = app;