const mongoose = require ('mongoose')

const { Schema } = mongoose

noteSchema = new Schema({
    text: { type: String, required: true },
    date: { type: Date, default: Date.now },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true }

})

module.exports = noteSchema