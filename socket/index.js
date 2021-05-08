const log = require("../lib/log");
const config = require("../config/index");
const connect = require("connect"); // npm i connect
const async = require("async");
const cookie = require("cookie"); // npm i cookie
const sessionStore = require("../lib/sessionStore");
const HttpError = require("http-errors").HttpError;
const User = require("../models/user");
var cookieParser = require("cookie-parser");

function loadSession(sid, callback) {
  // sessionStore callback is not quite async-style!
  sessionStore.load(sid, function (err, session) {
    if (arguments.length == 0) {
      // no arguments => no session
      return callback(null, null);
    } else {
      return callback(null, session);
    }
  });
}

function loadUser(session, callback) {
  if (!session.user) {
    log.debug("Session %s is anonymous", session.id);
    return callback(null, null);
  }

  // log.debug("retrieving user ", session.user);
  console.log("retrieving user ", session.user);

  User.findById(session.user, function (err, user) {
    if (err) return callback(err);

    if (!user) {
      return callback(null, null);
    }
    // log.debug("user findbyId result: " + user);
    callback(null, user);
  });
}

module.exports = function (server) {
  // const options = {
    // path: "/chat",
  // };

  const io = require("socket.io")(server);

  /**
   * Прослушиваем событие authorization
   */

  io.use(function (socket, next) {
    var handshake = socket.request;

    async.waterfall(
      [
        function (callback) {
          // сделать handshakeData.cookies - объектом с cookie
          handshake.cookies = cookie.parse(handshake.headers.cookie || "");
          const sidCookie = handshake.cookies[config.get("session:key")];

          const sid = cookieParser.signedCookie(
            sidCookie,
            config.get("session:secret")
          );

          loadSession(sid, callback);
        },
        function (session, callback) {
          if (!session) {
            callback(new HttpError(401, "No session"));
          }
          handshake.session = session;
          loadUser(session, callback);
        },
        function (user, callback) {
          if (!user) {
            callback(new HttpError(403, "Anonymous session may not connect"));
          }
          handshake.user = user;
          callback(null);
        },
      ],
      function (err) {
        if (!err) {
          return callback(null, true);
        }
        if (err instanceof HttpError) {
          return callback(null, false);
        }
        callback(err);
      }
    );
    next();
  });

  /**
   * Перезагрузка авторизованного списка клиентов после выхода любого пользователя из чата
   */
  io.sockets.on("session:reload", function (sid) {
    const clients = io.sockets.clients();

    //TODO: delete
    console.log("clients: ", clients);

    clients.forEach(function (client) {
      if (client.handshake.session.id != sid) return;

      loadSession(sid, function (err, session) {
        if (err) {
          client.emit("error", "server error");
          client.disconnect();
          return;
        }

        if (!session) {
          client.emit("logout");
          client.disconnect();
          return;
        }

        client.handshake.session = session;
      });
    });
  });

  /**
   * Прослушиваем событие connection
   */
  io.sockets.on("connection", (socket) => {
    // const username = "one";
    // Получаем имя пользователя
    const username = socket.handshake.user.get("username");

    // Отправляем всем слушателям сокета кроме себя, что  к нам присоединился пользователь
    socket.broadcast.emit("join", username);

    //TODO: delete
    console.log("handshake: ", socket.handshake);

    // Прослушиваем событие message
    socket.on("message", function (text, cb) {
      // Генерация событие message для  всех кроме себя
      socket.broadcast.emit("message", username, text);
      cb && cb();
    });
    // Прослушиваем событие disconnect отключение от чата
    socket.on("disconnect", function () {
      // Генерируем событие leave для всех кроме себя что покинули чат
      socket.broadcast.emit("leave", username);
    });
  });
  return io;
};




//=================================

// module.exports = function(server) {
  // var io = require('socket.io').listen(server);
  // io.set('origins', 'localhost:*');
  // io.set('logger', log);

  // io.set('authorization', function(handshake, callback) {
    // async.waterfall([
      // function(callback) {
        // // сделать handshakeData.cookies - объектом с cookie
        // handshake.cookies = cookie.parse(handshake.headers.cookie || '');
        // var sidCookie = handshake.cookies[config.get('session:key')];
        // var sid = connect.utils.parseSignedCookie(sidCookie, config.get('session:secret'));

        // loadSession(sid, callback);
      // },
      // function(session, callback) {

        // if (!session) {
          // callback(new HttpError(401, "No session"));
        // }

        // handshake.session = session;
        // loadUser(session, callback);
      // },
      // function(user, callback) {
        // if (!user) {
          // callback(new HttpError(403, "Anonymous session may not connect"));
        // }

        // handshake.user = user;
        // callback(null);
      // }

    // ], function(err) {
      // if (!err) {
        // return callback(null, true);
      // }

      // if (err instanceof HttpError) {
        // return callback(null, false);
      // }

      // callback(err);
    // });

  // });

  // io.sockets.on('session:reload', function(sid) {
    // var clients = io.sockets.clients();

    // clients.forEach(function(client) {
      // if (client.handshake.session.id != sid) return;

      // loadSession(sid, function(err, session) {
        // if (err) {
          // client.emit("error", "server error");
          // client.disconnect();
          // return;
        // }

        // if (!session) {
          // client.emit("logout");
          // client.disconnect();
          // return;
        // }

        // client.handshake.session = session;
      // });

    // });

  // });

  // io.sockets.on('connection', function(socket) {

    // var username = socket.handshake.user.get('username');

    // socket.broadcast.emit('join', username);

    // socket.on('message', function(text, cb) {
      // socket.broadcast.emit('message', username, text);
      // cb && cb();
    // });

    // socket.on('disconnect', function() {
      // socket.broadcast.emit('leave', username);
    // });

  // });

  // return io;
// };
