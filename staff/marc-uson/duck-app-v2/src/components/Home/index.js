import React, { Component } from 'react'
import literals from './literals'
import logic from '../../logic'
import Search from '../Search'
import Results from '../Results'
import Detail from '../Detail'
import Favorites from '../Favorites'
import Cart from '../Cart'
import './index.sass'
import { withRouter } from 'react-router-dom'
import queryString from 'query-string'

class Home extends Component {
    state = { query: null, error: null, ducks: null, duck: null, favs: null, favList: null, cartList: null}

    componentWillReceiveProps(props) {
        if (props.location.search) {
            const { query } = queryString.parse(props.location.search)

            query && this.search(query)
        } else {
            const [, , id] = props.location.pathname.split('/')

            id && this.retrieve(id)
        }
    }

    search = query =>
        Promise.all([logic.searchDucks(query), logic.retrieveFavDucks()])
            .then(([ducks, favs]) =>
                this.setState({ query, duck: null, favList: null, ducks: ducks.map(({ id, title, imageUrl: image, price }) => ({ id, title, image, price })), favs })
            )
            .catch(error =>
                this.setState({ error: error.message })
            )

    handleSearch = query => this.props.history.push(`/home?query=${query}`)

    retrieve = id =>
        logic.retrieveDuck(id)
            .then(({ title, imageUrl: image, description, price, id }) =>
                this.setState({ duck: { title, image, description, price, id }, favList: null })
            )
            .catch(error =>
                this.setState({ error: error.message })
            )

    handleRetrieve = id => this.props.history.push(`/home/${id}`)

    handleFav = id =>
        logic.toggleFavDuck(id)
            .then(() => this.search(this.state.query))

    handleFavList = () =>
        logic.retrieveFavDucks()
        .then(response => {
            this.setState({favList: response, duck: null})
            this.props.history.push(`/home/favorites`)
        })

    handleAddToCart = duckId =>
        logic.addDuckToCart(duckId)
            .then(() => logic.retrieveSoppingCart())

    handleDeleteFromCart = duckId =>
        logic.deleteDuckFromCart(duckId)
            .then(() => logic.retrieveSoppingCart())
            .then(response => {
                console.log(response)
                this.setState({ cartList: response, duck: null, favList: null })
                this.props.history.push(`/home/cart`)
            })

    handleShoppingCart = () =>
        logic.retrieveSoppingCart()
            .then(response => {
                console.log(response)
                this.setState({ cartList: response, duck: null, favList: null })
                this.props.history.push(`/home/cart`)
            })

    render() {
        const {
            handleSearch,
            handleRetrieve,
            handleFav,
            handleFavList,
            handleAddToCart,
            handleDeleteFromCart,
            handleShoppingCart,
            state: { query, ducks, duck, favs, favList, cartList},
            props: { lang, name, onLogout }
        } = this

        const { hello, logout, favorites, shoppingCart } = literals[lang]

        return <main className="home">
            <h1>{hello}, {name}!</h1>
            <button onClick={onLogout}>{logout}</button>
            <button onClick={handleFavList}>{favorites}</button>
            <button onClick={handleShoppingCart}>{shoppingCart}</button>
            <Search lang={lang} query={query} onSearch={handleSearch} />
            {!duck&& !favList && !cartList && ducks && (ducks.length && <Results items={ducks} onItem={handleRetrieve} onFav={handleFav} favs={favs} /> || <p>No results.</p>)}
            {duck && <Detail item={duck} onCart={handleAddToCart} />}
            {favList && <Favorites items={favList} onItem={handleRetrieve} onFav={handleFav} favs={favs} />}
            {cartList && <Cart items={cartList} offCart={handleDeleteFromCart} />}
        </main>
    }
}

export default withRouter(Home)