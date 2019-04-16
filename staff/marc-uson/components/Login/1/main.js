'use strict';

var forms = document.getElementsByTagName('form');

var login = new Login(forms[0]);
login.onSubmit(login);


var loginAdmin = new Login(forms[1]);
loginAdmin.onSubmit(loginAdmin);


var loginSuperAdmin = new Login(forms[2]);
loginSuperAdmin.onSubmit(loginSuperAdmin)