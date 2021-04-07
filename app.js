const createError = require('http-errors');
const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const config = require('./config');
const log = require('./lib/log')(module);
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const userIdRouter = require('./routes/userId');
const HttpError = require('./error');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');





/* Create server*/
// app.set('port', config.get('port'));
// http.createServer(app).listen(app.get('port'), () => {
  // log.info('Express server listening on port ' + config.get('port'));
// })

// view engine setup
app.engine('ejs', require('ejs-locals')); //layout, partial, block
app.set('views', path.join(__dirname, 'template'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: config.get('session:secret'),
  key: config.get('session:key'),
  cookie: config.get('session:cookie'),
  store: MongoStore.create({
    mongoUrl: config.get("mongoose:uri")
   })
}));


app.use(function(req, res, next) {
  req.session.numberOfVisits = req.session.numberOfVisits + 1 || 1;
  res.send("Visits: " + req.session.numberOfVisits);
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(require('./middleware/sendHttpError'));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/user', userIdRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {

  if (typeof err === 'number') {
    err = new HttpError(err);
  }

  if (err instanceof HttpError) {
    res.sendHttpError(err);
  } else {
    if (app.get('env') === 'development') {
    }
      else {
        log.error(err);
        err = new HttpError(500);
        res.sendHttpError(err);
      }
  }

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');

});

module.exports = app;
