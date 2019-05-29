const mongoose = require ('mongoose')
const userSchema = require ('./user')

const model = mongoose.model.bind(mongoose)

module.exports = {
    Users: model('Users', userSchema ),
}