const Log = require('./Logs')

class LogService {
    constructor() {
        this.mensagens = []
    }

    logger(mensagem) {
        console.log(mensagem)
        this.mensagens.push(mensagem)
    }

    async send(task) {
        await Log.create({
            mensagens: this.mensagens,
            task: task
        })
    }

}

module.exports = LogService