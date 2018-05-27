/**
 * Created by lenovo on 2017/8/20.
 */

const mongoose=require('./mongoCennect');
const mongo=require('mongoose');
const ObjectId=mongo.Schema.Types.ObjectId;


var songSchema=new mongoose.Schema({
    songName:String,
    author:[String],
    url:String,
    like:{
        type:Number,
        default:0
    },
    cloudMusicId:Number,
    createTime:{
        type:Date,
        default:Date.now
    }

});

var Song=mongoose.model('song',songSchema);
module.exports=Song;

