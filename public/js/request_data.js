/**
 * Created by edmond.o.flynn on 12/07/2016.
 */
let URL = 'http://www.glassbyte.com/neurobranch_mock_data/trials.json';
let LOCAL_URL = 'data/trials.json';

var getElementsPerRow = function (size) {
    return 12 / size;
};

var getColSize = function () {
    var width = window.screen.availWidth;
    var height = window.screen.availHeight;
    console.log(width + ", " + height);

    if (width >= 2560) {
        return 2;
    } else if (width >= 1920 && width < 2560) {
        return 3;
    } else if (width >= 1366 && width < 1920) {
        return 4;
    } else if (width >= 768 && width < 1366) {
        return 6;
    } else {
        return 12;
    }
};

var generateRow = function (rowId) {
    var row = '<div id="' + rowId + '" class="row flex-row"></div>';
    $("#dashboard-content-holder").append(row);
};

var generateTile = function (title, desc, imageUrl, id, rowId) {
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
};

var getData = function (data) {
    $.ajax({
        url: LOCAL_URL,
        data: data,
        type: "GET",
        dataType: "json"
    })
        .done(function (data) {
            console.log(data);
            var rowId = 0;
            for (var i = 0; i < data.length; i++) {
                if (i % (getElementsPerRow(getColSize())) == 0) {
                    ++rowId;
                }
                generateRow(rowId);
                generateTile(data[i]['trialname'], data[i]['description'], 'http://placehold.it/500x250/EEE',
                    data[i]['_id'], rowId);
            }
        });
};

getData();