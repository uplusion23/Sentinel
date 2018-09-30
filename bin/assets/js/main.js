var edn = require("jsedn");
var fs = require("fs");

var mapFrame = $('#mapFrame')[0];

$(document).ready(function() {
  window.opener.updateLoadStr("Initializing UI...");
});

function enableMap() {
  $('.sidebar ul li[data-page="map"]').removeClass('disabled');
  window.opener.windowReady();
}

// Init map for callback
if (mapFrame !== undefined) {
  mapFrame.onload = function() {
    mapFrame.contentWindow.enableMap = enableMap;
    window.opener.updateLoadStr("Loading map data...");
  }
}

$('body').on('click', '.sidebar ul li', function() {
  var selection = $(this).data('page');
  $('.sidebar ul li.active').removeClass('active');
  $(this).addClass('active');
  $('.page.active').removeClass('active');
  $('.page[data-page="' + selection + '"]').addClass('active');
});

$('body').on('click', '.die .btn', function() {
  var $dieContainer = $(this).parent()
  var dieCount = $dieContainer.data('die');
  var roll = 0;
  switch(dieCount) {
    case "d4":
      roll = Math.floor(Math.random() * 4) + 1;
    break;
    case "d6":
      roll = Math.floor(Math.random() * 6) + 1;
    break;
    case "d8":
      roll = Math.floor(Math.random() * 8) + 1;
    break;
    case "d10":
      roll = Math.floor(Math.random() * 10) + 1;
    break;
    case "d12":
      roll = Math.floor(Math.random() * 12) + 1;
    break;
    case "d20":
      roll = Math.floor(Math.random() * 20) + 1;
    break;
    default:
      console.log("Something broke with the die");
    break;
  }
  if ($dieContainer.find('.roll').length > 3) {
    var countToRemove = $dieContainer.find('.roll').length - 3;
    $dieContainer.find('.roll').slice(0, 1).css({'width': '0px', 'opacity': 0});
    $dieContainer.find('.roll').slice(0, countToRemove).fadeOut('fast', function(){
      $(this).remove();
    });
  }
  $dieContainer.find('.rolls').append('<span class="roll">' + roll + '</span>')
});
//var character = fs.readFileSync('test.json', 'utf8');
//var jsonChar = edn.parse(character);

$('body').on('click', '.btn[data-action="expand-character"]', function() {
  // Holy Shit I'm lazy
  $(this).parent().parent().toggleClass('active');
});

$('body').on('click', '.btn[data-action="character-import"]', function() {
  var urlExp = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
  var regex = new RegExp(urlExp);

  var url = prompt("Enter URL", "https://www.dndbeyond.com/profile/NAME/characters/1234567");
  if (url.match(regex)) {
    console.log("Adding character from url: " + url);
    var isJson = url.substr(url.length - 5);
    if (isJson != "/json") {
      console.log("URL does not end with JSON, appending now.");
      url = url + "/json";
    }
    nw.Clipboard.get().set(url,'text');
    alert('URL copied to clipboard\nPlease visit the url and paste the code into the next dialog.');
    var characterJson = prompt("JSON", "");
    ui.addCharacter(characterJson);
  } else {
    alert("Invalid URL!");
  }
});

$('body').on('click', '.btn[data-action="character-create"]', function() {
  $('.dialog').toggleClass('active');
});

var ui = {
  addCharacter: function(data) {
    var $char = '<div class="card card-character">\
      <div class="character">\
        <div class="header">\
          <a class="btn btn-outline" style="top: 10px; right: 10px; position: absolute; z-index: 2;" data-action="expand-character">More</a>\
          <div class="icon" style="background-image: url(' + data.avatarUrl + ')"></div>\
          <div class="basic-info">\
            <span class="character-name">' + data.name + '</span>\
            <span class="character-details">' + data.gender + ' ' + data.race.fullName + ' ' + data.classes[0].definition.name + ' ' + data.classes[0].level + '</span>\
            <span class="character-exp">\
              <span>LVL ' + character.getLevel(data.currentXp).level + '</span>\
              <span>' + data.currentXp + ' / ' + character.getLevel(data.currentXp).next + ' EXP</span>\
              <span class="exp-bar"><span class="prog" style="width: ' + character.getLevel(data.currentXp).percent + '%;"></span></span>\
              <span>LVL ' + (character.getLevel(data.currentXp).level + 1) + '</span>\
            </span>\
          </div>\
        </div>\
        <div class="data">' + JSON.stringify(data) + '</div>\
      </div>\
    </div>';
    $('.page[data-page="characters"]').append($char);
  }
}

var character = {
  data: {},
  init: function() {
    if (!fs.existsSync('data')) {
      fs.mkdirSync('data');
    }
    if (!fs.existsSync('data/data.json')) {
      console.warn('No data file detected, creating one now..');
      fs.writeFile('data/data.json', '{}', function(err) {
        if (err) throw err;
        character.data = JSON.parse(fs.readFileSync('data/data.json', 'utf8'));
      });
    } else {
      character.data = JSON.parse(fs.readFileSync('data/data.json', 'utf8'));
    }
    character.loadCharacters();
  },
  loadCharacters: function() {
    if (character.data.characters !== undefined) {
      for (var x = 0; x < character.data.characters.length; x++) {
        ui.addCharacter(character.data.characters[x]);
      }
    } else {
      console.log("No characters in the data file.");
    }
  },
  getLevel(exp) {
    var level = {};
    $.each(character.data.app.experience, function(index, data) {
      if (exp > index) {
        var keys = Object.keys(character.data.app.experience);
        var index2 = keys.indexOf(index.toString()); // needs to be string
        var next = keys[index2 + 1];
        level = {
          level: data.level,
          exp: index,
          proficiency: data.proficiency,
          percent: (exp * 100) / next,
          next: next
        }
      }
    });
    return level;
  },
  characters: []
};
character.init();
