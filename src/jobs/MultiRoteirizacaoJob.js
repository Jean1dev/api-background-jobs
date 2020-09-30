const Task = require('../modules/tasks/Task')
const axios = require('axios')
const config = require('../config/apisUrl')
const { simplifyGeoPayload } = require('./commons/utils')
const S3StorageProvider = require('./commons/s3')
const LogService = require('../modules/logs/LogService')

const GEOAPI = config.GEOLOCALIZACAO_API_URL
const DADOSAPI = config.DADOS_API

module.exports = {
    key: 'BatchRoteirizacaoQueue',
    options: {},
    async handle({ data }) {
        const LOGGER = new LogService()
        const task = await Task.findById(data)
        task.situacao = 'PROCESSANDO'
        await task.save()

        axios.post(`${GEOAPI}/criar-batch-rota`, task.payload).then(response => {
            LOGGER.logger('lote criado' + JSON.stringify(response.data))
            consultarLote(response.data, 5, task, LOGGER)

        }).catch(async e => {
            LOGGER.logger('falha ao criar rota' + new Date().toISOString())
            task.situacao = 'ERRO'
            task.descricaoErro = e.response.data.message || ''
            axios.post(`${DADOSAPI}/roteirizacao/falha`, { roteirizacaoId: task.roteirizacaoId })
            await task.save()
            await LOGGER.send(task)
        })
    }
}

function consultarLote(lote, nTentativas, task, LOGGER) {
    if (!nTentativas) {
        return
    }

    setTimeout(() => {
        LOGGER.logger('consultando lote' + lote.id)
        axios.get(`${GEOAPI}/lote/${lote.id}`).then(async response => {
            const { data } = response
            if (data.hasOwnProperty('status')) {
                return consultarLote(lote, nTentativas--, task, LOGGER)
            }

            data.properties = {}
            data.properties.orderRequestedPoints = lote.properties.orderRequestedPoints
            const payload = {
                data: simplifyGeoPayload(data),
                roteirizacaoId: task.roteirizacaoId,
            }

            payload.uri = await S3StorageProvider.createAndSave(payload)
            delete payload.data

            axios.post(`${DADOSAPI}/roteirizacao/processamento`, payload).then(async () => {
                LOGGER.logger('lote concluido' + new Date().toISOString())
                task.situacao = 'CONCLUIDO'
                task.s3uri = payload.uri
                await task.save()
                await LOGGER.send(task)

            }).catch(async e => {
                LOGGER.logger(`falha ao integrar rota` + new Date().toISOString() + e.message)
                task.situacao = 'ERRO'
                task.descricaoErro = 'Erro na integracao da rota com api-dados'
                await task.save()
                await LOGGER.send(task)
            })

        }).catch(async error => {
            LOGGER.logger(`falha ao consultar lote` + new Date().toISOString() + e.message)
            task.situacao = 'ERRO'
            task.descricaoErro = error.response.data.message || ''
            axios.post(`${DADOSAPI}/roteirizacao/falha`, { roteirizacaoId: task.roteirizacaoId })
            await task.save()
            await LOGGER.send(task)
        })
    }, 2000)
}