'use strict';

// presentation logic
var defaultLanguage = 'en';

var select = document.getElementsByTagName('select')[0];
var langSelector = new LanguageSelector(select, function (lang) {
    signUp.language = lang;
    signUpAdmin.language = lang;
    signUpSuperAdmin.language = lang;
    log.language = lang;
    logAdmin.language = lang;
    logSuperAdmin.language = lang;
});


var forms = document.getElementsByTagName('form');

var signUp = new SignUp(forms[1], register, i18n.signUp, defaultLanguage);

var signUpAdmin = new SignUp(forms[2], registerAdmin, i18n.signUp, defaultLanguage, function (language) {
    var admin = i18n.admin[language];

    this.__form__.children[0].innerText += ' ' + admin;
});

var signUpSuperAdmin = new SignUp(forms[3], registerSuperAdmin, i18n.signUp, defaultLanguage, function (language) {
    var admin = i18n.admin[language];

    this.__form__.children[0].innerText += ' Super ' + admin;
});

var log = new Login(forms[4], login, i18n.login, defaultLanguage);

var logAdmin = new Login(forms[5], loginAdmin, i18n.login, defaultLanguage, function (language) {
    var admin = i18n.admin[language];

    this.__form__.children[0].innerText += ' ' + admin;
});

var logSuperAdmin = new Login(forms[6], loginSuperAdmin, i18n.login, defaultLanguage, function (language) {
    var admin = i18n.admin[language];

    this.__form__.children[0].innerText += ' Super ' + admin;
});