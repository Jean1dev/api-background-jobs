const S3 = require('./commons/s3')

module.exports = {
    key: 'RemoveS3fileQueue',
    options: {
        delay: 5000,
    },
    async handle({ data }) {
        console.log('removendo arquivo do s3 ', data.key)
        await S3.removeFile(data.key)
    }
}