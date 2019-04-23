const Register = (() => {
    const literals = {
        en: {
            title: 'Register',
            name: 'Name',
            surname: 'Surname',
            email: 'E-mail',
            password: 'Password',
            login: 'Login',
            or: 'or'
        },
        es: {
            title: 'Registro',
            name: 'Nombre',
            surname: 'Apellido',
            email: 'E-milio',
            password: 'Contraseña',
            login: 'Inicio de sesión',
            o: 'o'
        },
        ca: {
            title: 'Registre',
            name: 'Nom',
            surname: 'Cognom',
            email: 'E-mil·li',
            password: 'Contrasenya',
            login: 'Inici de sessió',
            o: 'o'
        },
        ga: {
            title: 'Rexistro',
            name: 'Nome',
            surname: 'Apelido',
            email: 'E-miliño',
            password: 'Contrasinal',
            login: 'Inicio da sesión',
            or: 'o'
        }
    }

    return function({lang, error, onRegister, onLogin} ) {


        const {title, name, surname, email, password, or, login } = literals[lang]

        function handleSubmit(e) {
            e.preventDefault()

            const {
                name: { value: name },
                surname: { value: surname },
                username: { value: username },
                password: { value: password }
            } = e.target

            onRegister(name, surname, username, password)
        }

        function handleToLogin(e) {
            e.preventDefault()
            onLogin()
        }

        return <>
            <h2>{title}</h2>

            <form onSubmit={handleSubmit}>
                <input type="text" name="name" placeholder={name} />
                <input type="text" name="surname" placeholder={surname} />
                <input type="text" name="username" placeholder={email} />
                <input type="password" name="password" placeholder={password} />
                <button>{title}</button> <span> {or} </span> <a onClick ={handleToLogin} href="">{login}</a>
                <span>{error}</span>
            </form>
        </>
    }
})()