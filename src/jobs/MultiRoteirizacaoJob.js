const Task = require('../modules/tasks/Task')
const axios = require('axios')
const config = require('../config/apisUrl')

const GEOAPI = config.GEOLOCALIZACAO_API_URL
const DADOSAPI = config.DADOS_API

module.exports = {
    key: 'MultiRoteirizacaoQueue',
    options: {},
    async handle({ data }) {
        const task = await Task.findById(data)
        await task.updateOne({ situacao: 'PROCESSANDO' })

        axios.post(`${GEOAPI}/criar-multi-rota`, task.payload).then(response => {
            console.log('lote criado', response.data)
            consultarLote(response.data, 5, task)

        }).catch(async e => {
            console.log('falha ao criar rota', new Date().toISOString())
            await task.updateOne({ situacao: 'ERRO', descricaoErro: 'Erro durante a criacao da rota' })
        })
    }
}

function consultarLote(lote, nTentativas, task) {
    if (!nTentativas) {
        return
    }

    setTimeout(() => {
        console.log('consultando lote', lote.id)
        axios.get(`${GEOAPI}/lote/${lote.id}`).then(response => {
            const { data } = response
            if (data.hasOwnProperty('status')) {
                return consultarLote(lote, nTentativas--)
            }

            const payload = {
                data: data,
                roteirizacaoId: task.roteirizacaoId,
            }

            axios.post(`${DADOSAPI}/roteirizacao/processamento`, payload).then(async () => {
                console.log('lote concluido')
                await task.updateOne({ situacao: 'CONCLUIDO' })
                
            }).catch(async e => {
                console.log(`falha ao integrar rota`, new Date().toISOString(), e)
                await task.updateOne({ situacao: 'ERRO', descricaoErro: 'Erro na integracao da rota com api-dados' })
            })

        })
    }, 2000)
}