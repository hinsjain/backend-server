const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode;
    switch(statusCode){
        case 400:
            res.send({
                "code": statusCode,
                "msg": err.message
            })
            break;
        case 401:
            res.send({
                "code": statusCode,
                "msg": err.message
            })
            break;
        case 403:
            res.send({
                "code": statusCode,
                "msg": err.message
            })
            break;
        case 404:
            res.send({
                "code": statusCode,
                "msg": err.message
            })
            break;
        default:
            res.send({
                "code": statusCode,
                "msg": err.message
            })
            break;
    }
}

module.exports = errorHandler