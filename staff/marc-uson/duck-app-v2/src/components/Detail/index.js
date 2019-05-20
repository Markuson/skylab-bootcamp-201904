import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faCartPlus } from '@fortawesome/free-solid-svg-icons'

function Detail({ item: { title, image, description, price, id: duckId }, onCart }) {
    return <section>
        <h2>{title}</h2>
        <img src={image} />
        <p>{description}</p>
        <span>{price}</span>
        <FontAwesomeIcon icon={faCartPlus} onClick={e => {
            e.stopPropagation()
            console.log(duckId)
            onCart(duckId)
        }} />
    </section>
}

export default Detail