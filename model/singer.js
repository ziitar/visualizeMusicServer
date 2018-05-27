/**
 * Created by lenovo on 2017/11/16.
 */
const mongoose=require('./mongoCennect');
const mongo=require('mongoose')
const ObjectId=mongo.Schema.Types.ObjectId;

var singerSchema=new mongoose.Schema({
    singerName:String,
    songNum:{
        type:Number,
        default:0
    },
    songs:[{
        type:ObjectId,
        ref:'song'
    }]
});

var Singer=mongoose.model('singer',singerSchema);
module.exports=Singer;