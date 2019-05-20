import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashAlt} from '@fortawesome/free-solid-svg-icons'

function Cart({items, offCart}) {
    return <ul>
        {
            items.map(({ id, title, imageUrl, price, items }) =>{

                return <li id= {id}>
                    <h2>{title}</h2>
                    <img src={imageUrl} />
                    <span>{items}</span>
                    <span> X </span>
                    <span>{price}</span>
                    <FontAwesomeIcon icon={faTrashAlt} onClick={e => {
                        e.stopPropagation()
                        offCart()
                    }} />
                </li>
            })
        }
    </ul>
}

export default Cart