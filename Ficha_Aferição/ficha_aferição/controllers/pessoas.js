const { modelName } = require("../models/pessoa");
var Pessoa = require("../models/pessoa");

//lista de modalidades
module.exports.listModalidades = async () => {
  return await Pessoa.distinct("desportos").exec();
};


//lista de pessoas por modalidade
module.exports.listPessoasByModalidade = async (modalidade) => {
  return await Pessoa.find({ desportos: modalidade }).sort({ nome: 1 }).exec();
};

//get pessoas
module.exports.list = () => {
  const result = Pessoa.find({}).exec();

  return result;
};


//get pessoa by id
module.exports.findById = async (id) => {
  return Pessoa.find({ _id: id });
};


//adicionar pessoa
module.exports.insert = (pessoa) => {
  return Pessoa.create(pessoa);
};


//editar pessoa
module.exports.update = async (id, pessoa) => {
  let result = await Pessoa.updateOne({ _id: id }, pessoa).exec();

  if (result.modifiedCount > 0) {
    return Pessoa.find({ _id: id });
  } else {
    throw new Error("Error updating pessoa");
  }
};

//remover pessoa
module.exports.remove = async (id) => {
  let result = await Pessoa.deleteOne({ _id: id }).exec();

  if (result.deletedCount > 0) {
    return result;
  } else {
    throw new Error("Error deleting pessoa");
  }
};


