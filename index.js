var app = require("express")();
var http = require("http").createServer(app);

var io = require("socket.io")(http);

let clients = [];
io.origins('*:*');
io.on("connection", (socket) => {

  socket.on("store-client-info", (data) => {
    const clientInfo = new Object();
    console.log("Asdfasdfsadf");
    clientInfo.uid = data.uid;
    clientInfo.clientId = socket.id;

    clients.push(clientInfo);
  });

//   socket.on("new-member", (data) => {
//     console.log(data);

//     clients.forEach(client => {
//         io.sockets.sockets[client.clientId].emit('new-member', data);
//     });
//   });

  socket.on("message", (data) => {

    clients.forEach(client => {
        if(data.recipients.includes(client.uid)) {
            io.sockets.sockets[client.clientId].emit('message', {
                senderId: data.senderUserId,
                chatRoomId: data.chatRoomId,
                isGroupChat: data.isGroupChat,
                text: data.text
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

app.get("/", (req, res) => res.send("hello!"));
http.listen(3000, () => {
  console.log("listening on *:3000");
});
