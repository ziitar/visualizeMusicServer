/**
 * Created by lenovo on 2018/5/8.
 */
const restify=require('restify');
const session=require('client-sessions');
const bodyParser=require('body-parser');

const {createWebAPIRequest} =require('./util/util');
const User=require('./model/user');
const Song=require('./model/song');
const Sheet=require('./model/sheet');
const Comment=require('./model/comment');

const async=require('async');

//创建server服务对象server
const server=restify.createServer();

//使用session和queryParser插件
server
    .use(session({
        cookieName:'musicSession',
        secret:'hiphapu',
        duration:24*60*60*1000*7
    }))
    .use(AllowOrigin)
    .use(restify.plugins.queryParser({mapParams:true}))
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({extended:false}));


//注册路由
/*
*   登录中间件
* */
function loginMessage(req,res,next) {
    if (req.musicSession){
        if (req.musicSession.sign&&req.musicSession.user) {
            return next()
        }else{
            res.status(501);res.send({message:'false'});
            return next(false);
        }
    }else{
        res.send({message:'false'});
        return next(false);
    }
    // if (req.musicSession){
    //     if (req.musicSession.sign&&req.musicSession.user) {
    //         return next()
    //     }else{
    //         User.findOne({userName:'ziiter'})
    //             .populate('sheets')
    //             .exec((err,doc)=>{
    //                 if (err) {res.status(403);res.send(err)}
    //                 if (doc) {
    //                     req.musicSession.user = doc;
    //                     req.musicSession.sign = true;
    //                     return next();
    //                 }
    //             })
    //     }
    // }else{
    //     res.send({message:'false'});
    //     return next(false);
    // }
}
function AllowOrigin(req,res,next) {
    res.header('Access-Control-Allow-Credentials',true);
    res.header('access-Control-Allow-Origin',"*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    return next();
}

/*
*  搜索
*  /search?keywords=''
*  GET
*/
server.get('/search',(req,res)=>{
    const cookie = req.header("Cookie") ? req.header("Cookie") : "";
    const keywords = req.query.keywords;
    const type = req.query.type || 1;
    const limit = req.query.limit || 10;
    const offset = req.query.offset || 0;
    const data = {
        csrf_token: "",
        limit,
        type,
        s: keywords,
        offset
    };
    createWebAPIRequest(
        "music.163.com",
        "/weapi/search/get",
        "POST",
        data,
        cookie,
        music_req => {
            res.send(JSON.parse(music_req).result.songs);
        },
        err => {res.status(502);res.send(err)}
    );
});

/*
 *  搜索歌词
 *  /lyric?id=''
 *  GET
 */
server.get('/lyric',(req,res)=>{
    if (req.query.id&&req.query.id != 0){
        const cookie = req.header('Cookie') ? req.header('Cookie') : '';
        const data = {};
        const id = req.query.id;
        createWebAPIRequest(
            'music.163.com',
            '/weapi/song/lyric?os=osx&id=' + id + '&lv=-1&kv=-1&tv=-1',
            'POST',
            data,
            cookie,
            music_req => {
                res.send({lyric:JSON.parse(music_req).lrc.lyric})
            },
            err => {res.status(502);res.send(err)}
        )
    }else {
        res.status(403);res.send({message: 'failed to request'})
    }

});

/*
 *  搜索歌曲url
 *  /musicUrl?id=''
 *  GET
 */
server.get('/musicUrl',(req,res)=>{
    const cookie = req.header('Cookie') ? req.header('Cookie') : '';
    const id = req.query.id;
    const br = req.query.br || 999000;
    const data = {
        ids: [id],
        br: br,
        csrf_token: ''
    };
    createWebAPIRequest(
        'music.163.com',
        '/weapi/song/enhance/player/url',
        'POST',
        data,
        cookie,
        music_req => {
            res.send(JSON.parse(music_req).data[0])
        },
        err => {res.status(502);res.send(err)}
    )
});

/*
 *  用户注册
 *  /user/register "name=''&&password=''&&email=''"
 *  POST
 */
server.post('/user/register', (req, res, next)=> {
    let newUser=new User({
        userName:req.body.name,
        password:req.body.password,
        email:req.body.email,
        sex:req.body.sex || 'male'
    });
    newUser.save((err,doc)=>{
        if(err) res.send(err);
        if(doc){
            User.findOne({_id:doc._id})
                .populate('sheets')
                .exec((err,doc)=>{
                    if (err) {res.status(402);res.send(err);}
                    if (doc){
                        req.musicSession.user=doc;
                        req.musicSession.sign=true;
                        let user={
                            userName:doc.userName,
                            email:doc.email,
                            sex:doc.sex,
                            createTime:doc.createTime,
                            sheets:doc.sheets,
                            loveSheets:doc.loveSheets
                        };
                        res.send(user);
                    }else {
                        res.status(403);res.send({messages:'未知错误'})
                    }
                });
        }else {
            res.send({message:'false'});
        }
    })
});

/*
 *  用户登录
 *  /user/login "name=''&password=''"
 *  POST
 */
server.post('/user/login', (req, res, next)=> {
    User.findOne({userName:req.body.name})
        .populate('sheets')
        .exec((err,doc)=>{
            if(err) res.send(err);
            if(doc){
                if(doc.password==req.body.password){
                    req.musicSession.user=doc;
                    req.musicSession.sign=true;
                    let user={
                        userName:doc.userName,
                        headUrl:doc.headUrl,
                        email:doc.email,
                        sex:doc.sex,
                        sheets:doc.sheets,
                        loveSheets:doc.loveSheets
                    };
                    res.send(user);
                }else{
                    res.send({message:'false'});
                }
            }else{
                res.send({message:'false'});
            }
        })
});
/*
 *  退出登录
 *  /user/login
 *  get
 */
server.get('/user/login', (req, res, next)=> {
    req.musicSession.user = null;
    req.musicSession.sign = false;
    res.send({message:'ok'});
});
/*
 *  检测用户名是否存在
 *  /user/username?name=''
 *  GET
 */
server.get('/user/name',(req,res,next)=>{
    User.findOne({userName:req.query.username},(err,doc)=>{
        if (err) res.send(err);
        if (doc){
            res.send({message:'false'});
        }else{
            res.send(true);
        }
    })
});
/*
 *  获取用户信息
 *  /user/user
 *  GET
 */
server.get('/user/user',loginMessage,(req,res,next)=>{
    User.findOne({_id:req.musicSession.user._id})
        .populate('sheets')
        .exec((err,doc)=>{
            if (err) {res.status(402);res.send(err);}
            if (doc){
                let user={
                    userName:doc.userName,
                    email:doc.email,
                    sex:doc.sex,
                    createTime:doc.createTime,
                    sheets:doc.sheets,
                    loveSheets:doc.loveSheets
                };
                res.send(user);
            }else {
                res.status(403);res.send({messages:'未知错误'})
            }
        })
});
/*
*   获取歌单
*   /sheet
*   GET
*/
server.get('/sheet',loginMessage,(req,res,next) => {
    res.send(req.musicSession.user.sheets);
});
/*
*   获取歌单中的歌曲
*   /sheet
*   GET
*/
server.get('/song',loginMessage,(req, res, next)=>{
    Sheet
        .findOne({_id:req.query.id})
        .populate('songs')
        .exec((err,doc)=>{
            if (err) {res.status(402);res.send(err)}
            if (doc) {
                res.send(doc);
            }else {
                res.status(403);
                res.send({message: '未知错误'});
            }
        })

});
/*
*   新建歌单
*   /sheet
*   POST
*/
server.post('/sheet',loginMessage,(req, res, next)=>{
    let newSheet= new Sheet({
        sheetName: req.body.sheetName,
        orderUser: [req.musicSession.user.userName],
    });
    newSheet.save((err,doc)=>{
        if (err) {res.status(502);res.send(err)}
        if (doc){
            User.findOne({_id:req.musicSession.user._id},(err, user)=>{
                if (err) {res.status(402);res.send(err)}
                if (user){
                    user.sheets.push(doc._id);
                    user.save(function (err,doc) {
                        if (err) {res.status(402);res.send(err)}
                        if (doc) {
                            User.findOne({_id:req.musicSession.user._id})
                                .populate('sheets')
                                .exec((err,doc)=>{
                                    if (err) res.send(err);
                                    if (doc){
                                        req.musicSession.user = doc;
                                        let user={
                                            userName:doc.userName,
                                            email:doc.email,
                                            sex:doc.sex,
                                            createTime:doc.createTime,
                                            sheets:doc.sheets,
                                            loveSheets:doc.loveSheets
                                        };
                                        res.send(user.sheets);
                                    }
                                })
                        }else {
                            res.status(402);res.send({message: '未知错误'})
                        }
                    })
                }else {
                    res.status(402);res.send({message: '未知错误'})
                }
            })
        }else{
            res.status(402);res.send({message: '未知错误'})
        }
    })
});
/*
*   更新歌单
*   /sheet
*   PUT
*/
server.put('/sheet',loginMessage,(req, res, next)=>{
    Song.findOne({cloudMusicId:req.body.song.cloudMusicId},(err,doc)=>{
        if (err) {res.status(502);res.send(err)}
        if (doc) {
            Sheet.findOne({_id: req.body.sheet_id},(err,sheet)=> {
                if (err) {res.status(502);res.send(err)}
                if (sheet){
                    if (sheet.songs.includes(doc._id)){
                        res.status(403);
                        res.send({message:'歌曲已存在歌单中'})
                    } else {
                        sheet.songs.push(doc._id);
                        sheet.songNum++;
                        sheet.save((err,doc)=>{
                            if (err) {res.status(402);res.send(err);}
                            if (doc) {
                                async.mapSeries(req.musicSession.user.sheets,(sheet,cb)=>{
                                    if (sheet._id == doc._id){
                                        Sheet.findOne({_id:doc._id})
                                            .populate('songs')
                                            .exec((err,doc)=>{
                                                if (err) {res.status(403);res.send(err)}
                                                if (doc) {
                                                    cb(null,doc);
                                                } else {
                                                    res.status(403);
                                                    res.send({messages:"未知错误"})
                                                }
                                            })
                                    }else{
                                        cb(null,sheet);
                                    }
                                },(err,result)=>{
                                    req.musicSession.user.sheets=result;
                                    console.log(typeof result,"1");
                                    res.send(result);
                                });
                            }
                        })
                    }
                }else{
                    res.status(402);res.send(err);
                }
            });
        }else {
            const song = new Song({
                songName: req.body.song.songName,
                author: req.body.song.author,
                url: req.body.song.url,
                cloudMusicId: req.body.song.cloudMusicId
            });
            song.save((err,doc)=>{
                if(err) {res.status(402);res.send(err)}
                if (doc) {
                    Sheet.findOne({_id: req.body.sheet_id},(err,sheet)=> {
                        if (err) {res.status(502);res.send(err)}
                        if (sheet){
                            sheet.songs.push(doc._id);
                            sheet.songNum++;
                            sheet.save((err,doc)=>{
                                if (err) {res.status(402);res.send(err);}
                                if (doc) {
                                    async.mapSeries(req.musicSession.user.sheets,(sheet,cb)=>{
                                        if (sheet._id == doc._id){
                                            Sheet.findOne({_id:doc._id})
                                                .populate('songs')
                                                .exec((err,doc)=>{
                                                    if (err) {res.status(403);res.send(err)}
                                                    if (doc) {
                                                        cb(null,doc);
                                                    } else {
                                                        res.status(403);
                                                        res.send({messages:"未知错误"})
                                                    }
                                                })
                                        }else{
                                            cb(null,sheet);
                                        }
                                    },(err,result)=>{
                                        req.musicSession.user.sheets=result;
                                        console.log(typeof result,"2");
                                        res.send(result);
                                    });
                                }
                            })
                        }else{
                            res.status(402);res.send(err);
                        }
                    });
                }else{
                    res.status(402);res.send({message:"未知错误"});
                }
            });
        }
    })
});
/*
*   获取收藏歌单
*   /loveSheet
*   GET
*/
server.get('/loveSheet',loginMessage,(req, res, next)=>{
    async.mapSeries(req.musicSession.user.loveSheets,(sheet,callback)=>{
        Sheet
            .findOne({_id:sheet})
            .populate('songs')
            .exec((err,doc)=>{
                if (err) callback(err);
                if (doc) callback(null,doc)
            })
    },(err,sheets)=>{
        if (err) res.send(err);
        if (sheets) res.send(sheets);
    });
});
/*
*   获取歌曲评论信息
*   /comment/song?song_id=''
*   GET
* */
server.get('/comment/song',(req, res, next)=>{
    Comment.find({song_id:req.query.song_id},(err,doc)=>{
        if (err) res.send(err);
        if (doc) {
            res.send(doc)
        }
    })
});
/*
*   获取歌单评论信息
*   /comment/sheet?sheet_id=''
*   GET
* */
server.get('/comment/sheet',(req,res,next)=>{
    Comment.find({sheet_id:req.query.sheet_id},(err,doc)=>{
        if (err) res.send(err);
        if (doc) res.send(doc);
    })
});
/*
*   获取推荐歌曲
*   /recommend
*   GET
* */
server.get('/recommend',(req, res, next)=>{
    Sheet.findOne({sheetName:"系统推荐歌单"})
        .populate('songs')
        .exec((err,doc)=>{
            if (err) {res.status(403);res.send(err)}
            if (doc) {
                res.send(doc)
            }else {
                res.status(403);
                res.send({message:'未找到资源'})
            }
        })
});
//启动server part:3000
server.listen(3000,()=>{
    console.log('%s listening at %s',server.name,server.url);
});

