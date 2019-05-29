const { Schema } = require ('mongoose')
const { isEmail } = require ('validator')
const noteSchema = require ('../note')


const userSchema = new Schema({
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: isEmail
    },
    password: { type: String, required: true },
    notes: [noteSchema]
})

module.exports = userSchema