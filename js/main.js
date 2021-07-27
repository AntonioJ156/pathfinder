
var nodesJSON
var w = 0
var h = 0
var canvasMultiplier = 0.73
var coords = {}

function windowResized() {
    resizeCanvas(windowWidth * canvasMultiplier, windowHeight * canvasMultiplier);
    $(window).trigger('nodesReady')
}

function setup() {
    w = windowWidth * canvasMultiplier
    h = windowHeight * canvasMultiplier
    var myCanvas = createCanvas(w, h)
    myCanvas.parent("canvas")
}

function draw() {
    clear()
    background(255)
    strokeWeight(8)
    stroke(0)
    noFill()

    w = windowWidth * canvasMultiplier
    h = windowHeight * canvasMultiplier

    line(0, 0, 0, 15)
    line(0, 0, 15, 0)

    line(w, 0, w, 15)
    line(w, 0, w - 15, 0)

    line(0, h, 0, h - 15)
    line(0, h, 15, h)

    line(w, h, w, h - 15)
    line(w, h, w - 15, h)

    strokeWeight(2)
    textSize(20)
    textAlign(CENTER, CENTER);

    if (nodesJSON != undefined) {
        var rSelected = $('#routesSelector').val()

        if (rSelected != '' && rSelected > 0 && !isNaN(rSelected) && int(rSelected) <= routes.length) {
            stroke(173,173,173)
        }

        Object.keys(coords).forEach(function(key) {
            if (coords[key].Links != undefined && coords[key].Links.length != 0) {
                coords[key].Links.forEach((citiesLinked, i) => {
                    line(coords[key].x, coords[key].y, coords[citiesLinked].x, coords[citiesLinked].y)
                });
            }
        });
        
        Object.keys(coords).forEach(function(key) {
            fill(255)
            circle(coords[key].x, coords[key].y, 40)
            noFill()
            if (rSelected == '' || rSelected <= 0 || isNaN(rSelected) || rSelected > routes.length) {
                text(coords[key].index, coords[key].x, coords[key].y)
            }
        });

        if (rSelected != '' && rSelected > 0 && !isNaN(rSelected) && int(rSelected) <= routes.length) {
            stroke(29, 29, 255)

            routes[rSelected - 1].forEach((item, i) => {
                var current = routes[rSelected - 1]
                if (i < current.length - 1) {
                    line(coords[item].x, coords[item].y, coords[current[i+1]].x, coords[current[i+1]].y)
                }
            })

            routes[rSelected - 1].forEach((item, i) => {
                fill(255)
                circle(coords[item].x, coords[item].y, 40)
                noFill()
                text(i+1, coords[item].x, coords[item].y)
            })
        }
    }
}

function initCorrds() {
    var minLat = Infinity
    var minLong = Infinity
    var maxLat = -Infinity
    var maxLong = -Infinity
    var mX = 0
    var mY = 0

    coords = {}

    nodesJSON.forEach(node => {
        if (node.Latitude < minLat) {
            minLat = node.Latitude
        }
        if (node.Latitude > maxLat) {
            maxLat = node.Latitude
        }
        if (node.Longitude < minLong) {
            minLong = node.Longitude
        }
        if (node.Longitude > maxLong) {
            maxLong = node.Longitude
        }
    });

    minLat = minLat - 1
    minLong = minLong - 1
    maxLat = maxLat + 1
    maxLong = maxLong + 1

    mX = Math.abs(Math.abs(maxLong) - Math.abs(minLong))
    mY = Math.abs(Math.abs(maxLat) - Math.abs(minLat))

    nodesJSON.forEach((node, i) => {
        ratioX = w / mX
        ratioY = h / mY

        xCoord = ratioX * Math.abs(Math.abs(minLong) - Math.abs(node.Longitude))
        yCoord = ratioY * Math.abs(Math.abs(maxLat) - Math.abs(node.Latitude))

        coords[node.City] = {"index": i+1, "x": xCoord, "y": yCoord, "Links":node.Links}
    });
}

function searchText(text, resIdentifier, srcIdentifier) {
    let matches = nodesJSON.filter(node => {
        var regex = new RegExp(`^${text}`, 'gi')
        return node.City.match(regex)
    })

    if (text.length == 0) {
        matches = []
    }

    outHTML(matches, resIdentifier, srcIdentifier)
}

