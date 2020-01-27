const mongoose = require('mongoose')
const validator = require('validator')

mongoose.connect(process.env.MONGOOSE_URL, {
    useCreateIndex: true,
    useNewUrlParser: true
})