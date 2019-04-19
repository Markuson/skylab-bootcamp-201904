class Home extends Component{
    constructor(container, onLogOutClick, onSearch, onSelect) {
        super(container)

        let form = this.container.children[1]
        form = new Search(form, onSearch)

        let ul = this.container.children[2]
        let results = new Results(ul, onSelect)
        this.__results__ = results
        results.visible = false

        let section = this.container.children[3]
        let selectedItem = new SelectedItem(section)
        this.__selectedItem__ = selectedItem
        selectedItem.visible = false

        let link = this.container.children[4]

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