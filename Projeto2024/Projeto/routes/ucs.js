var express = require('express');
var router = express.Router();
var UC = require('../controllers/ucs')
var UCmo = require('../models/ucs')
var multer = require('multer')
const archiver = require('archiver');
const unzipper = require('unzipper');
const { Readable } = require('stream');
const upload = multer({ dest: 'uploads/' })
const path = require('path'); 
var fs = require('fs')
const { v4: uuidv4 } = require('uuid');
var jwt = require('jsonwebtoken');
var querystring = require('querystring');
const Auth = require('../controllers/auth')
var User = require('../controllers/users')
var UserMo = require('../models/users')

   
/**OPERAÇÕES CRUD SOBRE AS UCS */
   /* Listar as UC (R) */
   router.get('/ucs', Auth.verificaAutenticacao, function(req, res, next) {
    let token = req.cookies.token
       UC.list()
           .then(resposta => {
            res.render("pagUCS", {ucs: resposta, ucsUser: req.ucs, userType: req.typeUser});
           })
           .catch(erro => res.jsonp(erro))
   });

/**Motor de busca de UCS */
router.get('/ucs/search', Auth.verificaAutenticacao, function(req, res) {
    let query = req.query.search;
    UC.search(query) 
      .then(resposta => {
        res.render("pagUCS", {ucs: resposta, ucsUser: req.ucs, userType: req.typeUser});
      })
      .catch(erro => res.jsonp(erro));
});
   
/**GET adiconar UC */
router.get('/ucs/adicionarUC', Auth.verificaAdmin, function(req, res, next) {
    User.findUsersByLevel("prod")
   .then(data => {
    usersProd = data;
    const existingEmails = usersProd.map(user => user.email); 
    if(existingEmails.length === 0){
      return res.redirect(`/ucs/${req.params.id}?error=unidadeCurricularCheia`);
    }
    else{
      res.render("addUC", {emails: existingEmails});
    }
 })
  .catch(erro => res.jsonp(erro))
});
  

