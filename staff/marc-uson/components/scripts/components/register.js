/**
 * Register form.
 *
 * @param {*} form
 * @param {Funcion} onRegister The callback invoked on register.
 * @param {*} literals
 * @param {*} defaultLanguage
 * @param {*} onLanguageChange The callback invoked on language change.
 */

class Register extends Component{
    constructor(form, onRegister, literals, defaultLanguage, onLanguageChange, onNavigateToLogin) {
        super(form)

    this.__literals__ = literals
    this.__onLanguageChange__ = onLanguageChange
    let feedback = new Feedback(this.container.children[5])
    feedback.visible = false
    this.__feedback__ = feedback

    let link = this.container.children[4]

    this.language = defaultLanguage

    this.onRegister = onRegister

    link.addEventListener('click', function(){
        event.preventDefault()

        onNavigateToLogin()
    })
    }

    set onRegister(callback){
        this.container.addEventListener('submit', function (event) {
            event.preventDefault()

            let name = this.name.value
            let surname = this.surname.value
            let email = this.email.value
            let password = this.password.value

            callback(name, surname, email, password)
        })
    }

    set language(language) {
        let literals = this.__literals__[language]

        this.container.children[0].innerText = literals.title
        this.container.name.placeholder = literals.name
        this.container.surname.placeholder = literals.surname
        this.container.email.placeholder = literals.email
        this.container.password.placeholder = literals.password

        this.container.children[2].innerText = literals.title

        if (this.__onLanguageChange__) this.__onLanguageChange__(language)
    }

    set error(error){
        this.__feedback__.message = error
        this.__feedback__.visible = true
    }
}