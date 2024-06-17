const mongoose = require('mongoose')
var User = require("../models/users")

module.exports.list = () => {
    return User
        .find()
        .sort({_id : 1})
        .exec()
}

//vai buscar as ucvs que um user tem adquiridas
module.exports.listUcsByEmail = (email) => {
    return User.findOne({ email: email })
        .select('ucs') // Seleciona apenas o campo 'ucs'
        .exec()
        .then(user => {
            if (!user) {
                throw new Error('Usuário não encontrado');
            }
            return user.ucs; // Retorna apenas o campo 'ucs'
        })
        .catch(err => {
            throw err; // Rejeita a promessa com o erro ocorrido
        });
};


module.exports.findUserByEmail = (email) => {
    return User.findOne({ email: email })
        .exec()
        .then(user => {
            if (!user) {
                throw Promise.reject(new Error('Usuário não encontrado'));
            }
            return user; 
        })
        .catch(err => {
            throw err; 
        });
};

module.exports.removeUCFromUser = (email, idUC) => {
    return User.updateOne(
        { email: email }, 
        { $pull: { "ucs": idUC } } 
     ).exec();
}    

module.exports.findUsersByLevel = (level) => {
    return User.find({ level: level })
        .exec()
        .then(users => {
            if (!users || users.length === 0) {
                throw new Error('Nenhum usuário encontrado com o nível especificado');
            }
            return users;
        })
        .catch(err => {
            throw err;
        });
};




module.exports.removeUCFromAllUsers = (idUC) => {
    return User.updateMany(
        {}, // Critério vazio para afetar todos os documentos
        { $pull: { ucs: idUC } } // Operação de remoção de UC específica
    ).exec();
}