router.get('/ucs/:id/editar', Auth.verificaAdmin, function(req, res) {
  UC.findById(req.params.id)
    .then(data => {
     res.render("editarUC", {uc: data})
   })
    .catch(erro => res.jsonp(erro))
});

   /* Consultar uma UC (R) */
   router.get('/ucs/:id', Auth.verificaAutenticacao, function(req, res) {
    if (req.typeUser == 'admin' || req.ucs.includes(req.params.id)){
    UC.findById(req.params.id)
      .then(data => {
        const error = req.query.error;
       res.render("pagUC", {nomeUC: data.titulo, idUC: data._id, sigla: data.sigla, horario: data.horario, datas: data.datas, avaliacao: data.avaliacao, docentes: data.docentes, aulas: data.aulas, userType: req.typeUser, emailUser: req.email, error: error === 'unidadeCurricularCheia' ? `A unidade curricular ${data.titulo} não permite adicionar mais docentes!` : null})
     })
      .catch(erro => res.jsonp(erro))
    }else {
      res.render("error", {message: "Página não encontrada"});
    }
  });


  /**ADICIONAR UMA UC */
  router.post('/ucs/adicionarUC', upload.array('foto', 10), Auth.verificaAdmin, async function(req, res) {
    let numDocente = 2; // Inicia a contagem de docentes
    try {
        // Verifica se já existe uma UC com a sigla fornecida
        const ucExists = await UC.findBySigla(req.body.sigla);
        if (ucExists) {
            let docentesEmails = JSON.parse(req.body.emails);
            return res.render("addUC", { emails: docentesEmails, erro: "A sigla que escolheu já existe. Por favor, escolha outra!!!" });
        }

        // Criação dos arrays para teóricas, práticas e avaliação
        let teoricasArray = req.body.teoricas ? req.body.teoricas.split('\n') : [];
        let praticasArray = req.body.praticas ? req.body.praticas.split('\n') : [];
        let avaliacaoArray = req.body.avaliacao ? req.body.avaliacao.split('\n') : [];

        // Criação do objeto de dados da UC
        const ucData = {
            _id: uuidv4(), // Gera um ID único para a UC (se necessário ajustar conforme sua implementação)
            sigla: req.body.sigla,
            titulo: req.body.titulo,
            docentes: [], // Array para armazenar os docentes
            horario: {
                teoricas: teoricasArray,
                praticas: praticasArray,
            },
            avaliacao: avaliacaoArray,
            datas: {
                teste: req.body.teste,
                exame: req.body.exame,
                projeto: req.body.projeto,
            },
            aulas: [] // Array inicialmente vazio de aulas
        };

        // Adiciona o primeiro docente à lista de docentes da UC
        const primeiroDocente = {
            nome: req.body.nome,
            foto: '',
            categoria: req.body.categoria,
            filiacao: req.body.filiacao,
            email: req.body.email,
            webpage: req.body.webpage,
        };
        ucData.docentes.push(primeiroDocente);

        // Lista de Promises para atualizar UCs dos docentes
        let updatePromises = [];

        // Adiciona a Promise de atualização da UC do primeiro docente
        updatePromises.push(updateDocenteUcs(req.body.email, ucData._id)); // Certifique-se de definir corretamente 'ucData._id'

        // Adiciona os docentes adicionais, se houver
        while (req.body[`nome-${numDocente}`]) {
            let novoDocente = {
                nome: req.body[`nome-${numDocente}`],
                categoria: req.body[`categoria-${numDocente}`],
                filiacao: req.body[`filiacao-${numDocente}`],
                email: req.body[`email-${numDocente}`],
                webpage: req.body[`webpage-${numDocente}`],
            };
            ucData.docentes.push(novoDocente);
            // Adiciona a Promise de atualização da UC do novo docente
            updatePromises.push(updateDocenteUcs(novoDocente.email, ucData._id)); // Certifique-se de definir corretamente 'ucData._id'
            numDocente++;
        }

        // Executa todas as Promises de atualização de UCs dos docentes
        Promise.all(updatePromises)
            .then(() => {
                // Após todas as Promises serem resolvidas, insere a UC no banco de dados
                return UC.insert(ucData);
            })
            .then(() => {
                // Redireciona para a página de listagem de UCs após a inserção ser concluída
                res.redirect(`/ucs`);
            })
            .catch((erro) => {
                // Trata erros que possam ocorrer durante a inserção ou atualização
                console.error(`Erro ao inserir UC ou atualizar docentes:`, erro);
                res.jsonp(erro);
            });
    } catch (error) {
        // Captura e trata erros gerais que possam ocorrer na rota
        console.error(`Erro na rota /ucs/adicionarUC:`, error);
        res.jsonp(error);
    }
});



   
   /* Remover uma UC (D )   rota -> ucs/:id*/
   router.get('/ucs/remover/:id', Auth.verificaAdmin, function(req, res) {
    console.log("entrou para eliminar.... id ", req.params.id);
    
    // Supondo que você tenha um modelo UC e um método removeUC para remover a UC da coleção
    UC.removeUC(req.params.id)
        .then(() => {
            console.log("Deleted UC with id: " + req.params.id);
            // Após remover a UC da coleção, remover a UC dos usuários
            return User.removeUCFromAllUsers(req.params.id);
        })
        .then(() => {
            console.log("Removed UC " + req.params.id + " from all users");
            res.redirect("/ucs");
        })
        .catch(erro => {
            console.error(erro);
            res.status(500).jsonp(erro);
        });
});


/**Adicionar novos docentes */
router.get('/ucs/:id/adddocente', Auth.verificaAdmin, function(req, res) {
  let docentesUC;
  let usersProd;
  UC.findDocentesById(req.params.id)
    .then(data => {
      docentesUC = data
   })
    .catch(erro => res.jsonp(erro))
   User.findUsersByLevel("prod")
   .then(data => {
    usersProd = data;
    const docentesEmails = docentesUC.map(docente => docente.email); 
    const existingEmails = usersProd.map(user => user.email); 
    const emailsNotInDocentes = existingEmails.filter(email => !docentesEmails.includes(email));
    console.log("emails", emailsNotInDocentes)
    if(emailsNotInDocentes.length === 0){
      return res.redirect(`/ucs/${req.params.id}?error=unidadeCurricularCheia`);
    }
    else{
      res.render("addDocente", {docentes: docentesUC,  emails: emailsNotInDocentes, idUC: req.params.id})
    }
 })
  .catch(erro => res.jsonp(erro))
});


