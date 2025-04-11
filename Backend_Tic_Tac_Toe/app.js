let express = require("express");
const app = require('express')(); 
const internalServer = require('http').createServer(app);
const io = require("socket.io")(internalServer, {cors: {origin: "*", }}); //permette la conessione a tutti i client
let cors = require('cors');
app.use(cors());
let bodyparse = require('body-parser');
app.use(bodyparse.json());
app.use(express.json());
require('dotenv').config();
io.on('connection', (socket) => { console.log('Nuovo client connesso:', socket.id);});

//esporta il socket in modo da essere utilizzato in altre parti della applicazione
module.exports.io = io;

//PORT WHERE APP LISTENING
const PORT = process.env.PORT;

//APP ROUTE
let server = require('./app/server/matchController');

// //USE ROUTE
app.use('/server', server);

//START SERVER
internalServer.listen(PORT, () => console.log(`Server Listening on port ${PORT}`));

