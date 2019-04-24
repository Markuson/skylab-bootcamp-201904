const { Component, /* Fragment */ } = React

class Home extends Component {
    state = {results:null}

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

    handleSearch = (query) =>{
        logic.searchDucks(query, (result) => {
            this.setState({Results: result, visible: "results"})
        })
    }

    render(){
        const {props: {lang, onLogout, name, onSearch, showResults}} = this
        const {title, logout} = this.literals[lang]

        return <main>
            <h1>{title}, {name}!</h1>
            <Search lang={lang} onSearch={handleSearch} />
            <Results results={results}/>
            <a href="" onClick={() => onLogout()}>{logout}</a>
        </main>
    }
}