//**FAZER UPDATE A LISTA DE UCS DO DOCENTE */
async function updateDocenteUcs(email, ucId) {
  try {
      const user = await UserMo.findOne({ email: email });
      if (user) {
          if (!user.ucs.includes(ucId)) {
              user.ucs.push(ucId);
              await user.save();
          }
      } else {
          console.error(`Usuário com email ${email} não encontrado.`);
      }
  } catch (error) {
      console.error(`Erro ao atualizar UCs do usuário com email ${email}:`, error);
  }
}

router.post('/ucs/:id/adddocente', Auth.verificaAdmin, function(req, res) {
  try {
      let docentes = JSON.parse(req.body.docentes || '[]'); // Certifique-se de que 'docentes' é um array
      const ucId = req.params.id; // Defina 'ucId' corretamente
      let numDocente = 2;

      // Adicionar o primeiro docente
      let novodocente = {
          nome: req.body.nome,
          foto: '/images/defaultPerfil.png',
          categoria: req.body.categoria,
          filiacao: req.body.filiacao,
          email: req.body.email,
          webpage: req.body.webpage,
      };
      docentes.push(novodocente);

      // Lista de Promises para atualizar UCs dos docentes
      let updatePromises = [];

      // Atualizar a lista de UCs do primeiro docente
      updatePromises.push(updateDocenteUcs(req.body.email, ucId));

      // Adicionar os docentes restantes
      while (req.body[`nome-${numDocente}`]) {
          let novoDocente = {
              nome: req.body[`nome-${numDocente}`],
              foto: '',
              categoria: req.body[`categoria-${numDocente}`],
              filiacao: req.body[`filiacao-${numDocente}`],
              email: req.body[`email-${numDocente}`],
              webpage: req.body[`webpage-${numDocente}`],
          };
          docentes.push(novoDocente);

          // Adicionar a Promise de atualização da UC do novo docente
          updatePromises.push(updateDocenteUcs(novoDocente.email, ucId));
          numDocente++;
      }

      // Executar todas as Promises de atualização de UCs
      Promise.all(updatePromises)
          .then(() => {
              // Atualizar os docentes na UC após todas as Promises serem resolvidas
              return UC.updateDocentes(ucId, docentes);
          })
          .then(data => {
              res.redirect(`/ucs/${ucId}`);
          })
          .catch(erro => {
              console.error(`Erro ao atualizar docentes da UC:`, erro);
              res.jsonp(erro);
          });

  } catch (error) {
      console.error(`Erro na rota /ucs/:id/adddocente:`, error);
      res.jsonp(error);
  }
});







