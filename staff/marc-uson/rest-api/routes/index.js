const express = require('express')
const bodyParser = require('body-parser')
const logic = require('../logic')
const handleErrors = require('./handle-errors')
const { UnauthorizedError } = require('../common/errors')


const jsonParser = bodyParser.json()

const router = express.Router()

router.post('/user', jsonParser, (req, res) => {
    const { body: { name, surname, email, password } } = req

    try {
        logic.registerUser(name, surname, email, password)
            .then(() => res.json({ message: 'Ok, user registered. '}))
            .catch(({ message }) => {
                res.status(400).json({ error: message})
            })
    } catch ({ message }) {
        res.status(400).json({ error: message})
    }
})

router.post('/auth', jsonParser, (req, res) => {
    const { body: { email, password } } = req

    try {
        logic.authenticateUser(email, password)
            .then((response) => res.json({ message: 'Ok, user authenticated. ', data: { token: response} }))
            .catch(({ message }) => {
                res.status(400).json({ error: message})
            })
    } catch ({ message }) {
        res.status(400).json({ error: message})
    }
})

router.get('/user', (req, res) =>{
    const { headers:{authorization} } = req
    token = authorization.slice(7, authorization.length)
    try {
        logic.retrieveUser(token)
            .then((response) => res.json(response))
            .catch(({ message }) => {
                res.status(400).json({ error: message})
            })
    } catch ({ message }) {
        res.status(400).json({ error: message})
    }
})

router.get('/search', (req,res) => {
    const { headers:{authorization}, query:{q} } = req
    token = authorization.slice(7, authorization.length)
    const query = q
    try {
        logic.searchDucks(token, query)
            .then((response) => res.json(response))
            .catch(({ message }) => {
                res.status(400).json({ error: message})
            })
    } catch ({ message }) {
        res.status(400).json({ error: message})
    }
})

router.get('/duck/:id', (req,res) => {
    const { headers:{authorization}, params:{id} } = req
    token = authorization.slice(7, authorization.length)
    try {
        logic.retrieveDuck(token, id)
            .then((response) => res.json(response))
            .catch(({ message }) => {
                res.status(400).json({ error: message})
            })
    } catch ({ message }) {
        res.status(400).json({ error: message})
    }
})

router.post('/favduck/:id', (req,res) => {
    const { headers:{authorization}, params:{id} } = req
    token = authorization.slice(7, authorization.length)
    try {
        logic.toggleFavDuck(token, id)
            .then(() => res.json({message: 'favorites updated'}))
            .catch(({ message }) => {
                res.status(400).json({ error: message})
            })
    } catch ({ message }) {
        res.status(400).json({ error: message})
    }
})

router.get('/favducks', (req,res) => {
    const { headers:{authorization} } = req
    token = authorization.slice(7, authorization.length)
    try {
        logic.retrieveFavDucks(token)
            .then((response) => res.json(response))
            .catch(({ message }) => {
                res.status(400).json({ error: message})
            })
    } catch ({ message }) {
        res.status(400).json({ error: message})
    }
})

// TODO other routes (update, delete...)

module.exports = router