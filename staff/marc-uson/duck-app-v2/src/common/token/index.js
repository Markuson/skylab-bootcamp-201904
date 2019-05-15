const atob = require('atob')

const token = {
    payload(token) {
        const [, rawPayload] = token.split('.')

        return JSON.parse(atob(rawPayload))
    }
}

export default token