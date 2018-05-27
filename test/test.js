/**
 * Created by lenovo on 2018/5/8.
 */
const loadLocalMusic=require('../control/loadLocalMusic');

loadLocalMusic(function(err,res){
    if (err) console.log(err);
    if (res) console.log(res);
});