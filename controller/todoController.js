const ToModel = require('../model/todoModel');
const UsersModel = require("../model/todoRegisterModel")
const mongoose = require('mongoose');


//saving or adding a todo to the mongodb server /database
const addTodo = async (req, res) => {
    try {
        const { id } = req.params;
        const { todo } = req.body;

        const data = {
            todo,
            user: id

        }
        //destructuring the id so we dont type it
        const newData = { ...data, user: id }

        const dataToStore = await new ToModel(newData);

        //addng todo to todomodel
        const saveData = await dataToStore.save();

        //fetching the user
        const fetchUser = await UsersModel.findById(id)

        //pushing the todos to the
        fetchUser.todos.push(saveData)

        //saving the fetch user
        await fetchUser.save()

        res.status(201).json(fetchUser)

    } catch (error) {
        console.log(error)
        res.status(500).json(error)

    }

}




//  const addTodo =  (req, res) => {

//       const { todo, status } = req.body;

//       const dataTodo = {
//           todo,
//          status
//       }

//       const dataToStore = new ToModel(dataTodo)
//       dataToStore.save().then(results => {
//           if(results) res.send(results)
//       }).catch(err => {
//          console.log(err)
//       })

//  }

//fetching all todos from the database or mongodb server
const fetchTodos = (req, res) => {
    ToModel.find().then(results => {
        res.send(results)
    }).catch(err => {
        console.log(err.message)
    })
}

//fetching only one particular todo from the database or mongodb server

const fetchTodo = (req, res) => {
    ToModel.findById(req.params.id).then(result => {
        if (result) {
            res.send(result)
        }
    }).catch(err => console.log(err))
}

//deleting a particular todo using it id
const deleteTodo = (req, res) => {
    ToModel.findByIdAndDelete(req.params.id).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
    })
}

//updating a particula todo using it unique id
const updateTodo = (req, res) => {

    const { status } = req.body;

    const dataTodo = {
        status
    };
    ToModel.updateOne({ _id: req.params.id }, dataTodo)
        .then((results) => {
            res.send(results)
        }).catch((err) => {
            console.log({ message: "updated successfully" })
        })


}


// const TodoByUser = async (req, res) =>{
//     const { todoId } = req.params;
//     const todo = await ToModel.findById(todoId).populate()
//     /res.send(todo)

// }



module.exports = {
    addTodo,
    fetchTodos,
    fetchTodo,
    deleteTodo,
    updateTodo,



}