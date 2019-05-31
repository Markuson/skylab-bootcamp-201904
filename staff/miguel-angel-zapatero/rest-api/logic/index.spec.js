require('dotenv').config()

const logic = require('.')
const { LogicError, RequirementError, ValueError, FormatError } = require('../common/errors')
const userData = require('../data/user-data')
const duckApi = require('../data/duck-api')
require('../common/utils/object-matches.polyfill')
require('../common/utils/array-random.polyfill')
const { MongoClient, ObjectId } = require('mongodb')

const { env: { MONGO_URL_LOGIC_TEST: url } } = process

describe('logic', () => {
    let client, users
    
    const names = ['Pepito', 'Fulanito', 'Menganito']
    let _users, name, surname, email, password

    beforeAll(async () => {
        client = await MongoClient.connect(url, { useNewUrlParser: true })

        const db = client.db()

        users = db.collection('users')

        userData.__col__ = users
    })

    beforeEach(async () => { 
        await users.deleteMany()
    
        _users = new Array(Math.random(10, 100)).fill().map(() => ({
            name: `${names.random()}-${Math.random()}`,
            surname: `Grillo-${Math.random()}`,
            email: `grillo-${Math.random()}@mail.com`,
            password: `123-${Math.random()}`
        }))

        const user = _users.random()
        name = user.name
        surname = user.surname
        email = user.email
        password = user.password
    })

    describe('users', () => {
        describe('register user', () => {
            it('should succeed on correct user data', async () => {
                const response = await logic.registerUser(name, surname, email, password)
                    
                expect(response).toBeUndefined()

                const users = await userData.find(user => user.matches({ name, surname, email, password }))
            
                expect(users).toBeDefined()
                expect(users).toHaveLength(1)
            })

            describe('on already existing user', () => {
                
                beforeEach(() => logic.registerUser(name, surname, email, password))

                it('should fail on retrying to register', async () => {
                    try {
                        await logic.registerUser(name, surname, email, password)
                        throw Error('should not reach this point')
                    } catch (error) {
                        expect(error).toBeDefined()
                        expect(error).toBeInstanceOf(LogicError)

                        expect(error.message).toBe(`user with email "${email}" already exists`)
                    }
                })
            })

            it('should fail on undefined name', () => {
                const name = undefined

                expect(() => logic.registerUser(name, surname, email, password)).toThrowError(RequirementError, `name is not optional`)
            })

            it('should fail on null name', () => {
                const name = null

                expect(() => logic.registerUser(name, surname, email, password)).toThrowError(RequirementError, `name is not optional`)
            })

            it('should fail on empty name', () => {
                const name = ''

                expect(() => logic.registerUser(name, surname, email, password)).toThrowError(ValueError, 'name is empty')
            })

            it('should fail on blank name', () => {
                const name = ' \t    \n'

                expect(() => logic.registerUser(name, surname, email, password)).toThrowError(ValueError, 'name is empty')
            })

            it('should fail on undefined surname', () => {
                const surname = undefined

                expect(() => logic.registerUser(name, surname, email, password)).toThrowError(RequirementError, `surname is not optional`)
            })

            it('should fail on null surname', () => {
                const surname = null

                expect(() => logic.registerUser(name, surname, email, password)).toThrowError(RequirementError, `surname is not optional`)
            })

            it('should fail on empty surname', () => {
                const surname = ''

                expect(() => logic.registerUser(name, surname, email, password)).toThrowError(ValueError, 'surname is empty')
            })

            it('should fail on blank surname', () => {
                const surname = ' \t    \n'

                expect(() => logic.registerUser(name, surname, email, password)).toThrowError(ValueError, 'surname is empty')
            })

            it('should fail on undefined email', () => {
                const email = undefined

                expect(() => logic.registerUser(name, surname, email, password)).toThrowError(RequirementError, `email is not optional`)
            })

            it('should fail on null email', () => {
                const email = null

                expect(() => logic.registerUser(name, surname, email, password)).toThrowError(RequirementError, `email is not optional`)
            })

            it('should fail on empty email', () => {
                const email = ''

                expect(() => logic.registerUser(name, surname, email, password)).toThrowError(ValueError, 'email is empty')
            })

            it('should fail on blank email', () => {
                const email = ' \t    \n'

                expect(() => logic.registerUser(name, surname, email, password)).toThrowError(ValueError, 'email is empty')
            })

            it('should fail on non-email email', () => {
                const nonEmail = 'non-email'

                expect(() => logic.registerUser(name, surname, nonEmail, password)).toThrowError(FormatError, `${nonEmail} is not an e-mail`)
            })

            // TODO password fail cases
        })

        describe('authenticate user', () => {
            beforeEach(() =>
                userData.create({ name, surname, email, password })
            )

            it('should succeed on correct user credential', async () => {
                const id = await logic.authenticateUser(email, password)

                expect(typeof id).toBe('string')
                expect(id.length).toBeGreaterThan(0)
            })

            it('should fail on non-existing user', async () => {
                try {
                    await logic.authenticateUser(email = 'unexisting-user@mail.com', password)
                    throw Error('should not reach this point')
                } catch (error) {
                    expect(error).toBeDefined()
                    expect(error).toBeInstanceOf(LogicError)
                    expect(error.message).toBe(`user with email "${email}" does not exist`)
                }
            })
            
        })

        describe('retrieve user', () => {
            let id

            beforeEach(async () => {
                await userData.create({ name, surname, email, password })
                const users = await userData.find(user => user.email === email)
                id = users[0]._id.toString()
            })

            it('should succeed on correct user id from existing user', async () => {
                const user = await logic.retrieveUser(id)
                    
                expect(user.id).toBeUndefined()
                expect(user.name).toBe(name)
                expect(user.surname).toBe(surname)
                expect(user.email).toBe(email)
                expect(user.password).toBeUndefined()
            })

            it('should fail on unexisting user id', async () => {
                id = '01234567890123456789abcd'

                try {
                    await logic.retrieveUser(id) 
                    throw Error('should not reach this point')
                } catch (error) {
                    expect(error).toBeDefined()
                    expect(error).toBeInstanceOf(LogicError)
    
                    expect(error.message).toBe(`user with id "${id}" does not exist`)
                }
            })

            it('should fail on wrong id', async () => {
                id = 'wrong-id'

                try {
                    await logic.retrieveUser(id) 
                    throw Error('should not reach this point')
                } catch (error) {
                    expect(error).toBeDefined()
                    expect(error).toBeInstanceOf(FormatError)
    
                    expect(error.message).toBe(`invalid id`)
                }
            })
        })

        describe('update', () => {
            let user, id

            beforeEach(async () => {
                await userData.create({ name, surname, email, password })
                const users = await userData.find(user => user.email === email)
                user = users[0]  
                id = user._id.toString()
            })
    
            it('should succeed on correct data', async () => {    
                const data = { name: 'n', email: 'e', password: 'p', lastAccess: Date.now() }

                const response = await logic.updateUser(id, data)
                expect(response).toBeUndefined()
                    
                const _user = await userData.retrieve(ObjectId(id))
               
                expect(_user).toBeDefined()
                expect(_user.id).toBe(user.id)
                expect(_user.surname).toBe(user.surname)
                expect(_user.name).not.toBe(user.name)
                expect(_user.email).not.toBe(user.email)
                expect(_user.password).not.toBe(user.password)
                expect(_user).toMatchObject(data)
                expect(Object.keys(_user).length).toEqual(Object.keys(user).length + 1)
            })

            it('should succeed on incorrect user id', async () => {    
                id = '01234567890123456789abcd'

                try {
                    await logic.updateUser(id) 
                    throw Error('should not reach this point')
                } catch (error) {
                    expect(error).toBeDefined()
                    expect(error).toBeInstanceOf(LogicError)
    
                    expect(error.message).toBe(`user with id "${id}" does not exist`)
                }
            })
            
            it('should succeed on wrong id', async () => {    
                let id = 'wrong-id'

                try {
                    await logic.updateUser(id) 
                    throw Error('should not reach this point')
                } catch (error) {
                    expect(error).toBeDefined()
                    expect(error).toBeInstanceOf(FormatError)
    
                    expect(error.message).toBe('invalid id')
                }
            })
        })
    
        describe('delete', () => {
            let user, id

            beforeEach(async () => {
                await userData.create({ name, surname, email, password })
                const users = await userData.find(user => user.email === email)
                user = users[0]  
                id = user._id.toString()
            })
            
            it('should succed on correct id', async () => {
                const response = await logic.deleteUser(id, user.email, user.password)
                expect(response).toBeUndefined()
                const _user = await userData.retrieve(user._id)
                expect(_user).toBeNull()
            })
    
            it('should fail on incorrect id', async () => {
                id = '01234567890123456789abcd'
                try {
                    await logic.deleteUser(id, user.email, user.password)
                    throw new Error('should not reach this point')
                } catch (error) {
                    expect(error).toBeDefined()
                    expect(error).toBeInstanceOf(LogicError)
    
                    expect(error.message).toBe(`user with id "${id}" does not exist`)
                }
            })

            it('should fail on incorrect email', async () => {
                let email = 'fake_email@gmail.com' 

                try {
                    await logic.deleteUser(id, email, user.password)
                    throw new Error('should not reach this point')
                } catch (error) {
                    expect(error).toBeDefined()
                    expect(error).toBeInstanceOf(LogicError)
    
                    expect(error.message).toBe('wrong credentials')
                }
            })

            it('should fail on incorrect password', async () => {
                let password = '423'

                try {
                    await logic.deleteUser(id, user.email, password)
                    throw new Error('should not reach this point')
                } catch (error) {
                    expect(error).toBeDefined()
                    expect(error).toBeInstanceOf(LogicError)
    
                    expect(error.message).toBe('wrong credentials')
                }
            })
        })

        describe('toggle fav duck', () => {
            let id, duckId

            beforeEach(async () => {
                duckId = `${Math.random()}`

                await userData.create({ name, surname, email, password })
                const users = await userData.find(user => user.email === email)
                id = users[0]._id.toString()
            })

            it('should succeed adding fav on first time', async () => {
                
                const response = await logic.toggleFavDuck(id, duckId)
                expect(response).toBeUndefined()
                
                const user = await userData.retrieve(ObjectId(id))
                
                const { favs } = user

                expect(favs).toBeDefined()
                expect(favs).toBeInstanceOf(Array)
                expect(favs).toHaveLength(1)
                expect(favs[0]).toBe(duckId)
            })

            it('should succeed removing fav on second time', async () => {
                
                await logic.toggleFavDuck(id, duckId)
                
                const response = await logic.toggleFavDuck(id, duckId)
                expect(response).toBeUndefined()
                
                const user = await userData.retrieve(ObjectId(id))
                
                const { favs } = user

                expect(favs).toBeDefined()
                expect(favs).toBeInstanceOf(Array)
                expect(favs).toHaveLength(0)
            })

            it('should fail on null duck id', () => {
                duckId = null

                expect(() => logic.toggleFavDuck(duckId)).toThrowError(RequirementError, 'id is not optional')
            })

            // TODO more cases
        })

        describe('retrieve fav ducks', () => {
            let id, _favs

            beforeEach(async () => {
                _favs = []

                const ducks = await duckApi.searchDucks('')
                    
                for (let i = 0; i < 10; i++) {
                    const randomIndex = Math.floor(Math.random() * ducks.length)

                    _favs[i] = ducks.splice(randomIndex, 1)[0].id
                }

                await userData.create({ email, password, name, surname, favs: _favs })
                
                const users = await userData.find(user => user.email === email)
                id = users[0]._id.toString()
            })

            it('should succeed on correct user id', async () => {
                const ducks = await logic.retrieveFavDucks(id)

                ducks.forEach(({ id, title, imageUrl, description, price }) => {
                    const isFav = _favs.some(fav => fav === id)

                    expect(isFav).toBeTruthy()
                    expect(typeof title).toBe('string')
                    expect(title.length).toBeGreaterThan(0)
                    expect(typeof imageUrl).toBe('string')
                    expect(imageUrl.length).toBeGreaterThan(0)
                    expect(typeof description).toBe('string')
                    expect(description.length).toBeGreaterThan(0)
                    expect(typeof price).toBe('string')
                    expect(price.length).toBeGreaterThan(0)
                })
            })
        })
    })

    describe('ducks', () => {
        let id

        beforeEach(async () => {
            await userData.create({ email, password, name, surname })
            const users = await userData.find(user => user.email === email)
            id = users[0]._id.toString()
        })

        describe('search ducks', () => {
            it('should succeed on correct query', async () => {
                const ducks = await logic.searchDucks(id, 'yellow')
                
                expect(ducks).toBeDefined()
                expect(ducks).toBeInstanceOf(Array)
                expect(ducks.length).toBe(13)
                // TODO other cases
            })
        })

        describe('retrieve duck', () => {
            let duck

            beforeEach(async () => {
                const ducks = await duckApi.searchDucks('yellow')
                duck = ducks[0]
            })

            it('should succeed on correct duck id', async () => {
                const _duck = await logic.retrieveDuck(id, duck.id)
                
                expect(_duck).toMatchObject(duck)

                expect(typeof _duck.description).toBe('string')
                expect(_duck.description.length).toBeGreaterThan(0)
            })
        })
    })

    describe('cart', () => {
        let id, duckId

        beforeEach(async () => {
            duckId = `${Math.random()}`

            await userData.create({ name, surname, email, password })
            const users = await userData.find(user => user.email === email)
            id = users[0]._id.toString()
        })

        describe('add items', () => {
            it('should succed adding one item', async () => {
                const response = await logic.addToCart(id, duckId)
                expect(response).toBeUndefined()

                const user = await userData.retrieve(ObjectId(id))
                    
                const { cart } = user

                expect(cart).toBeDefined()
                expect(cart).toBeInstanceOf(Array)
                expect(cart).toHaveLength(1)
                expect(cart[0]).toBeInstanceOf(Object)
                expect(cart[0].id).toBe(duckId)
                expect(cart[0].qty).toBe(1)
            })

            it('should succed adding an item twice', async () => {
                await logic.addToCart(id, duckId)
                const response = await logic.addToCart(id, duckId)
                expect(response).toBeUndefined()
                
                const user = await userData.retrieve(ObjectId(id))

                const { cart } = user

                expect(cart).toBeDefined()
                expect(cart).toBeInstanceOf(Array)
                expect(cart).toHaveLength(1)
                expect(cart[0]).toBeInstanceOf(Object)
                expect(cart[0].id).toBe(duckId)
                expect(cart[0].qty).toBe(2)
            })

            it('should succed adding two different items', async () => {
                const _duckId = `${Math.random()}`

                await logic.addToCart(id, duckId)
                await logic.addToCart(id, _duckId)
                
                const user = await userData.retrieve(ObjectId(id))
                    
                const { cart } = user

                expect(cart).toBeDefined()
                expect(cart).toBeInstanceOf(Array)
                expect(cart).toHaveLength(2)
                expect(cart[0]).toBeInstanceOf(Object)
                expect(cart[0].id).toBe(duckId)
                expect(cart[0].qty).toBe(1)
                expect(cart[1]).toBeInstanceOf(Object)
                expect(cart[1].id).toBe(_duckId)
                expect(cart[1].qty).toBe(1)
            })
        })

        describe('delete items', () => {
            let _cart

            beforeEach(async () => {
                _cart = []
                _cart.push({id: duckId, qty: Math.ceil(Math.random() * 10)})
                await userData.update(ObjectId(id), { cart: _cart })
            })

            it('should succed on correct user and duckId', async () => {
                await logic.deleteToCart(id, duckId)
                const user = await userData.retrieve(ObjectId(id))
                    
                const { cart } = user

                expect(cart).toBeDefined()
                expect(cart).toBeInstanceOf(Array)
                expect(cart).toHaveLength(0)
            })
        })

        describe('update items', () => {
            let _cart, qty = 5

            beforeEach(async () => {
                _cart = []
                _cart.push({id: duckId, qty: qty})
                await userData.update(ObjectId(id), { cart: _cart })
            })

            it('should succed on positive number', async () => {
                qty = 2
                await logic.updateItemCart(id, duckId, qty)
                const user = await userData.retrieve(ObjectId(id))
                    
                const { cart } = user

                expect(cart).toBeDefined()
                expect(cart).toBeInstanceOf(Array)
                expect(cart).toHaveLength(1)
                expect(cart[0]).toBeInstanceOf(Object)
                expect(cart[0].id).toBe(duckId)
                expect(cart[0].qty).toBe(qty)
            })

            it('should delete item on zero or negative items', async () => {
                qty = 0
                await logic.updateItemCart(id, duckId, qty)
                const user = await userData.retrieve(ObjectId(id))
                
                const { cart } = user

                expect(cart).toBeDefined()
                expect(cart).toBeInstanceOf(Array)
                expect(cart).toHaveLength(0)      
            })
        })

        describe('retrieve cart', () => {
            let _cart

            beforeEach(async () => {
                _cart = []

                const ducks = await duckApi.searchDucks('')
                   
                for (let i = 0; i < 10; i++) {
                    const randomIndex = Math.floor(Math.random() * ducks.length)

                    _cart[i] = {}
                    _cart[i].id = ducks.splice(randomIndex, 1)[0].id
                    _cart[i].qty = Math.ceil(Math.random() * 10)
                }

                await userData.update(ObjectId(id), { cart: _cart })
            })

            it('should succeed on correct user id', async () => {
                const cart = await logic.retrieveCartItems(id)
                    
                cart.forEach(({ id: _id, qty, title, price, imageUrl }, i) => {
                    expect(_id).toBe(_cart[i].id)
                    expect(typeof _id).toBe('string')
                    expect(_id.length).toBeGreaterThan(0)
                    expect(typeof qty).toBe('number')
                    expect(typeof title).toBe('string')
                    expect(title.length).toBeGreaterThan(0)
                    expect(typeof imageUrl).toBe('string')
                    expect(imageUrl.length).toBeGreaterThan(0)
                    expect(typeof price).toBe('number')
                })
            })
        })

        describe('checkout', () => {

        })
    })

    afterAll(() => client.close(true))
})