const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
    const { username } = request.headers;

    const userSearched = users.find( element => {
        return element.username === username;
    } );

    if (!userSearched) {
        return response.status(404).json(
            {
                error: "Usuário não encontrado."
            }
        );
    }

    request.userSearched = userSearched;

    return next();
}

app.post('/users', (request, response) => {
    const { name, username } = request.body;

    const userSearched = users.find( element => {
        return element.username === username;
    } );

    if (userSearched) {
        return response.status(400).json(
            {
                error: "O username já está cadastrado."
            }
        );
    }

    const newUser = {
        id: uuidv4(),
        name,
        username,
        todos: []
    };

    users.push(newUser);

    return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
    const { userSearched } = request;

    return response.send(userSearched.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
    const { title, deadline } = request.body;
    const { userSearched } = request;

    const newTodo = {
        id: uuidv4(),
        title,
        done: false,
        deadline: new Date(deadline),
        created_at: new Date()
    };

    userSearched.todos.push(newTodo);

    return response.status(201).send(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
    const { id } = request.params;
    const { title, deadline } = request.body;
    const { userSearched } = request;

    const todoSearched = userSearched.todos.find( element => {
        return element.id === id;
    } );

    if(!todoSearched) {
        return response.status(404).json(
            {
                error: "O todo não foi encontrado."
            }
        );
    }

    todoSearched.title = title;
    todoSearched.deadline =new Date(deadline);

    return response.send(todoSearched);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
    const { userSearched } = request;
    const { id } = request.params;

    const todoSearched = userSearched.todos.find( element => {
        return element.id === id;
    } );

    if(!todoSearched) {
        return response.status(404).json(
            {
                error: "O todo não foi encontrado."
            }
        );
    }

    todoSearched.done = true;

    return response.send(todoSearched);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
    const { userSearched } = request;
    const { id } = request.params;

    const todoSearched = userSearched.todos.find( element => {
        return element.id === id;
    } );

    const todoSearchedIndex = userSearched.todos.findIndex( element => {
        return element.id === id;
    } );
    /* const todoSearchedIndex = userSearched.todos.findIndex( element => {
        return element.id === id;
    } ); */

    if(!todoSearched) {
        return response.status(404).json(
            {
                error: "O todo não foi encontrado."
            }
        );
    }
    /* if(todoSearchedIndex === -1) {
        return response.status(404).json(
            {
                error: "O todo não foi encontrado."
            }
        );
    } */

    userSearched.todos.splice(todoSearchedIndex, 1);

    return response.status(204);
});

module.exports = app;