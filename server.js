const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Handle uncaught exceptions (sync)
process.on('uncaughtException', err => {
  console.log(err);
  console.log('UNCAUGHT EXCEPTION!, shutting down the app..');
  process.exit(1);
});

dotenv.config({ path: './config.env' });

const app = require('./app');

// Initializing/syncing db
const DB = process.env.MONGO_DB_NAME.replace(
  '<PASSWORD>',
  process.env.MONGO_DB_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Db Connected! ✅');
  });

// Initializing server
const PORT_NUM = process.env.PORT || 3000;
const currentTime = new Date().toLocaleTimeString('default', {
  hour: '2-digit',
  minute: '2-digit',
});

const server = app.listen(PORT_NUM, () => {
  console.log(`${currentTime} - App is running on port ${PORT_NUM}`);
});

// Initializing socket.io
const io = require('./utils/socket').init(server);
io.on('connection', socket => {
  console.log('Client Connected 🚀🚀🚀');
});

// Handle promise rejections (async)
process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION!, shutting down the app..');
  server.close(() => {
    process.exit(1);
  });
});
