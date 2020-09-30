const mongoose = require('mongoose')
const Task = require('../tasks/Task').schema

const schema = new mongoose.Schema({
    task: { type: Task },
    mensagens: { type: Array }
})

module.exports = mongoose.model('Logs', schema)