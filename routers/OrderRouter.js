const express = require('express')
const Router = express.Router()

Router.get('/', (req, res) => {
    res.json({
        code: 0,
        message: 'Order route'
    })
})

module.exports = Router