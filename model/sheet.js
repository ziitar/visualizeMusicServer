/**
 * Created by lenovo on 2018/5/8.
 */
const mongoose=require('./mongoCennect');
const mongo=require('mongoose');
const ObjectId=mongo.Schema.Types.ObjectId;

var sheetSchema=new mongoose.Schema({
    sheetName:String,
    like:{
        type:Number,
        default:0
    },
    songNum:{
        type:Number,
        default:0
    },
    orderUser:[String],
    songs:[{
        type:ObjectId,
        ref:'song'
    }],
    createTime:{
        type:Date,
        default:Date.now
    },
    updateTime:{
        type:Date
    }
});

var Sheet=mongoose.model('sheet',sheetSchema);

module.exports=Sheet;
