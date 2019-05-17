const fs = require('fs').promises
const path = require('path')
const uuid = require('uuid/v4')
const validate = require('../../common/validate')

const userData = {
    __file__: path.join(__dirname, 'users.json'),

    create(user) {
        validate.arguments([
            { name: 'user', value: user, type: 'object', optional: false }
        ])

        user.id = uuid()

        return fs.readFile(this.__file__, 'utf8')
            .then(content => {
                const users = JSON.parse(content)

                users.push(user)

                const json = JSON.stringify(users)

                return fs.writeFile(this.__file__, json)
            })
    },

    list() {
        return fs.readFile(this.__file__, 'utf8')
            .then(JSON.parse)
    },

    retrieve(id){
        return fs.readFile(this.__file__, 'utf8')
        .then(response =>{
            const list = JSON.parse(response)
            const user = list.find(element =>{
                return element.id == id
            })

            if(!user) throw Error('user not found')

            return user
        })
    },

    update(id, data, replace){
        validate.arguments([
            { name: 'id', value: id, type: 'string', notEmpty: true, optional: false },
            { name: 'data', value: data, type: 'object', optional: false },
            { name: 'replace', value: replace, type: 'boolean', optional: true}
        ])
        return fs.readFile(this.__file__, 'utf8')
        .then(response =>{
            const users = JSON.parse(response)

            const index = users.findIndex(element => element.id == id)

            if(index === -1) throw Error('user not found')

            if(replace){
                for (const key in users[index]){
                    if(key !== 'id') delete users[index][key]
                }
            }

            for (const key in data) users[index][key] = data[key]

            const json = JSON.stringify(users)
            return fs.writeFile(this.__file__, json)
            .then(() => {return 'user updated'})


        })
    }
}

module.exports = userData