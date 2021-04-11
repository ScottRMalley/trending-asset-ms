# Trending Asset MS
The goal of this microservice is to keep track of all asset searches performed by users. It is made to be called 
only to log search events, and not to perform the searches itself.

## Running the MS
The microservice is built to run in Docker and connect to a TimescaleDB. The TimescaleDB has been included as part 
of the `docker-compose.yaml` to avoid the need to install any PostgreSQL or Timescale dependencies on the host 
machine. The easiest way to get the service up and running is through the following.

```shell
docker build . -t trending-asset-ms:0.0.0
docker-compose up
```

If you want to run the service locally, you will need to have a running instance of TimescaleDB, and 

## Interface

The microservice is accessible over HTTP with the following endpoints.

#### Log a user search
```shell
curl -X POST -H "Content-Type: application/json" http://localhost:8080/log -d \
'{
  "assetId": 123,
  "userId": 456
}'
```

#### Get trending searches
```shell
curl http://localhost:8080/trending
```
Response:
```json
{
  "assetIds": [543, 54, 23, ...]
}
```
#### Get recent searches for a user
```shell
curl http://localhost:8080/user/{userId}/recent
```
Response:
```json
{
  "assetIds": [543, 54, 23, ...]
}
```
* Note: recent searches are unique, so if the user 



## Experimentation
Various iterations of this project were made to test out 