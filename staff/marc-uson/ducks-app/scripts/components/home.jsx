const { Component, /* Fragment */ } = React

class Home extends Component {
    state = {}

    literals = {
        en: {
            title: 'Hello',
        logout: 'Logout'
        },
        es: {
            title: 'Hola',
            logout: 'Cerrar sesión'
        },
        ca: {
            title: 'Hola',
            logout: 'Tancar sessió'
        },
        ga: {
            title: 'Hola',
            logout: 'Cerar sesión'
        }
    }


    render(){
        const {props: {lang, onLogout, name}} = this
        const {title, logout} = this.literals[lang]

        return <main>
            <h1>{title}, {name}!</h1>
            {/* <Search /> */}
            <a href="" onClick={() => onLogout()}>{logout}</a>
        </main>
    }
}
