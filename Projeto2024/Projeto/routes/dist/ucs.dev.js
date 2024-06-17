"use strict";

var express = require('express');

var router = express.Router();

var UC = require('../controllers/ucs');

var multer = require('multer');

var upload = multer({
  dest: 'uploads/'
});

var path = require('path');

var fs = require('fs');

var _require = require('uuid'),
    uuidv4 = _require.v4;

var jwt = require('jsonwebtoken');

var querystring = require('querystring');

var Auth = require('../controllers/auth');

var User = require('../controllers/users');

var UserMo = require('../models/users');
/**OPERAÇÕES CRUD SOBRE AS UCS */

/* Listar as UC (R) */


router.get('/ucs', Auth.verificaAutenticacao, function (req, res, next) {
  var token = req.cookies.token;
  UC.list().then(function (resposta) {
    res.render("pagUCS", {
      ucs: resposta,
      ucsUser: req.ucs,
      userType: req.typeUser
    });
  })["catch"](function (erro) {
    return res.jsonp(erro);
  });
});
/**Motor de busca de UCS */

router.get('/ucs/search', Auth.verificaAutenticacao, function (req, res) {
  var query = req.query.search;
  UC.search(query) // Supondo que você tenha uma função de pesquisa definida no seu modelo UC
  .then(function (resposta) {
    res.render("pagUCS", {
      ucs: resposta,
      ucsUser: req.ucs,
      userType: req.typeUser
    });
  })["catch"](function (erro) {
    return res.jsonp(erro);
  });
});
/**GET adiconar UC */

router.get('/ucs/adicionarUC', Auth.verificaAdmin, function (req, res, next) {
  User.findUsersByLevel("prod").then(function (data) {
    usersProd = data;
    var existingEmails = usersProd.map(function (user) {
      return user.email;
    });

    if (existingEmails.length === 0) {
      return res.redirect("/ucs/".concat(req.params.id, "?error=unidadeCurricularCheia"));
    } else {
      console.log("Aqui");
      res.render("addUC", {
        emails: existingEmails
      });
    }
  })["catch"](function (erro) {
    return res.jsonp(erro);
  });
});
router.get('/ucs/:id/editar', Auth.verificaAdmin, function (req, res) {
  UC.findById(req.params.id).then(function (data) {
    res.render("editarUC", {
      uc: data
    });
  })["catch"](function (erro) {
    return res.jsonp(erro);
  });
});
/* Consultar uma UC (R) */

router.get('/ucs/:id', Auth.verificaAutenticacao, function (req, res) {
  UC.findById(req.params.id).then(function (data) {
    var error = req.query.error;
    res.render("pagUC", {
      nomeUC: data.titulo,
      idUC: data._id,
      sigla: data.sigla,
      horario: data.horario,
      datas: data.datas,
      avaliacao: data.avaliacao,
      docentes: data.docentes,
      aulas: data.aulas,
      userType: req.typeUser,
      emailUser: req.email,
      error: error === 'unidadeCurricularCheia' ? "A unidade curricular ".concat(data.titulo, " n\xE3o permite adicionar mais docentes!") : null
    });
  })["catch"](function (erro) {
    return res.jsonp(erro);
  });
});
/**ADICIONAR UMA UC */

