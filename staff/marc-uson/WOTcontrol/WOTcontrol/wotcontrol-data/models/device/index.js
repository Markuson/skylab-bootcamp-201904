const mongoose = require ('mongoose')

const { Schema } = mongoose

const inputSchema = new Schema({
    type: {
        type: String,
        enum:['digital', 'analog'],
        required: true
    },
    value: {
        type: String
    },
    direction:{
        type: Number,
        enum: [1,2],
        required: true
    }
})

const outputSchema = new Schema({
    type: {
        type: String,
        enum:['digital', 'analog', 'servo', 'motor'],
        required: true
    },
    value: {
        type: Number
    },
    direction:{
        type: String,
        required: true
    }
})

const deviceSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    ip: {
        type: String,
        required: true
    },
    port: {
        type: Number,
        required: true
    },
    inputs:[inputSchema],
    outputs: [outputSchema]

})

module.exports = { deviceSchema, inputSchema, outputSchema }