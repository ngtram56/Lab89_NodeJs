const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    let authorization = req.header('Authorization')
    if(!authorization) {
        return res.status(401).json({code: 101, message: 'Vui lòng cung cấp jwt token qua header'})

    }
    let token = authorization.split(' ')[1]
    // const {token} = req.body
    if(!token) {
        return res.status(401).json({code: 101, message: 'Vui lòng cung cấp jwt token hợp lệ'})
    }
    const {JWT_SECRET} = process.env
    jwt.verify(token, JWT_SECRET, (err, data) => {
        if(err) {
            return res.status(401).json({code: 102, message: 'Token không hợp lệ hoặc đã hết hạn'})
        }
        req.user = data
        next()
    })
}