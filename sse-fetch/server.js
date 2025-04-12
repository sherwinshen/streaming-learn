const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors()); // 允许跨域
app.use(express.json()); // 解析 JSON 请求体

app.get("/sse", (req, res) => {
  // 设置 HTTP 头部以允许 SSE
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  // 模拟聊天消息流
  const chatMessages = [
    "你好，我是 ChatGPT。",
    "有什么可以帮你的吗？",
    "请随时告诉我你的问题。",
    "custom-event",
    "close",
    "这个消息应该不会发送",
  ];

  // 每隔一定时间发送一条消息
  const intervalId = setInterval(() => {
    const message = chatMessages.shift();
    if (message) {
      // 发送特定结束标识
      if (message === "close") {
        // res.write(
        //   `data: ${JSON.stringify({
        //     type: "close",
        //   })}\n\n`
        // );
      } else if (message === "custom-event") {
        res.write(`event: custom\n`);
        res.write(`data: 这是第一行数据\n`);
        res.write(`data: 这是第二行数据\n\n`);
      } else {
        res.write(
          `data: ${JSON.stringify({
            type: "text",
            content: message,
          })}\n\n`
        );
      }
    } else {
      // 没有更多消息时停止发送, 结束响应
      clearInterval(intervalId);
      res.end();
    }
  }, 1000);

  // 监听客户端关闭连接事件
  req.on("close", () => {
    console.log("Client disconnected");
    clearInterval(intervalId); // 清除定时器
    res.end(); // 结束响应
  });
});

app.post("/sse", (req, res) => {
  console.log(1);
  // 设置 HTTP 头部以允许 SSE
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  const data = req.body;
  console.log("data", data);
  let count = 0;
  const interval = setInterval(() => {
    if (count === 3) {
      clearInterval(interval);
      res.end();
      return;
    }
    count++;
    res.write(`data: ${count}\n\n`);
  }, 1000);
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

async function postSSEWithFetch(url, data, { onmessage, onopen, onclose }) {
  const response = await fetch(url, {
    method: "POST",
    cache: "no-cache",
    keepalive: true,
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },

    body: JSON.stringify(data),
  });

  onopen && onopen();

  if (response.status !== 200) return;

  const reader = response.body?.getReader();

  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      onclose && onclose();
      break;
    }
    const data = new TextDecoder().decode(value);
    onmessage && onmessage(data);
  }
}


