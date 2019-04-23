const Login = (() => {
    const literals = {
        en: {
            title: 'Login',
            email: 'E-mail',
            password: 'Password',
            register: 'Register',
            or: 'or'
        },
        es: {
            title: 'Iniciar sesión',
            email: 'E-milio',
            password: 'Contraseña',
            register: 'Registrate',
            or: 'o'
        },
        ca: {
            title: 'Inici de sessió',
            email: 'E-mil·li',
            password: 'Contrasenya',
            register: 'Registra\'t',
            or: 'o'
        },
        ga: {
            title: 'Inicio da sesión',
            email: 'E-miliño',
            password: 'Contrasinal',
            register: 'Rexistrese',
            or: 'o'
        }
    }

    return function({lang, error, onRegister, onLogin}) {


        const {title, email, password, register, or} = literals[lang]

        function handleSubmit(e) {
            e.preventDefault()

            const username = e.target.username.value
            const password = e.target.password.value

            onLogin(username, password)
        }

        function handleToRegister(e) {
            e.preventDefault()
            onRegister()
        }

        return <>
            <h2>{title}</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" name="username" placeholder={email} />
                <input type="password" name="password" placeholder={password} />
                <button>{title}</button> <span> {or} </span> <a onClick ={handleToRegister} href="">{register}</a>
                <span>{error}</span>
            </form>
        </>
    }
})()