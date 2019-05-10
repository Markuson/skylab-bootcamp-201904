const Component = require('../component')
const Search = require('../search')
const path = require('path')

class Results extends Component {
    constructor() {
        super(path.join(__dirname, 'index.html'))
    }

    beforeRender(html, props) {
        const { ducks, query } = props
        let ducksResults = []
        html = html.replace('<search />',  new Search().render({query}))
        if(ducks){
            ducks.forEach(({id, title, imageUrl: image, price}) => {
                ducksResults += `<li key=${id}>
                                    <h2>${title}</h2>
                                    <img src=${image} >
                                    <span>${price}</span>
                                </li>`
            })
        html = html.replace('<list />', ducks ? ducksResults: '')

        return html
        }
    }
}

module.exports = Results