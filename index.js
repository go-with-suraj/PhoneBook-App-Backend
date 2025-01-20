const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person.js')

const app = express()
const PORT = process.env.PORT || 5000

app.use(express.json())
app.use(cors())

morgan.token('userName', (req) => {
    return req.body.name || req.query.name || req.params.name || 'N/A'
})
morgan.token('userNumber', (req) => {
    return req.body.number || req.query.number || req.params.number || 'N/A'
})

app.use(morgan(`:method :url  :status :res[content-length] - :response-time ms {name: :userName, number: :userNumber}`))

 
app.get('/', (req, res) => {
    res.send('Welcome to PhoneBook App')
})
app.get('/api/persons', (req, res) => {
    Person.find({}).then(person => {

        res.json(person)
    })
})

app.get('/info', (req, res) => {
    Person.countDocuments({})
    .then((totalEntries) => {
        const currentDate = new Date()
        const localTime = currentDate.toLocaleString('en-US', {
            timeZone: 'Europe/Helsinki',
            dateStyle: 'full',
            timeStyle: 'long'
        })
    
        res.send(`
            <div>
            <p>Phonebook has info for ${totalEntries} People</p>
            <p>${formattedTime}</p>
            
            </div>
            `)
    })
    .catch(error => next(error))

})

app.get('/api/persons/:id', (req, res, next) => {
    const id = req.params.id

    Person.findById(id)
    .then(person => {
        if(person) {
            res.json(person)
        } else {
            res.status(404).json({error: 'Person not found'})
        }

    })
    .catch(error => next(error))
})


app.post('/api/persons', (req, res, next) => {
    const body = req.body

    if(!body.name || !body.number) {
        return res.status(400).json({
            error: 'name or number is Missing'
        })
    }
    
    const person = new Person({
        name: body.name,
        number: body.number
    })

    person
    .save()
    .then(savedPerson =>
        res.json(savedPerson)
    )
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
    const {name, number} = req.body
    const id = req.params.id

    Person.findByIdAndUpdate(id, {name, number}, {new: true, runValidators: true, name: 'query'})
    .then(updatedPerson => {
        res.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
    const id = req.params.id
    Person.findByIdAndDelete(id)
    .then(() => res.status(204).end())
    .catch(error => next(error))
    
})

const unknownEndPoint = (req, res) => {
    res.status(404).send({error: 'unknown endpoints'})
}


app.use(unknownEndPoint)

const errorHandler = (error, req, res, next) => {
    if(error.name === 'CastError') {
        return res.status(400).send({error: 'malformatted id'})
    } else if(error.name === 'ValidationError') {
        return res.status(400).json({error: error.message})
    }
    next(error)
}
app.use(errorHandler)


app.listen(PORT, () => {
    console.log('Server started at port:', PORT)
})