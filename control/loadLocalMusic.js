/**
 * Created by lenovo on 2017/8/20.
 */
const fs=require('fs');
const path=require('path');
const media=path.join(__dirname,'../public/music');
const song=require('../model/song');
const singer=require('../model/singer');
const async=require('async');

function loadLocalMusic(cb) {
    fs.readdir(media,function (err,dirs) {
        if (err){
            return console.log(err);
        }
        async.mapSeries(dirs,function (dir,callback) {
            var s=dir.split('-');
            var musicInfo={
                musicName:'',
                musicAuthor:'',
                musicUrl:''
            };
            musicInfo.musicName=s[0];
            musicInfo.musicUrl='/music/'+dir;
            let musicAuthors=s[1].split('.')[0];
            if (musicAuthors.includes('、')){
                musicInfo.musicAuthor=musicAuthors.split('、');
                async.mapSeries(musicInfo.musicAuthor,function(author){
                    singer.findOne({singerName:author},function(err,singers){
                        if (err) callback(err);
                        if (singers){
                            song.findOne({songName:musicInfo.musicName},function (err,doc) {
                                if (err){
                                    callback(err);
                                }
                                if (!doc){
                                    let Song=new song({
                                        songName:musicInfo.musicName,
                                        author:musicInfo.musicAuthor,
                                        url:musicInfo.musicUrl
                                    });
                                    Song.save(function(err,doc){
                                        if (err) callback(err);
                                        if (doc) {
                                            singers.songs.push(doc._id);
                                            singers.songNum++;
                                            singers.save(function (err) {
                                                if (err) callback(err)
                                            });
                                            callback(null,doc);
                                        }
                                    })
                                }else {
                                    callback(null,doc);
                                }
                            })
                        }else{
                            let Song=new song({
                                songName:musicInfo.musicName,
                                author:musicInfo.musicAuthor,
                                url:musicInfo.musicUrl
                            });
                            Song.save(function(err,doc){
                                if (err) callback(err);
                                if (doc) {
                                    var songArray=[doc._id];
                                    let Singer=new singer({
                                        singerName:author,
                                        songs:songArray,
                                        songNum:1
                                    });
                                    Singer.save(function (err) {
                                        if (err) callback(err)
                                    });
                                    callback(null,doc);
                                }
                            })
                        }
                    })
                })
            }else{
                musicInfo.musicAuthor=musicAuthors;
                singer.findOne({singerName:musicInfo.musicAuthor},function(err,singers){
                    if (err) callback(err);
                    if (singers){
                        song.findOne({songName:musicInfo.musicName},function (err,doc) {
                            if (err){
                                callback(err);
                            }
                            if (!doc){
                                var author=[musicInfo.musicAuthor];
                                let Song=new song({
                                    songName:musicInfo.musicName,
                                    author:author,
                                    url:musicInfo.musicUrl
                                });
                                Song.save(function(err,doc){
                                    if (err) callback(err);
                                    if (doc) {
                                        singers.songs.push(doc._id);
                                        singers.songNum++;
                                        singers.save(function (err) {
                                            if (err) callback(err)
                                        });
                                    }
                                    callback(null,doc);
                                })
                            }else {
                                callback(null,doc);
                            }
                        })
                    }else{
                        let Song=new song({
                            songName:musicInfo.musicName,
                            author:musicInfo.musicAuthor,
                            url:musicInfo.musicUrl
                        });
                        Song.save(function(err,doc){
                            if (err) callback(err);
                            if (doc) {
                                var songArray=[doc._id];
                                let Singer=new singer({
                                    singerName:musicInfo.musicAuthor,
                                    songs:songArray,
                                    songNum:1
                                });
                                Singer.save(function (err) {
                                    if (err) callback(err)
                                });
                                callback(null,doc)
                            }
                        })
                    }
                })
            }
        },function (err,results) {
            if (err){
                cb(err,null)
            }else if(results){
                cb(null,results)
            }else {
                cb(null,null);
            }
        })
    });
}

module.exports=loadLocalMusic;