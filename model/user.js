/**
 * Created by lenovo on 2017/8/23.
 */
const mongoose=require('../model/mongoCennect');
const mongo=require('mongoose');
const ObjectId=mongo.Schema.Types.ObjectId;


var userSchema=new mongoose.Schema({
    userName:{
    	type:String,
    	unique:true
    },
    headUrl:String,
    password:String,
    email:String,
    sex:{
    	type:String,
    	default:'male'
    },
    createTime:{
        type:Date,
        default:Date.now
    },
    sheets:[{
        type:ObjectId,
        ref:'sheet'
    }],
    loveSheets:[{
        type:ObjectId,
        ref:'sheet'
    }]
});

var User=mongoose.model('user',userSchema);
module.exports=User;