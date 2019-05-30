const validate = require('wotcontrol-validate')
const { LogicError } = require('wotcontrol-errors')
const { models } = require('wotcontrol-data')

const { Users, Devices, Inputs, Outputs } = models

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

        return (async () => {

            const user = await Users.findById(id)
            if (!user) throw new LogicError(`user with id "${id}" does not exist`)

            await Users.findByIdAndDelete(id)

            return `User succesfully deleted`
        })()
    },

    addDevice(id, deviceName, deviceIp, devicePort){
        validate.arguments([
            { name: 'id', value: id, type: 'string', notEmpty: true },
            { name: 'deviceName', value: deviceName, type: 'string', notEmpty: true },
            { name: 'deviceIp', value: deviceIp, type: 'string', notEmpty: true },
            { name: 'devicePort', value: devicePort, type: 'number', notEmpty: true }
        ])

        return(async () => {

            try {

                const user = await Users.findById(id)
                if (!user) throw new LogicError(`user with id: ${id} does not exist`)

                let users = await Users.find({$and:[{_id: id},{'devices.name': deviceName}]})
                if (users.length > 0 ) throw new LogicError(`A device named ${deviceName} is already in your collection`)

                users = await Users.find({$and:[{_id: id},{'devices.ip': deviceIp}]})
                if (users.length > 0 ) throw new LogicError(`A device with ip ${deviceIp} is already in your collection`)

                user.devices.push(new Devices({ name: deviceName, ip: deviceIp, port: devicePort}))
                await user.save()

            } catch (error) {
                throw new LogicError(error.message)
            }
        })()
    },

    deleteDevice(id, deviceName){
        validate.arguments([
            { name: 'id', value: id, type: 'string', notEmpty: true },
            { name: 'deviceName', value: deviceName, type: 'string', notEmpty: true }
        ])

        return(async () => {

            try {

                const user = await Users.findById(id)
                if (!user) throw new LogicError(`user with id: ${id} does not exist`)
                let users = await Users.find({'devices.name': deviceName})
                if (users.length == 0 ) throw new LogicError(`A device named ${deviceName} does not exist`)

                const devices = user.devices.filter(({ name }) => name != deviceName)
                user.devices = devices

                await user.save()

            } catch (error) {
                throw new LogicError(error.message)
            }

        })()
    },

    addInput(id, deviceName, type, direction){
        validate.arguments([
            { name: 'id', value: id, type: 'string', notEmpty: true },
            { name: 'deviceName', value: deviceName, type: 'string', notEmpty: true },
            { name: 'type', value: type, type: 'string', notEmpty: true },
            { name: 'direction', value: direction, type: 'number', notEmpty: true }
        ])

        if(type != 'digital' && type != 'analog') throw new LogicError(`${type} is not a valid input type`)
        if(type == 'digital' && (direction < 1 || direction > 2)) throw new LogicError(`${direction} is not a valid direction for a digital input`)
        if(type == 'analog' && (direction != 1)) throw new LogicError(`${direction} is not a valid direction for a analog input`)

        return(async () => {

            try {

                const user = await Users.findById(id)
                if (!user) throw new LogicError(`user with id: ${id} does not exist`)

                let users = await Users.find({$and:[{_id: id}, {'devices.name': deviceName}]})
                if (users.length == 0 ) throw new LogicError(`A device named ${deviceName} does not exist in your collection`)

                const types = users.devices.inputs.filter(({ type:_type }) => _type == type)
                if((types.length == 1 && type == 'analog')||(types.length == 2 && type == 'digital'))
                 throw new LogicError(`The device ${deviceName} could not have more ${type} inputs`)

                user.devices.inputs.push(new Inputs({ type, direction }))
                await user.save()

            } catch (error) {
                throw new LogicError(error.message)
            }
        })()
    },

    deleteInput(id, deviceName, type, direction){

    },

    addOutput(id, deviceName, type, direction){

    },

    deleteOutput(id, deviceName, type, direction){

    },

    retrieveDeviceInfo(id, deviceId){

    },

    activateDevice(id, deviceId, timeInterval){

    },

    changeDeviceId(id, deviceId){

    },

    toggleDigitalOutput(id, deviceId, pinNumber){

    },

    setServoPosition(id, deviceId, servoNumber, angle){

    },

    setMotorSpeed(id, deviceId, motorNumber, speed){

    },

    saveAnalog(id, deviceId, scale){

    },

    retrieveAnalog(id, deviceId){

    },

    retrieveDigital(id, deviceId){

    }

}

module.exports = logic