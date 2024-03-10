# TPC3
## 2024-02-26

## Autor

- A100702
- Mariana Antunes Silva

## Resumo

- Análise do dataset e criação da BD em JSON-SERVER

- As consultas têm de ser rápidas

- Serviço que responde na porta que quisermos, as seguintes rotas:
    1. GET /filmes -> listagem de filmes, cada entra é um link para a página do filme.
       O pedido é feito por /filmes/idFilme
    2. A página do filme tem de ter todas a informação do filme (Nome, Ano, Género, Elenco) -> o género tem de ser um link tal como os atores /genero   /genero/idGenero   /ator    /ator/idAtor