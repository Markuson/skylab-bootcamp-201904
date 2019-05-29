const validate = require('../../common/validate')
var state = true

const testData = {

    test(data) {
        validate.arguments([
            { name: 'data', value: data, type: 'string', optional: false }
        ])

        var ioArray = data.split(',')
        var resultsArray= []

        switch(state){
            case true:
                resultsArray.push('ON')
                resultsArray.push('OFF')
            break
            case false:
                resultsArray.push('OFF')
                resultsArray.push('ON')
            break
        }
        state = !state

        return resultsArray

    },
}

module.exports = testData