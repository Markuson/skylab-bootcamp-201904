'use strict'

describe('user api', () => {
    const name = 'Marc'
    const surname = 'Uson'
    let username
    const password = '123'

    beforeEach(() => username = `marcuson-${Math.random()}@gmail.com`)

    describe('register', () => {
        it('should succeed on correct user data', done => {

            userApi.create(name, surname, username, password, function (response) {
                expect(response).toBeDefined()

                const { status, data: { id } } = response

                expect(status).toBe('OK')
                expect(typeof id).toBe('string')
                expect(id.length).toBeGreaterThan(0)

                done()
            })
        })

        describe('on already existing user', () => {
            beforeEach(done => userApi.create(name, surname, username, password, done))

            it('should fail on retrying to register', done => {
                userApi.create(name, surname, username, password, function (response) {
                    expect(response).toBeDefined()

                    const { status, error } = response

                    expect(status).toBe('KO')
                    expect(error).toBe(`user with username \"${username}\" already exists`)

                    done()
                })
            })
        })

        it('should fail on undefined name', () => {
            const name = undefined

            expect(() => userApi.create(name, surname, username, password, () => { })).toThrowError(RequirementError, `name is not optional`)
        })

        it('should fail on null name', () => {
            const name = null

            expect(() => userApi.create(name, surname, username, password, () => { })).toThrowError(RequirementError, `name is not optional`)
        })

        it('should fail on empty name', () => {
            const name = ''

            expect(() => userApi.create(name, surname, username, password, () => { })).toThrowError(ValueError, 'name is empty')
        })

        it('should fail on blank name', () => {
            const name = ' \t    \n'

            expect(() => userApi.create(name, surname, username, password, () => { })).toThrowError(ValueError, 'name is empty')
        })

        it('should fail on undefined surname', () => {
            const surname = undefined

            expect(() => userApi.create(name, surname, username, password, () => { })).toThrowError(RequirementError, `surname is not optional`)
        })

        it('should fail on null surname', () => {
            const surname = null

            expect(() => userApi.create(name, surname, username, password, () => { })).toThrowError(RequirementError, `surname is not optional`)
        })

        it('should fail on empty surname', () => {
            const surname = ''

            expect(() => userApi.create(name, surname, username, password, () => { })).toThrowError(ValueError, 'surname is empty')
        })

        it('should fail on blank surname', () => {
            const surname = ' \t    \n'

            expect(() => userApi.create(name, surname, username, password, () => { })).toThrowError(ValueError, 'surname is empty')
        })

        it('should fail on undefined username', () => {
            const username = undefined

            expect(() => userApi.create(name, surname, username, password, () => { })).toThrowError(RequirementError, `username is not optional`)
        })

        it('should fail on null username', () => {
            const username = null

            expect(() => userApi.create(name, surname, username, password, () => { })).toThrowError(RequirementError, `username is not optional`)
        })

        it('should fail on empty username', () => {
            const username = ''

            expect(() => userApi.create(name, surname, username, password, () => { })).toThrowError(ValueError, 'username is empty')
        })

        it('should fail on blank username', () => {
            const username = ' \t    \n'

            expect(() => userApi.create(name, surname, username, password, () => { })).toThrowError(ValueError, 'username is empty')
        })

        it('should fail on non-email username', () => {
            const nonEmail = 'non-email'

            expect(() => userApi.create(name, surname, nonEmail, password, () => { })).toThrowError(FormatError, `${nonEmail} is not an e-mail`)
        })

        it('should fail on undefined pasword', () => {
            const password = undefined

            expect(() => userApi.create(name, surname, username, password, () => { })).toThrowError(RequirementError, `password is not optional`)
        })

        it('should fail on null pasword', () => {
            const password = null

            expect(() => userApi.create(name, surname, username, password, () => { })).toThrowError(RequirementError, `password is not optional`)
        })

        it('should fail on empty pasword', () => {
            const password = ''

            expect(() => userApi.create(name, surname, username, password, () => { })).toThrowError(ValueError, 'password is empty')
        })

        it('should fail on blank pasword', () => {
            const password = ' \t    \n'

            expect(() => userApi.create(name, surname, username, password, () => { })).toThrowError(ValueError, 'password is empty')
        })

    })

    describe('update', () => {
        // beforeEach(
        //     (done => userApi.create(name, surname, username, password, done))
        //     (done => userApi.authenticate(username, password, done))
        // )

        // it('should succed on updating data', () => {
        //     userApi.update
        // })
    })

    describe('authenticate', () =>{
        beforeEach(done => userApi.create(name, surname, username, password, done))

        it('should succeed on correct authentication', done => {
            userApi.authenticate(username, password, function (response) {
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

        it('should fail on authentication', done => {
            const wrongUsername = 'mail@gmail.com'
            userApi.authenticate(wrongUsername, password, function (response) {
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

        it('should fail on wrong password', done => {
            const wrongPassword = 'wrong password'
            userApi.authenticate(username, wrongPassword, function (response) {
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

        it('should fail on undefied username', () => {

            expect(() =>  userApi.authenticate(undefined, password, () => { })).toThrowError(FormatError, `undefined is not an e-mail`)
        })
    })

    // describe('retrieve', () => {

    //     const id = ''
    //     const token = ''
    //     const name = 'Marc'
    //     const surname = 'Uson'
    //     let username
    //     const password = '123'

    //     beforeEach(
    //         (()=>{
    //             (() => username = `marcuson-${Math.random()}@gmail.com`)
    //             (done => userApi.create(name, surname, username, password, done))
    //             (done => userApi.authenticate(username, password, (response) => {

    //                 const {data: { authId , authToken} } = response
    //                 id = authId
    //                 token = authToken
    //                 done()
    //             }))
    //         })
    //     )

    //     it('should succes on retrieve user', done => {
    //         userApi.retrieve(id, token, (response) => {
    //             expect(response).toBeDefined()

    //             const {expectedStatus, data: {expectedId}} = response

    //             expect(expectedStatus).toBe('OK')
    //             expect(typeof expectedStatus).toBe('string')
    //             expect(expectedStatus.length).toBeGreaterThan(0)
    //             expect(typeof expectedId).toBe('string')
    //             expect(expectedId.length).toBeGreaterThan(0)
    //             expect(expectedId).toBe(id)
    //             done()
    //         })
    //     })
    // })
})