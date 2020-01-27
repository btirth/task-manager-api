const express = require('express')
const User = require('../models/user')
var bodyparser = require('body-parser');
const router = new express.Router()
const auth = require('../middleware/auth')
const sharp = require('sharp')
const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/account')

const bcrypt = require('bcryptjs')
const multer = require('multer')


router.use(bodyparser.json()); 
router.use(bodyparser.urlencoded({
    extended: true
}));


//if we use below code in index then we can use app.post instead of router
router.post('/users', async (req, res) => {
    //console.log(req.body)
    //res.send('Testing!')

    const user = new User(req.body)
    // user.save().then((result) => {
    //     res.status(201)       //to change the error status
    //     res.send(user)
    // }).catch((error) => {
    //     res.status(400).send(error)    //shorthand method of above 
    // })

    try{
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    }catch(e){
        console.log(e)
        res.status(400).send(e)
    }
})

router.post('/users/login', async (req, res) => {
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch(e) {
        res.status(400).send(e)
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try{
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })

        await req.user.save()
        return res.send(req.user)
    } catch(e){
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try{

        req.user.tokens = []

        await req.user.save()
        res.send(req.user)
    } catch(e){
        res.status(500).send()
    }
})

const profilePic = multer({
    //dest: 'avatar',
    limit: {
        fileSize: 100000
    },
    fileFilter(req, file, callback){
        if(!file.originalname.match(/\.(jpg|jpeg|png|PNG)$/)){
            callback(new Error('Please upload image'))
        }
        callback(undefined, true)
    }
})
router.post('/users/me/avatar', auth, profilePic.single('avatar'), async (req, res) => {
    //we can only access the req.file.buffer if we didn't provide dest above in the instance
    //req.user.avatar = req.file.buffer //all binary data store as buffer
    
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer
    
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.delete('/users/me/avatar', auth, async(req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        console.log(user._id)
        if(!user || !user.avatar){
            //res.send('dfdasdfd')
            throw new Error('strfervg')
        }

        res.set('Content-Type', 'image/PNG')
        res.send(user.avatar)

    } catch(e) {
        res.status(404).send(e)
        console.log(e)
    }
})

router.get('/users', async (req, res) => {
    // User.find({}).then((users) => {
    //     res.send(users)
    // }).catch(() => {
    //     res.status(500).send()
    // })

    try{
        const users = await User.find({})
        res.send(users)
    }catch(e){
        res.status(500).send()
    }
})

router.get('/users/me', auth, async (req, res) => {
    //we dont need to find user here because auth will return user by req.user
    res.send(req.user)
})

router.get('/users/me', async (req, res) => {
    const _id = req.params.id

    //we don't need to convert id into ObjectID as in mongodb, mongoose will do it for us
    // User.findById(_id).then((user) => {
    //     if(!user){
    //         return res.status(404).send()
    //     }
        
    //     res.status(200).send(user)
    // }).catch((Error) => {
    //     res.status(500).send()
    // })
    
    try{
        const user = await User.findById(_id)
        if(!user){
            return res.status(404).send()
        }
        res.status(200).send(user)
    }catch(e){
        res.status(500).send()
    }

})

router.patch('/users/me', auth, async (req, res) => {
    const toUpdate = Object.keys(req.body)
    const allowUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = toUpdate.every((update) => {
        return allowUpdates.includes(update)
    })

    if(!isValidOperation){
        return res.status(400).send({ error: 'Invalid updates' })
    }

    try{
        //const user = await User.findByIdAndUpdate(req.params.id, req.body,  { new: true, runValidators: true })
        
        //const user = await User.findById(req.params.id)
        toUpdate.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()

        // if(!user){
        //     return res.status(404).send()
        // }

        res.send(req.user)
    }catch(e){
        res.status(400).send(e)
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try{
        //const user = await User.findByIdAndDelete(req.params.id)
        // if(!user){
        //     return res.status(404).send()
        // }
        
        await req.user.remove()
        sendCancelationEmail(req.user.email, req.user.name)
        res.status(201).send(req.user)
    }catch(e){
        res.status(500).send(e)
    }
})

module.exports = router