const axios = require('axios');
const cheerio = require('cheerio');
const moment = require('moment');
const db = require('../models');


const arrCategory = ["r/webdev/", "r/learnprogramming/", "r/reactjs"];
var category = arrCategory[0];
var arrTempArticles = [];
// var arrTempArticles = [
//     {
//         category: arrCategory[0],
//         title: "webdev1",
//         author: "author 1",
//         href: "asdf1234"
//     },
//     {
//         category: arrCategory[0],
//         title: "webdev2",
//         author: "author 2",
//         href: "qcqcqcq"
//     },
//     {
//         category: arrCategory[0],
//         title: "webdev3",
//         author: "author 3",
//         href: "eeee"
//     }
// ];
var arrSavedArticles = [];
// var arrSavedArticles = [
//     {
//         articleCategory: arrCategory[0],
//         title: "webdev3",
//         author: "author 3",
//         href: "eeee",
//         notes: [
//             {
//                 title: 'note 1',
//                 body: 'contents of note 1'
//             },
//             {
//                 title: 'note 2',
//                 body: 'contents of note 2'
//             }
//         ]
//     }
// ];

var scrapeTime;


module.exports = function (app) {
    app.get('/api/index', function (req, res) {
        db.Articles.find({}).then(function (dbArticles) {
            res.json({
                arrTempArticles: arrTempArticles,
                arrSavedArticles: dbArticles,
                arrCategory: arrCategory,
                category: category,
                scrapeTime: scrapeTime ? "Last Scraped: " + scrapeTime.format('DD MMM YYYY HH:mm:ss') : 'Never'
            });
        })
    });


    app.post('/api/index/scrape', function (req, res) {
        category = req.body.category;
        scrapeTime = new moment();

        axios.get('https://www.reddit.com/' + category)
            .then(function (response) {
                var $ = cheerio.load(response.data);
                var container = $('.rpBJOHq2PR60pnwJlUyP0');
                var tempArr = [];
                container.children().each(function (i, element) {
                    var contents = $(element).children().children().find('._1poyrkZ7g36PawDueRza-J._11R7M_VOgKO1RJyRSRErT3');
                    if (contents.find('._2mHuuvyV9doV3zwbZPtIPG').text().length === 0) {
                        return;
                    } else {
                        let title = contents.find('._eYtD2XCVieq6emjKBH3m').text();
                        let author = contents.find('._2mHuuvyV9doV3zwbZPtIPG').text();
                        let href = "https://www.reddit.com" + contents.find('.SQnoC3ObvgnGjWt90zD9Z._2INHSNB8V5eaWp4P0rY_mE').attr('href');
                        tempArr.push({
                            category: category,
                            title: title,
                            author: author,
                            href: href
                        });
                    }
                });
                arrTempArticles = tempArr;

            })
            .catch(function (error) {
                console.log(error);
            })
            .finally(function () {
                res.json({
                    arrTempArticles: arrTempArticles,
                    arrCategory: arrCategory,
                    category: category,
                    scrapeTime: scrapeTime ? "Last Scraped: " + scrapeTime.format('DD MMM YYYY HH:mm:ss') : 'Never'
                });
            });
    });


    app.post('/api/index/save', function (req, res) {
        req.body.notes = [];
        db.Articles.create(req.body).then(function (dbArticle) {
            res.json({
                status: "success",
                savedArticle: dbArticle
            });
        })
            .catch(function (err) {
                console.log(err.message);
            });
    });

    ///////////////////////////////////////////////
    ///////////////////////////////////////////////
    ///////////////////////////////////////////////

    app.get('/api/saved', function (req, res) {
        db.Articles.find({}).populate("notes")
            .then(function (dbArticles) {
                res.json({
                    arrSavedArticles: dbArticles
                });
            })
            .catch(function (err) {
                console.log(err);
            });
    });

    app.delete('/api/saved/article/delete/:articleid', function (req, res) {
        db.Articles.deleteOne({ _id: req.params.articleid }).then(function (result) {
            res.json({
                status: "success",
                deletedArticle: req.params.articleid
            });
        }).catch(function (err) {
            console.log(err);
        })
    });

    app.post('/api/saved/note/create/:articleid', function (req, res) {
        var note = {
            title: req.body.title,
            body: req.body.body
        }
        db.Notes.create(note)
            .then(function (dbNote) {
                return db.Articles.findOneAndUpdate({ _id: req.body._id }, { $push: { notes: dbNote._id } }, { new: true });
            })
            .then(function (dbNote) {
                res.json({
                    status: "success"
                });
            })
            .catch(function (err) {
                res.json(err);
            });
    });
    app.put('/api/saved/note/update/:articleid/:noteid', function (req, res) {
        var note = {
            title: req.body.title,
            body: req.body.body
        }
        db.Notes.findOneAndUpdate({ _id: req.params.noteid }, note)
            .then(function (dbNote) {
                res.json({
                    arrSavedArticles: arrSavedArticles
                });
            })
            .catch(function (err) {
                res.json(err);
            });
    });
    app.delete('/api/saved/note/delete/:articleid/:noteid', function (req, res) {
        db.Notes.remove({_id: req.params.noteid}).then(function(result) {
            db.Articles.findOneAndUpdate({_id: req.params.articleid},  { $pull: { notes: req.params.noteid}}).then(function(result) {
                console.log(result);
            }).catch(function(err) {
                console.log(err);
            });
    
        }).catch(function(err) {
            console.log(err);
        });
    });
}