router.post('/ucs/adicionarUC', upload.array('foto', 10), Auth.verificaAdmin, function _callee(req, res) {
  var numDocente, ucExists, docentesEmails, teoricasArray, praticasArray, avaliacaoArray, ucData, primeiroDocente, updatePromises, novoDocente;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          numDocente = 2; // Inicia a contagem de docentes

          _context.prev = 1;
          _context.next = 4;
          return regeneratorRuntime.awrap(UC.findBySigla(req.body.sigla));

        case 4:
          ucExists = _context.sent;

          if (!ucExists) {
            _context.next = 8;
            break;
          }

          docentesEmails = JSON.parse(req.body.emails);
          return _context.abrupt("return", res.render("addUC", {
            emails: docentesEmails,
            erro: "A sigla que escolheu já existe. Por favor, escolha outra!!!"
          }));

        case 8:
          // Criação dos arrays para teóricas, práticas e avaliação
          teoricasArray = req.body.teoricas ? req.body.teoricas.split('\n') : [];
          praticasArray = req.body.praticas ? req.body.praticas.split('\n') : [];
          avaliacaoArray = req.body.avaliacao ? req.body.avaliacao.split('\n') : []; // Criação do objeto de dados da UC

          ucData = {
            _id: uuidv4(),
            // Gera um ID único para a UC (se necessário ajustar conforme sua implementação)
            sigla: req.body.sigla,
            titulo: req.body.titulo,
            docentes: [],
            // Array para armazenar os docentes
            horario: {
              teoricas: teoricasArray,
              praticas: praticasArray
            },
            avaliacao: avaliacaoArray,
            datas: {
              teste: req.body.teste,
              exame: req.body.exame,
              projeto: req.body.projeto
            },
            aulas: [] // Array inicialmente vazio de aulas

          }; // Adiciona o primeiro docente à lista de docentes da UC

          primeiroDocente = {
            nome: req.body.nome,
            foto: '',
            categoria: req.body.categoria,
            filiacao: req.body.filiacao,
            email: req.body.email,
            webpage: req.body.webpage
          };
          ucData.docentes.push(primeiroDocente); // Lista de Promises para atualizar UCs dos docentes

          updatePromises = []; // Adiciona a Promise de atualização da UC do primeiro docente

          updatePromises.push(updateDocenteUcs(req.body.email, ucData._id)); // Certifique-se de definir corretamente 'ucData._id'
          // Adiciona os docentes adicionais, se houver

          while (req.body["nome-".concat(numDocente)]) {
            novoDocente = {
              nome: req.body["nome-".concat(numDocente)],
              categoria: req.body["categoria-".concat(numDocente)],
              filiacao: req.body["filiacao-".concat(numDocente)],
              email: req.body["email-".concat(numDocente)],
              webpage: req.body["webpage-".concat(numDocente)]
            };
            ucData.docentes.push(novoDocente); // Adiciona a Promise de atualização da UC do novo docente

            updatePromises.push(updateDocenteUcs(novoDocente.email, ucData._id)); // Certifique-se de definir corretamente 'ucData._id'

            numDocente++;
          } // Executa todas as Promises de atualização de UCs dos docentes


          Promise.all(updatePromises).then(function () {
            // Após todas as Promises serem resolvidas, insere a UC no banco de dados
            return UC.insert(ucData);
          }).then(function () {
            // Redireciona para a página de listagem de UCs após a inserção ser concluída
            res.redirect("/ucs");
          })["catch"](function (erro) {
            // Trata erros que possam ocorrer durante a inserção ou atualização
            console.error("Erro ao inserir UC ou atualizar docentes:", erro);
            res.jsonp(erro);
          });
          _context.next = 24;
          break;

        case 20:
          _context.prev = 20;
          _context.t0 = _context["catch"](1);
          // Captura e trata erros gerais que possam ocorrer na rota
          console.error("Erro na rota /ucs/adicionarUC:", _context.t0);
          res.jsonp(_context.t0);

        case 24:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[1, 20]]);
});
/* Remover uma UC (D )   rota -> ucs/:id*/

router.get('/ucs/remover/:id', Auth.verificaAdmin, function (req, res) {
  console.log("entrou para eliminar.... id ", req.params.id);
  UC.removeUC(req.params.id).then(function () {
    console.log("Deleted " + req.params.id);
    res.redirect("/ucs");
  })["catch"](function (erro) {
    return res.status(500).jsonp(erro);
  });
});
/**Adicionar novos docentes */

