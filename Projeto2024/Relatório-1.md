# Relatório de Engenharia Web - Gerir Websites para UCs

## Autores

Mariana Antunes Silva, A100702

João Paulo Campelo Gomes, A100747

Pedro Afonso Moreira Lopes, A100759

## Introdução

Este relatório surge no âmbito da Unidade Curricular de Engenharia Web, em que nos foi proposto a concepção de uma aplicação *Web*.

A proposta de enunciado escolhida pelo grupo foi a criação de uma aplicação *Web* para gerir websites para UCs.

## Objectivos

Na implementação desta aplicação *Web*, pretendemos atingir os seguintes objectivos:

* Analisar o dataset de uma UC fornecido e tratá-lo de modo a criar um modelo em MongoDB para o guardar.
* Criar uma interface web de navegação em toda a informação disponibilizada, semelhante ao das UC.
* Criar uma funcionalidade para a criação de novas UC (todas as operações de CRUD sobre uma UC).
* Ter várias possibilidades de pesquisa sobre as UC criadas e ter uma interface centralizada para aceder ao site de cada uma.
* Permitir que utilizador autorizados edite a informação da UC.
* Restringir o acesso do utilizadores, dependendo da sua categoria (administrador, produtor, consumidor), a partir de autenticação.

## Tratamento dos *datasets*

Para o povoamento da base de dados da aplicação, foram fornecidos 3 *datasets* reais provenientes de diversas UCs. Estes *datasets* tiveram a necessidade de ser submetidos a um tratamento antes de serem inseridos na base de dados uma vez que estes *datasets* continham diversas inconsistências.

Apresentamos de seguida algumas das tarefas relativas ao tratamento dos dados dos *datasets*:

**1.** Começamos por juntar os 3 *datasets* num só.
**2.** Adicionamos um campo \_id a todas as UCs e as respetivas aulas de cada UC para facilitar as operações sobre estas.

Decidimos criar um dataset chamado **users.json**, que contém informação dos utilizadores e qual o tipo dele, sendo administrador, produtor e consumidor.

Além disto, de forma a tratar da autenticação dos utilizadores, tivemos também que ter em conta o tratamento do dataset de users.
Para este, foram então seguidos e respeitados os seguintes cuidados:

**1.** A estrutura dos utilizadores é bastante semelhante e foi inspirada nos utilizadores/docentes nos datasets das UCs mencionados acima.

**(Falta mais algo aqui)**

## Servidores Implementados

No desenvolvimento da nossa aplicação, só procedemos ao desenvolvimento de um servidor novo quando era importante e necessário para o seu funcionamento. Sendo assim, decidimos ter dois servidores: um que é responsável pela autenticação dos utilizadores e outro que implementa a API de dados e a interface em conjunto.

## Base de dados

A base de dados da nossa aplicação foi feita usando o MongoDB. A base de dados possui duas coleções: **ucs.json** e **users.json**. Tal como os nomes indicam, uma vai tratar do armazenamento de UCs e a outra de utilizadores, respetivamente.

## Rotas

``GET /login:`` Permite a qualquer utilizador fazer o login

``GET /logout:`` Redireciona o utilizador para a página de login

``GET /ucs:`` Esta rota vai apresentar ao utilizador todas as ucs disponíveis.

``GET /ucs/:id :`` Esta rota levará o utilizador à página da uc selecionada.

``GET /ucs/adicionarUC:`` Esta rota vai levar o utilizador para a página de criação de uma uc.

``POST /ucs/adicionarUC:`` Quando o utilizador submete os seus dados de registo para o servidor, este recebe vai registar a uc na base de dados.

``GET /ucs/:id/editar:`` Quando o utilizador quer editar uma uc vai lhe ser apresentar a respetiva página para o poder fazer.

``POST /ucs/:id/editar:`` Assim que o utilizador submeter a sua edição o servidor vai mandar as alterações respectivas à uc para a base de dados.

``GET /ucs/remover/:id :`` Se um utilizador autorizado quiser eliminar uma uc esta rota irá remover a uc da base de dados.

``GET /ucs/:idUC/aula/add:`` Quando um utilizador pretender adicionar uma
nova aula, vai-lhe ser apresentada uma página para poder fazê-lo.

``POST /ucs/:idUC/aula/add:`` Assim que o utilizador submeter a sua aula nova esta vai ser registada na base de dados.

