const mongoose = require("mongoose");
const { Schema } = mongoose;

// Define sub-schema for morada
const moradaSchema = new Schema({
  cidade: String,
  distrito: String,
});

// Define sub-schema for partido_politico
const partidoPoliticoSchema = new Schema({
  party_abbr: String,
  party_name: String,
});

// Define sub-schema for atributos
const atributosSchema = new Schema({
  fumador: Boolean,
  gosta_cinema: Boolean,
  gosta_viajar: Boolean,
  acorda_cedo: Boolean,
  gosta_ler: Boolean,
  gosta_musica: Boolean,
  gosta_comer: Boolean,
  gosta_animais_estimacao: Boolean,
  gosta_dancar: Boolean,
  comida_favorita: String,
});

// Define the main schema for pessoas
const pessoaSchema = new Schema({
  _id: String,
  nome: String,
  idade: Number,
  sexo: String,
  morada: moradaSchema,
  descricao: String,
  profissao: String,
  partido_politico: partidoPoliticoSchema,
  religiao: String,
  desportos: [String],
  animais: [String],
  figura_publica_pt: [String],
  marca_carro: String,
  destinos_favoritos: [String],
  atributos: atributosSchema,
});

// Define the model for the 'pessoas' collection using the schema
const Pessoa = mongoose.model("Pessoa", pessoaSchema);

module.exports = Pessoa;
