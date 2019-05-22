const validate = require('../../common/validate')
const { ValueError } = require('../../common/errors')

const userData = {
    __col__: null,

    create(user) {
        validate.arguments([
            { name: 'user', value: user, type: 'object', optional: false }
        ])

        return (async () => {
            await this.__col__.insertOne(user)
        })()
    },

    list() {
        // return (async () => {
        //     const cursor = await this.__col__.find().toArray()
        //     return await cursor.toArray()
        // })()
        return this.__col__.find().toArray()
    },

    retrieve(id) {
        validate.arguments([
            { name: 'id', value: id, type: 'string', notEmpty: true, optional: false }
        ])

        return await this.__col__.find({_id: ObjecId(id)})
    },

    find(criteria) {
        validate.arguments([
            { name: 'criteria', value: criteria, type: 'function', notEmpty: true, optional: false }
        ])

        return (async () => {
            const users = await this.__load__()

            return users.filter(criteria)
        })()
    },

    update(id, data, replace) {
        validate.arguments([
            { name: 'id', value: id, type: 'string', notEmpty: true },
            { name: 'data', value: data, type: 'object' },
            { name: 'replace', value: replace, type: 'boolean', optional: true }
        ])

        if (data.id && id !== data.id) throw new ValueError('data id does not match criteria id')

        return (async() => {
            const users = await this.__load__()
            const index = users.findIndex(element => element.id == id)

            if (replace)
                for (const key in users[index])
                    if (key !== 'id') delete users[index][key]

            for (const key in data) users[index][key] = data[key]

            return await this.__save__()
        })()
    }
}

module.exports = userData