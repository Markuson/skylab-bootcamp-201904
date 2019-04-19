class Home extends Component{
    constructor(container, onLogOutClick, onSearch, onSelect) {
        super(container)

        const form = this.container.children[1]
        form = new Search(form, onSearch)

        const ul = this.container.children[2]
        const results = new Results(ul, onSelect)
        this.__results__ = results
        results.visible = false

        const section = this.container.children[3]
        const selectedItem = new SelectedItem(section)
        this.__selectedItem__ = selectedItem
        selectedItem.visible = false

        const link = this.container.children[4]

        link.addEventListener('click', function(){
            event.preventDefault()

            onLogOutClick()
        })
    }

    set results(results) {
        this.__selectedItem__.visible = false
        this.__results__.items = results
        this.__results__.visible = true
    }

    set selectedItem(results) {
        this.__results__.visible = false
        this.__selectedItem__.items = results
        this.__selectedItem__.visible = true
    }
}