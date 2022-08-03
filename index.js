/*eslint linebreak-style: ['error', 'windows']*/

require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const Note = require('./models/notes')

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

// app.use(express.static('build'))
app.use(requestLogger)
app.use(express.json())
app.use(cors())

app.get('/', (request, response) => {
  console.log('request: /')

  response.send('<h1>Hello World!</h1>')
})
app.get('/api/notes/:id', (request, response, next) => {
  console.log('request: /api/notes:id')
  // const id = Number(request.params.id)
  // const note = Note.find(note => note.id === id)

  Note.findById(request.params.id)
    .then(note => {
      if(note){
        response.json(note)
      }else{
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.get('/api/notes', (request, response) => {
  console.log('request: /api/notes')
  Note.find({}).then(notes => {
    response.json(notes)
  })
})
app.post('/api/notes', (request, response, next) => {
  console.log('request: post:/api/notes')

  const body = request.body

  // if (body.content === undefined) {
  //   return response.status(400).json({ error: 'content missing' })
  // }

  const note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date(),
  })

  note.save().then(savedNote => {
    response.json(savedNote)
  }).catch(error => next(error))
})

app.delete('/api/notes/:id', (request, response) => {
  Note.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/notes/:id', (request, response, next) => {
  const { content, important } = request.body

  Note.findByIdAndUpdate(request.params.id,
    { content, important },
    { new: true, runValidators:true, context:'query' })
    .then(updatedNote => {
      response.json(updatedNote)
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  if(error.name ==='CastError'){
    return response.status(400).send({ error:'malformatted id' })
  } else if (error.name === 'ValidationError'){
    return response.status(400).json({ error: error.message })
  }
  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
