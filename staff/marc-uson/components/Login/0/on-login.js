'use strict';

function OnLogin(form, callback){
    form.addEventListener('submit', function(event){
        event.preventDefault();

        var email = this.email.value;
        var password = this.password.value;

        callback(email, password);
    })
}