const express = require('express')
require('./db/mongoose')
const User = require('./models/user')
const Task = require('./models/task')

const app = express()

//without middleware:   new req -> run route handler
//
//with middleware:    new req -> do something -> run route handler
//

// app.use((req, res, next) => {
//     // if(req.method === 'GET'){

//     //     res.send('GET req are disabled')
//     // }

//     res.status(503).send('Site is under maintaince... Please try again later...')

//     next()
// })



const multer = require('multer')
const upload = multer({
    dest: 'images',     //dest = destination (name of the folder where all the data which is send through postman will store)
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, callback){
        //use regex101.com to check file extension
        //we can use regular expresion using .match(/regex/)
        if(!file.originalname.match(/\.(doc|docx)$/)){
            callback(new Error('Please upload word document'))
        }
        
    }
})
//in ther upload.single('tirth')  upload is stand for instance of multer we created above
//and tirth is stand for the key name which send in postman
app.post('/upload', upload.single('tirth'), (req, res) => {
    res.send()
}, ( error, req, res, next) => {       //this fun will run when the middleware upload.single will throw an error
    res.status(400).send({ error: error.message })
})

const userRouter = require('./routers/user')
app.use(userRouter)

const taskRouter = require('./routers/task')
app.use(taskRouter)

const port = process.env.PORT

app.use(express.json())

app.listen(port, () => {
    console.log('Server is up  on PORT: ' + port)
})


// const main = async () => {
//     // const task = await Task.findById('5e2c0ca398a3f70d2ce159f4')
//     // await task.populate('owner').execPopulate()
//     // console.log(task.owner)

//     const user = await User.findById('5e2c09da8990490cb896efb8')
//     await user.populate('tasks').execPopulate()
//     console.log(user.tasks)
// }

// main()