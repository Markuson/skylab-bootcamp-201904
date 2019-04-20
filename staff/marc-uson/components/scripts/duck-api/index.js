'use strict'

const duckApi = {
    __url__: 'https://duckling-api.herokuapp.com/api',

    __call__(path, callback) {

        const xhr = new XMLHttpRequest

        xhr.open('GET', `${this.__url__}/${path}`)

        xhr.addEventListener('load', function () {
            callback(JSON.parse(this.responseText))
        })

        xhr.send()

    },

    searchDucks(query, callback) {
        validate.arguments([
            { name: 'path', value: query, type: 'string', notEmpty: false },
            { value: callback, type: 'function' }
        ])
        this.__call__(`search?q=${query}`, callback)

    },

    retrieveDuck(id, callback) {
        validate.arguments([
            { name: 'id', value: id, type: 'string', notEmpty: true },
            { value: callback, type: 'function' }
        ])
        // TODO validate inputs

        this.__call__(`ducks/${id}`, callback)
    }
}