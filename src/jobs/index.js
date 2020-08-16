const Roteirizacao = require('./RoteirizacaoJob')
const MultiRoteirizacao = require('./MultiRoteirizacaoJob')
const RemoveS3file = require('./RemoveS3fileJob')

module.exports = [
    Roteirizacao,
    MultiRoteirizacao,
    RemoveS3file
]