require('dotenv').config()
const { expect } =  require ('chai')
const logic = require('.')
const { LogicError, RequirementError, ValueError, FormatError } = require('wotcontrol-errors')
const {models, mongoose} = require('wotcontrol-data')

const { Users, Devices } = models;
const { env: { MONGO_URL_LOGIC_TEST : url }} = process

describe('logic', () => {

    before(async () => {
        await mongoose.connect(url, { useNewUrlParser: true })
    })

    const name = 'Marc'
    const surname = 'Uson'
    let email
    const password = '123'
    const isAdmin = true;
    let id
    let deviceName
    let deviceIp
    const devicePort = 80


    beforeEach(async () => {
        await Users.deleteMany()

        email = `marcusontest-${Math.random()}@gmail.com`
    })

    describe('users', () => {
        describe('register user', () => {
            it('should succeed on correct user data', async () => {

                const res = await logic.registerUser(name, surname, email, password)

                expect(res).to.not.exist

                const _user = await Users.find({ email })

                expect(_user).to.exist
                expect(_user).to.be.an.instanceOf(Array)
                expect(_user[0].id).to.exist
                expect(_user[0].id).to.be.a('string')
                expect(_user[0].admin).to.be.false
            })

            it('should succeed on correct admin user data', async () => {
                const res = await logic.registerUser(name, surname, email, password, isAdmin)

                expect(res).to.not.exist

                const _user = await Users.find({ email })

                expect(_user).to.exist
                expect(_user).to.be.an.instanceOf(Array)
                expect(_user[0].id).to.exist
                expect(_user[0].id).to.be.a('string')
                expect(_user[0].admin).to.be.true
            })

            it('should succeed on registering email in lower case', async () => {

                const uperCaseEmail = email.toUpperCase()

                const res = await logic.registerUser(name, surname, uperCaseEmail, password)

                expect(res).to.not.exist

                const _user = await Users.find({ email })

                expect(_user).to.exist
                expect(_user).to.be.an.instanceOf(Array)
                expect(_user[0].id).to.exist
                expect(_user[0].id).to.be.a('string')
                expect(_user[0].admin).to.be.false
            })

            describe('on already existing user', () => {
                beforeEach(() => Users.create({ name, surname, email, password }))

                it('should fail on retrying to register', async () => {
                    try {
                        await logic.registerUser(name, surname, email, password)

                        throw Error('should not reach this point')
                    } catch (error) {
                        expect(error).to.exist
                        expect(error).to.be.an.instanceOf(LogicError)

                        expect(error.message).to.equal(`user with email "${email}" already exists`)
                    }
                })
            })

            it('should fail on undefined name', () => {
                const name = undefined

                expect(() => logic.registerUser(name, surname, email, password)).to.throw(RequirementError, `name is not optional`)
            })

            it('should fail on null name', () => {
                const name = null

                expect(() => logic.registerUser(name, surname, email, password)).to.throw(RequirementError, `name is not optional`)
            })

            it('should fail on empty name', () => {
                const name = ''

                expect(() => logic.registerUser(name, surname, email, password)).to.throw(ValueError, 'name is empty')
            })

            it('should fail on blank name', () => {
                const name = ' \t    \n'

                expect(() => logic.registerUser(name, surname, email, password)).to.throw(ValueError, 'name is empty')
            })

            it('should fail on undefined surname', () => {
                const surname = undefined

                expect(() => logic.registerUser(name, surname, email, password)).to.throw(RequirementError, `surname is not optional`)
            })

            it('should fail on null surname', () => {
                const surname = null

                expect(() => logic.registerUser(name, surname, email, password)).to.throw(RequirementError, `surname is not optional`)
            })

            it('should fail on empty surname', () => {
                const surname = ''

                expect(() => logic.registerUser(name, surname, email, password)).to.throw(ValueError, 'surname is empty')
            })

            it('should fail on blank surname', () => {
                const surname = ' \t    \n'

                expect(() => logic.registerUser(name, surname, email, password)).to.throw(ValueError, 'surname is empty')
            })

            it('should fail on undefined email', () => {
                const email = undefined

                expect(() => logic.registerUser(name, surname, email, password)).to.throw(RequirementError, `email is not optional`)
            })

            it('should fail on null email', () => {
                const email = null

                expect(() => logic.registerUser(name, surname, email, password)).to.throw(RequirementError, `email is not optional`)
            })

            it('should fail on empty email', () => {
                const email = ''

                expect(() => logic.registerUser(name, surname, email, password)).to.throw(ValueError, 'email is empty')
            })

            it('should fail on blank email', () => {
                const email = ' \t    \n'

                expect(() => logic.registerUser(name, surname, email, password)).to.throw(ValueError, 'email is empty')
            })

            it('should fail on non-email email', () => {
                const nonEmail = 'non-email'

                expect(() => logic.registerUser(name, surname, nonEmail, password)).to.throw(FormatError, `${nonEmail} is not an e-mail`)
            })

            it('should fail on undefined password', () => {
                const password = undefined

                expect(() => logic.registerUser(name, surname, email, password)).to.throw(RequirementError, `password is not optional`)
            })

            it('should fail on null password', () => {
                const password = null

                expect(() => logic.registerUser(name, surname, email, password)).to.throw(RequirementError, `password is not optional`)
            })

            it('should fail on empty password', () => {
                const password = ''

                expect(() => logic.registerUser(name, surname, email, password)).to.throw(ValueError, 'password is empty')
            })

            it('should fail on blank password', () => {
                const password = ' \t    \n'

                expect(() => logic.registerUser(name, surname, email, password)).to.throw(ValueError, 'password is empty')
            })

        })

        describe('authenticate user', () => {
            beforeEach(() =>
                Users.create({ name, surname, email, password })
            )

            it('should succeed on correct user credential', async () => {
                const id = await logic.authenticateUser(email, password)

                expect(id).to.be.a('string')
                expect(id.length).to.be.greaterThan(0)
            })

            it('should fail on non-existing user', async () => {
                try {
                    await logic.authenticateUser(email = 'unexisting-user@mail.com', password)

                    throw Error('should not reach this point')
                } catch (error) {
                    expect(error).to.exist
                    expect(error).to.be.instanceOf(LogicError)

                    expect(error.message).to.equal(`user with email "${email}" does not exist`)
                }
            })
        })

        describe('retrieve user', () => {
            let id

            beforeEach(async () => {
                await Users.create({ name, surname, email, password })

                const users = await Users.find({email})

                id = users[0].id
            })

            it('should succeed on correct user id from existing user', async () => {
                const user = await logic.retrieveUser(id)

                expect(user.id).to.not.exist
                expect(user.name).to.equal(name)
                expect(user.surname).to.equal(surname)
                expect(user.email).to.equal(email)
                expect(user.password).to.not.exist
            })

            it('should fail on unexisting user id', async () => {
                id = '01234567890123456789abcd'

                try {
                    await logic.retrieveUser(id)

                    throw new Error('should not reach this point')
                } catch (error) {
                    expect(error).to.exist

                    expect(error).to.be.an.instanceOf(LogicError)

                    expect(error.message).to.equal(`user with id "${id}" does not exist`)
                }
            })
        })

        describe('update user', () => {
            let id

            beforeEach(async () => {
                await Users.create({ name, surname, email, password })

                const users = await Users.find({email})

                id = users[0].id
            })

            it('should succeed on updating user name', async () => {
                let newName = 'newName'
                const response = await logic.updateUser(id, {name: newName})

                expect(response).to.be.a('string')
                expect(response).to.equal('User succesfully updated')

                const user = await logic.retrieveUser(id)

                expect(user.id).to.not.exist
                expect(user.name).to.equal(newName)
                expect(user.surname).to.equal(surname)
                expect(user.email).to.equal(email)
                expect(user.password).to.not.exist
            })

            it('should succeed on updating user surname', async () => {
                let newSurname = 'newSurname'
                const response = await logic.updateUser(id, {surname: newSurname})

                expect(response).to.be.a('string')
                expect(response).to.equal('User succesfully updated')

                const user = await logic.retrieveUser(id)

                expect(user.id).to.not.exist
                expect(user.name).to.equal(name)
                expect(user.surname).to.equal(newSurname)
                expect(user.email).to.equal(email)
                expect(user.password).to.not.exist
            })

            it('should succeed on updating user email', async () => {
                let newEmail = 'newemail@mail.com'

                const response = await logic.updateUser(id, {email: newEmail})

                expect(response).to.be.a('string')
                expect(response).to.equal('User succesfully updated')

                const user = await logic.retrieveUser(id)

                expect(user.id).to.not.exist
                expect(user.name).to.equal(name)
                expect(user.surname).to.equal(surname)
                expect(user.email).to.equal(newEmail)
                expect(user.password).to.not.exist
            })

            it('should succeed on updating user password', async () => {
                let newPassword = 'newpassword'

                const response = await logic.updateUser(id, {password: newPassword})

                expect(response).to.be.a('string')
                expect(response).to.equal('User succesfully updated')

                const user = await logic.retrieveUser(id)

                expect(user.id).to.not.exist
                expect(user.name).to.equal(name)
                expect(user.surname).to.equal(surname)
                expect(user.email).to.equal(email)
                expect(user.password).to.not.exist

                const _id = await logic.authenticateUser(email, newPassword)

                expect(_id).to.be.a('string')
                expect(_id.length).to.be.greaterThan(0)
            })

            it('should fail on unexisting user id', async () => {
                id = '01234567890123456789abcd'

                try {
                    await logic.updateUser(id, {email})

                    throw new Error('should not reach this point')
                } catch (error) {
                    expect(error).to.exist

                    expect(error).to.be.an.instanceOf(LogicError)

                    expect(error.message).to.equal(`user with id "${id}" does not exist`)
                }
            })
        })

        describe('delete user', () => {
            let id

            beforeEach(async () => {
                await Users.create({ name, surname, email, password })

                const users = await Users.find({email})

                id = users[0].id
            })

            it('should succeed on deleting', async () => {
                const response = await logic.deleteUser(id)

                expect(response).to.be.a('string')
                expect(response).to.equal('User succesfully deleted')

                try {
                    await logic.retrieveUser(id)

                    throw new Error('should not reach this point')
                } catch (error) {
                    expect(error).to.exist

                    expect(error).to.be.an.instanceOf(LogicError)

                    expect(error.message).to.equal(`user with id "${id}" does not exist`)
                }
            })

            it('should fail on unexisting user id', async () => {
                id = '01234567890123456789abcd'

                try {
                    await logic.deleteUser(id)

                    throw new Error('should not reach this point')
                } catch (error) {
                    expect(error).to.exist

                    expect(error).to.be.an.instanceOf(LogicError)

                    expect(error.message).to.equal(`user with id "${id}" does not exist`)
                }
            })
        })

    })

    describe('WOTdevices', () => {

        describe('register WOTdevice', () => {

            beforeEach(async() =>{
                email = `marcusontest-${Math.random()}@gmail.com`
                deviceName = `WOTdevice${Math.floor(Math.random()*999)}`
                deviceIp = `192.168.${String(Math.floor(Math.random()*100))}.${String(Math.floor(Math.random()*255))}`

                await Users.create({ name, surname, email, password, isAdmin })

                user = await Users.findOne({email})

                id = user.id
            })

            it('should succeed on correct WOTdevice register', async () => {
                const response = await logic.addDevice(id, deviceName, deviceIp, devicePort)

                expect(response).to.not.exist

                const _user = await Users.findById(id)

                const { devices } = _user

                expect(_user.id).to.equal(id)
                expect(devices).to.exist
                expect(devices).to.be.instanceOf(Array)
                expect(devices).to.have.length(1)
                expect(devices[0].name).to.equal(deviceName)
                expect(devices[0].ip).to.equal(deviceIp)
                expect(devices[0].port).to.equal(devicePort)
            })

            it('should succeed on two correct WOTdevices register', async () => {

                await logic.addDevice(id, deviceName, deviceIp, devicePort)

                let _user = await Users.findById(id)

                let { devices } = _user

                expect(devices).to.have.length(1)
                expect(devices[0].name).to.equal(deviceName)
                expect(devices[0].ip).to.equal(deviceIp)
                expect(devices[0].port).to.equal(devicePort)

                deviceName = `WOTdevice${Math.floor(Math.random()*999)}`
                deviceIp = `192.168.${String(Math.floor(Math.random()*100))}.${String(Math.floor(Math.random()*255))}`

                const response = await logic.addDevice(id, deviceName, deviceIp, devicePort)

                expect(response).to.not.exist

                _user = await Users.findById(id)

                const { devices:_devices } = _user

                expect(_user.id).to.equal(id)
                expect(_devices).to.exist
                expect(_devices).to.be.instanceOf(Array)
                expect(_devices).to.have.length(2)
                expect(_devices[1].name).to.equal(deviceName)
                expect(_devices[1].ip).to.equal(deviceIp)
                expect(_devices[1].port).to.equal(devicePort)
            })

            it('should fail adding a new WOTdevice with an already used name', async () => {
                const _ip = '192.168.0.0'
                const user = await Users.findById(id)

                user.devices.push(new Devices({ name: deviceName, ip: deviceIp, port: devicePort}))
                await user.save()

                try {
                    await logic.addDevice(id, deviceName, _ip, devicePort)

                    throw Error('should not reach this point')
                } catch (error) {
                    expect(error).to.exist
                    expect(error).to.be.an.instanceOf(LogicError)

                    expect(error.message).to.equal(`A device named ${deviceName} is already in your collection`)
                }
            })

            it('should fail adding a new WOTdevice with an already used ip', async () => {
                const _deviceName = 'newName'
                const user = await Users.findById(id)

                user.devices.push(new Devices({ name: deviceName, ip: deviceIp, port: devicePort}))
                await user.save()

                try {
                    await logic.addDevice(id, _deviceName, deviceIp, devicePort)

                    throw Error('should not reach this point')
                } catch (error) {
                    expect(error).to.exist
                    expect(error).to.be.an.instanceOf(LogicError)

                    expect(error.message).to.equal(`A device with ip ${deviceIp} is already in your collection`)
                }
            })

            it('should fail adding a new WOTdevice to an unexisting user', async () => {
                let _id = 'unexistingId'
                try {
                    await logic.addDevice(_id, deviceName, deviceIp, devicePort)

                    throw Error('should not reach this point')
                } catch (error) {
                    expect(error).to.exist
                    expect(error).to.be.an.instanceOf(LogicError)

                    expect(error.message).to.equal(`user with id: ${_id} does not exist`)
                }
            })

            it('should fail on undefined device id', () => {
                const id = undefined

                expect(() => logic.addDevice(id, deviceName, deviceIp, devicePort).to.throw(RequirementError, `id is not optional`))
            })

            it('should fail on null id', () => {
                const id = null

                expect(() => logic.addDevice(id, deviceName, deviceIp, devicePort).to.throw(RequirementError, `id is not optional`))
            })

            it('should fail on empty id', () => {
                const id = ''

                expect(() => logic.addDevice(id, deviceName, deviceIp, devicePort).to.throw(ValueError, 'id is empty'))
            })

            it('should fail on blank id', () => {
                const id = ' \t    \n'

                expect(() => logic.addDevice(id, deviceName, deviceIp, devicePort).to.throw(ValueError, 'deviceName is empty'))
            })

            it('should fail on undefined device deviceName', () => {
                const deviceName = undefined

                expect(() => logic.addDevice(id, deviceName, deviceIp, devicePort).to.throw(RequirementError, `deviceName is not optional`))
            })

            it('should fail on null deviceName', () => {
                const deviceName = null

                expect(() => logic.addDevice(id, deviceName, deviceIp, devicePort).to.throw(RequirementError, `deviceName is not optional`))
            })

            it('should fail on empty deviceName', () => {
                const deviceName = ''

                expect(() => logic.addDevice(id, deviceName, deviceIp, devicePort).to.throw(ValueError, 'deviceName is empty'))
            })

            it('should fail on blank deviceName', () => {
                const deviceName = ' \t    \n'

                expect(() => logic.addDevice(id, deviceName, deviceIp, devicePort).to.throw(ValueError, 'deviceName is empty'))
            })

            it('should fail on undefined device deviceIp', () => {
                const deviceIp = undefined

                expect(() => logic.addDevice(id, deviceName, deviceIp, devicePort).to.throw(RequirementError, `deviceIp is not optional`))
            })

            it('should fail on null deviceIp', () => {
                const deviceIp = null

                expect(() => logic.addDevice(id, deviceName, deviceIp, devicePort).to.throw(RequirementError, `deviceIp is not optional`))
            })

            it('should fail on empty deviceIp', () => {
                const deviceIp = ''

                expect(() => logic.addDevice(id, deviceName, deviceIp, devicePort).to.throw(ValueError, 'deviceIp is empty'))
            })

            it('should fail on blank deviceIp', () => {
                const deviceIp = ' \t    \n'

                expect(() => logic.addDevice(id, deviceName, deviceIp, devicePort).to.throw(ValueError, 'deviceIp is empty'))
            })

            it('should fail on undefined device devicePort', () => {
                const devicePort = undefined

                expect(() => logic.addDevice(id, deviceName, deviceIp, devicePort).to.throw(RequirementError, `devicePort is not optional`))
            })

            it('should fail on null devicePort', () => {
                const devicePort = null

                expect(() => logic.addDevice(id, deviceName, deviceIp, devicePort).to.throw(RequirementError, `devicePort is not optional`))
            })

            it('should fail on empty devicePort', () => {
                const devicePort = ''

                expect(() => logic.addDevice(id, deviceName, deviceIp, devicePort).to.throw(ValueError, 'devicePort is empty'))
            })

            it('should fail on blank devicePort', () => {
                const devicePort = ' \t    \n'

                expect(() => logic.addDevice(id, deviceName, deviceIp, devicePort).to.throw(ValueError, 'devicePort is empty'))
            })
        })

        describe('delete WOTdevice', () => {

            beforeEach(async() =>{
                email = `marcusontest-${Math.random()}@gmail.com`
                deviceName = `WOTdevice${Math.floor(Math.random()*999)}`
                deviceIp = `192.168.${String(Math.floor(Math.random()*100))}.${String(Math.floor(Math.random()*255))}`

                await Users.create({ name, surname, email, password, isAdmin })

                user = await Users.findOne({email})

                id = user.id
            })

            it('should succeed on correct WOTdevice deletion', async () => {
                await logic.addDevice(id, deviceName, deviceIp, devicePort)
                await logic.deleteDevice(id, deviceName)

                const _user = await Users.findById(id)

                const { devices } = _user

                expect(_user.id).to.equal(id)
                expect(devices).to.exist
                expect(devices).to.be.instanceOf(Array)
                expect(devices).to.have.length(0)
            })

            it('should fail on unexisting user', async () => {
                await logic.addDevice(id, deviceName, deviceIp, devicePort)

                let _id = 'unexistingId'

                try {
                    await logic.deleteDevice(_id, deviceName)

                    throw Error('should not reach this point')
                } catch (error) {
                    expect(error).to.exist
                    expect(error).to.be.an.instanceOf(LogicError)

                    expect(error.message).to.equal(`user with id: ${_id} does not exist`)
                }

            })

            it('should fail on unexisting device', async () => {
                await logic.addDevice(id, deviceName, deviceIp, devicePort)

                deviceName = 'unexisting device'

                try {
                    await logic.deleteDevice(id, deviceName)

                    throw Error('should not reach this point')
                } catch (error) {
                    expect(error).to.exist
                    expect(error).to.be.an.instanceOf(LogicError)

                    expect(error.message).to.equal(`A device named ${deviceName} does not exist`)
                }

            })


            it('should fail on undefined id', () => {
                const id = undefined

                expect(() => logic.deleteDevice(id, deviceName, deviceIp, devicePort).to.throw(RequirementError, `id is not optional`))
            })

            it('should fail on null id', () => {
                const id = null

                expect(() => logic.deleteDevice(id, deviceName, deviceIp, devicePort).to.throw(RequirementError, `id is not optional`))
            })

            it('should fail on empty id', () => {
                const id = ''

                expect(() => logic.deleteDevice(id, deviceName, deviceIp, devicePort).to.throw(ValueError, 'id is empty'))
            })

            it('should fail on blank id', () => {
                const id = ' \t    \n'

                expect(() => logic.deleteDevice(id, deviceName).to.throw(ValueError, 'deviceName is empty'))
            })

            it('should fail on undefined device deviceName', () => {
                const deviceName = undefined

                expect(() => logic.deleteDevice(id, deviceName).to.throw(RequirementError, `deviceName is not optional`))
            })

            it('should fail on null deviceName', () => {
                const deviceName = null

                expect(() => logic.deleteDevice(id, deviceName).to.throw(RequirementError, `deviceName is not optional`))
            })

            it('should fail on empty deviceName', () => {
                const deviceName = ''

                expect(() => logic.deleteDevice(id, deviceName).to.throw(ValueError, 'deviceName is empty'))
            })

            it('should fail on blank deviceName', () => {
                const deviceName = ' \t    \n'

                expect(() => logic.deleteDevice(id, deviceName).to.throw(ValueError, 'deviceName is empty'))
            })

        })

        describe('manage inputs', () =>{

            beforeEach(async() =>{
                email = `marcusontest-${Math.random()}@gmail.com`
                deviceName = `WOTdevice${Math.floor(Math.random()*999)}`
                deviceIp = `192.168.${String(Math.floor(Math.random()*100))}.${String(Math.floor(Math.random()*255))}`
                let inputType = ''
                let inputDirection = 0

                await Users.create({ name, surname, email, password, isAdmin })
                user = await Users.findOne({email})
                id = user.id
                user.devices.push(new Devices({ name: deviceName, ip: deviceIp, port: devicePort}))
                await user.save()
            })

            it('should succed adding a new WOTdevice digital input', async()=>{
                inputType = 'digital'
                inputDirection = 1
                const response = await logic.addInput(id, deviceName, inputType, inputDirection)

                expect(response).to.not.exist
                const _user = await Users.findById(id)

                const { devices } = _user

                expect(devices[0].name).to.equal(deviceName)
                expect(devices[0].inputs).to.exist
                expect(devices[0].inputs).to.be.instanceOf(Array)
                expect(devices[0].inputs).to.have.length(1)
                expect(devices[0].inputs.type).to.equal(inputType)
                expect(devices[0].inputs.direction).to.equal(inputDirection)
                expect(devices[0].inputs.value).to.be.undefined

            })
        })
    })
    after(() => {
        mongoose.disconnect()
    })

})