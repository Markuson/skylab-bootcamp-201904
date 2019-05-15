const validate = require('../validate')
const { ConnectionError, TimeoutError } = require('../errors')
require('isomorphic-fetch')

/**
 * Makes an HTTP call.
 * 
 * @param {*} url 
 * @param {*} callback 
 * @param {*} options 
 * 
 * @version 4.0.0
 */
function call(url, options = {}) {
    const { method = 'GET', headers, body } = options

    validate.arguments([
        { name: 'url', value: url, type: 'string', notEmpty: true },
        { name: 'method', value: method, type: 'string', notEmpty: true },
        { name: 'headers', value: headers, type: 'object', optional: true },
        { name: 'body', value: body, type: 'string', notEmpty: true, optional: true }
    ])

    validate.url(url)
    debugger

    return fetch(url, {
        method,
        headers,
        body
    })
        .then(response => {
            if (!response.ok) {
                error = new Error()
                error.message = response.statusText
                error.status = response.status
            }
            else {
                return response
            }
        })
        .catch(error => {
            if (error.name === 'FetchError') throw new ConnectionError('cannot connect')
            else throw error
        })
}

module.exports = call