``GET /ucs/:idUC/aula/editar/:id :`` Esta rota vai permitir editar uma aula que foi selecionada.

``POST /ucs/:idUC/aula/editar/:id :`` Se o utilizador submeter as suas alterações estas vão ser espelhadas na base de dados.

``GET /ucs/:idUC/aula/remover/:id :`` Vai permitir remover uma aula.

``GET /ucs/:id/download/:fname :`` Quando um utilizador quiser fazer download de um ficheiro que está disponível numa aulas esta rota será acionada.

``GET /ucs:idUC/adddocente:`` Esta rota vai levar o utilizador para a página para este poder adicionar novos docentes á us.

``POST /ucs:idUC/adddocente:`` Quando o utilizador submeter, os dados vão ser mandados para a base de dados.

``GET /ucs/:idUC/avaliacao:`` Se um utilizador pretender editar as avaliações da uc, este será redirecionado para a pagina das avaliações.

``POST /ucs/:idUC/avaliacao:`` Assim que o utilizador submeter a edição das avaliações da uc, estas alterações vão ser mandadas para a base de dados.

``GET /ucs/:idUC/datas:`` Se um utilizador pretender editar as datas de uma uc, este será redirecionado para a página das datas referentes à uc.

``POST /ucs/:idUC/datas:`` Assim que o utilizador submeter a edição das datas da uc, estas alterações vão ser mandadas para a base de dados.

``GET /ucs/:idUC/horario:`` Se um utilizador pretender alterar o horário já definido, este será redirecionado para a página das datas referentes à uc.

``POST /ucs/:idUC/horario:`` Assim que o utilizador fizer as alterações e submeter, estas alterações vão ser mandadas para a base de dados.

``GET /ucs/:idUC/editarDocente/:idDocente`` Carrega a página de edição do docente onde há 3 botões: atualizar, remover foto e apagar docente. Se carregar em remover a fotografia volta a ter a foto de perfil default, removendo a fotografia do nosso servidor. Atualizar aplica as mudanças que realizou na página e eliminar docente remove este da uc, sendo que esta última funcionalidade só aparece para admin.

``POST /ucs/:idUC/editarDocente/:idDocente`` Envia os dados do formulário de edição de docente. 

``GET /ucs/:idUC/removerDocente/:idDocente`` Remove o docente da uc.

``GET /exportarDB`` Só pode ser acedido por admin, faz o download de um zip com todos os dados da db e imagens associadas.

``GET /importarDB`` Só pode ser acedido por admin, carrega a página de importação de db onde o admin pode enviar um zip para carregar dados para a db.

``POST /importarDB`` Envia os dados para o servidor para os carregar na db e inclui as imagens nas pastas respetivas.

## Servidor de Autenticação

O servidor de autenticação é responsável pela gestão dos utilizadores, desde a criação de novas contas até à autenticação dos utilizadores na aplicação.

O servidor de autenticação é também responsável pela criação de um ***token*** (*jsonwebtoken*) sempre que um pedido de registo ou *login* é feito. Esse *token* irá ficar guardado num *cookie* no *browser* do utilizador que será necessário para realizar qualquer pedido ao servidor.
Este token também é utilizado para determinar a que páginas é que o utilizador tem acesso, sendo que se ele inserir o url de uma página indevida, invés de ver o conteúdo da mesma verá uma página de "erro página não encontrada". Esta verificação valida não só o nível de acesso dele, mas também a que ucs é que ele está associado a não ser que seja admin.
## Rotas

``GET /:id :`` Devolve os dados do utilizador apenas pode ser feito pelo próprio utilizador cujo

``POST/:register:`` Cria uma nova conta de utilizador (aluno) e devolve um *token* de autenticação para que esta tenha acesso

``POST/:registerAdmin:`` Cria uma nova conta de utilizador (administrador) e devolve um *token* de autenticação para que esta tenha acesso

``POST/:registerDocente:`` Cria uma nova conta de utilizador (docente/professor) e devolve um *token* de autenticação para que esta tenha acesso

``POST/:login:`` Devolve um *token* de autenticação se os campos de autenticação estiverem corretos e corresponderem a uma conta existente.

## Colocação da aplicação em funcionamento 

Para correr o trabalho basta seguir os passos que estão no README.md
