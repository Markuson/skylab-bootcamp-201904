class SelectedItem extends Component{
    constructor(section){
        super(section)
    }

    set items(items) {
        const h2 = this.container.children[0]
        h2.innerText = items.title

        const img = this.container.children[1]
        img.src = items.image

        const p = this.container.children[2]
        p.innerText = items.price

        const span = this.container.children[3]
        span.innerText = items.description

        this.visible = true
    }
}