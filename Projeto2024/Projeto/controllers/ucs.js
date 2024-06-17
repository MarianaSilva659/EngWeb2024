const mongoose = require('mongoose')
var UC = require("../models/ucs")

module.exports.list = () => {
    return UC
        .find()
        .sort({_id : 1})
        .exec()
}

//Motor de busca de uma UC
module.exports.search = query => {
    return UC.find({
        $or: [
            { titulo: { $regex: query, $options: 'i' } },  
            { sigla: { $regex: query, $options: 'i' } }  
        ]
    }); 
};

module.exports.findById = id => {
    return UC
        .findOne({_id : id})
        .exec()
}

module.exports.findBySigla = id => {
    return UC
        .findOne({sigla : id})
        .exec()
}

module.exports.insert = uc => {
    if((UC.find({_id : uc._id}).exec()).length != 1){
        var newUC = new UC(uc)
        return newUC.save()
    }
}

module.exports.update = (id, uc) => {
    return UC
        .findByIdAndUpdate(id, uc, {new : true})
}

module.exports.removeUC = id => {
    return UC
        .findOneAndDelete({_id : id})
}


//Vai buscar os docentes de uma uc
module.exports.findDocentesById = (ucId) => {
    return UC
        .findById(ucId, 'docentes') 
        .exec()
        .then(result => {
            if (!result) {
                throw new Error('UC not found');
            }
            return result.docentes; 
        });
};

//updates do docentes
module.exports.updateDocentes = (ucId, novosDocentes) => {
    return UC
        .findByIdAndUpdate(ucId, { docentes: novosDocentes }, { new: true })
        .exec();
};


// vai buscar as aulas de uma UC
module.exports.findAulasById = id => {
    return UC
        .findOne({_id: id}, 'aulas')  // Busca apenas o campo 'aulas'
        .exec()
        .then(result => {
            if (!result) {
                return Promise.reject(new Error('UC not found'));
            }
            return result.aulas;
        });
}

// Edita uma aula já existente
module.exports.updateAula = (ucId, aulaId, aula) => {
    return UC
        .findOneAndUpdate(
            {_id: ucId, "aulas._id": aulaId},
            {
                $set: {
                    "aulas.$": aula
                }
            },
            {new: true}
        )
        .exec();
}

// Remove uma aula já existente
module.exports.removeAula = (ucId, aulaId) => {
    return UC
        .findOneAndUpdate(
            {_id: ucId},
            {
                $pull: { aulas: { _id: aulaId } }
            },
            {new: true}
        )
        .exec();
}

//Adicionar aula
module.exports.insertAula = (ucId, novaAula) => {
    return UC
        .findOneAndUpdate(
            {_id: ucId},
            {
                $push: { aulas: novaAula }
            },
            {new: true}
        )
        .exec();
}

//aula com id especifico
module.exports.findAulaById = (ucId, aulaId) => {
    return UC
        .findOne(
            { _id: ucId, "aulas._id": aulaId }, 
            { "aulas.$": 1 } // Isso projeta apenas a aula específica com o ID correspondente
        )
        .exec()
        .then(result => {
            if (!result || !result.aulas || result.aulas.length === 0) {
                return Promise.reject(new Error('Aula not found'));
            }
            return result.aulas[0];
        });
}

//get avaliação da UC
module.exports.getAvaliacao = (ucid) => {
    return UC
        .findOne({_id: ucid}, 'avaliacao')  // Busca apenas o campo 'avaliacao'
        .exec()
        .then(result => {
            if (!result) {
                return Promise.reject(new Error('UC not found'));
            }
            return result.avaliacao;
        });
};

//alterar avaliação

module.exports.updateAvaliacao = (id, novaAvaliacao) => {
    return UC
        .findOneAndUpdate({_id: id}, {avaliacao: novaAvaliacao}, {new: true})
        .exec();
}


//get datas
module.exports.getDatas = (ucId) => {
    return UC
        .findById(ucId, 'datas') // Busca apenas o campo 'datas' da UC pelo ID
        .exec()
        .then(result => {
            if (!result) {
                throw new Error('UC not found');
            }
            return result.datas;
        });
};

// Atualizar as datas da UC pelo ID
module.exports.updateDatas = (ucId, novasDatas) => {
    return UC
        .findByIdAndUpdate(ucId, { datas: novasDatas }, { new: true })
        .exec();
};

module.exports.getDocente = (idUC, docenteEmail) => {
    return UC
    .findOne({_id: idUC}, { docentes: { $elemMatch: { email: docenteEmail } } })
    .exec()
};

module.exports.editDocente = (ucId, docenteEmail, docente) => {
    const docenteFields = {
        'docentes.$.nome': docente.nome,
        'docentes.$.foto': docente.foto,
        'docentes.$.categoria': docente.categoria,
        'docentes.$.filiacao': docente.filiacao,
        'docentes.$.webpage': docente.webpage
    };
    return UC.updateOne(
        { _id: ucId, 'docentes.email': docenteEmail },
        { $set: docenteFields }
    ).exec();
}

module.exports.removeDocente = (ucId, docenteEmail) => {
    return UC.updateOne(
        { _id: ucId },
        { $pull: { docentes: { email: docenteEmail } } }
    ).exec();
};

// get hórário

module.exports.getHorario = (idUC) => {
    return UC
        .findById(idUC)
        .select('horario') // Seleciona apenas o campo 'horario'
        .exec()
        .then(uc => {
            if (!uc) {
                throw new Error('UC not found');
            }
            return uc.horario; // Retorna o horário associado à UC
        });
};

// Atualizar o horário da UC pelo ID
module.exports.updateHorario = (idUC, novoHorario) => {
    return UC
        .findByIdAndUpdate(idUC, { "horario.teoricas": novoHorario.teoricas, "horario.praticas": novoHorario.praticas }, { new: true })
        .exec();
};

