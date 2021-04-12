# Trending Asset MS

The goal of this microservice is to keep track of all asset searches performed by users. It is made to be called only to
log search events, and not to perform the searches itself.

## Running the MS

The microservice is built to run in Docker and connect to a TimescaleDB. The TimescaleDB has been included as part of
the `docker-compose.yaml` to avoid the need to install any PostgreSQL or Timescale dependencies on the host machine. The
easiest way to get the service up and running is through the following.

```shell
docker build . -t trending-asset-ms:0.0.0
docker-compose up
```

If you want to run the service locally, you will need to have a running instance of TimescaleDB, and ensure that the
correct variables are set in the `.env` file.

```dotenv
DB_USER=asset_ms
DB_PASSWORD=demo_password
DB_HOST=127.0.0.1
DB_PORT=5432
```

You can then initialize the database and run the service locally via:

```shell
npm install
npx sequelize db:create trending_asset_ms
npx sequelize db:migrate
npm run build
npm run start
```

## Interface

The microservice is accessible over HTTP with the following endpoints:

### Log a user search

```shell
curl -X POST -H "Content-Type: application/json" http://localhost:8080/log -d \
'{
  "assetId": 123,
  "userId": 456
}'
```

### Get trending searches

```shell
curl http://localhost:8080/trending
```

Response:

```json
{
  "assetIds": [
    543,
    54,
    23,
    ...
  ]
}
```

### Get recent searches for a user

```shell
curl http://localhost:8080/user/{userId}/recent
```

Response:

```json
{
  "assetIds": [
    543,
    54,
    23,
    ...
  ]
}
```

* Note: recent searches are unique, so if the user has searched for asset `1` twice, the MS will respond `[1]`

## Architecture

This project uses a NodeJS API written in Typescript, using a TimescaleDB for underlying storage.

#### Database Choice and Architecture

TimescaleDB is an SQL database optimized for timeseries data and packaged as a PostgreSQL extension. This means that we
can connect to it using a standard node package for SQL databases (Sequelize), and execute queries in normal SQL.

The key optimizations in TimescaleDB can be seen in the migrations. After creating a table for the search logs, we
instruct Timescale to make a Hypertable out of it. We can interact with the Hypertable the same way we would normally
interact with a table, however the underlying data has been broken up into chunks according to timestamp to optimize
time-based queries.

We also create indices on the table for time and user as well as time and asset. These indices speed up the "recent
searches" query and the "trending assets" query respectively. Having more indices does increase insert time however, so
in a production scenario, we would have to investigate how often users are checking recent history to determine whether
this choice is advantageous.

Having a single table where we log the `(log_time, user_id, asset)` does increase our data retention, and potentially
slow down our query times as our log rate increases. However, the choice does mean that for a given number of logs per
day, if we increase the user number or asset number, we don't see a significant hit in performance. It also means that
although we are keeping more data than necessary, we have more options for future features. For example, this model
would easily scale if you would want to analyze the trending assets for several of the past days rather than just for
the last 24 hours. I discuss some alternatives to this in
the [Experimentation and Alternatives](#experimentation-and-alternatives) section below.

#### API Architecture

For the API, we are using ExpressJS and Typescript. I chose these options mainly due to ease of use and simplicity.
There are some potential replacements for ExpressJS using something like Fastify or Koa, and it could be interesting in
the future to explore whether these options provide any significant advantage in response times.

#### Horizontal Scalability

The API itself is containerized independently of the db, and can be run connected to an existing db or a fresh one (only
applying migrations that have not been previously applied). The idea is that it would be rather straightforward to run
multiple instances of the API behind a load balancer, and connect them to a database cluster.

## Experimentation and Alternatives

#### Alternate Table Structure

One of the downsides of the current implementation is that we are at risk of storing an overly large amount of data for
the specific functionality exposed. Consider just the trending asset search. Ideally, for each user we only need to know
whether they searched a given asset in the last 24 hours. If they searched it 10 minutes ago and 5 hours ago, we don't
care about the 5 hours search at all. If they searched haven't searched anything in 25 hours, we don't care about that
user at all in the calculation.

One way I looked at optimizing this is to essentially have a sparse matrix stored in memory (Redis), with each
user-asset pair having an expiry time of 24 hours. Logging a repeat entry would just reset the expiry time back to 24
hours, and finding the trending assets would just mean counting the number of pairs each asset is present in, and
sorting the results. This limits our overall data space to `(num users) * (num assets)`, which could be very large, but
is at least finite, whereas tracking every log event could grow boundlessly (depending on how quickly users can press
their search button).

The downside of this approach is mainly that the data is not re-usable for other functionality. We cannot calculate the
recent searches of a user on this data, or do any historical analysis for the trending assets on previous days. This
also means that we would need a separate data store to keep the recent searches, which would inevitably increase insert
times.

#### Continuous Aggregates

One of the reasons I originally chose to use TimescaleDB was because of the potential of Continuous Aggregates.
Timescale lets you define a type of materialized view that bins incoming data into time buckets and allows for very fast
queries over a coarser timescale. It's possible for instance to create a Continuous Aggregate on our search log table
that bins logs per hour, per asset. This would mean that when we want to query for trending assets, our select statement
could perform a small query on the data that has yet to be binned, and another small query on a coarse grained table
with the remaining hours.

The primary reason this does not work with our current functionality is due to the fact that the trending calculation
only takes into account unique users in the last 24 hours. When binning data, a user search for a particular asset may
have been unique in that one time bin, but that does not mean it would be unique in a 24 hour time span, thus we cannot
simply sum up our time buckets.

Personally, I am still convinced that there is some potential to use Continuous Aggregates to boost our performance, 
but more investigation/design would need to be done into constructing the right binning format.

