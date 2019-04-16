'use strict';

var form = document.getElementsByTagName('form')[0];

OnLogin(form, login);

var form2 = document.getElementsByTagName('form')[1];

OnLogin(form2, loginAdmin);

var form3 = document.getElementsByTagName('form')[2];

OnLogin(form3, loginSuperAdmin);