/**OPERAÇÕES CRUD SOBRE AS AULAS DAS UCS */
    /**GET ADD aula */
    router.get('/ucs/:idUC/aula/add', Auth.verificaAdminOUProdutor, function(req, res) {
      if (req.userType = 'admin' || req.ucs.includes(req.params.idUC)){
        res.render('addAula', {idUC: req.params.idUC});
      }else {
        res.render('erro', {message: 'Página não encontrada'})
      }
    });


    /*Get editar aula*/
    router.get('/ucs/:idUC/aula/editar/:id', Auth.verificaAdminOUProdutor, function(req, res) {
      if (req.userType = 'admin' || req.ucs.includes(req.params.idUC)){
        UC.findAulaById(req.params.idUC, req.params.id)
          .then(data => {
            res.render('editarAula', {aula: data, idUC: req.params.idUC, idAula: req.params.id});
            })
          .catch(erro => res.jsonp(erro))
        }else {
          res.render('erro', {message: 'Página não encontrada'})
        }
    });

    /* Altera uma aula de uma UC rota -> ucs/:idUC/aula/:id */    
    router.post('/ucs/:idUC/aula/editar/:id', upload.array('anexos', 10),Auth.verificaAdminOUProdutor,async function(req, res) {
      if (req.userType = 'admin' || req.ucs.includes(req.params.idUC)){
      try {
        let sumarioArray = req.body.sumario.split('\n');

        const aula = {
          _id : req.params.id,
          tipo: req.body.tipo,
          data: req.body.data,
          sumario : sumarioArray,
          anexos : []
        }

    
        let manterAnexo = [];
        // verifica se quer manter algum ficheiro
        for (let chave in req.body) {
          if (req.body[chave] === 'on') {
            manterAnexo.push(chave);
            aula.anexos.push(chave)
          }
        }
    
    
        const oldDirPath = path.join(__dirname, '/../FileStore/anexosAulas/', req.params.id);
        const newDirPath = path.join(__dirname, '/../FileStore/anexosAulas/', req.body._id);
    
        // Verifica se a diretoria antiga existe e remove arquivos que não estão em manterAnexo
        if (fs.existsSync(oldDirPath)) {
          const files = fs.readdirSync(oldDirPath);
    
          files.forEach(file => {
            if (!manterAnexo.includes(file)) {
              fs.unlinkSync(path.join(oldDirPath, file));
            }
          });
    
          // Remove a diretoria antiga se estiver vazio
          if (fs.readdirSync(oldDirPath).length === 0) {
            fs.rmdirSync(oldDirPath);
          }
        }

         // Verifica se há arquivos duplicados
        const novosAnexos = req.files.map(file => file.originalname);
        const duplicatas = novosAnexos.filter(anexo => manterAnexo.includes(anexo));

        if (duplicatas.length > 0) {
          // Se houver duplicatas, renderiza o formulário com uma mensagem de erro
          res.render('editarAula', {aula: aula, idUC: req.params.idUC, idAula: req.params.id,
            erro: `Os seguintes arquivos já existem: ${duplicatas.join(', ')}`
          });
          return;
        }
    
        // Verifica se arquivos foram enviados
        if (req.files && req.files.length > 0) {
          req.files.forEach(file => {
            aula.anexos.push(file.originalname);
    
            console.log("ficheiro", JSON.stringify(file));
          });
    
          // Cria nova diretoria para armazenar os arquivos
          fs.mkdirSync(newDirPath, { recursive: true });
    
          req.files.forEach(file => {
            const oldPath = path.join(__dirname, '/../', file.path);
            const newPath = path.join(newDirPath, file.originalname);
    
            // Move o arquivo para o nova diretoria
            fs.renameSync(oldPath, newPath);
          });
        }
        
        console.log("aula", aula)
        // Atualiza a aula no banco de dados
        UC.updateAula(req.params.idUC, req.params.id, aula)
          .then(data => {
            res.redirect("/ucs/" + req.params.idUC);
          })
          .catch(erro => res.status(500).jsonp(erro));
      } catch (erro) {
        console.error(erro);
        res.status(500).jsonp(erro);
      }
    }else {
      res.render('erro', {message: 'Página não encontrada'})
    }
    });
    
    

    /* Remover uma aula de uma UC (D )   rota -> ucs/:idUC/aula/:id*/
   router.get('/ucs/:idUC/aula/remover/:id', Auth.verificaAdminOUProdutor, function(req, res) {
    if (req.userType = 'admin' || req.ucs.includes(req.params.idUC)){
    console.log("entrou para eliminar um aula.... id ", req.params.id);

    const dirPath = path.join(__dirname, '/../FileStore/anexosAulas/', req.params.id);
    //Verifica se existe algum ficheiro
    if (fs.existsSync(dirPath)) {
        fs.rmSync(dirPath, { recursive: true });
        console.log("Directory removed: " + dirPath);
    } else {
        console.log("Directory does not exist: " + dirPath);
    }
    UC.removeAula(req.params.idUC, req.params.id)
        .then(() => {
            res.redirect("/ucs/" + req.params.idUC);
        })
        .catch(erro => res.status(500).jsonp(erro));
      }else {
        res.render('erro', {message: 'Página não encontrada'})
      }
    });


 //**FUNÇÕES AUXILIARES AULAS */   

