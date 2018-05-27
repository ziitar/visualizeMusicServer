/**
 * Created by lenovo on 2018/5/8.
 */

const mongoose=require('./mongoCennect');
const mongo=require('mongoose');
const ObjectId=mongo.Schema.Types.ObjectId;

var commentSchema=new mongoose.Schema({
    content:String,
    fromUser:{
        type:ObjectId,
        ref:'user'
    },
    toUser:{
        type:ObjectId,
        ref:'user'
    },
    song_id:{
        type:ObjectId,
        ref:'song'
    },
    sheet_id:{
        type:ObjectId,
        ref:'sheet'
    },
    like:Number,
    createTime:{
        type:Date,
        default:Date.now
    }
});

var Comment=mongoose.model('comment',commentSchema);

module.exports=Comment;