function outHTML(matches, resIdentifier, srcIdentifier) {
    if (matches.length > 0) {
        var html = matches.map(match => `
            <a class="dropdown-item">${match.City}</a>
        `).join('')
    }
    $(resIdentifier).empty()
    $(resIdentifier).append(html)
}

$(function() {
    $.get("../db/cities.json", function( data ) {
        nodesJSON = data
        $(window).trigger('nodesReady')
    });
});

$(window).on('nodesReady', function(){
    initCorrds()

    var nodesLst = ""
    $("#nodesList").empty()
    nodesJSON.forEach(node => {
        nodesLst += "<li>" + node.City + "</li>"
    })
    $("#nodesList").append(nodesLst)
    $('#findPath').prop("disabled", false)
})

$(window).on('lstNodes', function(){
    var nodesLst = ""
    $("#nodesList").empty()
    nodesJSON.forEach(node => {
        nodesLst += "<li>" + node.City + "</li>"
    })
    $("#nodesList").append(nodesLst)
})

$(window).on('routeLst', function(){
    var value = $("#routesSelector").val()
    if (value == '' || value <= 0 || isNaN(value) || int(value) > routes.length) {
        $(window).trigger('lstNodes')
        $('#currRoute').empty()
    } else {
        $("#nodesList").empty()
        var nodesLst = ""
        routes[value - 1].forEach((item, i) => {
            nodesLst += "<li>" + item + "</li>"
        })
        $("#nodesList").append(nodesLst)

        $('#currRoute').empty()
        var cp = "Current dist: " + Math.round((distances[value - 1] + Number.EPSILON) * 100) / 100 + "km"
        $("#currRoute").append(cp)
    }
})

$("#newNode").click(function() {
    $("#addModal").addClass("is-active");
});

$(".addModalClose").click(function() {
    $("#addModal").removeClass("is-active");
});

$("#findPath").click(function() {
    $("#pathModal").addClass("is-active");
});

$(".pathModalClose").click(function() {
    $('#pathFrom').val('');
    $('#pathTo').val('');
    $("#pathModal").removeClass("is-active");
});

$("#addOne").click(function() {
    var v = $("#routesSelector").val();
    var nv = int(v) + 1
    $("#routesSelector").val(nv);
    $(window).trigger('routeLst')
});

$("#subOne").click(function() {
    var v = $("#routesSelector").val();
    var nv = 0
    if (v != 0) {
        nv = int(v) - 1
    }
    $("#routesSelector").val(nv);
    $(window).trigger('routeLst')
});

$("#routesSelector").keyup(function () {
    $(window).trigger('routeLst')
});

$("#pathFrom").keyup(function () {
    var value = $("#pathFrom").val()
    searchText(value, "#pathFromAutocomplete", "#pathFrom")
});

$("#pathTo").keyup(function () {
    var value = $("#pathTo").val()
    searchText(value, "#pathToAutocomplete", "#pathTo")
});

$("#findPathModal").click(function () {
    var origin = $("#pathFrom").val()
    var dest = $("#pathTo").val()
    routes = []
    distances = []
    pathfinder(origin, dest, [origin], 0)
    $('.routesText').show()

    $('#numRoutes').empty()
    var numR = "Routes available: 1 to " + routes.length
    $("#numRoutes").append(numR)

    var v = Infinity
    var min = 0
    distances.forEach((item, i) => {
        if (item < v) {
            v = item
            min = i + 1
        }
    })

    $('#minRoute').empty()
    var sp = "Shortest path: #" + min + " (" + Math.round((v + Number.EPSILON) * 100) / 100 + "km)"
    $("#minRoute").append(sp)

    $('#currRoute').empty()
    var cp = "Current dist: " + Math.round((distances[0] + Number.EPSILON) * 100) / 100 + "km"
    $("#currRoute").append(cp)

    $('#pathFrom').val('');
    $('#pathTo').val('');
    $('#routesSelector').val('1')
    $(window).trigger('routeLst')
    $("#pathModal").removeClass("is-active");
    $('.rsItems').prop("disabled", false)
});

$(document).click(function(event) {
    var text = $(event.target).text()
    var parent = $(event.target).parent().attr('id')
    if (parent == 'pathToAutocomplete') {
        $('#pathToAutocomplete').empty()
        $('#pathTo').val(text)
    }
    if (parent == 'pathFromAutocomplete') {
        $('#pathFromAutocomplete').empty()
        $('#pathFrom').val(text)
    }
});