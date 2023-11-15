const express = require('express');
const app = express();
const session = require("cookie-session");
require('dotenv').config();




// Import routes
const pageRouter = require('./routes/page.router');

// Create an HTTP server
// const server = http.createServer(app);

console.log("App is running in '" + process.env['NODE_ENV'] + "' mode.")
if (process.env['NODE_ENV'] == "test") {
  app.locals.appUrl = "http://localhost/a";
}
else if (process.env['NODE_ENV'] == "production") {
  app.locals.appUrl = "http://localhost/a";
}else{
  console.log("anlamadım hocam");
}
console.log("URL is >>> " + app.locals.appUrl);


// Middlewares
app.use(express.static(__dirname + '/'));
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}))
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false }
}))

//app.set('trust proxy', true); // IP filter için lazım

// Set view engine
app.set('view engine', 'twig');

// Routes
app.use("/", pageRouter);

app.use(function (req, res, next) {
    next(createError(404));
});

app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
  
    // render the error page
    res.status(err.status || 500);
    res.render('login'); // error olarak değişecek
  });


// Create a Socket.io instance attached to the HTTP server



/* server.listen(process.env.SOCKET_PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.SOCKET_PORT}`);
});
 */

module.exports = app;