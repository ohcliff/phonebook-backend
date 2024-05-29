require('dotenv').config()
const express = require('express')
var morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person')
const errorHandler = (error, request, response, next) => {
    console.error(error.message)
    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }
    next(error)
}
morgan.token('req-body', (req, res) => {
    return JSON.stringify(req.body)
})

app.use(express.static('dist'))
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req-body'))

app.use(cors())
app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get('/info', (request, response) => {
    const total = persons.length
    const currentDate = new Date()
    const infoMsg = `
    <p>Phonebook has info for ${total} people</p>
    <p>${currentDate}</p>
    `
    response.send(infoMsg)
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
        })


app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
    .then(result => {
        response.status(204).end()
    })
    .catch(error => next(error))
})

const generateId = () => {
    const maxId = persons.length > 0
    ? Math.max(...persons.map(p => p.id))
    : 0
    return maxId + 1
}

app.post('/api/persons', (request, response, next) => {
    const body = request.body

    if (!body.name || !body.number) {
        return response.status(400).json({ error: 'Name or number is missing' });
    }

    const person = new Person({
        name: body.name,
        number: body.number,
        id: generateId(),
    })
    
    person.save().then(savedNote => {
        response.json(savedNote)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body
    const person = {
        name: body.name,
        number: body.number,
    }
    Person.findByIdAndUpdate(request.params.id, person, { new: true })
        .then(updatedPerson => {
            if (updatedPerson) {
                response.json(updatedPerson);
            } else {
                response.status(404).end();
            }
        })
        .catch(error => next(error));
})

app.use(errorHandler)

// Ensure the app listens on all network interfaces
const PORT = process.env.PORT || 3000; // Update the port to 3000
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});