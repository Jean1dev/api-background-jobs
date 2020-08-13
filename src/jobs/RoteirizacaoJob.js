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
    task.situacao = 'PROCESSANDO'
    await task.save()

    axios.post(`${GEOAPI}/criar-rota`, task.payload).then(response => {
      const payload = {
        data: response.data,
        roteirizacaoId: task.roteirizacaoId,
      }
      
      axios.post(`${DADOSAPI}/roteirizacao/processamento`, payload).then(async () => {
        console.log('concluido roteirizacao')
        task.situacao = 'CONCLUIDO'
        await task.save()

      }).catch(async e => {
        console.log(`falha ao integrar rota`, new Date().toISOString(), e.message)
        task.situacao = 'ERRO'
        task.descricaoErro = 'Erro na integracao da rota com api-dados'
        await task.save()
      })

    }).catch(async () => {
      console.log('falha ao criar rota', new Date().toISOString())
      task.situacao = 'ERRO'
      await task.save()
    })
  },
};