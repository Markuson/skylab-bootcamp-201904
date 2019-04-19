'use strict'

describe('logic', () => {
    const name = 'Peter'
    const surname = 'Seller'
    const email = 'peterseller@gmail.com'
    const password = '123'

    beforeEach(() => {
        users.length = 0
    })

    describe('users', () => {
        describe('register', () => {
            it('should succeed on correct data', () => {
                const user = {
                    name: name,
                    surname: surname,
                    email: email,
                    password: password
                }

                const currentUsersCount = users.length

                logic.register(name, surname, email, password)

            expect(users.length).toBe(currentUsersCount + 1)

            const lastUser = users[users.length - 1]
            expect(lastUser).toEqual(user)
        })

        describe('name control', () => {
            it('should fail on undefined name', () => {
                expect(() => {
                    logic.register(undefined, surname, email, password)
                }).toThrowError(TypeError, 'undefined is not a valid name')
            })

            it('should fail on empty name', () => {

                let _error

                try {
                    logic.register('', surname, email, password)
                } catch(error) {
                    _error = error
                }

                expect(_error).toBeDefined()
                expect(_error.code).toBe(2)
            })

            it('should fail name not a string', () => {

                let _error

                try {
                    logic.register(2, surname, email, password)
                } catch(error) {
                    _error = error
                }

                expect(_error).toBeDefined()
                expect(_error.code).toBe(2)
            })
        })

        describe('surname control', () => {
            it('should fail on undefined surname', () => {

                let _error

                try {
                    logic.register(name, undefined, email, password)
                } catch(error) {
                    _error = error
                }

                expect(_error).toBeDefined()
                expect(_error.code).toBe(3)
            })

            it('should fail on empty surname', () => {

                let _error

                try {
                    logic.register(name, '', email, password)
                } catch(error) {
                    _error = error
                }

                expect(_error).toBeDefined()
                expect(_error.code).toBe(3)
            })

            it('should fail surname not a string', () => {

                let _error

                try {
                    logic.register(name, 2, email, password)
                } catch(error) {
                    _error = error
                }

                expect(_error).toBeDefined()
                expect(_error.code).toBe(3)
            })
        })

        describe('email control', () => {
            it('should fail on undefined email', () => {

                let _error

                try {
                    logic.register(name, surname, undefined, password)
                } catch(error) {
                    _error = error
                }

                expect(_error).toBeDefined()
                expect(_error.code).toBe(4)
            })

            it('should fail on empty email', () => {

                let _error

                try {
                    logic.register(name, surname, '', password)
                } catch(error) {
                    _error = error
                }

                expect(_error).toBeDefined()
                expect(_error.code).toBe(4)
            })

            it('should fail email not a string', () => {

                let _error

                try {
                    logic.register(name, surname, 2, password)
                } catch(error) {
                    _error = error
                }

                expect(_error).toBeDefined()
                expect(_error.code).toBe(4)
            })
        })

        describe('pasword control', () => {
            it('should fail on undefined pasword', () => {

                let _error

                try {
                    logic.register(name, surname, email, undefined)
                } catch(error) {
                    _error = error
                }

                expect(_error).toBeDefined()
                expect(_error.code).toBe(5)
            })

            it('should fail on empty password', () => {

                let _error

                try {
                    logic.register(name, surname, email, '')
                } catch(error) {
                    _error = error
                }

                expect(_error).toBeDefined()
                expect(_error.code).toBe(5)
            })
        })

        it('should fail on existing email', () => {
            users.push({
                name: name,
                surname: surname,
                email: email,
                password: password
            })

            let _error

            try {
                logic.register(name, surname, email, password)
            } catch(error) {
                _error = error
            }

            expect(_error).toBeDefined()
            expect(_error.code).toBe(6)
        })
    })

    describe('login', () => {
        beforeEach(() => {
            users.push({
                name: name,
                surname: surname,
                email: email,
                password: password
            })
        })

        it('should succeed on correct data', () => {
            logic.login(email, password)

            expect(logic.__userEmail__).toBe(email)
            expect(logic.__accessTime__ / 1000).toBeCloseTo(Date.now() / 1000, 1)
        })

        it('should fail on wrong email (unexisting user)', () => {

            let _error

            try {
                logic.login('pepitogrillo@gmail.com', password)
            } catch (error) {
                _error = error
            }

            expect(_error).toBeDefined()
            expect(_error.code).toBe(1)
        })

        it('should fail on wrong password (existing user)', () => {
                // expect(()=> {
                //     logic.login(email, '456')
                // }).toThrowError(Error, 'wrong credentials')

                let _error

                try {
                    logic.login(email, '456')
                } catch (error) {
                    _error = error
                }

                expect(_error).toBeDefined()
                expect(_error.code).toBe(1)
            })
        })

        describe('retrieve user', () => {
            beforeEach(() => {
                users.push({
                    name: name,
                    surname: surname,
                    email: email,
                    password: password
                })

                logic.__userEmail__ = email
            })

            it('should succeed on existing user and corect email', () => {
                const user = logic.retrieveUser()

                expect(user).toBeDefined()
                expect(user.name).toBe(name)
                expect(user.surname).toBe(surname)
                expect(user.email).toBe(email)
                expect(user.password).toBeUndefined()
            })
        })
    })

    describe('ducks', () => {
        describe('search ducks', () => {
            it('should succeed on correct query', (done) => {
                logic.searchDucks('yellow', (ducks) => {
                    expect(ducks).toBeDefined()
                expect(ducks instanceof Array).toBeTruthy()
                expect(ducks.length).toBe(13)

                done()
            })
            })
            it('should fail on undefined query', (done) => {
                expect(() => {
                    logic.searchDucks(undefined, () => {})
                }).toThrowError(Error, 'undefined is not a valid query')
                done()
            })
            it('should fail on undefined function', (done) => {
                expect(() => {
                    logic.searchDucks('yellow')
                }).toThrowError(Error, 'undefined is not a function')
                done()
            })
        })

        describe('retrieve ducks', () =>  {
            it('should succeed on correct id', (done) =>  {
                logic.retrieveDucklingDetail('5c3853aebd1bde8520e66e11', function(duck) {
                    expect(duck).toBeDefined()
                    expect(duck instanceof Object).toBeTruthy()
                    
                    done()
                })
            })
            it('should fail on undefined id', (done) => {
                expect(() => {
                    logic.retrieveDucklingDetail(undefined, () => {})
                }).toThrowError(Error, 'undefined is not a valid query')
                done()
            })
            it('should fail on undefined function', (done) => {
                expect(() => {
                    logic.retrieveDucklingDetail('5c3853aebd1bde8520e66e11')
                }).toThrowError(Error, 'undefined is not a function')
                done()
            })
        })
    })
})