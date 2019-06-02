const express = require('express')
const logic = require('../logic')
const bodyParser = require('body-parser')

const jsonParser = bodyParser.json()

const router = express.Router()

router.post('/test', jsonParser, (req, res) => {
    const { body: { data } } = req
    logic.testGet(data)
    res.json({ Status: 'OK' })
})

router.get('/test', (req, res) => {
    logic.testGet('Get test')
    res.json({ Status: 'OK' })
})

router.get('/test/data', (req, res) => {
    const { query: { dOut, dIn, aIn, aOut } } = req
    var response = ''
    var response1 = ''
    var response2 = ''
    var response3 = ''
    var response4 = ''
    if (dOut) response1 = logic.handleDigitalOutputs(dOut)
    if (dIn) response2 = logic.handleDigitalInputs(dIn)
    if (aIn) response3 = logic.handleAnalogInputs(aIn)
    if (aOut) response4 = logic.handleAnalogOutputs(aOut)

    response = response1.concat(response2, ',', response3, ',', response4)
    res.json({response})
})

module.exports = router