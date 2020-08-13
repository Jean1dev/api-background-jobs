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
    descricaoErro: { type: String, required: false }
})

module.exports = mongoose.model('Tasks', schema)