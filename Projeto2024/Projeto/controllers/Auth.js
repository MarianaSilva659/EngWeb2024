const axios = require('axios');
const env = require('../config/env')
var jwt = require('jsonwebtoken');


module.exports.verificaAutenticacao = (req, res, next) => {
    let token = req.cookies.token
    if (token) {
        jwt.verify(token, "EngWeb2024", function (e, payload) {
            if (e) { 
                res.redirect('/login')
            }
            else {
                req.idUser = payload._id;
                req.typeUser = payload.level;
                req.ucs = payload.ucs;
                req.email = payload.email;
                next()
            }
        })
    } else {
        req.session.redirectTo = req.originalUrl
        res.redirect('/login')
    }
}

module.exports.verificaAdmin = (req, res, next) => {
    let token = req.cookies.token
    if (token) {
        jwt.verify(token, "EngWeb2024", function (e, payload) {
            if (e) { 
                res.redirect('/login')
            } else {
                req.idUser = payload._id;
                req.typeUser = payload.level;
                req.email = payload.email;
                if (req.typeUser == "admin")
                    next()
                else
                    res.redirect('/login')
            }
        })
    } else {
        req.session.redirectTo = req.originalUrl
        res.redirect('/login')
    }
}


module.exports.verificaAdminOUProdutor = (req, res, next) => {
    let token = req.cookies.token
    if (token) {
        jwt.verify(token, "EngWeb2024", function (e, payload) {
            if (e) { // ocorreu um erro
                res.redirect('/login')
            } else {
                req.idUser = payload._id;
                req.typeUser = payload.level;
                req.email = payload.email;
                req.ucs = payload.ucs;
                if (req.typeUser == "admin" || req.typeUser == "prod")
                    next()
                else
                    res.redirect('/login')
            }
        })
    } else {
        req.session.redirectTo = req.originalUrl
        res.redirect('/login')
    }
}

module.exports.login = (loginData) => {
    return axios.post(env.authRoute('/login'), loginData)
        .then((result) => {
            return result // token do authserver
        }).catch((err) => {
            throw err
        });
}

module.exports.register = (signupData, token) => {
    return axios.post(env.authRoute(`/register?token=${token}`), signupData)
        .then((result) => {
            return result
        }).catch((err) => {
            throw err
        });
}

module.exports.registerAdmin = (signupData, token) => {
    return axios.post(env.authRoute(`/registerAdmin?token=${token}`), signupData)
        .then((result) => {
            return result
        }).catch((err) => {
            console.log(JSON.stringify(err))
            throw err
        });
}


module.exports.registerDocente = (signupData, token) => {
    return axios.post(env.authRoute(`/registerDocente?token=${token}`), signupData)
        .then((result) => {
            return result
        }).catch((err) => {
            console.log(JSON.stringify(err))
            throw err
        });
}

module.exports.getUser = (userID, token) => {
    return axios.get(env.authRoute(`/${userID}?token=${token}`))
        .then((result) => {
            return result
        }).catch((err) => {
            throw err
        });
}

module.exports.updateUser = (userID, userData, token) => {
    return axios.put(env.authRoute(`/${userID}?token=${token}`), userData)
        .then((result) => {
            return result
        }).catch((err) => {
            throw err
        });
}
