# EW-Projeto

## MongoDB

```
docker run -d -p 27017:27017 --name mongoEW mongo
docker cp ucs.json mongoEW:/tmp    
docker cp users.json mongoEW:/tmp   
docker exec mongoEW mongoimport -d EWPROJETO -c users /tmp/users.json --jsonArray 
docker exec mongoEW mongoimport -d EWPROJETO -c ucs /tmp/ucs.json --jsonArray 
```

## Para correr a aplicação

```
npm i
npm start
```