router.get('/ucs/:id/adddocente', Auth.verificaAdmin, function (req, res) {
  var docentesUC;
  var usersProd;
  UC.findDocentesById(req.params.id).then(function (data) {
    docentesUC = data;
  })["catch"](function (erro) {
    return res.jsonp(erro);
  });
  User.findUsersByLevel("prod").then(function (data) {
    usersProd = data;
    var docentesEmails = docentesUC.map(function (docente) {
      return docente.email;
    });
    var existingEmails = usersProd.map(function (user) {
      return user.email;
    });
    var emailsNotInDocentes = existingEmails.filter(function (email) {
      return !docentesEmails.includes(email);
    });
    console.log("emails", emailsNotInDocentes);

    if (emailsNotInDocentes.length === 0) {
      return res.redirect("/ucs/".concat(req.params.id, "?error=unidadeCurricularCheia"));
    } else {
      res.render("addDocente", {
        docentes: docentesUC,
        emails: emailsNotInDocentes,
        idUC: req.params.id
      });
    }
  })["catch"](function (erro) {
    return res.jsonp(erro);
  });
}); //**FAZER UPDATE A LISTA DE UCS DO DOCENTE */

function updateDocenteUcs(email, ucId) {
  var user;
  return regeneratorRuntime.async(function updateDocenteUcs$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return regeneratorRuntime.awrap(UserMo.findOne({
            email: email
          }));

        case 3:
          user = _context2.sent;

          if (!user) {
            _context2.next = 11;
            break;
          }

          if (user.ucs.includes(ucId)) {
            _context2.next = 9;
            break;
          }

          user.ucs.push(ucId);
          _context2.next = 9;
          return regeneratorRuntime.awrap(user.save());

        case 9:
          _context2.next = 12;
          break;

        case 11:
          console.error("Usu\xE1rio com email ".concat(email, " n\xE3o encontrado."));

        case 12:
          _context2.next = 17;
          break;

        case 14:
          _context2.prev = 14;
          _context2.t0 = _context2["catch"](0);
          console.error("Erro ao atualizar UCs do usu\xE1rio com email ".concat(email, ":"), _context2.t0);

        case 17:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 14]]);
}

router.post('/ucs/:id/adddocente', Auth.verificaAdmin, function (req, res) {
  console.log("aqui", req.body);

  try {
    var docentes = JSON.parse(req.body.docentes || '[]'); // Certifique-se de que 'docentes' é um array

    var ucId = req.params.id; // Defina 'ucId' corretamente

    var numDocente = 2; // Adicionar o primeiro docente

    var novodocente = {
      nome: req.body.nome,
      foto: '',
      categoria: req.body.categoria,
      filiacao: req.body.filiacao,
      email: req.body.email,
      webpage: req.body.webpage
    };
    docentes.push(novodocente); // Lista de Promises para atualizar UCs dos docentes

    var updatePromises = []; // Atualizar a lista de UCs do primeiro docente

    updatePromises.push(updateDocenteUcs(req.body.email, ucId)); // Adicionar os docentes restantes

    while (req.body["nome-".concat(numDocente)]) {
      var novoDocente = {
        nome: req.body["nome-".concat(numDocente)],
        foto: '',
        categoria: req.body["categoria-".concat(numDocente)],
        filiacao: req.body["filiacao-".concat(numDocente)],
        email: req.body["email-".concat(numDocente)],
        webpage: req.body["webpage-".concat(numDocente)]
      };
      docentes.push(novoDocente); // Adicionar a Promise de atualização da UC do novo docente

      updatePromises.push(updateDocenteUcs(novoDocente.email, ucId));
      numDocente++;
    } // Executar todas as Promises de atualização de UCs


    Promise.all(updatePromises).then(function () {
      // Atualizar os docentes na UC após todas as Promises serem resolvidas
      return UC.updateDocentes(ucId, docentes);
    }).then(function (data) {
      res.redirect("/ucs/".concat(ucId));
    })["catch"](function (erro) {
      console.error("Erro ao atualizar docentes da UC:", erro);
      res.jsonp(erro);
    });
  } catch (error) {
    console.error("Erro na rota /ucs/:id/adddocente:", error);
    res.jsonp(error);
  }
});
/**OPERAÇÕES CRUD SOBRE AS AULAS DAS UCS */

/**GET ADD aula */

