import validate from '../../common/validate'
import call from '../../common/call'

const restApi = {
    __url__: 'http://localhost:8080/api',
    __timeout__: 0,

    create(name, surname, email, password) {
        validate.arguments([
            { name: 'name', value: name, type: 'string', notEmpty: true },
            { name: 'surname', value: surname, type: 'string', notEmpty: true },
            { name: 'email', value: email, type: 'string', notEmpty: true },
            { name: 'password', value: password, type: 'string', notEmpty: true },
        ])

        return call(`${this.__url__}/user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({name, surname, email, password }),
        })
            .then(response => response.json())
    },

    authenticate(email, password) {
        validate.arguments([
            { name: 'email', value: email, type: 'string', notEmpty: true },
            { name: 'password', value: password, type: 'string', notEmpty: true }
        ])

        return call(`${this.__url__}/auth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        })
            .then(response => response.json())
    },

    retrieve(token) {
        validate.arguments([
            { name: 'token', value: token, type: 'string', notEmpty: true }
        ])

        return call(`${this.__url__}/user`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(response => response.json())
    },

    // update(id, token, data) {
    //     validate.arguments([
    //         { name: 'id', value: id, type: 'string', notEmpty: true },
    //         { name: 'token', value: token, type: 'string', notEmpty: true },
    //         { name: 'data', value: data, type: 'object', notEmpty: true }
    //     ])

    //     return call(`${this.__url__}/user/${id}`, {
    //         method: 'PUT',
    //         headers: {
    //             Authorization: `Bearer ${token}`,
    //             'Content-Type': 'application/json'
    //         },
    //         body: JSON.stringify(data),
    //         timeout: this.__timeout__
    //     })
    //         .then(response => response.json())
    // },

    searchDucks(token, query) {
        validate.arguments([
            { name: 'query', value: query, type: 'string' },
            { name: 'token', value: token, type: 'string', notEmpty: true }
        ])

        return call(`${this.__url__}/search?q=${query}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(response => response.json())
    },
}

export default restApi