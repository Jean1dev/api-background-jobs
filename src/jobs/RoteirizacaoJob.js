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
    await task.update({ situacao: 'PROCESSANDO' })

    axios.post(`${GEOAPI}/criar-rota`, task.payload).then(response => {
      const payload = {
        data: response.data,
        roteirizacaoId: task.roteirizacaoId,
      }
      axios.post(`${DADOSAPI}/roteirizacao/processamento`, payload).then(async () => {
        await task.update({ situacao: 'CONCLUIDO' })
        console.log('sucesso', new Date())
      })
    }).catch(async () => {
      console.log('falha na task', new Date())
      await task.update({ situacao: 'ERRO' })
    })
  },
};