

class Results extends Component{
    constructor (ul, onSelect) {
        super(ul)
        this.__onSelect__ = onSelect
    }

    set items(items){
        this.container.innerHTML = ''
        items.forEach(item => { // id, title, image, price
            const li = document.createElement('li')
            li.setAttribute('data-id', item.id)

            const h3 = document.createElement('h3')
            h3.innerText = item.title
            li.appendChild(h3)

            const img = document.createElement('img')
            img.src = item.image
            img.style.width = '200px'
            li.appendChild(img)

            const span = document.createElement('span')
            span.innerText = item.price
            li.appendChild(span)

            li.addEventListener('click', () =>{
                this.visible = false
                this.__onSelect__(item.id)
                // console.log('cosa', item.id, this)
            })

            this.container.appendChild(li)
            // this.visible = true
        })
    }

}