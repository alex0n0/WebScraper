const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const exphbs = require('express-handlebars');
const moment = require('moment');
const app = express();

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');



app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());



const arrCategory = ["r/webdev/", "r/learnprogramming/", "r/reactjs"];
var category = arrCategory[0];
// var arrTempArticles = [];
var arrTempArticles = [
    {
        category: arrCategory[0],
        title: "webdev1",
        author: "author 1",
        href: "asdf1234"
    },
    {
        category: arrCategory[0],
        title: "webdev2",
        author: "author 2",
        href: "qcqcqcq"
    },
    {
        category: arrCategory[0],
        title: "webdev3",
        author: "author 3",
        href: "eeee"
    }
];
// var arrSavedArticles = [];
var arrSavedArticles = [
    {
        articleCategory: arrCategory[0],
        title: "webdev3",
        author: "author 3",
        href: "eeee",
        notes: [
            {
                title: 'note 1',
                body: 'contents of note 1'
            },
            {
                title: 'note 2',
                body: 'contents of note 2'
            }
        ]
    }
];

var scrapeTime;


app.get('/api/index', function (req, res) {
    res.json({
        arrTempArticles: arrTempArticles,
        arrSavedArticles: arrSavedArticles,
        arrCategory: arrCategory,
        category: category,
        scrapeTime: scrapeTime ? "Last Scraped: " + scrapeTime.format('DD MMM YYYY HH:mm:ss') : 'Never'
    });
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
                    //user
                    let title = contents.find('._eYtD2XCVieq6emjKBH3m').text();
                    //title
                    let author = contents.find('._2mHuuvyV9doV3zwbZPtIPG').text();
                    //href
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
            // handle error
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
    arrSavedArticles.push(req.body);
    console.log(req.body);
    res.json({
        status: "ok",
        arrSavedArticles: arrSavedArticles
    });
});

app.get('/api/saved', function (req, res) {
    res.json({
        arrSavedArticles: arrSavedArticles
    });
});

app.delete('/api/saved/article/delete/:articleid', function (req, res) {
    arrSavedArticles.splice(req.params.articleid, 1);
    res.json({
        arrSavedArticles: arrSavedArticles
    });
});

app.post('/api/saved/note/create/:articleid', function (req, res) {
    arrSavedArticles[req.params.articleid].notes.push(req.body);
    res.json({
        arrSavedArticles: arrSavedArticles
    });
});
app.put('/api/saved/note/update/:articleid/:noteid', function (req, res) {
    arrSavedArticles[req.params.articleid].notes[req.params.noteid] = req.body;
    res.json({
        arrSavedArticles: arrSavedArticles
    });
});

/**
 * render route -> give the page
 * 
 * INDEX PAGE
 * get temp articles (from array)
 * get all saved articles (from db)
 * get categories (from variable)
 *     disable articles where appropriate
 * 
 * 
 * 
 * INDEX PAGE SCRAPE
 * server does scrape and put into temp articles
 * 
 * INDEX PAGE ADD
 * add, disable button
 * 
 * 
 * 
 * 
 * SAVED PAGE
 * get saved articles AND NOTES
 * 
 * view notes
 * add notes
 * edit notes
 * 
 * 
 */


require('./routes/api-routes')(app);





var PORT = process.env.PORT || 5000;
var server = app.listen(PORT, function () {
    console.log('server on port', PORT);
});