router.get('/ucs/:idUC/aula/add', Auth.verificaAdminOUProdutor, function (req, res) {
  console.log("aqui");
  res.render('addAula', {
    idUC: req.params.idUC
  });
});
/*Get editar aula*/

router.get('/ucs/:idUC/aula/editar/:id', Auth.verificaAdminOUProdutor, function (req, res) {
  UC.findAulaById(req.params.idUC, req.params.id).then(function (data) {
    res.render('editarAula', {
      aula: data,
      idUC: req.params.idUC,
      idAula: req.params.id
    });
  })["catch"](function (erro) {
    return res.jsonp(erro);
  });
});
/* Altera uma aula de uma UC rota -> ucs/:idUC/aula/:id */

router.post('/ucs/:idUC/aula/editar/:id', upload.array('anexos', 10), Auth.verificaAdminOUProdutor, function _callee2(req, res) {
  var sumarioArray, aula, manterAnexo, chave, oldDirPath, newDirPath, files, novosAnexos, duplicatas;
  return regeneratorRuntime.async(function _callee2$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          sumarioArray = req.body.sumario.split('\n');
          aula = {
            _id: req.params.id,
            tipo: req.body.tipo,
            data: req.body.data,
            sumario: sumarioArray,
            anexos: []
          };
          manterAnexo = []; // verifica se quer manter algum ficheiro

          for (chave in req.body) {
            if (req.body[chave] === 'on') {
              manterAnexo.push(chave);
              aula.anexos.push(chave);
            }
          }

          oldDirPath = path.join(__dirname, '/../FileStore/anexosAulas/', req.params.id);
          newDirPath = path.join(__dirname, '/../FileStore/anexosAulas/', req.body._id); // Verifica se o diretório antigo existe e remove arquivos que não estão em manterAnexo

          if (fs.existsSync(oldDirPath)) {
            files = fs.readdirSync(oldDirPath);
            files.forEach(function (file) {
              if (!manterAnexo.includes(file)) {
                fs.unlinkSync(path.join(oldDirPath, file));
              }
            }); // Remove o diretório antigo se estiver vazio

            if (fs.readdirSync(oldDirPath).length === 0) {
              fs.rmdirSync(oldDirPath);
            }
          } // Verifica se há arquivos duplicados


          novosAnexos = req.files.map(function (file) {
            return file.originalname;
          });
          duplicatas = novosAnexos.filter(function (anexo) {
            return manterAnexo.includes(anexo);
          });

          if (!(duplicatas.length > 0)) {
            _context3.next = 13;
            break;
          }

          // Se houver duplicatas, renderiza o formulário com uma mensagem de erro
          res.render('editarAula', {
            aula: aula,
            idUC: req.params.idUC,
            idAula: req.params.id,
            erro: "Os seguintes arquivos j\xE1 existem: ".concat(duplicatas.join(', '))
          });
          return _context3.abrupt("return");

        case 13:
          // Verifica se arquivos foram enviados
          if (req.files && req.files.length > 0) {
            req.files.forEach(function (file) {
              aula.anexos.push(file.originalname);
              console.log("ficheiro", JSON.stringify(file));
            }); // Cria novo diretório para armazenar os arquivos

            fs.mkdirSync(newDirPath, {
              recursive: true
            });
            req.files.forEach(function (file) {
              var oldPath = path.join(__dirname, '/../', file.path);
              var newPath = path.join(newDirPath, file.originalname); // Move o arquivo para o novo diretório

              fs.renameSync(oldPath, newPath);
            });
          }

          console.log("aula", aula); // Atualiza a aula no banco de dados

          UC.updateAula(req.params.idUC, req.params.id, aula).then(function (data) {
            res.redirect("/ucs/" + req.params.idUC);
          })["catch"](function (erro) {
            return res.status(500).jsonp(erro);
          });
          _context3.next = 22;
          break;

        case 18:
          _context3.prev = 18;
          _context3.t0 = _context3["catch"](0);
          console.error(_context3.t0);
          res.status(500).jsonp(_context3.t0);

        case 22:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 18]]);
});
/* Remover uma aula de uma UC (D )   rota -> ucs/:idUC/aula/:id*/

