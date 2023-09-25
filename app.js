const express = require('express');
const app = express();
require('dotenv').config();
const dataBase = require('./dbHandler/dbHandler');

// Connect to DB
dataBase.connect();

// Import routes
const pageRouter = require('./routes/page.router');

// Middlewares
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}))

// Set view engine
app.set('view engine', 'twig');

// Routes
app.use("/", pageRouter);

// Listen
app.listen(process.env.PORT, () => {
    console.log(`App is running on ${process.env.PORT}`)
})