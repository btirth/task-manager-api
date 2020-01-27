const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken') 

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        tolowercase: true
    },
    
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Invalid Email')
            }
        }
    },

    password: {
        type: String,
        minlength: 7,
        required: true,
        trim: true,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('Password can\'t contains word password')
            }
        }
    },

    age: {
        type: Number,
        default: 0
    },

    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],

    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})

//the below code will build virtual rel b/w User and Task
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',  //common b/w user and task
    foreignField: 'owner'
})

// const me = new User({
//     name: '     Tirth     ',
//     email: '    EMAILTIrth@gmail.com',
//     password: 'tirth12345'
    

// })

// me.save().then((result) => {
//     console.log(result)
// }).catch((error) => {
//     console.log(error)
// })


userSchema.pre('save', async function (next) {
    const user = this
    
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

//res.send call function JSON.stringify() before send the data and JSON.stringify() call any toJSON function
//available in models 
userSchema.methods.toJSON = function(){
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
    
    return userObject
}

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = await jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)
    
    user.tokens = await user.tokens.concat({ token: token })
    await user.save()

    return token
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email: email })

    if(!user){
        throw new Error('Email not found')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch){
        throw new Error('Unable to Login')
    }

    return user
}

const User = mongoose.model('User', userSchema)

module.exports = User

