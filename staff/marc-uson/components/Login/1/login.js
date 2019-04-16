'use strict';

function Login(form){
    this.__form__ =  form;
}

Login.prototype.onSubmit = function(callback){

    this.__form__.addEventListener('submit', function(event){
        event.preventDefault();

        var email = this.email.value;
        var password = this.password.value;

        callback(email, password);
    });
}

Object.defineProperty(Login.prototype, 'email', {
    set: function(email) {
        this.__form__.e-mail.placeholder = email;
    }
});

Object.defineProperty(Login.prototype, 'password', {
    set: function(password) {
        this.__form__.password.placeholder = password;
    }
});