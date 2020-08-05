const Task = require('./Task')
const Queue = require('../../queue/index')

module.exports = {
    async store(req, res) {
        const { payload, matrizId, userId, roteirizacaoId } = req.body
        const task = await Task.create({ payload, matrizId, userId, roteirizacaoId })
        await createJob(task)
        return res.json(task)
    }
}

async function createJob(task) {
    const { waypoints } = task.payload
    if (waypoints && waypoints.length > 20) {
        await Queue.add('MultiRoteirizacaoQueue', task._id )
        return
    }

    await Queue.add('RoteirizacaoQueue', task._id)
}