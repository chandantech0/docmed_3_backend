const app = require("./app");
const debug = require("debug")("node-angular");
const http = require("http");

const socketIo = require('socket.io');
const cors = require('cors');
// added cors for strict origin issue

const normalizePort = val => {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
};

const onError = error => {
  if (error.syscall !== "listen") {
    throw error;
  }
  const bind = typeof port === "string" ? "pipe " + port : "port " + port;
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
};

const onListening = () => {
  const addr = server.address();
  const bind = typeof port === "string" ? "pipe " + port : "port " + port;
  debug("Listening on " + bind);
};

const port = normalizePort(process.env.PORT || "3000");
app.set("port", port);
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    // origin: "http://localhost:4200",
    origin: 'https://docmed3-0.vercel.app',
    methods: ["GET", "POST"]
  }
});

app.use(cors());

// Socket for order placed listener
io.on('connection', (socket) => {
  console.log('User connected');

  // Listen for medicine order events
  socket.on('placeOrder', (orderData) => {
    // console.log('Medicine order placed:', orderData);
    // Broadcast the order to all connected admins
    io.emit('newOrder', orderData);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});


server.on("error", onError);
server.on("listening", onListening);
server.listen(port, () => console.log('server is running boss'));