const loadLocalMusic=require('./loadLocalMusic');
const Sheet=require('../model/sheet');

function createRecommend(){
    loadLocalMusic((err,docs)=>{
        if (err) console.log(err);
        if (docs) {
            let songs=[];
            docs.map((doc)=>{
                songs.push(doc._id);
            });
            let sheet=new Sheet({
                sheetName: '系统推荐歌单',
                songNum: docs.length,
                orderUser: ['system'],
                songs:songs
            });
            sheet.save((err, doc)=> {
                if (err) console.log(err);
                if (doc) console.log(doc);
            })
        }

    });
}
createRecommend();