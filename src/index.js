const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const usuario = users.find(user => user.username === username);
  
  if (!usuario) {
    return response.status(404).json({Erro: "usuario não existe"});
  }

  request.usuario = usuario;

  return next()

}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const userAlreadyExist = users.some((user) => user.username === username);
    
  if (userAlreadyExist) {
    return response.status(400).json({Error: 'Username already exists'});
    };

    const user ={
      id: uuidv4(),
      name,
      username,
      todos: []
    }
    users.push(user)

    return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {

  const { usuario } = request

  return response.json(usuario.todos)
  
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { usuario } = request
  const { title, deadline } = request.body

  const tarefa = {
      id: uuidv4(),
	    title,
	    done: false, 
	    deadline: new Date(deadline), 
	    created_at: new Date()
     }

  usuario.todos.push(tarefa)

  return response.status(201).json(tarefa)
  
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { usuario } = request
  const { id } = request.params
  const { title, deadline } = request.body

  const todo = usuario.todos.find(todo => todo.id === id)

  if (!todo) {
    return response.status(404).json({Error: "todo not found"})
  }

  todo.title = title
  todo.deadline = new Date(deadline)

  return response.json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { usuario } = request
  const { id } = request.params

  const todo = usuario.todos.find(todo => todo.id === id)
  
  if (!todo) {
    return response.status(404).json({Erro: "tarefa não existe"})
  }
  todo.done = true

  return response.json(todo)

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { usuario } = request
  const { id } = request.params

  const todo = usuario.todos.findIndex(todo => todo.id === id)

  if(todo === -1) {
    return response.status(404).json({Erro:"Id não encontrado"})
  }

  usuario.todos.splice(todo, 1)

  return response.status(204).json()

});

module.exports = app;
