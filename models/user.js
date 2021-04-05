const crypto = require('crypto');
const { Schema, model } = require('mongoose');

const schema = new Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    hashedPassword: {
        type: String,
        required: true
    },
    salt: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    }
});

schema.methods.encryptPassword = (password) => {
    return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
}

schema.virtual('password')
    .set(function(password) {
        this._plainPassword = password;
        this.salt = Math.random() + '';
        this.hashedPassword = this.encryptPassword(password);
    })
    .get(function() { return this._plainPassword; });

schema.methods.checkPassword = (password) => {
    return this.encryptPassword(password) === this.hashedPassword;
}


module.exports = model('User', schema);
