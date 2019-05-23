// getting-started.js
const mongoose = require('mongoose');

const { Schema, model } = mongoose;

(async () => {

    try{
        await mongoose.connect('mongodb://localhost/kittens', {useNewUrlParser: true});
        console.log('connected!')

        const userSchema = new Schema({
            firstName: String,
            lastName: String,
            email: {
                type: String,
                required: [true, 'email requierd'],
                unique: true,
                validate: {
                    validator: email => {
                        return /^\w+([\.-]?\w+)+@\w+([\.:]?\w+)+(\.[a-zA-Z0-9]{2,3})+$/.test(email);
                    },
                    message: props => `${props.value} is not a valid email`
                }
            },
            username: {
                type: String,
                required: [true, 'username requierd'],
                unique: true,
            },
            password: {
                type: String,
                required: [true, 'password required']
            }
        });

        // NOTE: methods must be added to the schema before compiling it with mongoose.model()
        userSchema.methods.salute = function () {
            var salute = this.firstName
                ? "Hi there name is " + this.name
                : "I don't have a name";
            console.log(salute);
        }

        let Users = model('Users', userSchema)

        const user = await Users.create({firstName: 'Marc', lasName: 'Uson', email:'mailgg@mail.com', username: 'MarcUs'})
        console.log(user)
        mongoose.disconnect();
    }catch (error) {
        console.error(error.message)
    }

})()