const userData = require('.')
const fs = require('fs').promises
const path = require('path')

userData.__file__ = path.join(__dirname, 'users.test.json')

describe('user data', () => {
    const users = [
        {
            id: "123",
            name: "Pepito",
            surname: "Grillo",
            email: "pepitogrillo@mail.com",
            password: "123"
        },
        {
            id: "456",
            name: "John",
            surname: "Doe",
            email: "johndoe@mail.com",
            password: "123"
        },
        {
            id: "789",
            name: "Pepito",
            surname: "Palotes",
            email: "pepitopalotes@mail.com",
            password: "123"
        },
    ]

    describe('create', () => {
        beforeEach(() => fs.writeFile(userData.__file__, '[]'))

        it('should succeed on correct data', () => {
            const user = {
                name: 'Manuel',
                surname: 'Barzi',
                email: 'manuelbarzi@gmail.com',
                password: '123'
            }

            return userData.create(user)
                .then(() => {
                    expect(typeof user.id).toBe('string')

                    return fs.readFile(userData.__file__, 'utf8')
                })
                .then(content => {
                    expect(content).toBeDefined()

                    const users = JSON.parse(content)

                    expect(users).toHaveLength(1)

                    const [_user] = users

                    // expect(_user).toMatchObject(user) 
                    expect(_user).toEqual(user)
                })
        })
    })

    describe('list', () => {
        beforeEach(() => fs.writeFile(userData.__file__, JSON.stringify(users)))

        it('should succeed and return items if users exist', () => {
            return userData.list()
                .then(_users => {
                    expect(_users).toHaveLength(users.length)

                    // expect(_users).toMatchObject(users)
                    expect(_users).toEqual(users)
                })
        })
    })

    describe('retrieve', () => {
        beforeEach(() => fs.writeFile(userData.__file__, JSON.stringify(users)))

        it('should succeed on an already existing user', () => {
            return userData.retrieve(users[0].id)
                .then(user => {
                    expect(user).toBeDefined()

                    expect(user).toEqual(users[0])
                })
        })

        it('should fail on retrieving an unexisting user', () => {
            return userData.retrieve('wrong id')
                .then((response) =>  expect(response).toBeUndefined())
        })
    })

    describe('update', () => {
        let object = {name:'name'}

        beforeEach(() => fs.writeFile(userData.__file__, JSON.stringify(users)))

        it('should succeed on updating a field on an existing user', () => {
            return userData.update(users[0].id, object, false)
                .then((response) => {
                    expect(response).toBeUndefined()
                    return fs.readFile(userData.__file__, 'utf8')
                        .then(JSON.parse)
                        .then(users => {
                            expect(users[0].name).toBe(object.name)
                        })
                })
        })
    })

    describe('delete', () => {
        // TODO
    })

    describe('find', () => {
        let _users

        beforeEach(() => {
            _users = users.concat({
                id: `123-${Math.random()}`,
                name: `Fulanito-${Math.random()}`,
                surname: `Grillo-${Math.random()}`,
                email: `pepitogrillo-${Math.random()}@mail.com`,
                password: `123-${Math.random()}`
            })

            return fs.writeFile(userData.__file__, JSON.stringify(_users))
        })

        it('should succeed on matching existing users', () => {
            const criteria = ({ name, email }) => (name.includes('F') || name.includes('a')) && email.includes('i')

            return userData.find(criteria)
                .then(() => userData.find(criteria))
                .then(users => {
                    const __users = _users.filter(criteria)

                    expect(users).toEqual(__users)// TODO
                })
        })

        it('should succeed on matching existing users', () => {
            userData.find({ name: 'Pepito' })
                .then(_users => {
                    // TODO
                })
        })

    })

    afterAll(() => fs.writeFile(userData.__file__, '[]'))
})