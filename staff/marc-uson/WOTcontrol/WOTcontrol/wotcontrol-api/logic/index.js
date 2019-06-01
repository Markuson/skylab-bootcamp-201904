const validate = require('wotcontrol-validate')
const { LogicError } = require('wotcontrol-errors')
const { models } = require('wotcontrol-data')
const call = require('wotcontrol-call')

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
                await Users.findByIdAndUpdate(id, user)

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

                await Users.findByIdAndUpdate(id, user)

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

                let users = await Users.find({ $and: [{ _id: id }, { 'devices.name': deviceName }] })
                if (users.length == 0) throw new LogicError(`A device named ${deviceName} does not exist in your collection`)

                const _users = await Users.find({ $and: [{ _id: id }, { 'devices.name': deviceName }, { 'devices.inputs.type': type }] })
                if (_users.length > 0) {
                    let inputs = _users[0].devices[0].inputs
                    filteredInputs = inputs.filter(element => element.type == type)

                    if ((filteredInputs.length == 1 && type == 'analog') || (filteredInputs.length == 2 && type == 'digital'))
                        throw new LogicError(`The device ${deviceName} could not have more ${type} inputs`)
                }
                users[0].devices[0].inputs.push(new Inputs({ type, direction }))

                await Users.findByIdAndUpdate(id, users[0])

            } catch (error) {
                throw new LogicError(error.message)
            }
        })()
    },

    deleteInput(id, deviceName, type, direction){
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

                let _users = await Users.find({$and:[{_id: id}, {'devices.name': deviceName}, {'devices.inputs.type': type}]})
                if (_users.length == 0) throw new LogicError(`The device ${deviceName} don't have any ${type} input`)

                _users = await Users.find({$and:[{_id: id}, {'devices.name': deviceName}, {'devices.inputs.type': type}, {'devices.inputs.direction': direction} ]})
                if (_users.length == 0) throw new LogicError(`The device ${deviceName} don't have any ${type} input asigned to ${direction} direction`)

                const device = user.devices.filter(({ name }) => name == deviceName)
                const inputs = device[0].inputs.filter(({ type: _type, direction: _direction }) => (_type != type)||((_type == type)&&(_direction != direction)) )
                const deviceIndex = user.devices.findIndex(({ name }) => name == deviceName)
                user.devices[deviceIndex].inputs = inputs
                await Users.findByIdAndUpdate(id, user)

            } catch (error) {
                throw new LogicError(error.message)
            }
        })()
    },

    addOutput(id, deviceName, type, direction){
        validate.arguments([
            { name: 'id', value: id, type: 'string', notEmpty: true },
            { name: 'deviceName', value: deviceName, type: 'string', notEmpty: true },
            { name: 'type', value: type, type: 'string', notEmpty: true },
            { name: 'direction', value: direction, type: 'number', notEmpty: true }
        ])

        if(type != 'digital' && type != 'motor' && type != 'servo') throw new LogicError(`${type} is not a valid output type`)
        if(type == 'digital' && (direction < 1 || direction > 2)) throw new LogicError(`${direction} is not a valid direction for a digital output`)
        if(type == 'motor' && (direction < 1 || direction > 2)) throw new LogicError(`${direction} is not a valid direction for a motor output`)
        if(type == 'servo' && (direction < 1 || direction > 3)) throw new LogicError(`${direction} is not a valid direction for a servo output`)

        return(async () => {

            try {
                const user = await Users.findById(id)
                if (!user) throw new LogicError(`user with id: ${id} does not exist`)

                let users = await Users.find({ $and: [{ _id: id }, { 'devices.name': deviceName }] })
                if (users.length == 0) throw new LogicError(`A device named ${deviceName} does not exist in your collection`)

                const _users = await Users.find({ $and: [{ _id: id }, { 'devices.name': deviceName }, { 'devices.outputs.type': type }] })
                if (_users.length > 0) {
                    let outputs = _users[0].devices[0].outputs
                    filteredOutputs = outputs.filter(element => element.type == type)

                    if ((filteredOutputs.length == 3 && type == 'servo') ||(filteredOutputs.length == 2 && type == 'motor') || (filteredOutputs.length == 2 && type == 'digital'))
                        throw new LogicError(`The device ${deviceName} could not have more ${type} outputs`)
                }
                users[0].devices[0].outputs.push(new Outputs({ type, direction }))

                await Users.findByIdAndUpdate(id, users[0])

            } catch (error) {
                throw new LogicError(error.message)
            }
        })()
    },

    deleteOutput(id, deviceName, type, direction){
        validate.arguments([
            { name: 'id', value: id, type: 'string', notEmpty: true },
            { name: 'deviceName', value: deviceName, type: 'string', notEmpty: true },
            { name: 'type', value: type, type: 'string', notEmpty: true },
            { name: 'direction', value: direction, type: 'number', notEmpty: true }
        ])

        if(type != 'digital' && type != 'motor' && type != 'servo') throw new LogicError(`${type} is not a valid output type`)
        if(type == 'digital' && (direction < 1 || direction > 2)) throw new LogicError(`${direction} is not a valid direction for a digital output`)
        if(type == 'motor' && (direction < 1 || direction > 2)) throw new LogicError(`${direction} is not a valid direction for a motor output`)
        if(type == 'servo' && (direction < 1 || direction > 3)) throw new LogicError(`${direction} is not a valid direction for a servo output`)

        return(async () => {

            try {
                const user = await Users.findById(id)
                if (!user) throw new LogicError(`user with id: ${id} does not exist`)

                let users = await Users.find({$and:[{_id: id}, {'devices.name': deviceName}]})
                if (users.length == 0 ) throw new LogicError(`A device named ${deviceName} does not exist in your collection`)

                let _users = await Users.find({$and:[{_id: id}, {'devices.name': deviceName}, {'devices.outputs.type': type}]})
                if (_users.length == 0) throw new LogicError(`The device ${deviceName} don't have any ${type} output`)

                _users = await Users.find({$and:[{_id: id}, {'devices.name': deviceName}, {'devices.outputs.type': type}, {'devices.outputs.direction': direction} ]})
                if (_users.length == 0) throw new LogicError(`The device ${deviceName} don't have any ${type} output asigned to ${direction} direction`)

                const device = user.devices.filter(({ name }) => name == deviceName)
                const outputs = device[0].outputs.filter(({ type: _type, direction: _direction }) => (_type != type)||((_type == type)&&(_direction != direction)) )
                const deviceIndex = user.devices.findIndex(({ name }) => name == deviceName)
                user.devices[deviceIndex].outputs = outputs
                await Users.findByIdAndUpdate(id, user)

            } catch (error) {
                throw new LogicError(error.message)
            }
        })()
    },

    retrieveDevice(id, deviceName){
        validate.arguments([
            { name: 'id', value: id, type: 'string', notEmpty: true },
            { name: 'deviceName', value: deviceName, type: 'string', notEmpty: true }
        ])

        return(async () => {

            try {
                const user = await Users.findById(id)
                if (!user) throw new LogicError(`user with id: ${id} does not exist`)

                let users = await Users.find({ $and: [{ _id: id }, { 'devices.name': deviceName }] })
                if (users.length == 0) throw new LogicError(`A device named ${deviceName} does not exist in your collection`)

                const device = users[0].devices.filter(({name}) => name == deviceName)

                return device[0]
            } catch (error) {
                throw new LogicError(error.message)
            }
        })()
    },

    activateDevice(id, deviceName, timeInterval){
        validate.arguments([
            { name: 'id', value: id, type: 'string', notEmpty: true },
            { name: 'deviceName', value: deviceName, type: 'string', notEmpty: true },
            { name: 'timeInterval', value: timeInterval, type: 'number', notEmpty: true }
        ])

        if(timeInterval < 1000) throw new LogicError(`time interval ${timeInterval} is too low. must be at least 1000`)

        return(async () => {

            try {
                const user = await Users.findById(id)
                if (!user) throw new LogicError(`user with id: ${id} does not exist`)

                let users = await Users.find({ $and: [{ _id: id }, { 'devices.name': deviceName }] })
                if (users.length == 0) throw new LogicError(`A device named ${deviceName} does not exist in your collection`)

                const device = users[0].devices.filter(({name}) => name == deviceName)

                const url = `http://${device[0].ip}:${device[0].port}/active?status=on&interval=${timeInterval}`

                const response = await call(url)

                return response
            } catch (error) {
                throw new LogicError(error.message)
            }
        })()
    },

    changeDeviceId(id, deviceName, newDeviceName){
        validate.arguments([
            { name: 'id', value: id, type: 'string', notEmpty: true },
            { name: 'deviceName', value: deviceName, type: 'string', notEmpty: true },
            { name: 'newDeviceName', value: newDeviceName, type: 'string', notEmpty: true }
        ])

        return(async () => {

            try {
                const user = await Users.findById(id)
                if (!user) throw new LogicError(`user with id: ${id} does not exist`)

                let users = await Users.find({ $and: [{ _id: id }, { 'devices.name': deviceName }] })
                if (users.length == 0) throw new LogicError(`A device named ${deviceName} does not exist in your collection`)

                const device = users[0].devices.filter(({name}) => name == deviceName)
                const url = `http://${device[0].ip}:${device[0].port}/new?deviceid=${newDeviceName}`

                const response = await call(url)

                if(response.status == 'OK'){
                    device[0].name = response.deviceid
                    const index = users[0].devices.findIndex(({name}) => name == deviceName)
                    users[0].devices[index] = device[0]
                    await Users.findByIdAndUpdate(id, users[0])
                }
                return response
            } catch (error) {
                throw new LogicError(error.message)
            }
        })()
    },

    toggleDigitalOutput(id, deviceName, pinNumber){
        validate.arguments([
            { name: 'id', value: id, type: 'string', notEmpty: true },
            { name: 'deviceName', value: deviceName, type: 'string', notEmpty: true },
            { name: 'pinNumber', value: pinNumber, type: 'number', notEmpty: true }
        ])
        let toggleOnOff='off'

        if((pinNumber > 2)||(pinNumber < 1)) throw new LogicError(`${pinNumber} is not a valid digital pinNumber`)

        return(async () => {

            try {
                const user = await Users.findById(id)
                if (!user) throw new LogicError(`user with id: ${id} does not exist`)

                let users = await Users.find({ $and: [{ _id: id }, { 'devices.name': deviceName }] })
                if (users.length == 0) throw new LogicError(`A device named ${deviceName} does not exist in your collection`)

                const device = users[0].devices.filter(({ name }) => name == deviceName)

                const outputIndex = device[0].outputs.findIndex(({direction, type }) => (direction == pinNumber) && (type == 'digital'))

                if(outputIndex == -1) throw new LogicError(`no output declared with pin number ${pinNumber}`)

                if(device[0].outputs[outputIndex].value == 0) toggleOnOff = 'on'
                else toggleOnOff = 'off'

                const url = `http://${device[0].ip}:${device[0].port}/d${toggleOnOff}?pin=${pinNumber}`

                let response
                try {
                    response = await call(url)
                } catch (error) {
                    if(error.status == 404) throw new LogicError('Not Found', status=404)
                }

                const deviceIndex = user.devices.findIndex(({ name }) => name == deviceName)
                response.status == 'ON' ? user.devices[deviceIndex].outputs[outputIndex].value = 1 : user.devices[deviceIndex].outputs[outputIndex].value = 0

                await Users.findByIdAndUpdate(id, user)

                return response
            } catch (error) {
                throw new LogicError(error.message)
            }
        })()
    },

    setServoPosition(id, deviceName, servoNumber, angle) {
        validate.arguments([
            { name: 'id', value: id, type: 'string', notEmpty: true },
            { name: 'deviceName', value: deviceName, type: 'string', notEmpty: true },
            { name: 'servoNumber', value: servoNumber, type: 'number', notEmpty: true },
            { name: 'angle', value: angle, type: 'number', notEmpty: true }
        ])

        if ((servoNumber > 3) || (servoNumber < 1)) throw new LogicError(`${servoNumber} is not a valid servo direction`)

        if ((angle > 180) || (angle < 0)) throw new LogicError(`${angle} is not a valid angle`)

        return (async () => {

            try {
                const user = await Users.findById(id)
                if (!user) throw new LogicError(`user with id: ${id} does not exist`)

                let users = await Users.find({ $and: [{ _id: id }, { 'devices.name': deviceName }] })
                if (users.length == 0) throw new LogicError(`A device named ${deviceName} does not exist in your collection`)

                const device = users[0].devices.filter(({ name }) => name == deviceName)

                const outputIndex = device[0].outputs.findIndex(({direction, type }) => (direction == servoNumber) && (type == 'servo'))

                if (outputIndex == -1) throw new LogicError(`no servo declared with direction ${servoNumber}`)

                const url = `http://${device[0].ip}:${device[0].port}/servo${servoNumber}?val=${angle}`

                let response
                try {
                    response = await call(url)
                } catch (error) {
                    if(error.status == 404) throw new LogicError('Not Found', status=404)
                }

                response.status = Number(response.status)
                const deviceIndex = user.devices.findIndex(({ name }) => name == deviceName)

                user.devices[deviceIndex].outputs[outputIndex].value = response.status

                await Users.findByIdAndUpdate(id, user)

                return response
            } catch (error) {
                throw new LogicError(error.message)
            }
        })()
    },

    setMotorSpeed(id, deviceName, motorNumber, speed){
        validate.arguments([
            { name: 'id', value: id, type: 'string', notEmpty: true },
            { name: 'deviceName', value: deviceName, type: 'string', notEmpty: true },
            { name: 'motorNumber', value: motorNumber, type: 'number', notEmpty: true },
            { name: 'speed', value: speed, type: 'number', notEmpty: true }
        ])

        if ((motorNumber > 2) || (motorNumber < 1)) throw new LogicError(`${motorNumber} is not a valid motor direction`)

        if ((speed > 100) || (speed < 0)) throw new LogicError(`${speed} is not a valid speed`)

        return (async () => {

            try {
                const user = await Users.findById(id)
                if (!user) throw new LogicError(`user with id: ${id} does not exist`)

                let users = await Users.find({ $and: [{ _id: id }, { 'devices.name': deviceName }] })
                if (users.length == 0) throw new LogicError(`A device named ${deviceName} does not exist in your collection`)

                const device = users[0].devices.filter(({ name }) => name == deviceName)

                const outputIndex = device[0].outputs.findIndex(({direction, type }) => (direction == motorNumber) && (type == 'motor'))

                if (outputIndex == -1) throw new LogicError(`no motor declared with direction ${motorNumber}`)

                const url = `http://${device[0].ip}:${device[0].port}/motor${motorNumber}?val=${speed}`

                let response
                try {
                    response = await call(url)
                } catch (error) {
                    if(error.status == 404) throw new LogicError('Not Found', status=404)
                }

                response.status = response.status/2.54

                const deviceIndex = user.devices.findIndex(({ name }) => name == deviceName)

                user.devices[deviceIndex].outputs[outputIndex].value = response.status

                await Users.findByIdAndUpdate(id, user)

                return response
            } catch (error) {
                throw new LogicError(error.message)
            }
        })()
    },

    saveAnalogInput(id, deviceName, value){
        validate.arguments([
            { name: 'id', value: id, type: 'string', notEmpty: true },
            { name: 'deviceName', value: deviceName, type: 'string', notEmpty: true },
            { name: 'value', value: value, type: 'number', notEmpty: true }
        ])

        return (async () => {

            try {
                const user = await Users.findById(id)
                if (!user) throw new LogicError(`user with id: ${id} does not exist`)

                let users = await Users.find({ $and: [{ _id: id }, { 'devices.name': deviceName }] })
                if (users.length == 0) throw new LogicError(`A device named ${deviceName} does not exist in your collection`)

                const device = users[0].devices.filter(({ name }) => name == deviceName)

                const inputIndex = device[0].inputs.findIndex(({ type }) => (type == 'analog'))

                if (inputIndex == -1) throw new LogicError(`no analog input declared in the WOTdevice ${deviceName}`)

                const deviceIndex = user.devices.findIndex(({ name }) => name == deviceName)

                let saveValue = (value/10.23).toFixed(2)

                if(user.devices[deviceIndex].inputs[inputIndex].values.length >= 10) user.devices[deviceIndex].inputs[inputIndex].values.shift()

                user.devices[deviceIndex].inputs[inputIndex].values.push({value: saveValue, date: Date.now()})

                await Users.findByIdAndUpdate(id, user)

            } catch (error) {
                throw new LogicError(error.message)
            }
        })()
    },

    saveDigitalInput(id, deviceName, value, pinNumber){
        validate.arguments([
            { name: 'id', value: id, type: 'string', notEmpty: true },
            { name: 'deviceName', value: deviceName, type: 'string', notEmpty: true },
            { name: 'value', value: value, type: 'number', notEmpty: true },
            { name: 'pinNumber', value: pinNumber, type: 'number', notEmpty: true }
        ])

            if(pinNumber<1 || pinNumber>2) throw new LogicError(`${direction} is not a valid direction for a digital input`)
        return (async () => {

            try {
                const user = await Users.findById(id)
                if (!user) throw new LogicError(`user with id: ${id} does not exist`)

                let users = await Users.find({ $and: [{ _id: id }, { 'devices.name': deviceName }] })
                if (users.length == 0) throw new LogicError(`A device named ${deviceName} does not exist in your collection`)

                const device = users[0].devices.filter(({ name }) => name == deviceName)

                const inputIndex = device[0].inputs.findIndex(({ type, direction }) => (type == 'digital') && (direction == pinNumber))

                if (inputIndex == -1) throw new LogicError(`no digital input declared in the WOTdevice ${deviceName}`)

                const deviceIndex = user.devices.findIndex(({ name }) => name == deviceName)

                if(user.devices[deviceIndex].inputs[inputIndex].values.length >= 10) user.devices[deviceIndex].inputs[inputIndex].values.shift()

                user.devices[deviceIndex].inputs[inputIndex].values.push({value, date: Date.now()})

                await Users.findByIdAndUpdate(id, user)

            } catch (error) {
                throw new LogicError(error.message)
            }
        })()
    },

    retrieveAnalog(id, deviceName){
        validate.arguments([
            { name: 'id', value: id, type: 'string', notEmpty: true },
            { name: 'deviceName', value: deviceName, type: 'string', notEmpty: true }
        ])

        return (async () => {

            try {
                const user = await Users.findById(id)
                if (!user) throw new LogicError(`user with id: ${id} does not exist`)

                let users = await Users.find({ $and: [{ _id: id }, { 'devices.name': deviceName }] })
                if (users.length == 0) throw new LogicError(`A device named ${deviceName} does not exist in your collection`)

                const device = users[0].devices.filter(({ name }) => name == deviceName)

                const inputIndex = device[0].inputs.findIndex(({ type }) => (type == 'analog'))

                if (inputIndex == -1) throw new LogicError(`no analog input declared in the WOTdevice ${deviceName}`)

                const deviceIndex = user.devices.findIndex(({ name }) => name == deviceName)

                return user.devices[deviceIndex].inputs[inputIndex].values
            } catch (error) {
                throw new LogicError(error.message)
            }
        })()
    },

    retrieveDigital(id, deviceName, pinNumber){
        validate.arguments([
            { name: 'id', value: id, type: 'string', notEmpty: true },
            { name: 'deviceName', value: deviceName, type: 'string', notEmpty: true },
            { name: 'pinNumber', value: pinNumber, type: 'number', notEmpty: true }
        ])

        return (async () => {

            try {
                const user = await Users.findById(id)
                if (!user) throw new LogicError(`user with id: ${id} does not exist`)

                let users = await Users.find({ $and: [{ _id: id }, { 'devices.name': deviceName }] })
                if (users.length == 0) throw new LogicError(`A device named ${deviceName} does not exist in your collection`)

                const device = users[0].devices.filter(({ name }) => name == deviceName)

                const inputIndex = device[0].inputs.findIndex(({ type, direction }) => (type == 'digital') && (direction == pinNumber))

                if (inputIndex == -1) throw new LogicError(`no digital input declared in the WOTdevice ${deviceName}`)

                const deviceIndex = user.devices.findIndex(({ name }) => name == deviceName)

                return user.devices[deviceIndex].inputs[inputIndex].values
            } catch (error) {
                throw new LogicError(error.message)
            }
        })()
    }

}

module.exports = logic