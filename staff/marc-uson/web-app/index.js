const express = require('express')
const { injectLogic, checkLogin } = require('./middlewares')
const package = require('./package.json')
const bodyParser = require('body-parser')
const session = require('express-session')


const urlencodedParser = bodyParser.urlencoded({ extended: false })

const { argv: [, , port = 8080] } = process

const app = express()

app.set('view engine', 'pug')
app.set('views', 'components')

app.use(session({
    secret: 'my super secret phrase to encrypt my session',
    resave: true,
    saveUninitialized: true
}))

app.use(express.static('public'), injectLogic)

app.get('/', checkLogin('/home'), (req, res) => {
    res.render('landing')
})

app.get('/register', checkLogin('/home'), (req, res) => {
    res.render('register')
})

app.post('/register', [checkLogin('/home'), urlencodedParser], (req, res) => {
    const { body: { name, surname, email, password }, logic } = req

    try {
        logic.registerUser(name, surname, email, password)
            .then(() => res.render('login'))
            .catch(({ message }) => res.render('register', { name, surname, email, message }))
    } catch ({ message }) {
        res.render('register', { name, surname, email, message })
    }
})

app.get('/login', checkLogin('/home'), (req, res) =>
    res.render('login')
)

app.post('/login', [checkLogin('/home'), urlencodedParser], (req, res) => {
    const { body: { email, password }, logic, session } = req

    try {
        logic.loginUser(email, password)
            .then(() => {
                session.token = logic.__userToken__

                res.redirect('/home')
            })
            .catch(({ message }) => res.render('login', { email, message }))
    } catch ({ message }) {
        res.render('login', { email, message })
    }
})

app.get('/home', checkLogin('/', false), (req, res) => {
    const { logic, session } = req

    logic.retrieveUser()
        .then(({ name, favList }) => {
            session.favList = favList
            return res.render('home', {name})
        })
        .catch(({ message }) => res.render('home', {message}))
})

app.get('/home/search', checkLogin('/', false), urlencodedParser, (req, res) => {
    const { query: { query }, logic, session } = req

    session.query = query

    logic.searchDucks(query)
        .then(ducks => {
            ducks = ducks.map(({ id, title, imageUrl: image, price }) =>{
                isFav = session.favList.some(fav => fav == id)
                return { url: `/home/duck/${id}`, title, image, price, isFav, id}
            })

            return logic.retrieveUser()
                .then(({ name }) => res.render('home',{ name, query, ducks }))
        })
        .catch(({ message }) => res.render('home', { message}))
})

app.get('/home/favorites', checkLogin('/', false), urlencodedParser, (req, res) => {
    const { query: { query }, logic, session } = req

    session.query = query

    logic.retrieveFavDucks()
        .then(response => {
            let favs
            favs = response.map(({ id, title, imageUrl: image, price }) =>{
                return { url: `/home/duck/${id}`, title, image, price, id}
            })

            return logic.retrieveUser()
                .then(({ name }) => res.render('home',{ name, query, favs }))
        })
        .catch(({ message }) => res.render('home', { message}))
})

app.get('/home/duck/:id', checkLogin('/', false), (req, res) => {
    const { params: { id }, logic, session: { query } } = req

    logic.retrieveDuck(id)
        .then(({ title, imageUrl: image, description, price }) => {
            const duck = { title, image, description, price }

            return logic.retrieveUser()
                .then(({ name }) => res.render('home', { query, name, duck }))
        })
})

app.post('/logout', (req, res) => {
    req.session.destroy()

    res.redirect('/')
})

app.post('/home/search', checkLogin('/', false), urlencodedParser, (req, res) => {
    const{query:{query}, logic, session, body} = req
    session.query = query;

  if (body.toggleFav) {
    const id = body.toggleFav;
    return logic.toggleFavDuck(id).then(() => res.redirect(`/home/search?query=${query}`));
  } else res.redirect(req.url);
})

app.use(function (req, res, next) {
    res.redirect('/')
})

app.listen(port, () => console.log(`${package.name} ${package.version} up on port ${port}`))