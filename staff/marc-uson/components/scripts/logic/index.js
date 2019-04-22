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
                loginDone(response);
            }
        })
    },

    retrieveUser(id, token, retrieveDone) {
        validate.arguments([
            { name: "id", value: id, type: "string", notEmpty: true },
            { name: "token", value: token, type: "string", notEmpty: true }
           ])

        userApi.retrieve(id, token, response => {
            if(response.error){
                retrieveDone({
                    status : 'KO',
                    error: response.error
                })
            }else{
                retrieveDone(response);
            }
        })
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
