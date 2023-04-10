const express = require('express')
const { validationResult } = require('express-validator')
const Router = express.Router()
const CheckLogin = require('../auth/CheckLogin')
const Product = require('../models/ProductModel')
const rateLimit = require('express-rate-limit')

const addProductValidator = require('./validators/addProductValidator')

const allProductLimiter = rateLimit({
    windowMs: 10 * 1000, //10s
    max: 5,
    message: "Không thể gửi quá 5 request trong 10s khi đọc danh sách sản phẩm"
})

const deltailProductLimiter = rateLimit({
    windowMs: 10 * 1000, //10s
    max: 2,
    message: "Không thể gửi quá 2 request trong 10s khi đọc chi tiết 1 sản phẩm"
})

Router.get('/', allProductLimiter, (req, res) => {
    Product.find()
    .then(products => {
        res.json({code: 0, message: 'Đọc danh sách sản phẩm thành công', data: products})
    })
})

Router.post('/', CheckLogin, addProductValidator, (req, res) => {
    let result = validationResult(req)
    if(result.errors.length === 0) {
        const {name, price, desc} = req.body
        let product = new Product({
            name, price, desc
        })

        product.save()
        .then(() => {
            res.json({code: 0, message: 'Thêm sản phẩm thành công', data: product})
        })
        .catch(e => {
            res.json({code: 2, message: e.message})
        })
        return
    }
    else {
        let messages = result.mapped()
        let message = ''
        for(m in messages) {
            message = messages[m].msg
            break
        }

        res.json({code: 1, message: message})
    }
})

Router.get('/:id', deltailProductLimiter, (req, res) => {
    let {id} = req.params
    if(!id) {
        return res.json({code: 1, messsage: 'Không có thông tin mã sản phẩm'})
    }
    Product.findById(id)
    .then(p => {
        if(p) {
            return res.json({code: 0, message: 'Đã tìm thấy sản phẩm', data: p})
        }
        else return res.json({code: 2, message: 'Không tìm thấy sản phẩm'})
    })
    .catch(e => {
        if(e.message.includes('Cast to ObjectId failed')) {
            return res.json({code: 3, message: 'Đây không phải là một id hợp lệ'})
        }
        return res.json({code: 3, message: e.message})
    })
})

Router.delete('/:id', CheckLogin, (req, res) => {
    let {id} = req.params
    if(!id) {
        return res.json({code: 1, message: 'Không có thông tin mã sản phẩm'})
    }
    Product.findByIdAndDelete(id)
    .then(p => {
        if(p) {
            return res.json({code: 0, message: 'Đã xóa sản phẩm'})
        }
        else return res.json({code: 2, message: 'Không tìm thấy sản phẩm'})
    })
    .catch(e => {
        if(e.message.includes('Cast to ObjectId failed')) {
            return res.json({code: 3, message: 'Đây không phải là một id hợp lệ'})
        }
        return res.json({code: 3, message: e.message})
    })
})

Router.put('/:id', CheckLogin, (req, res) => {
    let {id} = req.params
    if(!id) {
        return res.json({code: 1, message: 'Không có thông tin mã sản phẩm'})
    }

    let supportedFields = ['name', 'price', 'desc']
    let updateData = req.body
    if(!updateData) {
        return res.json({code: 2, message: 'Không có dữ liệu cần cập nhật'})
    }
    // console.log('Before: ')
    // console.log(updateData)

    for (field in updateData) {
        if (!supportedFields.includes(field)) {
            delete updateData[field];
            
        }
    }
    // console.log('After: ')
    // console.log(updateData)
    // res.json({code: 0, message: 'Xem log'})


    Product.findByIdAndUpdate(id, updateData, {
        new: true
    })
    .then(p => {
        if(p) {
            return res.json({code: 0, message: 'Đã cập nhật sản phẩm thành công', data: p})
        }
        else return res.json({code: 2, message: 'Không tìm thấy sản phẩm bằng id'})
    })
    .catch(e => {
        if(e.message.includes('Cast to ObjectId failed')) {
            return res.json({code: 3, message: 'Đây không phải là một id hợp lệ'})
        }
        return res.json({code: 3, message: e.message})
    })
})

module.exports = Router