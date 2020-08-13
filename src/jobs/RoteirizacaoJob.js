const config = require('../config/apisUrl')
const Task = require('../modules/tasks/Task')
const axios = require('axios')

const GEOAPI = config.GEOLOCALIZACAO_API_URL
const DADOSAPI = config.DADOS_API

module.exports = {
  key: 'RoteirizacaoQueue',
  options: {
    delay: 5000,
  },
  async handle({ data }) {
    const task = await Task.findById(data)
    await task.updateOne({ situacao: 'PROCESSANDO' })
    
    axios.post(`${GEOAPI}/criar-rota`, task.payload).then(response => {
      const payload = {
        data: response.data,
        roteirizacaoId: task.roteirizacaoId,
      }
      axios.post(`${DADOSAPI}/roteirizacao/processamento`, payload).then(async () => {
        console.log('concluido roteirizacao')
        await task.updateOne({ situacao: 'CONCLUIDO' })
      })
    }).catch(async () => {
      console.log('falha ao criar rota', new Date().toISOString())
      await task.updateOne({ situacao: 'ERRO' })
    })
  },
};