function isValidDate(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) {
      return false;
  }
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

    /* Criar uma aula na UC (C) */

    router.post('/ucs/:idUC/aula/add', upload.array('anexos', 10), Auth.verificaAdminOUProdutor, async function(req, res) {
      if (req.userType = 'admin' || req.ucs.includes(req.params.idUC)){
      const { tipo, data, sumario } = req.body;
      let error = null;
  
      // Validate fields

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
          let aula = req.body;
          aula._id = req.params.idUC + aula.tipo + uuidv4();
          let sumarioArray = req.body.sumario.split('\n');
          aula.sumario = sumarioArray;
          if (!aula.anexos) {
              aula.anexos = [];
          }
          if (req.files && req.files.length > 0) {
              req.files.forEach(file => {
                  aula.anexos.push(file.originalname);
              });
          }
          UC.insertAula(req.params.idUC, aula)
              .then(data => {
                  if (req.files && req.files.length > 0) {
                      fs.mkdirSync(__dirname + "/../FileStore/anexosAulas/" + data._id, { recursive: true });
                      req.files.forEach(file => {
                          let oldPath = __dirname + '/../' + file.path;
                          let newPath = __dirname + '/../FileStore/anexosAulas/' + data._id + '/' + file.originalname;
                          fs.renameSync(oldPath, newPath);
                      });
                  }
                  res.redirect("/ucs/" + req.params.idUC);
              })
              .catch(erro => res.jsonp(erro));
      }
    }else {
      res.render('erro', {message: 'Página não encontrada'})
    }
  });

/**faz dawnload de uma ficheiro se a aula tiver*/
router.get('/ucs/:id/download/:fname', Auth.verificaAutenticacao, function(req,res){
  if (req.userType = 'admin' || req.ucs.includes(req.params.id)){
  res.download(__dirname + '/../FileStore/anexosAulas/'+ req.params.id +'/' + req.params.fname);
}else {
  res.render('erro', {message: 'Página não encontrada'})
}
})

/**OPERAÇÕES CRUD SOBRE AS AVALIAÇÕES DAS UCS */


/**get Avalição UC */
router.get('/ucs/:idUC/avaliacao', Auth.verificaAdminOUProdutor,function(req, res) {
  if (req.userType = 'admin' || req.ucs.includes(req.params.idUC)){
    UC.getAvaliacao(req.params.idUC)
      .then(data => {
        res.render("editarAvaliacao", {avaliacao: data, idUC: req.params.idUC})
      })
      .catch(erro => res.jsonp(erro))
    }else {
      res.render('erro', {message: 'Página não encontrada'})
    }
});

/**editar Avalição UC */
router.post('/ucs/:idUC/avaliacao', Auth.verificaAdminOUProdutor,function(req, res) {
  if (req.userType = 'admin' || req.ucs.includes(req.params.idUC)){
    let avaliacao = req.body.avaliacao;
    let avaliacaoArray =  avaliacao.split('\n');
    UC.updateAvaliacao(req.params.idUC, avaliacaoArray)
      .then(data => {
        res.redirect("/ucs/" + req.params.idUC);
      })
      .catch(erro => res.jsonp(erro))
    }else {
        res.render('erro', {message: 'Página não encontrada'})
      }
});


/**OPERAÇÕES CRUD SOBRE DATAS DAS UCS */


/**get Datas UC */
router.get('/ucs/:idUC/datas', Auth.verificaAdminOUProdutor,function(req, res) {
  if (req.userType = 'admin' || req.ucs.includes(req.params.idUC)){
    UC.getDatas(req.params.idUC)
      .then(data => {
        res.render("editarDatas", {datas: data, idUC: req.params.idUC})
      })
      .catch(erro => res.jsonp(erro))
    }else {
      res.render('erro', {message: 'Página não encontrada'})
    }
});


/**editar Datas UC */
router.post('/ucs/:idUC/datas', Auth.verificaAdminOUProdutor,function(req, res) {
  if (req.userType = 'admin' || req.ucs.includes(req.params.idUC)){
    UC.updateDatas(req.params.idUC, req.body)
      .then(data => {
        res.redirect("/ucs/" + req.params.idUC);
      })
      .catch(erro => res.jsonp(erro))
    }else {
      res.render('erro', {message: 'Página não encontrada'})
    }
});



/**OPERAÇÕES CRUD SOBRE OS HORÁRIOS DA UC */


/**get Horário UC */
router.get('/ucs/:idUC/horario', Auth.verificaAdminOUProdutor,function(req, res) {
  if (req.userType = 'admin' || req.ucs.includes(req.params.idUC)){
    UC.getHorario(req.params.idUC)
      .then(data => {
        res.render("editarHorario", {horario: data, idUC: req.params.idUC})
      })
      .catch(erro => res.jsonp(erro))
    }else {
      res.render('erro', {message: 'Página não encontrada'})
    }
});

