const validate = require('../common/validate')
const testData = require('../data/test-data')

const logic = {

    handleDigitalInputs(data){
        console.log(data)
    },

    handleDigitalOutputs(data){
        validate.arguments([
            { name: 'data', value: data, type:'string', notEmpty: true }
        ])

        var responseArray = testData.test(data)
        var response = '';

        for(i=0; i < responseArray.length; i++){
            response= response.concat(`do${i+1}:${responseArray[i]}:do${i+1},`)
        }

        return response
    },

    handleAnalogInputs(data){
        console.log(data)
    },

    handleAnalogOutputs(data){
        console.log(data)
    }
}

module.exports = logic