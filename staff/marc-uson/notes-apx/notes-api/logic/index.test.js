require('dotenv').config()
const { expect } =  require ('chai')
const logic = require('.')
const { LogicError, RequirementError, ValueError, FormatError } = require('../common/errors')
const {Users, Notes } = require('../data/models')
require('../common/utils/object-matches.polyfill')
require('../common/utils/array-random.polyfill')
const mongoose = require('mongoose')

const { env: { MONGO_URL_LOGIC_TEST : url }} = process

describe('logic', () => {

    before(async () => {
        await mongoose.connect('mongodb://localhost/rest-api-logic-test', { useNewUrlParser: true })
    })

    const name = 'Manuel'
    const surname = 'Barzi'
    let email
    const password = '123'

    beforeEach(async () => {
        await Users.deleteMany()

        await Notes.deleteMany()

        email = `manuelbarzi-${Math.random()}@gmail.com`
    })

    describe('users', () => {
        describe('register user', () => {
            it('should succeed on correct user data', async () => {

                const res = await logic.registerUser(name, surname, email, password)

                expect(res).to.not.exist

                const _user = await Users.find({email})

                expect(_user).to.exist
                expect(_user).to.be.an.instanceOf(Array)
                expect(_user[0].id).to.exist
                expect(_user[0].id).to.be.a('string')
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

            // TODO password fail cases
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

    })

    describe('notes', () => {
        const note = 'Example note'
        let id

        beforeEach( async () => {
            await Users.create({ name, surname, email, password })

            const users = await Users.find({email})

            id = users[0].id
        })

        it('shoul succes on adding a public note', async () => {
            debugger
            const response = await logic.addPublicNote(id, note)

            expect(response).to.exist
            expect(response).to.be.a('string')
            expect(response).to.equal('Message published')
        })

        it('shoul succes on adding a private note', async () => {

            const response = await logic.addPrivateNote(id, note)

            expect(response).to.exist
            expect(response).to.be.a('string')
            expect(response).to.equal('Message published')

            const allUsers = await Users.find()
            expect(allUsers[0].notes).to.exist
            expect(allUsers[0].notes).to.be.a('array')
            expect(allUsers[0].notes.length).to.equal(1)
        })

        it('shoul succes on adding two private notes', async () => {

            const response = await logic.addPrivateNote(id, note)

            expect(response).to.exist
            expect(response).to.be.a('string')
            expect(response).to.equal('Message published')

            const response2 = await logic.addPrivateNote(id, note)

            expect(response2).to.exist
            expect(response2).to.be.a('string')
            expect(response2).to.equal('Message published')

            const allUsers = await Users.find()
            expect(allUsers[0].notes).to.exist
            expect(allUsers[0].notes).to.be.a('array')
            expect(allUsers[0].notes.length).to.equal(2)
        })

        it('shoul succes on deleting a public note', async () => {

            const newNote = await Notes.create({text: note, author: id})

            let allNotes = await Notes.find()

            expect(allNotes).to.exist
            expect(allNotes).to.be.instanceOf(Object)
            expect(allNotes.length).to.equal(1)

            const response = await logic.deletePublicNote(newNote.id)
            expect(response).to.exist
            expect(response).to.be.a('string')
            expect(response).to.equal('Message deleted')
            allNotes = await Notes.find()
            expect(allNotes).to.exist
            expect(allNotes).to.be.an.instanceOf(Object)
            expect(allNotes.length).to.equal(0)
        })

        it('shoul succes on deleting a private note', async () => {

            // const user = await Users.findById(id)
            // user.notes.push(note)
            // await user.save()
            // let notes = await Users.findById(id).select('notes')
            // logic.deletePrivateNote(id, notes[0].id)

            // expect(response).to.exist
            // expect(response).to.be.a('string')
            // expect(response).to.be.a('Message deleted')
            // notes = await Users.findById(id).select('notes')

        })
        after(() => {
            mongoose.disconnect()
        })
    })

})