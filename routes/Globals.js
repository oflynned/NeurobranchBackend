/**
 * Created by Ed on 30/06/2016.
 */

// email
exports.shouldVerifyUsers = true;
exports.shouldSendEmail = true;
exports.email = "neurobranchbeta@gmail.com";
exports.password = "v-<P5&B^GcSxV7tg";
exports.TEN_MINUTES_MILLIS = 1000 * 60 * 60;

//accessing addresses
exports.PORT = 80;
exports.DB_PORT = 27017;
exports.ADDRESS = "localhost";

//sensitive info -- change this before we publish
exports.SECRET = "secret";

//routes
exports.INDEX_ROUTE = "./routes/index";
exports.USERS_ROUTE = "./routes/users";