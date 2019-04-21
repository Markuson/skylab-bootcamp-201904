'use strict'

describe('logic', () => {
    describe('users', () => {
        const name = 'Marc'
        const surname = 'Uson'
        let username
        const password = '123'

        beforeEach(() => username = `marcuson-${Math.random()}@gmail.com`)

        describe('register', () => {
            it('should succeed on register a new user', done => {
                logic.registerUser(name, surname, username, password, response => {
                    expect(response).toBeDefined()

                    const { status, data: { id } } = response

                    expect(status).toBe('OK')
                    expect(typeof id).toBe('string')
                    expect(id.length).toBeGreaterThan(0)

                    done()
                })
            })

            describe('on already existing user', () => {
                beforeEach(done => logic.registerUser(name, surname, username, password, done))

                it('should fail on retrying to register', done => {
                    logic.registerUser(name, surname, username, password, response => {
                        expect(response).toBeDefined()

                        const { status, error } = response

                        expect(status).toBe('KO')
                        expect(error).toBe(`user with username \"${username}\" already exists`)

                        done()
                    })
                })
            })

            describe('name control', () => {
                it('should fail on undefined name', () => {
                    expect(() => {
                        logic.registerUser(undefined, surname, username, password, () => {})
                    }).toThrowError(RequirementError, `name is not optional`)
                })

                it('should fail on empty name', () => {

                    expect(() => {
                        logic.registerUser('', surname, username, password, () => {})
                    }).toThrowError(ValueError, `name is empty`)
                })

                it('should fail name not a string', () => {

                    expect(() => {
                        logic.registerUser(123, surname, username, password, () => {})
                    }).toThrowError(TypeError, `name 123 is not a string`)
                })
            })

            describe('surname control', () => {
                it('should fail on undefined surname', () => {
                    expect(() => {
                        logic.registerUser(name, undefined, username, password, () => {})
                    }).toThrowError(RequirementError, `surname is not optional`)
                })

                it('should fail on empty surname', () => {

                    expect(() => {
                        logic.registerUser(name, '', username, password, () => {})
                    }).toThrowError(ValueError, `surname is empty`)
                })

                it('should fail surname not a string', () => {

                    expect(() => {
                        logic.registerUser(name, 123, username, password, () => {})
                    }).toThrowError(TypeError, `surname 123 is not a string`)
                })
            })

            describe('username control', () => {
                it('should fail on undefined username', () => {
                    expect(() => {
                        logic.registerUser(name, surname, undefined, password, () => {})
                    }).toThrowError(FormatError, `undefined is not an e-mail`)
                })

                it('should fail on empty username', () => {

                    expect(() => {
                        logic.registerUser(name, surname, '', password, () => {})
                    }).toThrowError(FormatError, ` is not an e-mail`)
                })

                it('should fail username not a string', () => {

                    expect(() => {
                        logic.registerUser(name, surname, 123, password, () => {})
                    }).toThrowError(FormatError, `123 is not an e-mail`)
                })
            })

            describe('pasword control', () => {
                it('should fail on undefined password', () => {
                    expect(() => {
                        logic.registerUser(name, surname, username, undefined, () => {})
                    }).toThrowError(RequirementError, `password is not optional`)
                })

                it('should fail on empty password', () => {

                    expect(() => {
                        logic.registerUser(name, surname, username, '', () => {})
                    }).toThrowError(ValueError, `password is empty`)
                })

                it('should fail password not a string', () => {

                    expect(() => {
                        logic.registerUser(name, surname, username, 123, () => {})
                    }).toThrowError(TypeError, `password 123 is not a string`)
                })
            })

        })

        describe('login', () => {
            beforeEach(done => logic.registerUser(name, surname, username, password, done))

            it('should succeed on correct data', (done) => {
                logic.loginUser(username, password, response => {
                    expect(response).toBeDefined()

                    const { status, data: { id , token} } = response

                    expect(status).toBe('OK')
                    expect(typeof status).toBe('string')
                    expect(status.length).toBeGreaterThan(0)
                    expect(typeof id).toBe('string')
                    expect(id.length).toBeGreaterThan(0)
                    expect(typeof token).toBe('string')
                    expect(token.length).toBeGreaterThan(0)

                    done()
                })
            })

            it('should fail on wrong email (unexisting user)', (done) => {

                const wrongUsername = 'mail@gmail.com'
                logic.loginUser(wrongUsername, password, function (response) {
                    expect(response).toBeDefined()

                    const { status, error } = response

                    expect(status).toBe('KO')
                    expect(typeof status).toBe('string')
                    expect(status.length).toBeGreaterThan(0)
                    expect(typeof error).toBe('string')
                    expect(error.length).toBeGreaterThan(0)
                    expect(error).toBe(`user with username \"${wrongUsername}" does not exist`)

                    done()
                })
            })

            it('should fail on wrong password (existing user)', (done) => {

                logic.loginUser(username, '111', function (response) {
                    expect(response).toBeDefined()

                    const { status, error } = response

                    expect(status).toBe('KO')
                    expect(typeof status).toBe('string')
                    expect(status.length).toBeGreaterThan(0)
                    expect(typeof error).toBe('string')
                    expect(error.length).toBeGreaterThan(0)
                    expect(error).toBe(`username and/or password wrong`)

                    done()
                })
            })
        })

        // describe('retrieve user', () => {
            
        // })
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
                logic.retrieveDuck('5c3853aebd1bde8520e66e11', function(duck) {
                    expect(duck).toBeDefined()
                    expect(duck instanceof Object).toBeTruthy()

                    done()
                })
            })
            it('should fail on undefined id', (done) => {
                expect(() => {
                    logic.retrieveDuck(undefined, () => {})
                }).toThrowError(Error, 'undefined is not a valid query')
                done()
            })
            it('should fail on undefined function', (done) => {
                expect(() => {
                    logic.retrieveDuck('5c3853aebd1bde8520e66e11')
                }).toThrowError(Error, 'undefined is not a function')
                done()
            })
        })
    })
})