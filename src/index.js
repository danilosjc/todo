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
    return response.status(404).json({Erro: "usuario não existe"})
  }

  request.usuario = usuario;

  return next()

}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const userAlreadyExist = users.some(
    (user) => user.username === username);
    
    if (userAlreadyExist) {
      return response.status(400).json(
        {Erro: "Usuário já cadastrado"})
    };

    users.push({
      id: uuidv4(),
      name,
      username,
      todo: []
    });

    return response.json(users);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {

  const { usuario } = request

  return response.json(usuario.todo)
  
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

  usuario.todo.push(tarefa)

  return response.json(usuario.todo)
  
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  
  const { usuario } = request
  
  const { id } = request.params
 
  const { title, deadline } = request.body

  const item = usuario.todo.find(item => item.id === id)

  if (!item)
    return response.status(404).json({Erro: "tarefa não existe"})

  item.title = title
  item.deadline = deadline

  return response.status(201).send()
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  
  const { usuario } = request

  const { id } = request.params

  const item = usuario.todo.find(item => item.id === id)

  if(!item)
    return response.status(404).json({Erro: "tarefa não existe"})

  item.done = true

  console.log("item", item.done)

  return response.status(201).send()

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  
  const { usuario } = request

  const { id } = request.params

  const index = usuario.todo.findIndex(todo => todo.id === id)

  if(index == -1)
    return response.status(404).json({Erro:"Id não encontrado"})

  usuario.todo.splice(index, 1)

  return response.status(200).json(users)

});

module.exports = app;
app.listen(3000);