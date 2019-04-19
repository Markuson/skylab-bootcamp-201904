class SelectedItem extends Component{
    constructor(section){
        super(section)
    }

    set items(items) {
        let h2 = this.container.children[0]
        h2.innerText = items.title

        let img = this.container.children[1]
        img.src = items.image

        let p = this.container.children[2]
        p.innerText = items.price

        let span = this.container.children[3]
        span.innerText = items.description

        this.visible = true
    }
}