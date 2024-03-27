exports.pagCompositores = function(slist, d){
    var pagHTML = `
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="UTF-8"/>
            <link rel="icon" href="favicon.png"/>
            <link rel="stylesheet" href="w3.css"/>
            <title>Student Management</title>
        </head>
        <body>
            <div class="w3-card-4">

                <header class="w3-container w3-pink">
                    <h1>Compositores
                    <a class="w3-btn w3-round w3-grey" href="/alunos/registo">+</a>
                    </h1>
                    
                </header>
        
                <div class="w3-container">
                    <table class="w3-table-all">
                        <tr>
                            <th>Id</th>
                            <th>Nome</th>
                            <th>Periodo</th>
                            <th>Actions</th>
                        </tr>
                `
    for(let i=0; i < slist.length ; i++){
        pagHTML += `
                <tr>
                    <td>${slist[i].id}</td>
                    <td>
                        <a href="/compositores/${slist[i].id}">
                            ${slist[i].nome}
                        </a>
                    </td>
                    <td>${slist[i].periodo}</td>    
                    <td>
                        [<a href="/compositores/edit/${slist[i].id}">Edit</a>][<a href="/compositores/delete/${slist[i].id}">Delete</a>]
                    </td>
                </tr>
        `
    }

    pagHTML += `
            </table>
            </div>
                <footer class="w3-container w3-pink">
                    <h5>Generated by EngWeb2024 in ${d}</h5>
                </footer>
            </div>
        </body>
    </html>
    `
    return pagHTML
}

exports.pagPeriodos = function(periodos, d){
    var pagHTML = `
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="UTF-8"/>
            <link rel="icon" href="favicon.png"/>
            <link rel="stylesheet" href="w3.css"/>
            <title>Student Management</title>
        </head>
        <body>
            <div class="w3-card-4">

                <header class="w3-container w3-pink">
                    <h1>Periodos
                    <a class="w3-btn w3-round w3-grey" href="/alunos/registo">+</a>
                    </h1>
                    
                </header>
        
                <div class="w3-container">
                    <table class="w3-table-all">
                        <tr>
                            <th>Periodo</th>
                        </tr>
                `
        for (let i = 0; i < periodos.length; i++){
        pagHTML += `
                <tr>
                    <td><li><a href="/compositores?periodo=${periodos[i]}">${periodos[i]} </a></li>
                    </td>
                </tr>
        `
    }

    pagHTML += `
            </table>
            </div>
                <footer class="w3-container w3-pink">
                    <h5>Generated by EngWeb2024 in ${d}</h5>
                </footer>
            </div>
        </body>
    </html>
    `
    return pagHTML
}


exports.editarCompositor = function(a, d){
    var pagHTML = `
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="UTF-8"/>
            <link rel="icon" href="favicon.png"/>
            <link rel="stylesheet" href="w3.css"/>
            <title>Compositor</title>
        </head>
        <body>
            <div class="w3-card-4">
                <header class="w3-container w3-purple">
                    <h2>Compositor</h2>
                </header>
            
                <form class="w3-container" method="POST">
                    <fieldset>
                        <legend>Metadata</legend>
                        <label>Id</label>
                        <input class="w3-input w3-round" type="text" name="id" readonly value="${a.id}"/>
                        <label>Nome</label>
                        <input class="w3-input w3-round" type="text" name="nome" value="${a.nome}"/>
                        <label>Bibliografia</label>
                        <input class="w3-input w3-round" type="text" name="bio" value="${a.bio}"/>
                        <label>Data de nascimento</label>
                        <input class="w3-input w3-round" type="text" name="dataNasc" value="${a.dataNasc}"/>
                        <label>Data de Obito</label>
                        <input class="w3-input w3-round" type="text" name="dataObito" value="${a.dataObito}"/>
                        <label>Periodo</label>
                        <input class="w3-input w3-round" type="text" name="periodo" value="${a.periodo}"/>
                        
                    </fieldset>
                    <button class="w3-btn w3-purple w3-mb-2" type="submit">Register</button>
                </form>

                <footer class="w3-container w3-purple">
                    <h5>Generated by EngWeb2023 in ${d} - [<a href="/alunos">Voltar</a>]</h5>
                </footer>
            
            </div>
    `
    return pagHTML
}

exports.pagCompositor = function(Compositor, d ){
    var pagHTML = `
    <html>
    <head>
        <title>Compositor: ${Compositor.id}</title>
        <meta charset="utf-8"/>
        <link rel="icon" href="favicon.png"/>
        <link rel="stylesheet" href="w3.css"/>
    </head>
    <body>
        <div class="w3-card-4">
            <header class="w3-container w3-teal">
                <h1>Compositor ${Compositor.id}</h1>
            </header>

            <div class="w3-container">
                <ul class="w3-ul w3-card-4" style="width:50%">
                    <li><b>Nome: </b> ${Compositor.nome}</li>
                    <li><b>Bibliografia: </b> ${Compositor.bio}</li>
                    <li><b>Data de Nascimento: </b> ${Compositor.dataNasc}</li>
                    <li><b>Data de Obito: </b> ${Compositor.dataObito}</li>
                    <li><b>Período: </b> ${Compositor.periodo}</li>
                </ul>
            </div>
            <footer class="w3-container w3-teal">
                <address>Gerado por compositores::EngWeb2024 em ${d} - [<a href="/compositores">Voltar</a>]</address>
            </footer>
        </div>
    </body>
    </html>
    `
    return pagHTML
}

// -------------- Error Treatment ------------------------------
exports.errorPage = function(errorMessage, d){
    return `

    <html>
    <head>
        <title>Error Page</title>
        <meta charset="utf-8"/>
        <link rel="icon" href="favicon.png"/>
        <link rel="stylesheet" href="w3.css"/>
    </head>
    <body>
        <div class="w3-card-4">
            <header class="w3-container w3-teal">
                <h1>Erro</h1>
            </header>

            <div class="w3-container">
                <p>${d}: Error: ${errorMessage}</p>
            </div>

            <footer class="w3-container w3-teal">
                <address>Gerado por compositor::EngWeb2024 em ${d} - [<a href="/">Voltar</a>]</address>
            </footer>
        </div>
    </body>
    </html>    
    `
}