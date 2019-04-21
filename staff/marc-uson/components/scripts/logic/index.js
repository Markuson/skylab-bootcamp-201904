'use strict'

const logic = {
    registerUser(name, surname, email, password, registerDone) {
       validate.arguments([
        { name: "name", value: name, type: "string", notEmpty: true },
        { name: "surname", value: surname, type: "string", notEmpty: true },
        { name: "password", value: password, type: "string", notEmpty: true },
       ])

       validate.email(email);

       userApi.create(name, surname, email, password, function(response) {
        if (response.status === "OK") registerDone(response);
        else registerDone(response);
      });

    },

    loginUser(email, password, loginDone) {
        validate.arguments([
            { name: "password", value: password, type: "string", notEmpty: true },
           ])

        validate.email(email);

        userApi.authenticate(email, password, response => {
            if(response.error){
                loginDone({
                    status : 'KO',
                    error: response.error
                })
            }else{
                const {data: {id: userId, token}} = response

                // Home.__userId__ = userId
                // Home.__token__ = token,
                loginDone(response);

            }
        })
    },

    retrieveUser() {
        // TODO validate input

        const user = users.find(user => user.email === this.__userEmail__)

        if (!user) {
            const error = Error('user not found with email ' + email)

            error.code = 2

            throw error
        }

        return {
            name: user.name,
            surname: user.surname,
            email: user.email
        }
    },

    searchDucks(query, callback) {
        if(query === undefined) throw new Error(query + ' is not a valid query')
        if ((callback === undefined) ||(typeof callback !== 'function')) throw new Error(callback + ' is not a function')

        // TODO handle api errors
        duckApi.searchDucks(query, callback)
    },

    retrieveDuck(id, callback) {
        if(id === undefined) throw new Error(id + ' is not a valid query')
        if ((callback === undefined) || (typeof callback !== 'function')) throw new Error(callback + ' is not a function')

        // TODO handle api errors
        duckApi.retrieveDuck(id, callback)
    }
}
