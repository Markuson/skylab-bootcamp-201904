const id = 'nada';
let languageSelected = 'en'

const select = document.getElementsByTagName('select')[0]
const languageSelector = new LanguageSelector(select, function (language) {
    languageSelected = language

    landing.language = language
    register.language = language
    login.language = language
})

const sections = document.getElementsByTagName('section')

const landing = new Landing(sections[1], i18n.landing, () => {
    landing.visible = false
    register.visible = true
}, () => {
    landing.visible = false
    login.visible = true
})

const forms = document.getElementsByTagName('form')

const register = new Register(forms[0], function (name, surname, email, password) {
    try {
        logic.registerUser(name, surname, email, password, response => {
          if (!response.error) {
            register.visible = false;
            registerOk.visible = true;
          } else {
            register.error = response.message;
          }
        });
    } catch (error) {
        register.error = error.message;
    }
}, i18n.register, languageSelected, function(){
    this.__feedback__.visible = false
},function(){
    register.visible = false
    login.visible = true
})
register.visible = false


const login = new Login(forms[1], function (email, password) {
    try {
        logic.loginUser(email, password, response => {
            if (!response.error){
                login.visible = false
                home.visible = true
                logic.retrieveUser()
            } else {
                login.error = response.error
            }
        })
    } catch (error) {
        login.error = i18n.errors[languageSelected][error.code]
    }
}, i18n.login, languageSelected, function() {
    this.__feedback__.visible = false
}, function(){
    login.visible = false
    register.visible = true
})
login.visible = false

const registerOk = new RegisterOk(sections[2], function () {
    registerOk.visible = false
    login.visible = true
})
registerOk.visible = false

const main = document.getElementsByTagName('main')[0]
const home = new Home(main, function(){
    home.visible = false
    landing.visible = true
}, function(query) {
    logic.searchDucks(query, function(ducks) {
        home.results = ducks.map(function(duck) {
            return {
                id: duck.id,
                title: duck.title,
                image: duck.imageUrl,
                price: duck.price
            }
        })
    })
}, function(id){
    logic.retrieveDuck(id, function(data){
        home.selectedItem = {
            title: data.title,
            image: data.imageUrl,
            price: data.price,
            description: data.description
        }
    })
})
home.visible = false


