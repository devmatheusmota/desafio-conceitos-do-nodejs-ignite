const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksIfUserAccountExists(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(400).json({
      status: "error",
      error: "User not found!",
    });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userExists = users.find((user) => user.username === username);

  if (userExists) {
    return response.status(400).json({
      status: "error",
      error: "User already exists!",
    });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).send(user);
});

app.get("/todos", checksIfUserAccountExists, (request, response) => {
  const { user } = request;

  return response.status(200).send(user.todos);
});

app.post("/todos", checksIfUserAccountExists, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);

  return response.status(201).send(todo);
});

app.put("/todos/:id", checksIfUserAccountExists, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const { title, deadline } = request.body;

  const todoIndex = user.todos.findIndex((todo) => todo.id === id);

  if (todoIndex === -1) {
    return response.status(404).json({
      status: "error",
      error: "Todo not found!",
    });
  }

  user.todos[todoIndex] = {
    ...user.todos[todoIndex],
    title,
    deadline: new Date(deadline),
  };

  return response.status(200).send(user.todos[todoIndex]);
});

app.patch("/todos/:id/done", checksIfUserAccountExists, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todoIndex = user.todos.findIndex((todo) => todo.id === id);

  if (todoIndex === -1) {
    return response.status(404).json({
      status: "error",
      error: "Todo not found!",
    });
  }

  user.todos[todoIndex] = {
    ...user.todos[todoIndex],
    done: true,
  };

  return response.status(200).send(user.todos[todoIndex]);
});

app.delete("/todos/:id", checksIfUserAccountExists, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todoIndex = user.todos.findIndex((todo) => todo.id === id);

  if (todoIndex === -1) {
    return response.status(404).json({
      status: "error",
      error: "Todo not found!",
    });
  }

  user.todos.splice(todoIndex, 1);

  return response.status(204).send();
});

module.exports = app;
