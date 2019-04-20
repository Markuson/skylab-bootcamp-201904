'use strict'

describe('duck api', () => {
    describe('search ducks', () => {
        it('should succeed on correct query', (done) => {
            duckApi.searchDucks('yellow', (ducks) => {
                expect(ducks).toBeDefined()
                expect(ducks instanceof Array).toBeTruthy()
                expect(ducks.length).toBe(13)

                done()
            })
        })

        it('should succeed on empty query', (done) => {
            duckApi.searchDucks('', (ducks) => {
                expect(ducks).toBeDefined()
                expect(ducks instanceof Array).toBeTruthy()
                expect(ducks.length).toBe(286)

                done()
            })
        })

        it('should fail on duck not found', (done) => {
            const search = 'jeans'

            duckApi.searchDucks(search, (response) => {
                expect(response).toBeDefined()
                expect(response.error).toBe(`There are not results for this query: ${search}`)
                done()
            })
        })
    })

    describe('retrieve duck', () => {
        it('should succeed on correct id', (done) => {
            const id = '5c3853aebd1bde8520e66e21'
            const expectedTitle = "Cyber Rubber Duck"

            duckApi.retrieveDuck(id, (duck) => {
                const {title} = duck

                expect(title).toBeDefined()
                expect((typeof title === 'string')).toBeTruthy()
                expect(title).toBe(expectedTitle)


                done()
            })
        })

        it('should fail on duck not found', (done) => {
            const id = '12dde'

            duckApi.retrieveDuck(id, (response) => {
                const {error} = response
                expect(error).toBeDefined()
                expect(error).toBe(`Cast to ObjectId failed for value \"${id}\" at path \"_id\" for model \"Duck\"`)
                done()
            })
        })
        it('should fail on undefined id', () => {
            const id = undefined

            expect(() => duckApi.retrieveDuck(id, () =>{ })).toThrowError(RequirementError, `id is not optional`)
        })
        it('should fail on null id', () => {
            const id = null

            expect(() => duckApi.retrieveDuck( id, () => { })).toThrowError(RequirementError, `id is not optional`)
        })

        it('should fail on empty id', () => {
            const id = ''

            expect(() => duckApi.retrieveDuck( id, () => { })).toThrowError(ValueError, 'id is empty')
        })

        it('should fail on blank id', () => {
            const id = ' \t    \n'

            expect(() => duckApi.retrieveDuck( id, () => { })).toThrowError(ValueError, 'id is empty')
        })
    })
    // TODO test retrieve duck
})