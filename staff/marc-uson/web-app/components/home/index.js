const path = require('path')
const Search = require('../search')
const Results = require('../results')
const Component = require('../component')

class Home extends Component {
    constructor() {
        super(path.join(__dirname, 'index.html'))
    }

    render(props={name:'', query:'', ducks:''}){
        return super.render(props)
    }

    beforeRender(html, props) {
        const { ducks, query } = props

        html = html.replace('<search />',  new Search().render())
        html = html.replace('<results />', ducks ?  new Results().render({ducks, query}) : '')

        return html
    }
}

module.exports = Home