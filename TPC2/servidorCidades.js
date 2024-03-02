var http = require('http')
var fs = require('fs')
var url = require('url')

files = {}

http.createServer(function (req, res) {
    //encontras as páginas das cidades
    var regex = /^\/Cidades\/c[0-9]+\.html$/;

    var q =  url.parse(req.url, true);
    console.log(q.pathname);
    var tableBody = '';
    //para abrir a página inicial
    if (q.pathname == '/') {
        //para ir buscar informação das cidades á base de dados JSON
        fetch('http://localhost:3000/cidades')
            .then(response => {
              // Verifica se a resposta é bem-sucedida (status 200-299)
              if (!response.ok) {
                throw new Error('Erro ao buscar as cidades: ' + response.status);
              }
              // Converte a resposta em JSON
              return response.json();
            })
            .then(data => {
                // Carrega o conteúdo do arquivo HTML modelo
                fs.readFile('paginaInicial.html', 'utf8', (erro, dados) => {
                    if (erro) {
                        console.error('Erro ao carregar o modelo HTML:', erro);
                        res.writeHead(500, {'Content-Type': 'text/plain'});
                        res.end('Erro interno do servidor');
                        return;
                    }
                
                    //ordena por ordem alfabética
                    data.sort((cidade1, cidade2) => cidade1.nome.localeCompare(cidade2.nome));

                    // Preenche o modelo com os dados das cidades
                    data.forEach(cidade => {
                        tableBody += `<tr>
                            <td>${cidade.nome}</td>
                            <td><a href="Cidades/${cidade.id}.html">${cidade.nome}</a></td>
                        </tr>`;
                        fileCidade = `
                            <!DOCTYPE html>
                            <html>
                            <head>
                                <title>TPC2</title>
                                <meta charset="UTF-8">
                            </head>
                            <body>
                                <h1>${cidade.nome}</h1>
                                <h2>Distrito: ${cidade.distrito}</h2>
                                <h3>ID: ${cidade.id}</h3>
                                <h4>População: ${cidade.população}</h4>
                                <h2>Descrição:</h2>
                                <p>${cidade.descrição}</p>

                                <h2>Ligações</h2>
                                    <!-- Aqui fica as ligações -->
                            </body>
                            </html>`;
                        files[cidade.id] = fileCidade;
                    });
                    
                    const htmlContent = dados.replace('<!-- Os dados das cidades serão inseridos aqui -->', tableBody);
                
                    // Escreve o conteúdo HTML preenchido em um arquivo
                    fs.writeFile('paginaInicial.html', htmlContent, 'utf8', err => {
                        if (err) {
                            console.error('Erro ao escrever no arquivo paginaInicial.html:', err);
                            res.writeHead(500, {'Content-Type': 'text/plain'});
                            res.end('Erro interno do servidor');
                            return;
                        }
                    });
                    
                    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
                    res.write(dados);
                    res.end();
                });  
            })
            .catch(error => {
              // Captura e trata erros de rede ou outras falhas na requisição
              console.error('Erro durante a busca das cidades:', error);
            });
    }
    else if(regex.test(q.pathname)){
        let l = ''; // Corrected variable declaration
        //caso não exista a página em html necessita de ser escrita 
        const cidadeData = files[q.pathname.substring(9, 12)]; // Corrected variable declaration
        fetch('http://localhost:3000/ligacoes')
            .then(response => {
                // Verifica se a resposta é bem-sucedida (status 200-299)
                if (!response.ok) {
                    throw new Error('Erro ao buscar as cidades: ' + response.status);
                }
                // Converte a resposta em JSON
                return response.json();
            })
            .then(data => {
                // Carrega o conteúdo do arquivo HTML modelo
                // Preenche o modelo com os dados das cidades
                data.forEach(ligacao => {
                    if ((ligacao.origem + ".html") == q.pathname.substring(9)){

                        l += `
                            <h4><a href="${ligacao.destino}.html">${ligacao.destino}</a></h4>
                            Distância: ${ligacao.distância}
                            `;
                    }
                });
                const htmlContent = cidadeData.replace('<!-- Aqui fica as ligações -->', l);
                
                // Escreve o conteúdo HTML preenchido em um arquivo
                fs.writeFile(q.pathname.substring(1), htmlContent, 'utf8', err => {
                    if (err) {
                        console.error('Erro ao escrever no arquivo paginaInicial.html:', err);
                        res.writeHead(500, {'Content-Type': 'text/plain'});
                        res.end('Erro interno do servidor');
                        return;
                    }
                });
                
                fs.readFile(q.pathname.substring(1), 'utf8', (erro, dados) => {
                    if (erro) {
                        console.error('Erro ao carregar o modelo HTML:', erro);
                        res.writeHead(500, {'Content-Type': 'text/plain'});
                        res.end('Erro interno do servidor');
                        return;
                    }
                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                    res.write(dados);
                    res.end();
                });
            })
            .catch(error => {
                // Captura e trata erros de rede ou outras falhas na requisição
                console.error('Erro durante a busca das cidades:', error);
            });
    }
    else{
        res.writeHead(400, {'Content-Type': 'text/html ; charset=utf-8'})
        res.write('<p>Erro: pedido não suportado</p>')
        res.write('<pre>' + q.pathname + '</pre>')
        res.end()
    }
   
}).listen(7777)