

let logic = {
    register: function (name, surname, email, password) {

        if ((typeof name !== 'string') || (name === undefined) || (name == '')){
            let error = Error('not a valid name')
            error.code = 2
            throw error
        }

        if ((typeof surname !== 'string') || (surname === undefined) || (surname == '')){
            let error = Error('not a valid surname')
            error.code = 3
            throw error
        }

        if ((typeof email !== 'string') || (email === undefined) || (email == '')){
            let error = Error('not a valid email')
            error.code = 4
            throw error
        }

        if ((password === undefined) || (password == '')){
            let error = Error('not a valid password')
            error.code = 5
            throw error
        }

        let exists = users.some(function(user) { return user.email === email})

        if (exists){
            let error = Error('User already exists!')
            error.code = 6
            throw error
        }

        users.push({
            name: name,
            surname: surname,
            email: email,
            password: password
        })
    },

    login: function (email, password) {
        // TODO validate input data

        const user = users.find(function(user) { return user.email === email })

        if (!user) {
            let error = Error('wrong credentials')

            error.code = 1

            throw error
        }

        if (user.password === password) {
            this.__userEmail__ = email
            this.__accessTime__ = Date.now()
        } else {
            let error = Error('wrong credentials')

            error.code = 1

            throw error
        }
    },

    searchDucks: function (query, callback) {
        if(query === undefined) throw new Error(query + ' is not a valid query')
        if ((callback === undefined) ||(typeof callback !== 'function')) throw new Error(callback + ' is not a function')

        const xhr = new XMLHttpRequest

        xhr.open('GET', 'https://duckling-api.herokuapp.com/api/search?q=' + query)

        xhr.addEventListener('load', function () {
            callback(JSON.parse(this.responseText))
        })

        xhr.send()
    },

    retrieveDucklingDetail: function(id, callback) {
        if(id === undefined) throw new Error(id + ' is not a valid query')
        if ((callback === undefined) || (typeof callback !== 'function')) throw new Error(callback + ' is not a function')

        const xhr = new XMLHttpRequest

        xhr.open('GET', 'https://duckling-api.herokuapp.com/api/ducks/' + id)

        xhr.addEventListener('load', function () {
            callback(JSON.parse(this.responseText))
        })

        xhr.send()
    }
}
