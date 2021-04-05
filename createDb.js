const mongoose = require('mongoose');
const async = require('async');


const open = (callback) => {
    mongoose.connection.on('open', callback);
}

const dropDataBase = (callback) => {
    const db = mongoose.connection.db;
    db.dropDatabase(callback);
}

const requireModels = (callback) => {
    require('./models/user');

    async.each(Object.keys(mongoose.models), (modelName, callback) => {
        mongoose.models[modelName].ensureIndexes(callback);
    }, callback);
}

const createUsers = (callback) => {

    const users = [
        { username:'Петя', password: '123p' },
        { username:'Вася', password: '123v' },
        { username:'admin', password: '123admin' }
    ];

    async.each(users, (userData, callback) => {
        const user = new mongoose.models.User(userData);
        user.save(callback);
    }, callback);
}

async.series([
    open,
    dropDataBase,
    requireModels,
    createUsers
], function(err) {
    console.log(arguments);
    mongoose.disconnect();
    process.exit(err ? 255 : 0);
});
