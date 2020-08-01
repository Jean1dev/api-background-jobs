module.exports = {
    GEOLOCALIZACAO_API_URL: process.env.NODE_ENV === 'dev' ? 
        'http://localhost:8081/geolocation' : 
        'https://api-geolocalizacao-binno.herokuapp.com/geolocation',
    DADOS_API: process.env.NODE_ENV === 'dev' ?
        'http://localhost:8082/dados':
        'https://api-dados-binno.herokuapp.com/dados'
}