const BASE_URL = require('../../config/apisUrl').NOTIFICATION_API
const axios = require('axios')
const mongoose = require('mongoose')

const Situacao = {
    NA_FILA: 'NA_FILA',
    PROCESSANDO: 'PROCESSANDO',
    CONCLUIDO: 'CONCLUIDO',
    ERRO: 'ERRO'
}

const schema = new mongoose.Schema({
    matrizId: { type: String, required: true },
    userId: { type: String, required: true },
    roteirizacaoId: { type: String, required: true },
    payload: { type: Object },
    situacao: { type: Situacao, default: Situacao.NA_FILA },
    descricaoErro: { type: String, required: false },
    s3uri: { type: String, required: false },
    api: { type: String, required: true },
    created_at: { type: Date, default: new Date() }
})

schema.post('save', function(task) {
    axios.post(`${BASE_URL}/notificacoes`, {
        task: {
            id: task._id,
            situacao: task.situacao,
            matrizId: task.matrizId,
            userId: task.userId,
            roteirizacaoId: task.roteirizacaoId,
            uri: task.s3uri,
            descricaoErro: task.descricaoErro
        }
    })
})

module.exports = mongoose.model('Tasks', schema)