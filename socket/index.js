module.exports = function (server) {
  const options = {
    path: "/chat",
  };

  const io = require("socket.io")(server, options);

  io.on("connection", (socket) => {
    // Обработка события
    socket.on("message", function (text, cb) {
      // Генерация события
      socket.broadcast.emit("message", text);
      cb();
    });
  });
};
