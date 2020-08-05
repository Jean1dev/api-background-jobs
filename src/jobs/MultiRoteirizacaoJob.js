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
            console.log(`erro`, new Date().toISOString())
            await task.updateOne({ situacao: 'ERRO' })
        })
    }
}

function consultarLote(lote, nTentativas, task) {
    if (!nTentativas) {
        return
    }

    setTimeout(() => {
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
                await task.updateOne({ situacao: 'CONCLUIDO' })
                
            }).catch(async e => {
                console.log(`erro`, new Date().toISOString())
                await task.updateOne({ situacao: 'ERRO' })
            })

        })
    }, 2000)
}