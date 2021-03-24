var winston = require('winston');
var ENV = process.env.NODE_ENV;

// console.log("NODE_ENV=" + ENV);

const { combine, timestamp, label, prettyPrint, printf } = winston.format;

const myFormat = printf(({ level, message, label, timestamp }) => {
    return `${level}: [${label}] ${message}  [${timestamp}]`;
  });

function getLogger(module) {

    var path = module.filename.split('/').slice(-2).join('/');
    // console.log('path = ' + path);

    return new winston.createLogger({
        format: combine(
            label({ label: path }),
            timestamp(),
            prettyPrint(),
            myFormat
        ),
        transports: [
            new winston.transports.Console({
                level: (ENV == 'development') ? 'debug' : 'error'
            }),
            new winston.transports.File({
                filename: 'errors.log',
                level: 'error'
              })
        ]
    });
}

module.exports = getLogger;
