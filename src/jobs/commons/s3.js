const { promises: { writeFile, unlink, readFile } } = require('fs')
const AWS = require('aws-sdk')
const S3 = new AWS.S3({
    region: process.env.AWS_DEFAULT_REGION
})
const BUCKET = process.env.AWS_BUCKET

class S3StorageProvider {

    async createAndSave(content) {
        const filename = `roteirizacao_${content.roteirizacaoId}_${new Date().toISOString()}.json`
        await writeFile(filename, JSON.stringify(content.data))
        const filtcontent = await readFile(filename)

        await S3.putObject({
            Bucket: BUCKET,
            Key: filename,
            ACL: 'public-read',
            Body: filtcontent,
        }).promise()

        await unlink(filename)
        return `${process.env.AWS_S3_URI}${filename}`
    }

    async removeFile(key) {
        await S3.deleteObject({
            Bucket: BUCKET,
            Key: key
        }).promise()
    }
}

module.exports = new S3StorageProvider()