const Moongose = require('mongoose')

Moongose.Promise = global.Promise
const mongoUrl = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/binno_db'

module.exports = Moongose.connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
