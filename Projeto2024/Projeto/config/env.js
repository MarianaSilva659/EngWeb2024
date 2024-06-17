// Servidor de autenticação

module.exports.authAccessPoint = process.env.AUTH || 'http://localhost:3001/users'

module.exports.authRoute = (route) => this.authAccessPoint + route