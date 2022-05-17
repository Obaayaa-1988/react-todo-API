// const { Timestamp } = require('mongodb');

const mongoose = require('mongoose');
const { Schema } =  mongoose

const TodoSchema = new Schema ({

    todo:{
        type: String,
    },

    status:{
        type: String,
        default:"Pending"

    },

    user: {
        type: Schema.Types.ObjectId,
        ref: 'Users'
    }

}, {timestamps: true});

const Todolist = mongoose.model("Todolist", TodoSchema)

module.exports = Todolist;