

let languageSelected = 'en'

let select = document.getElementsByTagName('select')[0]
let languageSelector = new LanguageSelector(select, function (language) {
    languageSelected = language

    landing.language = language
    register.language = language
    login.language = language
})

let sections = document.getElementsByTagName('section')

let landing = new Landing(sections[0], i18n.landing, function() {
    landing.visible = false
    register.visible = true
}, function() {
    landing.visible = false
    login.visible = true
})

let forms = document.getElementsByTagName('form')

let register = new Register(forms[0], function (name, surname, email, password) {
    try {
        logic.register(name, surname, email, password)

        register.visible = false
        registerOk.visible = true
    } catch (error) {
        register.error = i18n.errors[languageSelected][error.code]
    }
}, i18n.register, languageSelected, function(){
    this.__feedback__.visible = false
},function(){
    register.visible = false
    login.visible = true
})
register.visible = false


let login = new Login(forms[1], function (email, password) {
    try {
        logic.login(email, password)

        login.visible = false
        home.visible = true
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

let registerOk = new RegisterOk(sections[1], function () {
    registerOk.visible = false
    login.visible = true
})
registerOk.visible = false

let main = document.getElementsByTagName('main')[0]
let home = new Home(main, function(){
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
    logic.retrieveDucklingDetail(id, function(data){
        home.selectedItem = {
            title: data.title,
            image: data.imageUrl,
            price: data.price,
            description: data.description
        }
    })
})
home.visible = false


