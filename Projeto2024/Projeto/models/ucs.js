var mongoose = require("mongoose")


const docenteSchema = new mongoose.Schema({
    _id: String,
    nome: String,
    foto: String,
    categoria: String,
    filiacao: String,
    email: String,
    webpage: String
  });
  
  const horarioSchema = new mongoose.Schema({
    teoricas: [String],
    praticas: [String]
  });
  
  const aulaSchema = new mongoose.Schema({
    _id: String,
    tipo: String,
    data: String,
    sumario: [String],
    anexos: [String]
  });
  
  const ucSchema = new mongoose.Schema({
    _id: String,
    sigla: String,
    titulo: String,
    docentes: [docenteSchema],
    horario: horarioSchema,
    avaliacao: [String],
    datas: {
      teste: String,
      exame: String,
      projeto: String
    },
    aulas: [aulaSchema]
  }, { versionKey: false });
  
module.exports = mongoose.model('uc', ucSchema, 'ucs')