/**editar Horário UC */
router.post('/ucs/:idUC/horario',Auth.verificaAdminOUProdutor, function(req, res) {
  if (req.userType = 'admin' || req.ucs.includes(req.params.idUC)){
    let horario = req.body;
    let teoricasArray =  horario.teoricas.split('\n');
    let praticasicasArray =  horario.praticas.split('\n');
    horario.teoricas = teoricasArray;
    horario.praticas = praticasicasArray;
    UC.updateHorario(req.params.idUC, horario)
      .then(data => {
        res.redirect("/ucs/" + req.params.idUC);
      })
      .catch(erro => res.jsonp(erro))
    }else {
      res.render('erro', {message: 'Página não encontrada'})
    }
});
   


/**USER */

router.get('/', function(req, res) {
  res.redirect("/login");
});

/*iniciar sessão. */
router.get('/login', function (req, res, next) {
  console.log("aqui")
  let token = req.cookies.token
  if (token) {
      jwt.verify(token, "EngWeb2024", function (e, payload) {
          if (e) { 
              if (e.name == 'TokenExpiredError') { 
                  res.render('login', { title: "Login", warning: "Sessão expirou." })
              }

              else { 
                  res.render('login', { title: "Login", warning: "Ocorreu um problema no login." })
              }
          }
          else { 
              req.tipoUser = payload.level
              res.render('login', { title: "Login" })
          }
      })
  }
  else {
      res.render('login', { title: "Login" })
  }
})


router.post('/login', function (req, res, next) {
  Auth.login(req.body)
      .then((response) => {
          res.cookie('token', response.data.token)
          const redirectTo = req.session.redirectTo || '/ucs'
          delete req.session.redirectTo // limpar a variável de sessão
          res.redirect(redirectTo)
      }).catch((err) => {
          res.render('login', { title: "Login", warning: "Credenciais inválidas.", loginData: { email: req.body.email, password: req.body.password } })
      });
})

/**Registar Novos Alunos*/
router.get('/signup', Auth.verificaAdmin, function (req, res, next) {
  UC.list()
    .then(resposta => {
     res.render('signup', { title: "Sign-up", ucs: resposta, userType: req.typeUser})
    })
})


router.post('/signup', Auth.verificaAdmin,  function (req, res, next) {
  console.log("req", req.body);
  let token = req.cookies.token
  let ucsAluno = [];
  if(Array.isArray(req.body.ucs)){
    ucsAluno = req.body.ucs;
  }else{
    ucsAluno.push(req.body.ucs);
  }
  let signupData = { username: req.body.username, name: req.body.name, email: req.body.email, password: req.body.password, ucs: ucsAluno}
  // Verificação dos campos provenientes do cliente
  let missingField = null
  for (let field in signupData) {
      if (signupData[field].length <= 0) {
          missingField = field
          break
      }
  }

  if (missingField) {
      warning = `Campo "${missingField}" por preencher.`
      res.status(512).jsonp({ warning: warning })
      missingField = null
  }
  else {
      Auth.register(signupData, token)
          .then((response) => {
              let error = response.data.error
              if (error) { // Se a autenticação falhou.
                  if (error.name == "UserExistsError") res.status(512).jsonp({ warning: "Já existe um utilizador com este email associado." })
                  else if (error.name == "MissingUsernameError") res.status(512).jsonp({ warning: "Não foi especificado um endereço de email." })
                  else res.status(512).jsonp({ warning: error.message })
              }
              else {
                  res.redirect('/ucs')
              }
          }).catch((err) => {
              res.status(512).jsonp({ warning: "Ocorreu um erro no serviço da criação da conta." })
          });

  }
})

/**Regista um novo admin */

router.get('/signupAdmin', Auth.verificaAdmin, function (req, res, next) {
  res.render('signupADM', {userType: req.typeUser})
})


router.post('/signupAdmin', Auth.verificaAdmin,  function (req, res, next) {
  let token = req.cookies.token
  let signupData = { username: req.body.username, name: req.body.name, email: req.body.email, password: req.body.password }
  let missingField = null
  for (let field in signupData) {
      if (signupData[field].length <= 0) {
          missingField = field
          break
      }
  }

  if (missingField) {
      warning = `Campo "${missingField}" por preencher.`
      res.status(512).jsonp({ warning: warning })
      missingField = null
  }
  else {
      Auth.registerAdmin(signupData, token)
          .then((response) => {
              let error = response.data.error
              if (error) { 
                  if (error.name == "UserExistsError") res.status(512).jsonp({ warning: "Já existe um utilizador com este email associado." })
                  else if (error.name == "MissingUsernameError") res.status(512).jsonp({ warning: "Não foi especificado um endereço de email." })
                  else res.status(512).jsonp({ warning: error.message })
              }
              else {
                  res.redirect('/ucs')
              }
          }).catch((err) => {
              res.status(512).jsonp({ warning: "Ocorreu um erro no serviço da criação da conta." })
          });

  }
})


