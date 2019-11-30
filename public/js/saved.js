var arrSavedArticles = [];
var currentArticle;
var currentNote;

$(document).ready(function () {
    $.ajax({
        type: 'get',
        url: '/api/saved'
    }).then(data => {
        arrSavedArticles = data.arrSavedArticles;
        if (arrSavedArticles.length !== 0) {
            renderSavedArticles(arrSavedArticles, $('#savedArticles'));
        } else {
            $('#labelSavedArticlesDefault').text('Save some articles');
        }
    });
});

function renderSavedArticles(arrArticles, target) {
    target.empty();

    arrArticles.forEach((curr, i, arr) => {
        var row = $(`
            <div class="d-flex border-bottom py-2">
                <div class="flex-grow-1 flex-shrink-1 row align-items-start">
                    <div class="col">
                        <div class="row">
                            <div class="col-12 col-xl-8">
                                <p class="mb-0 text-muted">r/webdev</p>
                                <p class="mb-0"><b>${curr.title}</b></p>
                            </div>
                            <div class="col-12 col-xl-4">
                                <p class="mb-0 text-muted">${curr.author}</p>
                            </div>
                        </div>
                    </div>
                    <div style="flex: 0 0 75px;">
                        <a href="${curr.href}" target="_blank">open</a>
                    </div>
                </div>


                <div class="d-flex align-items-center mr-3" style="flex: 0 0 10px;">
                    <div class="dropdown">
                        <button class="btn d-flex align-items-center px-0" id="dropdownMenuButton"
                            data-toggle="dropdown">
                            <i class="material-icons" style="font-size: 1.35rem;">more_vert</i>
                        </button>
                        <div class="dropdown-menu dropdown-menu-right">
                            <button class="dropdown-item buttonDeleteArticle">Delete</button>
                        </div>
                    </div>
                </div>
                <div class="d-flex align-items-center">
                    <button class="btn btn-block btn-primary d-flex align-items-center px-2 buttonViewNotes">
                        <i class="material-icons" style="font-size: 1.35rem;">speaker_notes</i>
                    </button>
                </div>
            </div>
        `);
        target.append(row);

        row.find('.buttonDeleteArticle').on('click', function () {
            currentArticle = undefined;
            $('#notes-container').addClass('d-none');
            $.ajax({
                type: 'delete',
                url: '/api/saved/article/delete/' + i
            }).then(data => {
                $('#savedArticles').empty();
                $('#notesList').empty();
                arrSavedArticles = data.arrSavedArticles;
                if (arrSavedArticles.length !== 0) {
                    renderSavedArticles(arrSavedArticles, $('#savedArticles'));
                } else {
                    $('#savedArticles').append(`<p id="labelSavedArticlesDefault" class="m-0 my-3 text-center text-muted">Save some articles</p>`);
                }
            });
        });

        row.find('.buttonViewNotes').on('click', function () {
            currentArticle = curr;
            $('#notes-container').removeClass('d-none');
            renderArticlesNotes(curr.notes, $('#notesList'));
        });
    });
}

$('#note-modal').on('show.bs.modal', function (e) {
    if ($(e.relatedTarget).hasClass('buttonCreateNote')) {
        $(this).find('#labelCreateNote').removeClass('d-none');
        $(this).find('#labelEditNote').addClass('d-none');
        $(this).find('#buttonSaveNoteCreate').removeClass('d-none');
        $(this).find('#buttonSaveNoteEdit').addClass('d-none');
    }
    if ($(e.relatedTarget).hasClass('buttonEditNote')) {
        $(this).find('#labelCreateNote').addClass('d-none');
        $(this).find('#labelEditNote').removeClass('d-none');
        $(this).find('#buttonSaveNoteCreate').addClass('d-none');
        $(this).find('#buttonSaveNoteEdit').removeClass('d-none');
    }
});
$('#note-modal').on('hidden.bs.modal', function (e) {
    $('#noteTitle').val('');
    $('#noteBody').val('');
});

$('#buttonSaveNoteCreate').on('click', function () {
    var title = $('#noteTitle').val().trim();
    var body = $('#noteBody').val().trim();
    if (title.length !== 0 && body.length !== 0) {
        console.log(currentArticle, 'create');
        if (currentArticle) {
            $('#buttonSaveNoteCreate').attr('disabled', true);
            let currentArticleIndex = arrSavedArticles.indexOf(currentArticle);
            let noteObj = {
                title: title,
                body: body
            }
            $.ajax({
                type: 'post',
                url: '/api/saved/note/create/' + currentArticleIndex,
                data: noteObj
            }).then(data => {
                $('#buttonSaveNoteCreate').attr('disabled', false);
            });
            arrSavedArticles[currentArticleIndex].notes.push(noteObj);
            $('#note-modal').modal('hide');
            renderArticlesNotes(arrSavedArticles[currentArticleIndex].notes, $('#notesList'))
        }
    }
});
$('#buttonSaveNoteEdit').on('click', function () {
    var title = $('#noteTitle').val().trim();
    var body = $('#noteBody').val().trim();
    if (title.length !== 0 && body.length !== 0) {
        // console.log(currentArticle, 'update');
        if (currentArticle && currentNote) {
            let currentArticleIndex = arrSavedArticles.indexOf(currentArticle);
            let currentNoteIndex = arrSavedArticles[currentArticleIndex].notes.indexOf(currentNote);

            arrSavedArticles[currentArticleIndex].notes[currentNoteIndex] = {
                title: title,
                body: body
            }
            $('#note-modal').modal('hide');
            currentNote = undefined;

            renderArticlesNotes(arrSavedArticles[currentArticleIndex].notes, $('#notesList'));
        }
    }
});


function renderArticlesNotes(arrNotes, target) {

    target.empty();
    if (arrNotes.length > 0) {
        arrNotes.forEach((curr, i, arr) => {
            var noteRow = $(`
                <div class="border p-3 mb-3 bg-white">
                    <div class="row">
                        <div class="col">
                            <h6 class="pt-2">${curr.title}</h6>
                            <p class="mb-0">${curr.body}</p>
                        </div>
                        <div class="col flex-grow-0 flex-shrink-0 d-flex align-items-start flex-nowrap">
                            <div class="dropdown mr-2">
                                <button class="btn d-flex align-items-center px-0" id="dropdownMenuButton"
                                    data-toggle="dropdown">
                                    <i class="material-icons" style="font-size: 1.35rem;">more_vert</i>
                                </button>
                                <div class="dropdown-menu dropdown-menu-right">
                                    <button class="dropdown-item buttonDeleteNote">Delete</button>
                                </div>
                            </div>
                            <button class="btn btn-warning px-2 d-flex align-items-center buttonEditNote"
                                data-toggle="modal" data-target="#note-modal">
                                <i class="material-icons" style="font-size: 1.35rem;">edit</i>
                            </button>
                        </div>
                    </div>
                </div>
            `);
            target.append(noteRow);

            noteRow.find('.buttonEditNote').on('click', function () {
                $('#note-modal').find('#noteTitle').val(curr.title);
                $('#note-modal').find('#noteBody').val(curr.body);
                currentNote = curr;
            });
            noteRow.find('.buttonDeleteNote').on('click', function () {
                arr.splice(i, 1);
                renderArticlesNotes(arr, $('#notesList'));
            });
        });
    } else {
        target.append(`<p class="m-0 my-3 text-center text-muted">Add some notes</p>`);
    }
}