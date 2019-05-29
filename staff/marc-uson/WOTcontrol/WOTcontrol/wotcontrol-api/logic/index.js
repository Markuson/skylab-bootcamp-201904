const validate = require('wotcontrol-validate')
const { LogicError } = require('wotcontrol-errors')
const { models } = require('wotcontrol-data')

const { Users } = models

const logic = {

    registerUser(name, surname, email, password, admin = false) {
        validate.arguments([
            { name: 'name', value: name, type: 'string', notEmpty: true },
            { name: 'surname', value: surname, type: 'string', notEmpty: true },
            { name: 'email', value: email, type: 'string', notEmpty: true },
            { name: 'password', value: password, type: 'string', notEmpty: true },
            { name: 'admin', value: admin, type: 'boolean', optional: true }
        ])
        email = email.toLowerCase()
        validate.email(email)

        return (async () => {
            const user = await Users.findOne({ email })

            if (user) throw new LogicError(`user with email "${email}" already exists`)

            try {
                await Users.create({ name, surname, email, password, admin })
            } catch (error) {
                throw new Error(error)
            }


        })()
    },

    authenticateUser(email, password) {
        validate.arguments([
            { name: 'email', value: email, type: 'string', notEmpty: true },
            { name: 'password', value: password, type: 'string', notEmpty: true }
        ])
        email = email.toLowerCase()
        validate.email(email)

        return (async () => {
            const users = await Users.find({email})

            if (!users.length) throw new LogicError(`user with email "${email}" does not exist`)

            const [user] = users

            if (user.password !== password) throw new LogicError('wrong credentials')

            return user.id
        })()
    },

    retrieveUser(id) {
        validate.arguments([
            { name: 'id', value: id, type: 'string', notEmpty: true }
        ])

        return (async () => {
            const user = await Users.findById(id)
            if (!user) throw new LogicError(`user with id "${id}" does not exist`)
            const { name, surname, email } = user

            return { name, surname, email }
        })()
    },

    updateUser(id, data) {
        validate.arguments([
            { name: 'id', value: id, type: 'string', notEmpty: true },
            { name: 'data', value: data, type: 'object'}

        ])

        let _email

        return (async () => {

            if(data.email){
                _email = data.email.toLowerCase()
                const _user = await Users.findOne({_email})
                if (_user) throw new LogicError(`user with email "${_email}" already exists`)
            }

            const user = await Users.findById(id)
            if (!user) throw new LogicError(`user with id "${id}" does not exist`)
            const { admin, name, surname, email, password } = user

            await Users.findByIdAndUpdate(id,{
                admin: data.admin || admin,
                name: data.name || name,
                surname: data.surname || surname,
                email: _email || email,
                password: data.password || password
            })

            return `User succesfully updated`
        })()
    },

    deleteUser(id) {
        validate.arguments([
            { name: 'id', value: id, type: 'string', notEmpty: true }
        ])

        let _email

        return (async () => {

            const user = await Users.findById(id)
            if (!user) throw new LogicError(`user with id "${id}" does not exist`)
            
            await Users.findByIdAndDelete(id)

            return `User succesfully deleted`
        })()
    },

    // handleDigitalInputs(data){
    //     console.log(data)
    // },

    // handleDigitalOutputs(data){
    //     validate.arguments([
    //         { name: 'data', value: data, type:'string', notEmpty: true }
    //     ])

    //     //var responseArray = testData.test(data)
    //     var response = '';

    //     for(i=0; i < responseArray.length; i++){
    //         response= response.concat(`do${i+1}:${responseArray[i]}:do${i+1},`)
    //     }

    //     return response
    // },

    // handleServo(data){
    //     console.log(data);
    // },

    // handleAnalogInputs(data){
    //     console.log(data)
    // },

    // handleAnalogOutputs(data){
    //     console.log(data)
    // }
}

module.exports = logic