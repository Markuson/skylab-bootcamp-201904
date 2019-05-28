const dotenv = require('dotenv')
const { mongoose, models } = require('cf-mce-data')
const { errors: {LogicError, RequirementError, ValueError, FormatError}  } = require('cf-mce-common')
const { expect } = require('chai')
const logic = require('.')
const argon2 = require('argon2')

dotenv.config()

const { User, Customer, ElectronicControlModule, Product, Note } = models
const { env: { MONGO_URL_LOGIC_TEST: url } } = process

describe('logic', () => {
    let name, surname, email, password, category

    const categories = ['MASTER', 'TECHNICIAN', 'ASSISTANT']

    before(() => mongoose.connect(url, { useNewUrlParser: true }))

    beforeEach(async () => {
        await User.deleteMany()
        await Note.deleteMany()

        name = `name-${Math.random()}`
        surname = `surname-${Math.random()}`
        email = `email-${Math.random()}@mail.com`
        password = `password-${Math.random()}`
        category = categories[Math.floor(Math.random()*categories.length)]

    })

    describe('user', () => {
        describe('register user', () => {
            it('should succeed on correct data', async () => {
                const res = await logic.registerUser(name, surname, email, password, category)
    
                expect(res).to.be.undefined
    
                const users = await User.find()
    
                expect(users).to.exist
                expect(users).to.have.lengthOf(1)
    
                const [user] = users
    
                expect(user.name).to.equal(name)
                expect(user.surname).to.equal(surname)
                expect(user.email).to.equal(email)
    
                expect(user.password).to.exist
    
                expect(await argon2.verify(user.password, password)).to.be.true
            })

            it('should fail when retrying to register on already existing user', async () => {
                const hash = await argon2.hash(password)
                await User.create({ name, surname, email, password: hash, category })
                try {
                    await logic.registerUser(name, surname, email, password, category)

                    throw Error('should not reach this point')
                } catch (error) {
                    expect(error).to.exist
                    expect(error).to.be.instanceof(LogicError)

                    expect(error.message).to.equal(`user with email "${email}" already exists`)
                }
            })

            it('should fail on undefined name', () => {
                const name = undefined

                expect(() => logic.registerUser(name, surname, email, password, category)).to.throw(RequirementError, `name is not optional`)
            })

            it('should fail on null name', () => {
                const name = null

                expect(() => logic.registerUser(name, surname, email, password, category)).to.throw(RequirementError, `name is not optional`)
            })

            it('should fail on empty name', () => {
                const name = ''

                expect(() => logic.registerUser(name, surname, email, password, category)).to.throw(ValueError, 'name is empty')
            })

            it('should fail on blank name', () => {
                const name = ' \t    \n'

                expect(() => logic.registerUser(name, surname, email, password, category)).to.throw(ValueError, 'name is empty')
            })

            it('should fail on undefined surname', () => {
                const surname = undefined

                expect(() => logic.registerUser(name, surname, email, password, category)).to.throw(RequirementError, `surname is not optional`)
            })

            it('should fail on null surname', () => {
                const surname = null

                expect(() => logic.registerUser(name, surname, email, password, category)).to.throw(RequirementError, `surname is not optional`)
            })

            it('should fail on empty surname', () => {
                const surname = ''

                expect(() => logic.registerUser(name, surname, email, password, category)).to.throw(ValueError, 'surname is empty')
            })

            it('should fail on blank surname', () => {
                const surname = ' \t    \n'

                expect(() => logic.registerUser(name, surname, email, password, category)).to.throw(ValueError, 'surname is empty')
            })

            it('should fail on undefined email', () => {
                const email = undefined

                expect(() => logic.registerUser(name, surname, email, password, category)).to.throw(RequirementError, `email is not optional`)

            })

            it('should fail on null email', () => {
                const email = null

                expect(() => logic.registerUser(name, surname, email, password, category)).to.throw(RequirementError, `email is not optional`)
            })

            it('should fail on empty email', () => {
                const email = ''

                expect(() => logic.registerUser(name, surname, email, password, category)).to.throw(ValueError, 'email is empty')

            })

            it('should fail on blank email', () => {
                const email = ' \t    \n'

                expect(() => logic.registerUser(name, surname, email, password, category)).to.throw(ValueError, 'email is empty')
            })

            it('should fail on non-email email', () => {
                const nonEmail = 'non-email'

                expect(() => logic.registerUser(name, surname, nonEmail, password, category)).to.throw(FormatError, `${nonEmail} is not an e-mail`)

            })

            it('should fail on undefined password', () => {
                const password = undefined

                expect(() => logic.registerUser(name, surname, email, password, category)).to.throw(RequirementError, `password is not optional`)
            })

            it('should fail on null password', () => {
                const password = null

                expect(() => logic.registerUser(name, surname, email, password, category)).to.throw(RequirementError, `password is not optional`)
            })

            it('should fail on empty password', () => {
                const password = ''

                expect(() => logic.registerUser(name, surname, email, password, category)).to.throw(ValueError, 'password is empty')
            })

            it('should fail on blank password', () => {
                const password = ' \t    \n'

                expect(() => logic.registerUser(name, surname, email, password, category)).to.throw(ValueError, 'password is empty')
            })

            it('should fail on undefined category', () => {
                const category = undefined

                expect(() => logic.registerUser(name, surname, email, password, category)).to.throw(RequirementError, `category is not optional`)

            })

            it('should fail on null category', () => {
                const category = null

                expect(() => logic.registerUser(name, surname, email, password, category)).to.throw(RequirementError, `category is not optional`)
            })

            it('should fail on empty category', () => {
                const category = ''

                expect(() => logic.registerUser(name, surname, email, password, category)).to.throw(ValueError, 'category is empty')

            })

            it('should fail on blank category', () => {
                const category = ' \t    \n'

                expect(() => logic.registerUser(name, surname, email, password, category)).to.throw(ValueError, 'category is empty')
            })

            it('should fail on non-category category', () => {
                const nonCategory = 'non-category'
                
                expect(() => logic.registerUser(name, surname, email, password, nonCategory)).to.throw(LogicError, `${nonCategory} is not a valid option for category`)

            })

        })

        


    
        // describe('authenticate user', () => {
        //     let user
    
        //     beforeEach(async () => user = await User.create({ name, surname, email, password: await argon2.hash(password) }))
    
        //     it('should succeed on correct credentials', async () => {
        //         const id = await logic.authenticateUser(email, password)
    
        //         expect(id).to.exist
        //         expect(id).to.be.a('string')
    
        //         expect(id).to.equal(user.id)
        //     })
        // })
    
        // describe('retrieve user', () => {
        //     let user
    
        //     beforeEach(async () => user = await User.create({ name, surname, email, password: await argon2.hash(password) }))
    
        //     it('should succeed on correct id from existing user', async () => {
        //         const _user = await logic.retrieveUser(user.id)
    
        //         expect(_user.id).to.be.undefined
        //         expect(_user.name).to.equal(name)
        //         expect(_user.surname).to.equal(surname)
        //         expect(_user.email).to.equal(email)
    
        //         expect(_user.password).to.be.undefined
        //     })
        // })
    })

    // describe('customer', () => {
    //     //TODO
    //     describe('add private note', () => {
    //         let user
    
    //         beforeEach(async () => user = await User.create({ name, surname, email, password: await argon2.hash(password) }))
    
    //         it('should succeed on existing user', async () => {
    //             const text = 'Hola, Mundo!'
    
    //             const res = await logic.addPrivateNote(user.id, text)
    
    //             expect(res).to.be.undefined
    
    //             // const notes = await Note.find()
    //             const _user = await User.findById(user.id)
    
    //             const { notes } = _user
    
    //             expect(notes).to.exist
    //             expect(notes).to.have.lengthOf(1)
    
    //             const [note] = notes
    
    //             expect(note._id).to.exist
    
    //             expect(note.text).to.equal(text)
    
    //             expect(note.author.toString()).to.equal(user.id)
    //         })
    //     })
    
    //     describe('retrieve private notes', () => {
    //         let user
    
    //         beforeEach(async () => {
    //             user = await User.create({ name, surname, email, password: await argon2.hash(password) })
    
    //             const texts = new Array(10).fill('note-').map(text => `${text}-${Math.random()}`)
    
    //             user.notes = texts.map(text => new Note({ text, author: user.id }))
    
    //             await user.save()
    //         })
    
    //         it('should succeed for existing user', async () => {
    //             const _notes = await logic.retrievePrivateNotes(user.id)
    
    //             expect(_notes).to.exist
    //             expect(_notes).to.have.lengthOf(user.notes.length)
    
    //             _notes.forEach(note => {
    //                 expect(note._id).to.be.undefined
    //                 expect(note.id).to.exist
    //                 expect(note.id).to.be.a('string')
    
    //                 expect(note.text).to.exist
    //                 expect(note.text).to.be.a('string')
    //                 const _note = user.notes.find(_note => _note.id === note.id)
    //                 expect(note.text).to.equal(_note.text)
    
    //                 expect(note.date).to.exist
    //                 expect(note.date).to.be.instanceOf(Date)
    
    //                 expect(note.author).to.equal(user.id)
    //             })
    //         })
    //     })
    // })

    // describe('electronic module control', () => {
    //     //TODO
    //     describe('add private note', () => {
    //         let user
    
    //         beforeEach(async () => user = await User.create({ name, surname, email, password: await argon2.hash(password) }))
    
    //         it('should succeed on existing user', async () => {
    //             const text = 'Hola, Mundo!'
    
    //             const res = await logic.addPrivateNote(user.id, text)
    
    //             expect(res).to.be.undefined
    
    //             // const notes = await Note.find()
    //             const _user = await User.findById(user.id)
    
    //             const { notes } = _user
    
    //             expect(notes).to.exist
    //             expect(notes).to.have.lengthOf(1)
    
    //             const [note] = notes
    
    //             expect(note._id).to.exist
    
    //             expect(note.text).to.equal(text)
    
    //             expect(note.author.toString()).to.equal(user.id)
    //         })
    //     })
    
    //     describe('retrieve private notes', () => {
    //         let user
    
    //         beforeEach(async () => {
    //             user = await User.create({ name, surname, email, password: await argon2.hash(password) })
    
    //             const texts = new Array(10).fill('note-').map(text => `${text}-${Math.random()}`)
    
    //             user.notes = texts.map(text => new Note({ text, author: user.id }))
    
    //             await user.save()
    //         })
    
    //         it('should succeed for existing user', async () => {
    //             const _notes = await logic.retrievePrivateNotes(user.id)
    
    //             expect(_notes).to.exist
    //             expect(_notes).to.have.lengthOf(user.notes.length)
    
    //             _notes.forEach(note => {
    //                 expect(note._id).to.be.undefined
    //                 expect(note.id).to.exist
    //                 expect(note.id).to.be.a('string')
    
    //                 expect(note.text).to.exist
    //                 expect(note.text).to.be.a('string')
    //                 const _note = user.notes.find(_note => _note.id === note.id)
    //                 expect(note.text).to.equal(_note.text)
    
    //                 expect(note.date).to.exist
    //                 expect(note.date).to.be.instanceOf(Date)
    
    //                 expect(note.author).to.equal(user.id)
    //             })
    //         })
    //     })
    // })


    

    // describe('add public note', () => {
    //     let user

    //     beforeEach(async () => user = await User.create({ name, surname, email, password: await argon2.hash(password) }))

    //     it('should succeed for existing user', async () => {
    //         const text = 'Hola, Mundo!'

    //         const res = await logic.addPublicNote(user.id, text)

    //         expect(res).to.be.undefined

    //         const notes = await Note.find()

    //         expect(notes).to.exist
    //         expect(notes).to.have.lengthOf(1)

    //         const [note] = notes

    //         expect(note.text).to.equal(text)
    //         expect(note.author.toString()).to.equal(user.id)
    //     })
    // })

    // describe('retrieve public notes', () => {
    //     let user, notes

    //     beforeEach(async () => {
    //         user = await User.create({ name, surname, email, password: await argon2.hash(password) })

    //         const texts = new Array(10).fill('note-').map(text => `${text}-${Math.random()}`)

    //         notes = []

    //         await Promise.all(texts.map(async text => notes.push(await Note.create({ text, author: user.id }))))
    //     })

    //     it('should succeed for existing user', async () => {
    //         const _notes = await logic.retrievePublicNotes(user.id)

    //         expect(_notes).to.exist
    //         expect(_notes).to.have.lengthOf(notes.length)

    //         _notes.forEach(note => {
    //             expect(note._id).to.be.undefined
    //             expect(note.id).to.exist
    //             expect(note.id).to.be.a('string')

    //             expect(note.text).to.exist
    //             expect(note.text).to.be.a('string')
    //             const _note = notes.find(_note => _note.id === note.id)
    //             expect(note.text).to.equal(_note.text)

    //             expect(note.date).to.exist
    //             expect(note.date).to.be.instanceOf(Date)

    //             expect(note.author).to.be.an('object')
    //             expect(note.author.id).to.be.a('string')
    //             expect(note.author.name).to.be.a('string')
    //         })
    //     })
    // })


    // describe('retrieve all public notes', () => {
    //     let user, user2, notes, notes2

    //     beforeEach(async () => {
    //         user = await User.create({ name, surname, email, password: await argon2.hash(password) })
    //         user2 = await User.create({ name, surname, email: `${Math.random()}-${email}`, password: await argon2.hash(password) })

    //         let texts = new Array(10).fill('note-').map(text => `${text}-${Math.random()}`)

    //         notes = []

    //         await Promise.all(texts.map(async text => notes.push(await Note.create({ text, author: user.id }))))

    //         texts = new Array(10).fill('note-').map(text => `${text}-${Math.random()}`)

    //         notes2 = []

    //         await Promise.all(texts.map(async text => notes2.push(await Note.create({ text, author: user2.id }))))
    //     })

    //     it('should succeed for existing user', async () => {
    //         const _notes = await logic.retrieveAllPublicNotes()

    //         expect(_notes).to.exist
    //         expect(_notes).to.have.lengthOf(notes.length + notes2.length)

    //         _notes.forEach(note => {
    //             expect(note._id).to.be.undefined
    //             expect(note.id).to.exist
    //             expect(note.id).to.be.a('string')

    //             expect(note.text).to.exist
    //             expect(note.text).to.be.a('string')
    //             const _note = notes.find(_note => _note.id === note.id) || notes2.find(_note => _note.id === note.id)
    //             expect(note.text).to.equal(_note.text)

    //             expect(note.date).to.exist
    //             expect(note.date).to.be.instanceOf(Date)

    //             expect(note.author).to.be.an('object')
    //             expect(note.author.id).to.be.a('string')
    //             expect(note.author.name).to.be.a('string')

    //             expect(note.author.id).to.be.oneOf([user.id, user2.id])
    //         })

    //         expect(_notes.reduce((accum, { author }) => {
    //             accum[author.id]++

    //             return accum
    //         }, {
    //                 [user.id]: 0,
    //                 [user2.id]: 0
    //             })).to.deep.equal({
    //                 [user.id]: notes.length,
    //                 [user2.id]: notes2.length
    //             })
    //     })
    // })

    

    after(() => mongoose.disconnect())
})