const userData = require('.')
require('../../common/utils/array-random.polyfill')
const { MongoClient, ObjectId } = require('mongodb')

const url = 'mongodb://localhost/rest-api-test'

describe('user data', () => {
    let client, users

    beforeAll(async () => {
        client = await MongoClient.connect(url, { useNewUrlParser: true })

        const db = client.db()

        users = db.collection('users')

        userData.__col__ = users
    })

    const names = ['Pepito', 'Fulanito', 'Menganito']

    const _users = new Array(Math.random(100)).fill().map(() => ({
        name: `${names.random()}-${Math.random()}`,
        surname: `Grillo-${Math.random()}`,
        email: `grillo-${Math.random()}@mail.com`,
        password: `123-${Math.random()}`
    }))

    beforeEach(() => users.deleteMany())

    xdescribe('create', () => {
        it('should succeed on correct data', async () => {
            const user = {
                name: 'Manuel',
                surname: 'Barzi',
                email: 'manuelbarzi@gmail.com',
                password: '123'
            }

            await userData.create(user)

            expect(user._id).toBeInstanceOf(ObjectId)

            const cursor = await users.find()

            const _users = []

            await cursor.forEach(user => _users.push(user))

            expect(_users).toHaveLength(1)

            const [_user] = _users

            expect(_user).toEqual(user)
        })
    })

    xdescribe('list', () => {
        beforeEach(async () => await _users.forEach(user => userData.create(user)))

        it('should succeed and return items if users exist', async () => {
            const _users_ = await userData.list()
            expect(_users_).toHaveLength(_users.length)
            expect(_users_).toEqual(_users)
        })
    })

    describe('retrieve', () => {
        beforeEach(async () => await _users.forEach(user => userData.create(user)))

        it('should succeed on an already existing user', async () => {
            const __users = await userData.list()
            const user = __users.random()
            const id = user._id.toString()
            const _user = await userData.retrieve(id)

            expect(_user).toEqual(user)
        })
    })

    xdescribe('update', () => {
        beforeEach(async () => await file.writeFile(userData.__file__, JSON.stringify(users)))

        describe('replacing', () => {
            it('should succeed on correct data', async () => {
                const user = users[Math.random(users.length - 1)]

                const data = { name: 'n', email: 'e', password: 'p', lastAccess: Date.now() }

                await userData.update(user.id, data, true)
                const _users = JSON.parse(await file.readFile(userData.__file__, 'utf8'))
                const _user = _users.find(({ id }) => id === user.id)

                expect(_user).toBeDefined()

                expect(_user.id).toEqual(user.id)

                expect(_user).toMatchObject(data)

                expect(Object.keys(_user).length).toEqual(Object.keys(data).length + 1)
            })
        })

        describe('not replacing', () => {
            it('should succeed on correct data', async () => {
                const user = users[Math.random(users.length - 1)]

                const data = { name: 'n', surname: 's', email: 'e', password: 'p', lastAccess: Date.now() }

                await userData.update(user.id, data)
                const users = JSON.parse(await file.readFile(userData.__file__, 'utf8'))
                const _user = users.find(({ id }) => id === user.id)

                expect(_user).toBeDefined()

                expect(_user.id).toEqual(user.id)

                expect(_user).toMatchObject(data)

                expect(Object.keys(_user).length).toEqual(Object.keys(data).length + 1)
            })
        })
    })

    xdescribe('delete', () => {
        // TODO
    })

    xdescribe('find', () => {
        let _users

        beforeEach(() => {
            _users = users.concat({
                id: `123-${Math.random()}`,
                name: `Fulanito-${Math.random()}`,
                surname: `Grillo-${Math.random()}`,
                email: `pepitogrillo-${Math.random()}@mail.com`,
                password: `123-${Math.random()}`
            })

            return file.writeFile(userData.__file__, JSON.stringify(_users))
        })

        it('should succeed on matching existing users', async () => {
            const criteria = ({ name, email }) => (name.includes('F') || name.includes('a')) && email.includes('i')

            await userData.find(criteria)
            const users = await userData.find(criteria)
            const __users = _users.filter(criteria)

            expect(users).toEqual(__users)

        })
    })

    afterAll(() => client.close())
})