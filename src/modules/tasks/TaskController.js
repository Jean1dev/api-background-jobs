const Task = require('./Task')
const Queue = require('../../queue/index')

module.exports = {
    async store(req, res) {
        const { payload, matrizId, userId, roteirizacaoId } = req.body
        const task = await Task.create({ payload, matrizId, userId, roteirizacaoId })
        await Queue.add('RoteirizacaoQueue', task._id)
        return res.json(task)
    }
}