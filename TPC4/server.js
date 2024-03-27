// alunos_server.js
// EW2024 : 04/03/2024
// by jcr

var http = require('http')
var axios = require('axios')
const { parse } = require('querystring');

var templates = require('./templates')          // Necessario criar e colocar na mesma pasta
var static = require('./static.js')             // Colocar na mesma pasta

// Aux functions
function collectRequestBodyData(request, callback) {
    if(request.headers['content-type'] === 'application/x-www-form-urlencoded') {
        let body = '';
        request.on('data', chunk => {
            body += chunk.toString();
        });
        request.on('end', () => {
            callback(parse(body));
        });
    }
    else {
        callback(null);
    }
}

// Server creation


var alunosServer = http.createServer((req, res) => {
    // Logger: what was requested and when it was requested
    var d = new Date().toISOString().substring(0, 16)
    console.log(req.method + " " + req.url + " " + d)

    // Handling request
    if(static.staticResource(req)){
        static.serveStaticResource(req, res)
    }
    else{
        switch(req.method){
            case "GET": 
                 // GET /compositores --------------------------------------------------------------------
                if(req.url == '/compositores'){
                    axios.get('http://localhost:3000/compositores')
                    .then(resposta => {
                        res.writeHead(200, {'Content-Type': 'text/html'})
                        res.end(templates.pagCompositores(resposta.data, d))      
                    })
                    .catch(erro => {
                        res.writeHead(520, {'Content-Type': 'text/html'})
                        res.end(templates.errorPage(erro, d))
                    })
                }
                //GET /compositores/:id -----------------------------------------------------------------
                else if(/\/compositores\/C[0-9]{2,3}/.test(req.url)){
                    axios.get('http://localhost:3000' + req.url)
                    .then(resposta => {
                        res.writeHead(200, {'Content-Type': 'text/html'})
                        res.end(templates.pagCompositor(resposta.data, d))      
                    })
                    .catch(erro => {
                        res.writeHead(520, {'Content-Type': 'text/html'})
                        res.end(templates.errorPage(erro, d))
                    })
                }
                //GET periodos
                else if(req.url == '/periodos'){
                    axios.get('http://localhost:3000/compositores/')
                        .then(response => {
                            const periodos = [];
                            response.data.forEach(compositor => {
                                if (!periodos.includes(compositor.periodo)) {
                                    periodos.push(compositor.periodo);
                                }
                            });
                            console.log("aqi")
                            res.writeHead(200, {'Content-Type': 'text/html'})
                            res.end(templates.pagPeriodos(periodos, d)) 
                            console.log("aqi")

                        })
                        .catch(error => {
                            res.writeHead(520, {'Content-Type': 'text/html'})
                            res.end(templates.errorPage(error, d))      
                      });
                }          
                // GET /compositores/edit/:id --------------------------------------------------------------------
                else if(/\/compositores\/edit\/C[0-9]{2,3}/.test(req.url)){
                    var partes = req.url.split('/')
                    idAluno = partes[partes.length - 1]
                    axios.get('http://localhost:3000/compositores/' + idAluno)
                        .then(resposta => {
                            res.writeHead(200, {'Content-Type': 'text/html'})
                            res.end(templates.editarCompositor(resposta.data, d))      
                        })
                        .catch(erro => {
                            res.writeHead(520, {'Content-Type': 'text/html'})
                            res.end(templates.errorPage(erro, d))
                        })
                }
              //  // GET /compositores?periodo={periodo}] --------------------------------------------------------------------
                else if(/\/compositores\?periodo=[a-zA-Z]+/.test(req.url)){
                var partes = req.url.split('/')
                console.log(req.url)
                axios.get('http://localhost:3000' + req.url)
                    .then(resposta => {
                        res.writeHead(200, {'Content-Type': 'text/html'})
                        res.end(templates.pagCompositores(resposta.data, d))      
                    })
                    .catch(erro => {
                        res.writeHead(520, {'Content-Type': 'text/html'})
                        res.end(templates.errorPage(erro, d))
                    })
                }
                //GET DELETE
                else if(/\/compositores\/delete\/C[0-9]{2,3}/.test(req.url)){
                    var partes = req.url.split('/')
                    idAluno = partes[partes.length - 1]
                    axios.delete('http://localhost:3000/compositores/'+ idAluno)
                        .then(resposta => {
                            res.writeHead(200, {'Content-Type': 'text/html'})
                            res.end(templates.pagCompositor(resposta.data, d))      
                        })
                        .catch(erro => {
                            res.writeHead(520, {'Content-Type': 'text/html'})
                            res.end(templates.errorPage(erro, d))
                        })
                }
                
                // GET ? -> Lancar um erro
                else{
                    res.writeHead(520, {'Content-Type': 'text/html'})
                    res.end(templates.errorPage('Pedido não suportado: ${rep.url}', d))
                }
                break
            case "POST":
                // POST /compositores/edit/:id --------------------------------------------------------------------
                if(/\/compositores\/edit\/C[0-9]{2,3}/.test(req.url)){
                    var partes = req.url.split('/')
                    idCompositores = partes[partes.length - 1]
                    console.log(idCompositores)
                    collectRequestBodyData(req, result => {
                        if(result){
                            axios.put('http://localhost:3000/compositores/' + idCompositores, result) // Added colon after "http"
                                .then(resposta => {
                                    console.log(JSON.stringify(resposta.data))
                                    res.writeHead(201, {'Content-Type': 'text/html'});
                                    res.end(templates.pagCompositor(resposta.data, d));
                                })
                                .catch(erro => {
                                    res.writeHead(520, {'Content-Type': 'text/html'});
                                    res.end(templates.errorPage(erro, d));
                                });
                        }
                    });
                }
                //POST /compositores/delete/:id -----------------------------------------------
               // else if(/\/compositores\/delete\/C[0-9]{2,3}/.test(req.url)){
               //     var partes = req.url.split('/')
               //     idCompositores = partes[partes.length - 1]
               //     collectRequestBodyData(req, result => {
               //         if(result){
               //             axios.delete('http://localhost:3000/compositores/' + idCompositores, result) // Added colon after "http"
               //                 .then(resposta => {
               //                     console.log(JSON.stringify(resposta.data))
               //                     res.writeHead(201, {'Content-Type': 'text/html'});
               //                     res.end(templates.pagCompositor(resposta.data, d));
               //                 })
               //                 .catch(erro => {
               //                     res.writeHead(520, {'Content-Type': 'text/html'});
               //                     res.end(templates.errorPage(erro, d));
               //                 });
               //         }
               //     });
               // }
                // POST ? -> Lancar um erro
                else{
                    res.writeHead(404, {'Content-Type': 'text/html'})
                    res.end(templates.errorPage(`Pedido POST não suportado: ${req.url}`,d))
                }
            default: 
                // Outros metodos nao sao suportados
        }
    }
})

alunosServer.listen(7777, ()=>{
    console.log("Servidor à escuta na porta 7777...")
})



