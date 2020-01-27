const express = require('express')
const auth = require('../middleware/auth') 
const Task = require('../models/task')
const router = new express.Router()

var bodyparser = require('body-parser');
router.use(bodyparser.json()); 
router.use(bodyparser.urlencoded({
    extended: true
}));

router.post('/tasks', auth, async (req, res) => {
    //const task = new Task(req.body)
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })  


    // task.save().then((result) => {
    //     res.status(201).send(task)
    // }).catch((error) => {
    //     res.status(400).send(error)
    // })

    try{
        await task.save()
        res.status(201).send(task)
    }catch(e){
        res.status(400).send(e)
    }

})

//GET tasks?isDone=true
//GET tasks?limit=1&&skip=2
//GET tasks?sortBy=createdAt:asc
router.get('/tasks', auth, async (req, res) => {
    // User.find({}).then((tasks) => {
    //     res.send(tasks)
    // }).catch(() => {
    //     res.status(500).send()
    // })

    try{
        const match = {}
        const sort = {}
        if(req.query.isDone){
            match.isDone = req.query.isDone === 'true'
        }

        if(req.query.sortBy){
            const parts = req.query.sortBy.split(':')
            sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
        }

        //const tasks = await Task.find({})

        //await req.user.populate('tasks').execPopulate()
        await req.user.populate({
            path: 'tasks',
            match: match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                // sort: {
                //     createdAt: -1   //1 is for ascending and -1 is for descending
                // },
                sort        //sorthand operator instead of sort: sort
            },
            
        }).execPopulate()
        res.send(req.user.tasks)
    }catch(e){
        res.status(500).send()
    }


})

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    //we don't need to convert id into ObjectID as in mongodb, mongoose will do it for us
    // Task.findById(_id).then((task) => {
    //     if(!task){
    //         return res.status(404).send()
    //     }
        
    //     res.status(200).send(task)
    // }).catch((Error) => {
    //     res.status(500).send()

    // })


    try{
        const task = await Task.findById({ _id, owner: req.user.id })
        if(!task){
            return res.status(404).send()
        }
        res.status(200).send(task)
    }catch(e){
        res.status(500).send()
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {
    const toUpdate = Object.keys(req.body)
    const allowUpdates = ['description', 'isDone']
    const isValidOperation = toUpdate.every((update) => {
        return allowUpdates.includes(update)
    })

    if(!isValidOperation){
        return res.status(400).send({ error: 'Invalid update' })
    }

    try{
        //const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })
        
        if(!task){
            res.status(404).send()
        }
        toUpdate.forEach((update) => task[update] = req.body[update])
        await task.save()
        res.status(201).send(task)
    }catch(e){
        res.status(500).send()
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    try{
        //const task = await Task.findByIdAndDelete(req.params.id)
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
        if(!task){
            res.status(404).send()
        }

        res.status(201).send(task)
    }catch(e){
        res.status(500).send()
    }
})




module.exports = router