/**
 * Created by lenovo on 2017/8/20.
 */
const mongoCennect=require('mongoose');
const DB_url='mongodb://musicAdmin:4325803@localhost:27017/personal-music';
/*musicAdmin:4325803@*/

mongoCennect.connect(DB_url);

mongoCennect.connection.on('connected', function () {
    console.log('Mongoose connection open to ' + DB_url);
});

mongoCennect.connection.on('error',function (err) {
    console.log('Mongoose connection error: ' + err);
});

mongoCennect.connection.on('disconnected', function () {
    console.log('Mongoose connection disconnected');
});

module.exports=mongoCennect;