const express = require("express");
const path = require("path");
let socketIo = require("socket.io");
const { createProxyMiddleware } = require("http-proxy-middleware");
const socketProxy = createProxyMiddleware("/socket.io", {
  target: "http://localhost:8000",
  logLevel: "debug",
});

const PORT = process.env.PORT || 5000;
const app = express();
var io = socketIo();
app.io = io;
let clients = [];

io.on("connection", (socket) => {
  socket.on("store-client-info", (data) => {
    const clientInfo = new Object();

    clientInfo.uid = data.uid;
    clientInfo.clientId = socket.id;

    clients.push(clientInfo);
  });

  socket.on("message", (data) => {
    clients.forEach((client) => {
      if (data.recipients.includes(client.uid)) {
        io.sockets.sockets[client.clientId].emit("message", {
          senderId: data.senderUserId,
          chatRoomId: data.chatRoomId,
          isGroupChat: data.isGroupChat,
          text: data.text,
        });
      }
    });
  });

  socket.on("disconnect", (data) => {
    for (let i = 0, len = clients.length; i < len; i++) {
      let c = clients[i];

      if (c.clientId == socket.id) {
        clients.splice(i, 1);
        break;
      }
    }
  });
});

app
  .use(express.static(path.join(__dirname, "public")))
  .use(socketProxy)
  .set("views", path.join(__dirname, "views"))
  .set("view engine", "ejs")
  .get("/", (req, res) => res.render("pages/index"))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));
