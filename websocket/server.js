const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 4000 });

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (message) => {
    console.log(`Server receive message: ${message}`);
    const messageObj = JSON.parse(message);
    if (messageObj.type === "init") {
      count = 1;
      // 定时主动推送至客户端
      const interval = setInterval(() => {
        if (count < 5) {
          ws.send(`Hello init: ${Date.now()}`);
          count++;
        } else {
          clearInterval(interval);
        }
      }, 1000);
    } else if (messageObj.type === "click") {
      ws.send(`Hello Click: ${Date.now()}`);
    } else if (messageObj.type === "close") {
      ws.close();
    }
    // Broadcast to all clients
    // wss.clients.forEach((client) => {
    //   if (client.readyState === WebSocket.OPEN) {
    //     client.send(`Hello Client: ${Date.now()}`);
    //   }
    // });
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

console.log("Server started on ws://localhost:4000");
