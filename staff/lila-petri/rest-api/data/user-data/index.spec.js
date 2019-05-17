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

    xdescribe('retrieve', () => {
        beforeEach(() => fs.writeFile(userData.__file__, JSON.stringify(users)))

        it('should succeed on an already existing user', () => {
           return userData.retrieve(users[0].id)
                .then(user => {
                    expect(user.id).toBe(users[0].id)
                    expect(user.name).toBe(users[0].name)
                    expect(user.surname).toBe(users[0].surname)
                    expect(user.password).toBe(users[0].password)
                    expect(user).toEqual(users[0])
                })
        })
        it('should fail on an unexisting user', () => {
            return userData.retrieve('888')
                .then(user => 
                    expect(user).toBeUnefined()
                )
                .catch(error => {
                    expect(error).toBeDefined()
                    expect(error.message).toBe('User not found')

                })
        })
    })

    describe('update', () => {
        beforeEach(() => fs.writeFile(userData.__file__, JSON.stringify(users)))
            const name= 'Lila'
            const surname= 'Petri'
            const password= '888'
            fit('should succeed on correct data', ()=>{
                return userData.update(users[0].id,{name, surname, password})
                    .then(() => {})
                    .then(()=>userData.retrieve(users[0].id))
                    .then(user => {
                        debugger
                        expect(user.id).toBe(users[0].id)
                        expect(user.name).toBe(name)
                        expect(user.surname).toBe(surname)
                        expect(user.password).toBe(password)
                        
                })
            })
    })

    xdescribe('delete', () => {
        // TODO
    })

    xdescribe('find', () => {
        // TODO

        it('should succeed on matching existing users', () => {
            userData.find({ name: 'Pepito' })
                .then(_users => {
                    // TODO
                })
        })

    })

    afterAll(() => fs.writeFile(userData.__file__, '[]'))
})