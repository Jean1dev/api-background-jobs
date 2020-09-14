const config = require('../config/apisUrl')
const Task = require('../modules/tasks/Task')
const axios = require('axios')
const { simplifyGeoPayload } = require('./commons/utils')
const S3StorageProvider = require('./commons/s3')

const GEOAPI = config.GEOLOCALIZACAO_API_URL
const DADOSAPI = config.DADOS_API

module.exports = {
  key: 'RoteirizacaoQueue',
  options: {},
  async handle({ data }) {
    const task = await Task.findById(data)
    task.situacao = 'PROCESSANDO'
    await task.save()
    let url = `${GEOAPI}/criar-rota`

    if (task.api === 'v2') {
      url = `${GEOAPI}/v2/criar-rota`
    }

    axios.post(url, task.payload).then(async response => {
      const payload = {
        data: simplifyGeoPayload(response.data),
        roteirizacaoId: task.roteirizacaoId,
      }
      
      payload.uri = await S3StorageProvider.createAndSave(payload)
      delete payload.data

      axios.post(`${DADOSAPI}/roteirizacao/processamento`, payload).then(async () => {
        console.log('concluido roteirizacao', new Date().toISOString())
        task.situacao = 'CONCLUIDO'
        task.s3uri = payload.uri
        await task.save()

      }).catch(async e => {
        console.log(`falha ao integrar rota`, new Date().toISOString(), e.message)
        task.situacao = 'ERRO'
        task.descricaoErro = 'Erro na integracao da rota com api-dados'
        await task.save()
      })

    }).catch(async error => {
      console.log('falha ao criar rota', new Date().toISOString())
      task.situacao = 'ERRO'
      task.descricaoErro = error.response.data.message || ''
      axios.post(`${DADOSAPI}/roteirizacao/falha`, { roteirizacaoId: task.roteirizacaoId })
      await task.save()
    })
  },
};