router.get('/ucs/:idUC/aula/remover/:id', Auth.verificaAdminOUProdutor, function (req, res) {
  console.log("entrou para eliminar um aula.... id ", req.params.id);
  var dirPath = path.join(__dirname, '/../FileStore/anexosAulas/', req.params.id); //Verifica se existe algum ficheiro

  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, {
      recursive: true
    });
    console.log("Directory removed: " + dirPath);
  } else {
    console.log("Directory does not exist: " + dirPath);
  }

  UC.removeAula(req.params.idUC, req.params.id).then(function () {
    res.redirect("/ucs/" + req.params.idUC);
  })["catch"](function (erro) {
    return res.status(500).jsonp(erro);
  });
}); //**FUNÇÕES AUXILIARES AULAS */   

function isValidDate(dateString) {
  var regex = /^\d{4}-\d{2}-\d{2}$/;

  if (!regex.test(dateString)) {
    return false;
  }

  var date = new Date(dateString);
  return !isNaN(date.getTime());
}
/* Criar uma aula na UC (C) */


router.post('/ucs/:idUC/aula/add', upload.array('anexos', 10), Auth.verificaAdminOUProdutor, function _callee3(req, res) {
  var _req$body, tipo, data, sumario, error, aula, sumarioArray;

  return regeneratorRuntime.async(function _callee3$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _req$body = req.body, tipo = _req$body.tipo, data = _req$body.data, sumario = _req$body.sumario;
          error = null; // Validate fields

          if (!isValidDate(data)) {
            error = "Data da aula deve estar no formato 'Ano-Mês-Dia'.";
          }

          if (error) {
            // Render the form again with error message
            res.render('addAula', {
              idUC: req.params.idUC,
              error: error,
              tipo: tipo,
              data: data,
              sumario: sumario
            });
          } else {
            aula = req.body;
            aula._id = req.params.idUC + aula.tipo + uuidv4();
            sumarioArray = req.body.sumario.split('\n');
            aula.sumario = sumarioArray;

            if (!aula.anexos) {
              aula.anexos = [];
            }

            if (req.files && req.files.length > 0) {
              req.files.forEach(function (file) {
                aula.anexos.push(file.originalname);
              });
            }

            UC.insertAula(req.params.idUC, aula).then(function (data) {
              if (req.files && req.files.length > 0) {
                fs.mkdirSync(__dirname + "/../FileStore/anexosAulas/" + data._id, {
                  recursive: true
                });
                req.files.forEach(function (file) {
                  var oldPath = __dirname + '/../' + file.path;
                  var newPath = __dirname + '/../FileStore/anexosAulas/' + data._id + '/' + file.originalname;
                  fs.renameSync(oldPath, newPath);
                });
              }

              res.redirect("/ucs/" + req.params.idUC);
            })["catch"](function (erro) {
              return res.jsonp(erro);
            });
          }

        case 4:
        case "end":
          return _context4.stop();
      }
    }
  });
});
/**faz dawnload de uma ficheiro se a aula tiver*/

router.get('/ucs/:id/download/:fname', Auth.verificaAutenticacao, function (req, res) {
  res.download(__dirname + '/../FileStore/anexosAulas/' + req.params.id + '/' + req.params.fname);
});
/**OPERAÇÕES CRUD SOBRE AS AVALIAÇÕES DAS UCS */

/**get Avalição UC */

router.get('/ucs/:idUC/avaliacao', Auth.verificaAdminOUProdutor, function (req, res) {
  UC.getAvaliacao(req.params.idUC).then(function (data) {
    res.render("editarAvaliacao", {
      avaliacao: data,
      idUC: req.params.idUC
    });
  })["catch"](function (erro) {
    return res.jsonp(erro);
  });
});
/**editar Avalição UC */

