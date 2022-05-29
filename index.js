const express = require('express')
const app = express()
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const cors = require('cors');
const port = 3000
const imageProcessor = require('./imageProcess');
const clients = [];
const path = require('path');
// Multer ayarları, dosya yükleyebilmek için
const multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, "./uploads"))
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      req.newFileName = uniqueSuffix+file.originalname;
      cb(null, uniqueSuffix+file.originalname)
    }
})
app.use(cors({
    origin: '*',
}));
const imageUpload = multer({ storage: storage });
// socket
io.on('connection', async (socket) => {
    console.log(socket.id +' connected');
    clients.push(socket.id);
    console.log(clients)
    socket.emit('myID', socket.id);
    io.emit('userList', (clients));
    socket.on('disconnect', () => {
        console.log(socket.id +' disconnected');
        clients.splice(clients.indexOf(socket.id), 1);
    });
});

app.use(express.static(path.join(__dirname, "./uploads")))

// Endpoints
app.get('/',(req,res)=>{
    res.sendFile(__dirname + '/public/index.html')
})
app.post('/encode', imageUpload.single('image'), (req, res) => {
    console.log(req);
    imageProcessor.encoder(req, res);
    setTimeout(function(){
        io.emit('encodedImage',{user: req.body.forWho, image: req.newFileName});
    },3000)
})
app.get('/decode/:image', (req, res)=>{
    console.log(req.params.image)
    imageProcessor.decoder(req, res)
})
app.get('/uploads/:image', (req,res)=>{
    res.sendFile(__dirname + '/uploads/'+req.params.image)
})
server.listen(port, () => {
  console.log(`Stenography App listening on port ${port}`)
})