router.get('/ucs/:idUC/removerDocente/:idDocente', Auth.verificaAdminOUProdutor, async function (req, res, next) {
  if (req.userType = 'admin' || req.ucs.includes(req.params.idUC)){
  let pUC = UC.removeDocente(req.params.idUC, req.params.idDocente);
  let pDocente = User.removeUCFromUser(req.params.idDocente, req.params.idUC);
  
  Promise.all([pDocente, pUC])
    .then((result) => {
      try {
        fs.rmdirSync(path.join(__dirname, '/../Public/images/anexosDocentes/' + req.params.idUC + '/' + req.params.idDocente + '/'), {recursive: true})
      }catch (err) {
        console.error(err);
      }
      res.redirect('/ucs/' + req.params.idUC);
    })
    .catch((err) => {
      res.render('error', { message: err.message });
    });
  }else {
    res.render('erro', {message: 'Página não encontrada'})
  }
});

router.get('/exportarDB', Auth.verificaAdmin, async function (req, res) {
  try {
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    res.attachment('database.zip');
    archive.pipe(res);

      let UCS = await UC.list();
      let USERS = await User.list();
      let jsonString = JSON.stringify(UCS, null, 2);
      archive.append(jsonString, { name: `ucs.json` });
      jsonString = JSON.stringify(USERS, null, 2);
      archive.append(jsonString, { name: `users.json` });
      const imagesDir = path.join(__dirname, '../public/images');
      addFilesToArchive(archive, imagesDir, 'images');
    await archive.finalize();
  } catch (err) {
    console.error(err);
    res.status(500).send('Error generating ZIP file');
  }
});

function addFilesToArchive(archive, dirPath, baseDir) {
  const files = fs.readdirSync(dirPath);
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const relativePath = path.relative(baseDir, filePath);
    const stats = fs.statSync(filePath);
    if (stats.isFile()) {
      archive.file(filePath, { name: relativePath });
    } else if (stats.isDirectory()) {
      archive.directory(filePath, relativePath);
      addFilesToArchive(archive, filePath, baseDir);
    }
  });
}

router.get('/importarDB', Auth.verificaAdmin, async function (req, res){
  res.render('importarDB');
});

router.post('/importarDB', upload.single('file') ,Auth.verificaAdmin, async function (req, res){
  if (req.file){
    try {
      const fileStream = fs.createReadStream(req.file.path);
      fileStream
        .pipe(unzipper.Parse())
        .on('entry', async (entry) => {
          const fileName = entry.path.substring(entry.path.indexOf('/') +1);
          const type = entry.type;
          const size = entry.vars.uncompressedSize;
          console.log("Filename "+ fileName);
          if (type === 'File' && fileName.endsWith('ucs.json')) {
            let jsonString = '';
  
            entry.on('data', (chunk) => {
              jsonString += chunk;
            });
  
            entry.on('end', async () => {
              const documents = JSON.parse(jsonString);
              await UCmo.insertMany(documents);
            });
          }else if (type === 'File' && fileName.endsWith('users.json')) {
            let jsonString = '';
  
            entry.on('data', (chunk) => {
              jsonString += chunk;
            });
  
            entry.on('end', async () => {
              const documents = JSON.parse(jsonString);
              await UserMo.insertMany(documents);
            });
          } else if (type === 'File' && fileName.startsWith('images/')){
              const destPath = path.join(__dirname, '../Public/', fileName);
              try {
                fs.mkdirSync(path.dirname(destPath), {recursive: true});
                entry.pipe(fs.createWriteStream(destPath));
              } catch{}
          }
          else {
            entry.autodrain();
          }
        })
        .on('close', () => {
          fs.unlinkSync(req.file.path);
          res.redirect('/ucs');
        });
  
    } catch (err) {
      console.error(err);
      res.status(500).send('Error processing the ZIP file.');
    }
  }
});

