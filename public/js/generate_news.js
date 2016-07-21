/**
 * Created by edmond.o.flynn on 12/07/2016.
 */
var URL = 'http://www.glassbyte.com/neurobranch_mock_data/front_news.json';
var LOCAL_URL = 'data/front_news.json';

var getElementsPerRow = function (size) {
    return 12 / size;
};

function getColSize() {
    var width = window.screen.availWidth;

    if(width >= 2560) {
        return 4;
    } else if(width >= 1920 && width < 2560) {
        return 4;
    } else if(width >= 1366 && width < 1920) {
        return 4;
    } else if(width >= 768 && width < 1366) {
        return 6;
    } else {
        return 12;
    }
}

function generateRow(rowId) {
    var row = '<div id="' + rowId + '" class="row flex-row"></div>';
    $("#front-news-grid").append(row);
}

function generateTile(title, desc, imageUrl, id, rowId) {
    var tile =
        '<div class="col-md-' + getColSize() + '" id="' + id + '">' +
        '<div class="thumbnail">' +
        '<img src="' + imageUrl + '">' +
        '<div class="caption">' +
        '<h4>' + title + '</h4>' +
        '<p>' + desc + '</p>' +
        '</div>' +
        '</div>' +
        '</div>';
    $("#" + rowId).append(tile);
}

var getData =  function(data) {
    $.ajax({
        url: LOCAL_URL,
        data: data,
        type: "GET",
        dataType: "json"
    })
        .done(function(data){
            console.log(data);
            var rowId = 0;
            for (var i = 0; i < data.length; i++) {
                if (i % (getElementsPerRow(getColSize())) == 0) {
                    ++rowId;
                }
                generateRow(rowId);
                generateTile(data[i]['headline'], data[i]['description'], 'http://placehold.it/500x250/EEE', data[i]['_id'], rowId);
            }
        });
};

getData();