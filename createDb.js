var User = require('./models/user');

var user = new User({
    username: "Tester",
    password: "123"
});

user.save(function(err, user, affected) {
    if(err) throw err;

    
})
