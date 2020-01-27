const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        trim: true,
        required: true
    },

    isDone: {
        type: Boolean,
        default: false
    },

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        //ref is required to use populate method
        ref: 'User'
    }
}, {
    timestamps: true
})

const Task = mongoose.model('Task', taskSchema)

// const task1 = new Task({
//     description: 'Making Youtube Video',
//     isDone: false
// })

// task1.save().then((result) => {
//     console.log(result)
// }).catch((error) => {
//     console.log(error)
// })



module.exports = Task