const Task = require('./Task')
const Queue = require('../../queue/index')

module.exports = {
    async store(req, res) {
        const { payload, matrizId, userId, roteirizacaoId, api } = req.body
        const task = await Task.create({ payload, matrizId, userId, roteirizacaoId, api })
        await createJob(task)
        return res.json(task)
    },

    async removeS3file(req, res) {
        const { key } = req.body
        await Queue.add('RemoveS3fileQueue', {key})
        return res.send('Ok')
    }
}

async function createJob(task) {
    const { waypoints } = task.payload
    if (waypoints && waypoints.length > 20) {
        await Queue.add('BatchRoteirizacaoQueue', task._id)
        return
    }

    await Queue.add('RoteirizacaoQueue', task._id)
}