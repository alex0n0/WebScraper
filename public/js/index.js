var arrTempArticles;
var arrSavedArticles;
var arrCategory;
var category;
var scrapeTime;

$(document).ready(function () {


    $.ajax({
        type: 'get',
        url: '/api/index'
    }).then(data => {
        console.log(data);

        arrTempArticles = data.arrTempArticles;
        arrSavedArticles = data.arrSavedArticles;
        arrCategory = data.arrCategory;
        category = data.category;
        scrapeTime = data.scrapeTime;
        $('#labelCategory').text(category);
        $('#labelScrapedDateTime').html(scrapeTime);
        if (arrTempArticles.length !== 0) {
            renderScrapedArticles(arrTempArticles, $('#scrapedArticles'));
        } else {
            $('#labelScrapedArticlesDefault').text('Scrape some articles');
        }
        if (arrSavedArticles.length !== 0) {
            renderSavedArticles(arrSavedArticles, $('#savedArticles'));
        } else {
            $('#labelSavedArticlesDefault').text('Save some articles');
        }

        arrCategory.forEach(curr => {
            $('#selectCategory').append(`
                <option value="${curr}" ${curr === category ? "selected" : ""}>${curr}</option>
            `);
        });
    });

    $('#buttonScrape').on('click', function () {
        $('#buttonScrape').attr('disabled', true);
        category = $('#selectCategory').val();
        $.ajax({
            type: 'post',
            url: '/api/index/scrape',
            data: { category: category }
        }).then(data => {
            $('#buttonScrape').attr('disabled', false);
            arrTempArticles = data.arrTempArticles;
            arrCategory = data.arrCategory;
            category = data.category;
            scrapeTime = data.scrapeTime;
            $('#labelCategory').text(category);
            $('#labelScrapedDateTime').html(scrapeTime);
            if (arrTempArticles.length !== 0) {
                renderScrapedArticles(arrTempArticles, $('#scrapedArticles'));
            }
        });
    });
});

function renderScrapedArticles(arrArticles, target) {
    target.empty();
    arrArticles.forEach(curr => {
        var foundElement = arrSavedArticles.find(function(article) {
            return article.href === curr.href;
        });
        var row = $(`
            <div class="d-flex border-bottom py-2">
                <div class="flex-grow-1 flex-shrink-1 row align-items-start">
                    <div class="col">
                        <div class="row">
                            <div class="col-12 col-md-8">
                                <p class="mb-0 labelArticleTitle"><b>${curr.title}</b></p>
                            </div>
                            <div class="col-12 col-md-4">
                                <p class="mb-0 text-muted text-truncate labelArticleAuthor">${curr.author}</p>
                            </div>
                        </div>
                    </div>
                    <div style="flex: 0 0 75px;">
                        <a class="labelArticleHref" href="${curr.href}" target="_blank">open</a>
                    </div>
                </div>
                <div class="d-flex align-items-center" style="flex: 0 0 75px;">
                    <button class="btn btn-block btn-success buttonSaveArticle text-truncate" ${foundElement ? "disabled" : ""}>${foundElement ? "SAVED" : "SAVE"}</button>
                </div>
            </div>
        `);
        target.append(row);
        row.find('.buttonSaveArticle').on('click', function () {

            $(this).attr('disabled', true);
            var articleData = {
                articleCategory: category,
                title: $(this).parent().parent().find('.labelArticleTitle').text(),
                author: $(this).parent().parent().find('.labelArticleAuthor').text(),
                href: $(this).parent().parent().find('.labelArticleHref').attr('href')
            }
            $.ajax({
                type: 'post',
                url: '/api/index/save',
                data: articleData
            }).then(data => {
                arrSavedArticles.push(data.savedArticle);
                if (arrSavedArticles.length !== 0) {
                    renderSavedArticles(arrSavedArticles, $('#savedArticles'));
                    renderScrapedArticles(arrTempArticles, $('#scrapedArticles'));
                }
            });
        });
    });
}


function renderSavedArticles(arrArticles, target) {
    target.empty();
    let index = arrArticles.length - 1;
    let count = arrArticles.length <= 5 ? arrArticles.length : 5;
    for (let i = 0; i < count; i++, index--) {
        target.append(`
            <div class="mb-2 border py-1 px-2">
                <p class="small text-muted mb-0">${arrArticles[index].articleCategory}</p>
                <div class="d-flex">
                    <p class="mb-0 mr-auto">${arrArticles[index].title}</p>
                    <a href="${arrArticles[index].href}" target="_blank">open</a>
                </div>
            </div>
        `);
    };
}