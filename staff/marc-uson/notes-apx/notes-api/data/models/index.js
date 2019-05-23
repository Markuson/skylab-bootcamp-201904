const mongoose = require ('mongoose')
const userSchema = require ('./user')
const noteSchema = require ('./note')

const model = mongoose.model.bind(mongoose)

module.exports = {
    Users: model('Users', userSchema ),
    Notes: model('Notes', noteSchema )
}