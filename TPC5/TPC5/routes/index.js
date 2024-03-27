var express = require('express');
var router = express.Router();
var axios = require('axios');


/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { titulo: 'Compositores'});
});

// GET /compositores --------------------------------------------------------------------
router.get('/compositores', function(req, res) {
  var d = new Date().toISOString().substring(0, 16)
  axios.get('http://localhost:3000/compositores')
  .then(resposta => {
    res.render('pagCompositores', {lista: resposta.data, data: d, titulo: 'Lista de Compositores'});
  })
  .catch(erro => {
      res.render('error', {error: erro, message: "Erro ao ir buscar os compositores"})
  })
});

//GET /compositores/registo
router.get('/compositores/registo', function(req,res){
  var d = new Date().toISOString().substring(0, 16)
  res.render('adicionarCompositor', {titulo: "Adicionar Compositor"});
});


router.post('/compositores/registo', function(req, res, next) {
  var d = new Date().toISOString().substring(0, 16)
  console.log("A adicionar")
  const newComposer = {
      id: req.body.id,
      nome: req.body.nome.replaceAll("+", " "),
      periodo: req.body.periodo.replaceAll("+", " "),
      dataNasc: req.body.dataNasc,
      dataObito: req.body.dataObito,
      bio: req.body.bio.replaceAll("+", " "),
  };
  console.log("A adicionar2")
  console.log(newComposer)

  axios
      .post("http://localhost:3000/compositores", newComposer)
      .then((resp) => {
      console.log("Compositor adicionado com sucesso:", resp.data);
      res.render('pagCompositor', { compositor: resp.data, data: d, titulo: 'Compositor ' + req.params.id});    
      res.end();
      })
      .catch((error) => {
      console.error("Error ao adicionar compositor:", error);
      res.render('error', {error : error, message :'Erro ao adicionar e recuperar o compositor.'})
      });
});

//GET /compositores:{id}---------------------------------------------------------------------
router.get('/compositores/:id', function(req, res) {
  var d = new Date().toISOString().substring(0, 16)
  axios.get('http://localhost:3000/compositores/' + req.params.id)
      .then(resposta => {
        res.render('pagCompositor', { compositor: resposta.data, data: d, titulo: 'Compositor ' + req.params.id});    
      })
      .catch(erro => {
        res.render('error', {error : erro, message :'Erro ao recuperar o compositor.'})
      })
});


//GET periodos
router.get('/periodos', function(req, res) {
  var d = new Date().toISOString().substring(0, 16)
  axios.get('http://localhost:3000/compositores/')
      .then(response => {
          const periodos = [];
          response.data.forEach(compositor => {
              if (!periodos.includes(compositor.periodo)) {
                  periodos.push(compositor.periodo);
                  console.log(compositor.periodo)
              }
          });
          console.log(periodos)
          res.render('pagPeriodos', {periodos: periodos, data: d})
      })
      .catch(erro => {
          res.render('error', {error: erro, message :'Erro ao recuperar os periodos.'})
    });
  });


router.get('/compositores?periodo=:id', function(req, res) {
  var d = new Date().toISOString().substring(0, 16)

  axios.get('http://localhost:3000' + req.url)
                    .then(resposta => {
                        console.log("peridos especificos")
                        res.render('pagCompositores', {lista: resposta.data, data: d, titulo: 'Lista de Compositores'})  
                    })
                    .catch(erro => {
                      res.render('error', {error: erro, message :'Erro ao recuperar os periodos especificos.'})

                    })
});

router.get('/compositores/edit/:id', function(req, res) {
  var d = new Date().toISOString().substring(0, 16)
  axios.get('http://localhost:3000/compositores/' + req.params.id)
      .then(resposta => {
          res.render('editarCompositor', {compositor: resposta.data, data: d})      
      })
      .catch(erro => {
        res.render('error', {error : erro, message :'Erro ao recuperar o compositor.'})
      })
});



router.post('/compositores/edit/:id', function(req, res, next) {
  var d = new Date().toISOString().substring(0, 16)

  const newComposer = {
      id: req.params.id,
      nome: req.body.nome.replaceAll("+", " "),
      periodo: req.body.periodo.replaceAll("+", " "),
      dataNasc: req.body.dataNasc,
      dataObito: req.body.dataObito,
      bio: req.body.bio.replaceAll("+", " "),
  };

  axios
      .put("http://localhost:3000/compositores/" + req.params.id, newComposer)
      .then((resp) => {
      console.log("Compositor editado com sucesso:", resp.data);
      res.render('pagCompositor', { compositor: resp.data, data: d, titulo: 'Compositor ' + req.params.id});    
      res.end();
      })
      .catch((error) => {
      console.error("Error ao editar compositor:", error);
      res.render('error', {error : error, message :'Erro ao recuperar o compositor.'})
      });
});


router.get('/compositores/delete/:id', function(req, res, next) {
    var d = new Date().toISOString().substring(0, 16)

    axios.delete("http://localhost:3000/compositores/" + req.params.id)
    .then((resp) => {
        console.log("Compositor eliminado com sucesso:", resp.data);
        res.render('pagCompositor', {compositor: resp.data, data: d, titulo: 'Compositor ' + req.params.id});
        res.end();
    })
    .catch((error) => {
        console.error("Error ao eliminar compositor:", error);
        res.write("Ocorreu um erro ao eliminar o compositor.");
        res.end();
    });
});




module.exports = router;