router.get('/ucs/:idUC/editarDocente/:idDocente',  Auth.verificaAdminOUProdutor, function (req, res, next) {
  if (req.userType = 'admin' || req.ucs.includes(req.params.idUC)){
  UC.getDocente(req.params.idUC, req.params.idDocente).then((docente) => {
    console.log(docente);
    res.render('editarDocente', {docente: docente.docentes[0], idUC: req.params.idUC, permissao: req.typeUser})
  }).catch((err) => {res.jsonp(err)});
}else {
  res.render('erro', {message: 'Página não encontrada'})
}
})

router.post('/ucs/:idUC/editarDocente/:idDocente', upload.single('foto'), Auth.verificaAdminOUProdutor, function (req, res, next) {
  if (req.userType = 'admin' || req.ucs.includes(req.params.idUC)){
  let Docente = {
    nome: req.body.nome,
    foto: req.body.foto,
    categoria: req.body.categoria,
    filiacao: req.body.filiacao,
    email: req.body.email,
    webpage: req.body.webpage
}
const termination = path.join('/images/anexosDocentes/', req.params.idUC, '/', req.params.idDocente, '/');
const fPath = path.join(__dirname, '/../public/', termination);
  if (req.file){
    // Cria nova diretoria para armazenar os arquivos
    try {
    fs.rmdirSync(fPath, { recursive: true });
    }catch(e){
    }
    fs.mkdirSync(fPath, { recursive: true });

      const oldPath = path.join(__dirname, '/../', req.file.path);
      const newPath = path.join(fPath, req.file.originalname);
      // Move o arquivo para o nova diretoria
      fs.renameSync(oldPath, newPath);
      Docente.foto = path.join(termination, req.file.originalname).replace(/\\/g, "/");
  }else {
    if ((req.body.remover == 1)){
      Docente.foto = '/images/defaultPerfil.png';
      const lastSlashIndex =  req.body.originalFoto.lastIndexOf('/');
      const subStr = req.body.originalFoto.substring(0, lastSlashIndex+1);
      console.log(subStr);
      if (subStr != '/images/' && subStr != '/javascripts/' && subStr != '/stylesheets/' && !subStr.includes('../')) {
      try {

      fs.rmdirSync(path.join(__dirname, '/../public/', subStr), { recursive: true });
      }catch (err) {
        console.error(err);
      }
    }
    }else {
    Docente.foto = req.body.originalFoto;}
  }

  UC.editDocente(req.params.idUC, req.params.idDocente, Docente).then((docente) => {
    console.log(docente);
    res.redirect('/ucs/' + req.params.idUC);
  }).catch((err) => {res.jsonp(err)});
}else {
  res.render('erro', {message: 'Página não encontrada'})
}
})
/**Regista um novo docente */

router.get('/signupProd', Auth.verificaAdmin, function (req, res, next) {
  res.render('signupDocente', {userType: req.typeUser})
})


router.post('/signupProd', Auth.verificaAdmin,  function (req, res, next) {
  let token = req.cookies.token
  let signupData = { username: req.body.username, name: req.body.name, email: req.body.email, password: req.body.password }
  let missingField = null
  for (let field in signupData) {
      if (signupData[field].length <= 0) {
          missingField = field
          break
      }
  }

  if (missingField) {
      warning = `Campo "${missingField}" por preencher.`
      res.status(512).jsonp({ warning: warning })
      missingField = null
  }
  else {
      Auth.registerDocente(signupData, token)
          .then((response) => {
              let error = response.data.error
              if (error) { 
                  if (error.name == "UserExistsError"){
                     res.status(512).jsonp({ warning: "Já existe um utilizador com este email associado." })
                  }
                  else if (error.name == "MissingUsernameError") res.status(512).jsonp({ warning: "Não foi especificado um endereço de email." })
                  else res.status(512).jsonp({ warning: error.message })
              }
              else {
                  res.redirect('/ucs')
              }
          }).catch((err) => {
              res.status(512).jsonp({ warning: "Ocorreu um erro no serviço da criação da conta." })
          });

  }
})

router.get('/logout', function (req, res, next) {
  res.clearCookie('token')
  res.redirect('/login')
})

router.get('/')

   module.exports = router;
   