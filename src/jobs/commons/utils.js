module.exports = {
    simplifyGeoPayload: (payload) => {
        // delete payload.features[0].properties
        // delete payload.properties
        return payload
    }
}