router.post('/ucs/:idUC/avaliacao', Auth.verificaAdminOUProdutor, function (req, res) {
  var avaliacao = req.body.avaliacao;
  var avaliacaoArray = avaliacao.split('\n');
  UC.updateAvaliacao(req.params.idUC, avaliacaoArray).then(function (data) {
    res.redirect("/ucs/" + req.params.idUC);
  })["catch"](function (erro) {
    return res.jsonp(erro);
  });
});
/**OPERAÇÕES CRUD SOBRE DATAS DAS UCS */

/**get Datas UC */

router.get('/ucs/:idUC/datas', Auth.verificaAdminOUProdutor, function (req, res) {
  UC.getDatas(req.params.idUC).then(function (data) {
    res.render("editarDatas", {
      datas: data,
      idUC: req.params.idUC
    });
  })["catch"](function (erro) {
    return res.jsonp(erro);
  });
});
/**editar Datas UC */

router.post('/ucs/:idUC/datas', Auth.verificaAdminOUProdutor, function (req, res) {
  UC.updateDatas(req.params.idUC, req.body).then(function (data) {
    res.redirect("/ucs/" + req.params.idUC);
  })["catch"](function (erro) {
    return res.jsonp(erro);
  });
});
/**OPERAÇÕES CRUD SOBRE OS HORÁRIOS DA UC */

/**get Horário UC */

router.get('/ucs/:idUC/horario', Auth.verificaAdminOUProdutor, function (req, res) {
  UC.getHorario(req.params.idUC).then(function (data) {
    res.render("editarHorario", {
      horario: data,
      idUC: req.params.idUC
    });
  })["catch"](function (erro) {
    return res.jsonp(erro);
  });
});
/**editar Horário UC */

router.post('/ucs/:idUC/horario', Auth.verificaAdminOUProdutor, function (req, res) {
  var horario = req.body;
  var teoricasArray = horario.teoricas.split('\n');
  var praticasicasArray = horario.praticas.split('\n');
  horario.teoricas = teoricasArray;
  horario.praticas = praticasicasArray;
  UC.updateHorario(req.params.idUC, horario).then(function (data) {
    res.redirect("/ucs/" + req.params.idUC);
  })["catch"](function (erro) {
    return res.jsonp(erro);
  });
});
/**USER */

router.get('/', function (req, res) {
  res.redirect("/login");
});
/*iniciar sessão. */

router.get('/login', function (req, res, next) {
  console.log("aqui");
  var token = req.cookies.token;

  if (token) {
    jwt.verify(token, "EngWeb2024", function (e, payload) {
      if (e) {
        if (e.name == 'TokenExpiredError') {
          res.render('login', {
            title: "Login",
            warning: "Sessão expirou."
          });
        } else {
          res.render('login', {
            title: "Login",
            warning: "Ocorreu um problema no login."
          });
        }
      } else {
        req.tipoUser = payload.level;
        res.render('login', {
          title: "Login"
        });
      }
    });
  } else {
    res.render('login', {
      title: "Login"
    });
  }
});
router.post('/login', function (req, res, next) {
  Auth.login(req.body).then(function (response) {
    res.cookie('token', response.data.token);
    var redirectTo = req.session.redirectTo || '/ucs';
    delete req.session.redirectTo; // limpar a variável de sessão

    res.redirect(redirectTo);
  })["catch"](function (err) {
    res.render('login', {
      title: "Login",
      warning: "Credenciais inválidas.",
      loginData: {
        email: req.body.email,
        password: req.body.password
      }
    });
  });
});
/**Registar Novos Alunos*/

