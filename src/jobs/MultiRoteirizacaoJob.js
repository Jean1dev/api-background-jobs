const Task = require('../modules/tasks/Task')
const axios = require('axios')
const config = require('../config/apisUrl')
const { simplifyGeoPayload } = require('./commons/utils')
const S3StorageProvider = require('./commons/s3')

const GEOAPI = config.GEOLOCALIZACAO_API_URL
const DADOSAPI = config.DADOS_API

module.exports = {
    key: 'BatchRoteirizacaoQueue',
    options: {},
    async handle({ data }) {
        const task = await Task.findById(data)
        task.situacao = 'PROCESSANDO'
        await task.save()

        axios.post(`${GEOAPI}/criar-batch-rota`, task.payload).then(response => {
            console.log('lote criado', response.data)
            consultarLote(response.data, 5, task)

        }).catch(async e => {
            console.log('falha ao criar rota', new Date().toISOString())
            task.situacao = 'ERRO'
            task.descricaoErro = error.response.data.message || ''
            axios.post(`${DADOSAPI}/roteirizacao/falha`, { roteirizacaoId: task.roteirizacaoId })
            await task.save()
        })
    }
}

function consultarLote(lote, nTentativas, task) {
    if (!nTentativas) {
        return
    }

    setTimeout(() => {
        console.log('consultando lote', lote.id)
        axios.get(`${GEOAPI}/lote/${lote.id}`).then(async response => {
            const { data } = response
            if (data.hasOwnProperty('status')) {
                return consultarLote(lote, nTentativas--)
            }

            data.orderRequestedPoints = lote.orderRequestedPoints
            const payload = {
                data: simplifyGeoPayload(data),
                roteirizacaoId: task.roteirizacaoId,
            }

            payload.uri = await S3StorageProvider.createAndSave(payload)
            delete payload.data

            axios.post(`${DADOSAPI}/roteirizacao/processamento`, payload).then(async () => {
                console.log('lote concluido', new Date().toISOString())
                task.situacao = 'CONCLUIDO'
                task.s3uri = payload.uri
                await task.save()

            }).catch(async e => {
                console.log(`falha ao integrar rota`, new Date().toISOString(), e.message)
                task.situacao = 'ERRO'
                task.descricaoErro = 'Erro na integracao da rota com api-dados'
                await task.save()
            })

        })
    }, 2000)
}