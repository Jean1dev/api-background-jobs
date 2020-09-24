require('dotenv-extended').load()

const Sentry = require("@sentry/node")

if (process.env.SENTRY_DNS) {
    console.log('iniciando monitoramento')
    Sentry.init({
        dsn: process.env.SENTRY_DNS,
        tracesSampleRate: 1.0,
    })
}

require('./queue/index').process()