 const express = require('express');
 const { todoAuthUser } = require('../middleware/todoAuth')
 const router = express.Router();
 const {
     addTodo,
     fetchTodo,
     fetchTodos,
     deleteTodo,
     updateTodo,
     //TodoByUser

 } = require('../controller/todoController')
 




router.post('/api/todos/:id', addTodo)

router.get('/api/todos', fetchTodos)
router.get('/api/todo/:id', fetchTodo)
router.delete('/api/todo/:id', deleteTodo)
router.put('/api/todo/:id', updateTodo)





 module.exports = router;