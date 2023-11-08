var app = require("../deneme.js");
var debug = require('debug')('untitled1:server');
var http = require('http');
var webSocket = require('../webSocket/webSocket.js');
var socketIo = require('socket.io');
const dataBase = require('../dbHandler/dbHandler');
const { exit } = require("process");

// Connect to DB
let x = async function () {
  await dataBase.connect();


  var port = normalizePort(process.env.PORT || '80');
  app.set('port', port);

  var server = http.createServer(app);

  server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
  server.on('error', onError);
  server.on('listening', onListening);

  const io = socketIo(server);

  io.on('connection', (socket) => {
    socket.on('join', async (username) => {
      webSocket.connection(socket, username);
    });

    socket.on('refreshToken', async (username) => {
      webSocket.refreshToken(socket, username);
    });

    socket.on('disconnect', () => {
      webSocket.disconnect(socket);
    });
  });

  function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
      return val;
    }

    if (port >= 0) {
      return port;
    }

    return false;
  }

  function onError(error) {
    if (error.syscall !== 'listen') {
      throw error;
    }

    var bind = typeof port === 'string'
      ? 'Pipe ' + port
      : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        console.error(bind + ' requires elevated privileges');
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(bind + ' is already in use');
        process.exit(1);
        break;
      default:
        throw error;
    }
  }

  function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + addr.port;
    debug('Listening on ' + bind);
  }


}

x();