router.get('/signup', Auth.verificaAdmin, function (req, res, next) {
  UC.list().then(function (resposta) {
    res.render('signup', {
      title: "Sign-up",
      ucs: resposta,
      userType: req.typeUser
    });
  });
});
router.post('/signup', Auth.verificaAdmin, function (req, res, next) {
  console.log("req", req.body);
  var token = req.cookies.token;
  var ucsAluno = [];

  if (Array.isArray(req.body.ucs)) {
    ucsAluno = req.body.ucs;
  } else {
    ucsAluno.push(req.body.ucs);
  }

  var signupData = {
    username: req.body.username,
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    ucs: ucsAluno
  }; // Verificação dos campos provenientes do cliente

  var missingField = null;

  for (var field in signupData) {
    if (signupData[field].length <= 0) {
      missingField = field;
      break;
    }
  }

  if (missingField) {
    warning = "Campo \"".concat(missingField, "\" por preencher.");
    res.status(512).jsonp({
      warning: warning
    });
    missingField = null;
  } else {
    Auth.register(signupData, token).then(function (response) {
      var error = response.data.error;

      if (error) {
        // Se a autenticação falhou.
        if (error.name == "UserExistsError") res.status(512).jsonp({
          warning: "Já existe um utilizador com este email associado."
        });else if (error.name == "MissingUsernameError") res.status(512).jsonp({
          warning: "Não foi especificado um endereço de email."
        });else res.status(512).jsonp({
          warning: error.message
        });
      } else {
        res.redirect('/ucs');
      }
    })["catch"](function (err) {
      res.status(512).jsonp({
        warning: "Ocorreu um erro no serviço da criação da conta."
      });
    });
  }
});
/**Regista um novo admin */

router.get('/signupAdmin', Auth.verificaAdmin, function (req, res, next) {
  res.render('signupADM', {
    userType: req.typeUser
  });
});
router.post('/signupAdmin', Auth.verificaAdmin, function (req, res, next) {
  var token = req.cookies.token;
  var signupData = {
    username: req.body.username,
    name: req.body.name,
    email: req.body.email,
    password: req.body.password
  };
  var missingField = null;

  for (var field in signupData) {
    if (signupData[field].length <= 0) {
      missingField = field;
      break;
    }
  }

  if (missingField) {
    warning = "Campo \"".concat(missingField, "\" por preencher.");
    res.status(512).jsonp({
      warning: warning
    });
    missingField = null;
  } else {
    Auth.registerAdmin(signupData, token).then(function (response) {
      var error = response.data.error;

      if (error) {
        if (error.name == "UserExistsError") res.status(512).jsonp({
          warning: "Já existe um utilizador com este email associado."
        });else if (error.name == "MissingUsernameError") res.status(512).jsonp({
          warning: "Não foi especificado um endereço de email."
        });else res.status(512).jsonp({
          warning: error.message
        });
      } else {
        res.redirect('/ucs');
      }
    })["catch"](function (err) {
      res.status(512).jsonp({
        warning: "Ocorreu um erro no serviço da criação da conta."
      });
    });
  }
});
/**Regista um novo docente */

router.get('/signupProd', Auth.verificaAdmin, function (req, res, next) {
  res.render('signupDocente', {
    userType: req.typeUser
  });
});
router.post('/signupProd', Auth.verificaAdmin, function (req, res, next) {
  var token = req.cookies.token;
  var signupData = {
    username: req.body.username,
    name: req.body.name,
    email: req.body.email,
    password: req.body.password
  };
  var missingField = null;

  for (var field in signupData) {
    if (signupData[field].length <= 0) {
      missingField = field;
      break;
    }
  }

  if (missingField) {
    warning = "Campo \"".concat(missingField, "\" por preencher.");
    res.status(512).jsonp({
      warning: warning
    });
    missingField = null;
  } else {
    Auth.registerDocente(signupData, token).then(function (response) {
      var error = response.data.error;

      if (error) {
        if (error.name == "UserExistsError") {
          res.status(512).jsonp({
            warning: "Já existe um utilizador com este email associado."
          });
        } else if (error.name == "MissingUsernameError") res.status(512).jsonp({
          warning: "Não foi especificado um endereço de email."
        });else res.status(512).jsonp({
          warning: error.message
        });
      } else {
        res.redirect('/ucs');
      }
    })["catch"](function (err) {
      res.status(512).jsonp({
        warning: "Ocorreu um erro no serviço da criação da conta."
      });
    });
  }
});
router.get('/logout', function (req, res, next) {
  res.clearCookie('token');
  res.redirect('/login');
});
module.exports = router;