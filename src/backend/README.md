
# Backend

SMS Manager Backend to create / track producers and generate / send messages

## Notable Packages

The backend uses the tokio runtime for multithreading capabilities. It uses Axum to expose an Http server that clients can interact with. 

I prefer Axum over alternatives like Rocket/Actix-web because of its predictable interface (Very similar to express in typescript which is an overwhelming industry standard for node servers) and it supports async/await operations to allow for processing of requests in a nonblocking fashion. 

Diesel is used as an ORM. Since we are using PostgreSQL and I personally am not a SQL wizard, I prefer using an ORM to interact with the database. It allows us to have typesafe queries and inserts and not have to worry about query structure passed the compiler which limits runtime issues. I prefer Diesel as opposed to prisma or sqlxlite because a: prisma is no longer supported on rust, and b: sqlxlite just abstracts the act of performing SQL calls. So you still have to write all the SQL yourself which I want to avoid for the sake of simplicity and limiting runtime errors. Since diesel's schema generation isn't great, if we were to expand our schema significantly and make lots of complex relations, I would want to write the schema in prisma use the prisma cli to generate the migration files, and then use diesel to read the migration files and perform the queries. 

## Structure 

The backend is separated into three distinct sections: Routes, Controllers and Services. Together they allow for the processing of HTTP methods and interacting with the database

### Routes

Routes are the interface to our server, they define our endpoint urls as well as which http methods can be made to each endpoint. 

They then delegate the handling of the request to the controllers

Routes are nested by each axum router. Since we only have endpoints on the /producers route, we only have one router, however if we were to expand our services to other operations, we can easily create a new router and nest it on the main app.

### Controllers

Controllers are responsible for handling the http side of the request, they parse out the arguments from the request, either from the parameters or from the body as JSON, take in the diesel database and then call the service function to handle the requests logic. They then take the result of the logic and transform it to the expected public type and send that back to the client. 

### Services

Services are responsible for the logic of the backend. They take in the arguments passed by the controller, interact with the database, perform any business logic and then give back the result of their processing. They are meant to be heavily tested independently from the request. 

## Development

To develop locally: 

Ensure the postgres database is running by running `docker-compose up -d`

cd into directory.

run `echo DATABASE_URL=postgres://admin:password@localhost:5432/sms_manager > .env`

(Optional) install diesel cli:

### Linux/MacOS
curl --proto '=https' --tlsv1.2 -LsSf https://github.com/diesel-rs/diesel/releases/latest/download/diesel_cli-installer.sh | sh

### Windows
powershell -c "irm https://github.com/diesel-rs/diesel/releases/latest/download/diesel_cli-installer.ps1 | iex"

run `diesel migration run`

run `cargo run`

## Testing

To test, ensure youve run the above commands at least once, then run

`cargo test -- --test-threads=1`

### Integration Tests

The integration tests are for testing anything that interacts with the database. Diesel unfortunately is very difficult to unit test as mocking the calls is not really possible since they are global class objects rather than trait objects. 

So any functions with diesel like the services and the message updater are tested with targeted integration tests against a running database. 

### Unit Tests

All functions that do not interact with the database and aren't the controllers or services, are unit tested. 