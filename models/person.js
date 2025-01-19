require('dotenv').config();

const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGO_URL

mongoose.connect(url)
.then(result => {
    console.log('connected to MongoDB')
})
.catch(error => console.log('error connecting to mongoDB', error.message))

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 3,
        required: true,
    },

    number: {
        type: String, 
        required: true,
    },
});


personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

const Person = mongoose.model('list', personSchema)

module.exports = Person