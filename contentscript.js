var instabot_free_trial_time = 604800000;
var todaysdate = new Date();
var today = todaysdate.getTime();
var getfromcommenters = false;
var defaultcomment = "Looks beautiful!,Cool!,Keep posting!,Waaow,Nice :)";
var defaultHashtag = "nature,travel,photography,photoshop";
var defaultUsername = "instagram,nature.photos.np,tommy.clarke,alexstrohl";
var defaultUsernameCommentersArray = "instagram,nature.photos.np,tommy.clarke,alexstrohl";
var defaultFilterOptions = {
  followers: [0, 3000],
  following: [0, 3000],
  followRatio: [-7500, 10000],
  posts: [0, 300],
  lastPosted: [0, 3000],
  private: true,
  non_private: true,
  verified: true,
  non_verified: true,
  follows_me: false,
  non_follows_me: true,
  followed_by_me: false,
  non_followed_by_me: true,
  applyFiltersAutomatically: true
}
var gblOptions = {
  timeDelay: 70000,
  timeDelayAfterSoftRateLimit: 600000,
  timeDelayAfterHardRateLimit: 3600000,
  useRandomTimeDelay: true,
  percentRandomTimeDelay: .125,
  followPrivateAccounts: true,
  minRandomTimeDelay: 40000, // 40000
  maxRandomTimeDelay: 80000, // 52000
  limitQueue: true,
  maxAcctQueueLength: 1000,
  truncateStart: 0,
  dontUnFollowFollowers: true,
  dontUnFollowFilters: false,
  unFollowFresh: false,
  unFollowIfOld: true,
  unFollowDelay: 259200000, // 259200000 = 3 days
  unFollowIfOlderThan: 2592000000, // 2592000000 = 30 days
  filterOptions: defaultFilterOptions,
  commentArray: "",
  hashtagArray: "",
  ui: [],
  showConvenienceButtons: true,
  showUnfollowingInQueue: true
};

var gbl404attempt = 0;

var acctsQueue = [];
var acctsQueueTmp = [];
var theirFollowings = [];
var myFollowers = [];

var acctsProcessed = [];
var acctsPreviouslyAttempted = [];
var acctsWhiteList = [];
var freeTrialInterval;

var counter = 0;
var scrollIntervalId;
var totalAvailableForQueue;

var loadedTheirFollowers = false;
var loadedTheirFollowings = false;
var loadedMyFollowers = false;
var loadedMyFollowings = false;
var queueToDivFinished = false;

var user;
var currentProfilePage = false;

var todaysdate = new Date();
var today = todaysdate.getTime();

var mediaToLike = [];
var previousLikes = [];

var igloggedinacct = retrieveWindowVariables(["window._sharedData"]);

var currentList = false;

let mediaForComments = [];
let accountIdsThatCommented = [];


let mediaForLikes = [];
let accountIdsThatLiked = [];

if (igloggedinacct && igloggedinacct.config && igloggedinacct.config.viewer != null) {
  user = igloggedinacct.config;
}
function timeToDate(t) {
  var date = new Date(parseInt(t));
  return date.toString();
}

function outputMessage(txt) {
  var statusDiv = document.getElementById('igBotStatusDiv');
  var fakeConsole = document.getElementById('txtConsole');
  if (txt.trim() != '') {
    txt = getTimeStamp() + ' - ' + txt;
    statusDiv.textContent = txt;
  }
  fakeConsole.textContent = fakeConsole.textContent + '\n' + txt;
  if (document.activeElement.id !== 'txtConsole') {
    fakeConsole.scrollTop = fakeConsole.scrollHeight;
  }
}

function retrieveWindowVariables(variables) {
  var ret = "";
  var scriptContent = "if (typeof " + variables + " !== 'undefined') localStorage.setItem('" + variables + "', JSON.stringify(" + variables + ")) \n"
  var script = document.createElement('script');
  script.id = 'tmpScript';
  script.appendChild(document.createTextNode(scriptContent));
  (document.body || document.head || document.documentElement).appendChild(script);

  ret = JSON.parse(localStorage.getItem(variables));
  localStorage.removeItem(variables);
  return ret;
}

function millisecondsToHumanReadable(ms, formatAsString) {
  var obj = {}
  var x = ms / 1000;
  obj.seconds = parseInt(x % 60);
  x /= 60;
  obj.minutes = parseInt(x % 60);
  x /= 60;
  obj.hours = parseInt(x % 24);
  x /= 24;
  obj.days = parseInt(x);
  if (formatAsString == false) return obj;
  return obj.days + ' days, ' + obj.hours + ' hours';

}

function zeroPad(digitcount, num) {
  for (var i = 0; i < digitcount; i++) {
    num = "0" + num;
  }
  return num.substr(-digitcount, digitcount);
}

function getTimeStamp() {
  var d = new Date();
  var meridium = ' am';
  var hours = d.getHours();

  if (hours > 11) {
    meridium = ' pm';
    hours = hours - 12;
  }

  if (hours == 0) {
    hours = 12;
  }
  return hours + ':' + zeroPad(2, d.getMinutes()) + ':' + zeroPad(2, d.getSeconds()) + meridium;
}

function containsObject(obj, list) {
  var i;
  for (i = 0; i < list.length; i++) {
    if (list[i].id === obj.id) {
      return true;
    }
  }

  return false;
}

function findAcctById(id, list, returnIndexOnly) {
  if (returnIndexOnly !== true) returnIndexOnly = false;
  var i;
  for (i = 0; i < list.length; i++) {
    if (list[i].id === id) {
      if (returnIndexOnly === true) return i;
      return list[i];
    }
  }
  return false;
}

function waitForTrue(variableNames, callback, args) {
  var allTrue = true;
  var waitingFor = 'waiting for ';
  for (var i = 0; i < variableNames.length; i++) {
    if (window[variableNames[i]] === false) {
      allTrue = false;
      waitingFor = waitingFor + variableNames[i] + ' ';
    } else {
      waitingFor = waitingFor.replace(variableNames[i], '');
    }
  }

  if (allTrue === true) {
    outputMessage('Done.');
    callback.apply(this, args);
  } else {
    setTimeout(function() {
      waitForTrue(variableNames, callback, args);
    }, 1000);
  }

}
function addNewConvenienceLinks(element) {

    if (gblOptions.showConvenienceButtons == false) return false;

    var $$this = $(element);

    if ($$this.children('div').length > 0) return false;
    if ($$this.parents('.Mr508').length > 0) return false;
    if ($$this.parents('.XQXOT').length > 0) return false;

    var username = $$this.text();
    $$this.after('<a class="igBotInjectedLinkWhitelist" href="javascript:void(0);" data-username="' + username + '">Whitelist</a> <a class="igBotInjectedLinkUnfollow" href="javascript:void(0);" data-username="' + username + '">Unfollow</a>');
    $$this.parents('.RqtMr').css({'max-width':'initial'});
}
function addNewConvenienceLinktoUserPage(element) {

    if (gblOptions.showConvenienceButtons == false) return false;

    var $$this = $(element);
    var username = $$this.text();
    $$this.after('<a class="igBotInjectedLinkWhitelist" href="javascript:void(0);" data-username="' + username + '">Whitelist</a> <a class="igBotInjectedLinkUnfollow" href="javascript:void(0);" data-username="' + username + '">Unfollow</a>');
    $$this.parents('.RqtMr').css({'max-width':'initial'});
}
function convenienceLinkUnfollowAcct(userName) {
    var acct = getAdditionalDataForAcct({ username: userName });
    quickUnfollowAcct(acct);
}

async function convenienceLinkWhitelistAcct(userName) {
    var acct = await getAdditionalDataForAcct({ username: userName });
    if (addAcctToWhiteList(acct) === true) saveWhiteListToStorage();
    $('.igBotInjectedLinkWhitelist[data-username="' + acct.username + '"]').fadeOut();
    $('.igBotInjectedLinkUnfollow[data-username="' + acct.username + '"]').fadeOut();
}



function loadOptions() {
  chrome.storage.local.get("gblOptions", function(data) {
    if (typeof data.gblOptions != 'undefined') {
      gblOptions = data.gblOptions;

      if (typeof gblOptions.filterOptions == 'undefined') {
        gblOptions.filterOptions = defaultFilterOptions;
      }
      if (typeof gblOptions.commentArray == 'undefined' || gblOptions.commentArray == '') {
        gblOptions.commentArray = defaultcomment;
      }

      if (typeof gblOptions.hashtagArray == 'undefined' || gblOptions.hashtagArray == '') {
        gblOptions.hashtagArray = defaultHashtag;
      }
      if (typeof gblOptions.usernameArray == 'undefined' || gblOptions.usernameArray == '') {
        gblOptions.usernameArray = defaultUsername;
      }
      if (typeof gblOptions.usernameCommentersArray == 'undefined' || gblOptions.usernameCommentersArray == '') {
        gblOptions.usernameCommentersArray = defaultUsernameCommentersArray;
      }

      document.getElementById('textSecondsBetweenActions').value = gblOptions.timeDelay / 1000;
      document.getElementById('textMinutesAfterSoftRateLimit').value = gblOptions.timeDelayAfterSoftRateLimit / 60000;
      document.getElementById('textHoursAfterHardRateLimit').value = gblOptions.timeDelayAfterHardRateLimit / 3600000;
      document.getElementById('cbRandomizeTimeDelay').checked = gblOptions.useRandomTimeDelay;
      document.getElementById('igBotPercentRandomTimeDelay').value = gblOptions.percentRandomTimeDelay * 200;
      document.getElementById('cbDontUnfollowFollowers').checked = gblOptions.dontUnFollowFollowers;
      document.getElementById('cbDontUnfollowFresh').checked = !gblOptions.unFollowFresh;
      document.getElementById('cbUnfollowOld').checked = gblOptions.unFollowIfOld;
      document.getElementById('textUnfollowNew').value = gblOptions.unFollowDelay / 86400000;
      document.getElementById('textUnfollowOld').value = gblOptions.unFollowIfOlderThan / 86400000;
      document.getElementById('cbLimitQueueSize').checked = gblOptions.limitQueue;
      document.getElementById('txtLimitQueueSize').value = gblOptions.maxAcctQueueLength;
      document.getElementById('commentArray').value = gblOptions.commentArray;
      document.getElementById('hashtagArray').value = gblOptions.hashtagArray;
      document.getElementById('usernameArray').value = gblOptions.usernameArray;
      document.getElementById('usernameCommentersArray').value = gblOptions.usernameArray;

    }

    if (typeof gblOptions.filterOptions == 'undefined') {
      gblOptions.filterOptions = defaultFilterOptions;
    }

  });
}

function saveThisOptions() {
  var uiOptions = [];

  var filterOptions = gblOptions.filterOptions;

  gblOptions.timeDelay = 45000;

  gblOptions = {
    timeDelay: 45000,
    timeDelayAfterSoftRateLimit: document.getElementById('textMinutesAfterSoftRateLimit').value * 60000,
    timeDelayAfterHardRateLimit: document.getElementById('textHoursAfterHardRateLimit').value * 3600000,
    useRandomTimeDelay: document.getElementById('cbRandomizeTimeDelay').checked,
    percentRandomTimeDelay: document.getElementById('igBotPercentRandomTimeDelay').value / 200,
    minRandomTimeDelay: Math.max(0, gblOptions.timeDelay - (gblOptions.timeDelay * gblOptions.percentRandomTimeDelay)),
    maxRandomTimeDelay: gblOptions.timeDelay + (gblOptions.timeDelay * gblOptions.percentRandomTimeDelay),
    limitQueue: document.getElementById('cbLimitQueueSize').checked,
    maxAcctQueueLength: parseInt(document.getElementById('txtLimitQueueSize').value),
    dontUnFollowFollowers: document.getElementById('cbDontUnfollowFollowers').checked,
    unFollowFresh: !document.getElementById('cbDontUnfollowFresh').checked,
    unFollowIfOld: document.getElementById('cbUnfollowOld').checked,
    unFollowDelay: parseInt(document.getElementById('textUnfollowNew').value) * 86400000,
    unFollowIfOlderThan: parseInt(document.getElementById('textUnfollowOld').value) * 86400000,
    commentArray: document.getElementById('commentArray').value,
    hashtagArray: document.getElementById('hashtagArray').value,
    usernameArray: document.getElementById('usernameArray').value,
    filterOptions: filterOptions,
    ui: uiOptions
  };
  chrome.storage.local.set({
    gblOptions: gblOptions
  });

}

function loadPreviousAttempts() {
  chrome.storage.local.get("acctsAttempted", function(data) {
    if (Array.isArray(data.acctsAttempted)) {
      acctsPreviouslyAttempted = data.acctsAttempted;
      outputMessage('Previously attempted to follow: ' + acctsPreviouslyAttempted.length + ' accounts');
    }
  })
}

function loadPreviousLikes() {
  chrome.storage.local.get("previousLikes", function(data) {
    if (Array.isArray(data.previousLikes)) {
      previousLikes = data.previousLikes;
      outputMessage('Previously Liked: ' + previousLikes.length);
    }
  })
}

function savePreviousLikesToStorage() {
  chrome.storage.local.set({
    previousLikes: previousLikes
  });
}
function addAcctToWhiteList(acct) {
    var acctInWhiteList = findAcctById(acct.id, acctsWhiteList);
    if (acct !== false && acctInWhiteList == false) {
        acctsWhiteList.push(acct);
        outputMessage(acct.username + ' added to whitelist');
        return true;
    } else {
        outputMessage(acct.username + ' already on whitelist');
        return false;
    }
}
function loadWhiteList() {
//console.log(gblOptions.commentArray)
  chrome.storage.local.get("acctsWhiteList", function(data) {
    if (Array.isArray(data.acctsWhiteList)) {
      acctsWhiteList = data.acctsWhiteList;
      outputMessage('Whitelist loaded: ' + acctsWhiteList.length + ' accounts');
    }
  })
}

function saveWhiteListToStorage() {
  chrome.storage.local.set({
    acctsWhiteList: acctsWhiteList
  });
  outputMessage('Whitelist saved to local storage');
}

function saveWhiteListToDisk() {
  saveText("bot-whitelist.txt", JSON.stringify(acctsWhiteList));
  outputMessage('Whitelist saved to disk');
}

function saveWhiteListToStorageAndDisk() {
  saveWhiteListToStorage();
  saveWhiteListToDisk();
}

function saveText(filename, text) {
  var tempElem = document.createElement('a');
  tempElem.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  tempElem.setAttribute('download', filename);
  tempElem.click();
}

function viewWhiteList() {
    currentList = 'acctsWhiteList';
    arrayOfUsersToDiv(acctsWhiteList, true);
    handleCheckBoxes(acctsWhiteList);
    handleImagePreload();
}

function openWhiteListFile() {
  var input = document.createElement("input");
  input.setAttribute('type', 'file');
  input.setAttribute('accept', 'text/plain');
  input.addEventListener("change", function() {
    if (this.files && this.files[0]) {
      var myFile = this.files[0];
      var reader = new FileReader();
      reader.addEventListener('load', function(e) {
        acctsWhiteList = JSON.parse(e.target.result);
        currentList = 'acctsWhiteList';
        arrayOfUsersToDiv(acctsWhiteList, true);
        handleCheckBoxes(acctsWhiteList);
        handleImagePreload();
        saveWhiteListToStorage();
      });
      reader.readAsText(myFile);
    }
  });
  input.click();
}

function loadSavedQueue() {
  chrome.storage.local.get("acctsQueue", function(data) {
    if (Array.isArray(data.acctsQueue)) {
      acctsQueue = data.acctsQueue;
      if (acctsQueue.length > gblOptions.maxAcctQueueLength &&
        gblOptions.limitQueue == true &&
        window.confirm('Saved queue has ' + acctsQueue.length + ' accounts, limit to first ' + gblOptions.maxAcctQueueLength + ' accounts?')) {
        truncateQueue();
      }
      arrayOfUsersToDiv(acctsQueue, true);
      handleCheckBoxes(acctsQueue);
      handleImagePreload();
      outputMessage('Accounts Queue loaded: ' + acctsQueue.length + ' accounts');
    }
  });
}

function saveQueueToStorage() {
  chrome.storage.local.set({
    acctsQueue: acctsQueue
  });
  outputMessage('Saved queue of ' + acctsQueue.length + ' accounts')
}

function findUsername() {
    var someAccArray = [];
    var accArray = $("#usernameArray").val();
    $.each(accArray.split(","), function (i, name) {
      if(name != ""){
          someAccArray.push(name);
      }
    });
    function getAcc() {
       return someAccArray[Math.floor(Math.random() * someAccArray.length)];
    }
    var username = getAcc();
    outputMessage('Account: ' + username);
    ajaxGetAllUsersFollowersAuto(username);
}
function findUsernameForCommenters() {
	getfromcommenters = true;
    var someAccArray = [];
    var accArray = $("#usernameCommentersArray").val();
    $.each(accArray.split(","), function (i, name) {
      if(name != ""){
          someAccArray.push(name);
      }
    });
    function getAcc() {
       return someAccArray[Math.floor(Math.random() * someAccArray.length)];
    }
    var username = getAcc();
    outputMessage('Account: ' + username);
    ajaxGetAllUsersFollowersAuto(username);
}

function findAcc() {
    var someAccArray = [];
    var accArray = $("#hashtagArray").val();
    $.each(accArray.split(","), function (i, name) {
      if(name != ""){
          someAccArray.push(name);
      }
    });
    function getAcc() {
       return someAccArray[Math.floor(Math.random() * someAccArray.length)];
    }
    var thisAcc = getAcc();
    outputMessage('Hashtags ' + thisAcc);
    url = 'https://www.instagram.com/graphql/query/?query_hash=3e7706b09c6184d5eafd8b032dbcf487&variables={"tag_name":"'+ thisAcc +'","first":1000,"after":""}';
    console.log(thisAcc)
    console.log(url)
    $.ajax(url).done(function(r) {
        var set_comments = document.getElementById("setComments");
        var set_likes = document.getElementById("setLikes");
        var set_unfollow = document.getElementById("setUnfollow");
        var set_follow = document.getElementById("setFollow");
        var set_visitStories = document.getElementById("setVisitStories");
        $.each(r.data.hashtag.edge_hashtag_to_media.edges, function(i,data){
            setTimeout(function(){
                if(data.node.owner.id){
                    var userid = data.node.owner.id;
                    var postid = data.node.id;
                    var schalteran = new Boolean(true);
                    if(set_likes.checked == true){
                        likethisguy(postid, schalteran);
                    }
                    if(set_comments.checked == true){
                        commentthisguy(postid, schalteran);
                    }
                    if(set_follow.checked == true){
                        followthisGuy(userid);
                    }
                    if(set_unfollow.checked == true){
                        initUnfollowMyFollowersWhileFollowing();
                    }
                }
            }, i * gblOptions.timeDelay)
        });
      }).fail(function(data) {
        outputMessage('FAILED, can not find this account');
        gbl404attempt = 0;
      });
}



function ajaxLoadAllUsersCommenters(after) {
    if (typeof after != 'string') {
        after = '';
    }

    var jsonvars = {
        id: currentProfilePage.id,
        first: 12
    }

    if (after != '') {
        jsonvars.after = after;
    }

    var urljsonvars = JSON.stringify(jsonvars);

    var url = 'https://www.instagram.com/graphql/query/?query_hash=6305d415e36c0a5f0abb6daba312f2dd&variables=' + encodeURIComponent(urljsonvars);

    $.ajax(url).done(function(r) {
        loadCommentsForMedia(r);
    }).fail(function(f) {
        if (f.status == 429) {
            outputMessage('429 rate limit from instagram. waiting 1 minute to attempt load more media, please be patient!');
            setTimeout(function() {
                ajaxLoadAllUsersCommenters(after);
            }, 60000);
        }
    });
}

async function loadCommentsForMedia(r) {
    for (var i = 0; i < r.data.user.edge_owner_to_timeline_media.edges.length; i++) {
        var media = r.data.user.edge_owner_to_timeline_media.edges[i];

        if (media.node.edge_media_to_comment.page_info.has_next_page == true) {
            if (gblOptions.limitQueue == false || (gblOptions.limitQueue == true && mediaForComments.length < gblOptions.maxAcctQueueLength)) {
                var retMedia = await loadMoreCommentsForMedia(media);
                mediaForComments.push(retMedia);
            }
        } else {
            mediaForComments.push(media);
        }
    }

    if (getCommentersFromMediaArray() == false) {
        outputMessage('Done (queue limit reached).');
        return false;
    }

    if (r.data.user.edge_owner_to_timeline_media.page_info.has_next_page == true) {
        outputMessage('waiting 2 seconds to load more media for comments');
        setTimeout(function() {
            ajaxLoadAllUsersCommenters(r.data.user.edge_owner_to_timeline_media.page_info.end_cursor);
        }, 2000);
    } else {
        outputMessage('Done.')
    }
}

function loadMoreCommentsForMedia(media) {
    return new Promise(function(resolve, reject) {

        if (getCommentersFromMediaArray() == false) {
            outputMessage('Done (queue limit reached).');
            return false;
        }

        var jsonvars = {
            shortcode: media.node.shortcode,
            first: 48
        }

        if (media.node.edge_media_to_comment.page_info.has_next_page === true) {
            jsonvars.after = media.node.edge_media_to_comment.page_info.end_cursor;
        }

        var urljsonvars = JSON.stringify(jsonvars);

        var url = 'https://www.instagram.com/graphql/query/?query_hash=33ba35852cb50da46f5b5e889df7d159&variables=' + encodeURIComponent(urljsonvars);

        let retMedia = media;

        $.ajax(url).done(function(r) {

            for (var i = 0; i < r.data.shortcode_media.edge_media_to_comment.edges.length; i++) {
                retMedia.node.edge_media_to_comment.edges.push(r.data.shortcode_media.edge_media_to_comment.edges[i]);
            }

            if (r.data.shortcode_media.edge_media_to_comment.page_info.has_next_page === true) {
                retMedia.node.edge_media_to_comment.page_info.end_cursor = r.data.shortcode_media.edge_media_to_comment.page_info.end_cursor;

                outputMessage('waiting 2 seconds to load more comments');

                if ((gblOptions.limitQueue == true && retMedia.node.edge_media_to_comment.edges.length > gblOptions.maxAcctQueueLength)) {
                    resolve(retMedia);
                    return false;
                }

                setTimeout(function() {
                    resolve(loadMoreCommentsForMedia(retMedia));
                }, 2000);
            } else {
                resolve(retMedia);
            }


        }).fail(function(f) {
            if (f.status == 429) {
                outputMessage('429 rate limit from instagram. waiting 60 seconds to attempt load more commenters');
                setTimeout(function() {
                    resolve(loadMoreCommentsForMedia(retMedia));
                }, 60000);
            }
        });

    });
}


function getCommentersFromMediaArray() {
    let accountsThatCommented = [];

    for (var i = 0; i < mediaForComments.length; i++) {
        var media = mediaForComments[i];

        for (var j = 0; j < media.node.edge_media_to_comment.edges.length; j++) {
            var comment = media.node.edge_media_to_comment.edges[j];

            if (accountIdsThatCommented.indexOf(comment.node.owner.id) == -1) {
                accountIdsThatCommented.push(comment.node.owner.id);
                //var acct = await getAdditionalDataForAcct(comment.node.owner);
                //accountsThatCommented.push(acct);
                accountsThatCommented.push(comment.node.owner);
            }
        }
    }

    if (acctsQueue.length == 0) {
        acctsQueue = accountsThatCommented;
    } else {
        for (var i = 0; i < accountsThatCommented.length; i++) {
            if ((gblOptions.limitQueue == true && acctsQueue.length < gblOptions.maxAcctQueueLength) || gblOptions.limitQueue == false) {
                if (findAcctById(accountsThatCommented[i].id, acctsQueue) === false) {
                    acctsQueue.push(accountsThatCommented[i]);
                }
            } else {
                arrayOfUsersToDiv(accountsThatCommented, false);
                handleCheckBoxes(accountsThatCommented);
                handleImagePreload();
                return false;
            }
        }
    }

    arrayOfUsersToDiv(accountsThatCommented, false);
    handleCheckBoxes(accountsThatCommented);
    handleImagePreload();
    initStealFollowers();
}












function initStealFollowers() {
  document.getElementById('btnFollowQueue').classList.add('pulsing');
  loadPreviousAttempts();
  ajaxFollowAll();
}


function initUnfollowMyFollowers() {
  acctsQueue = [];
  $('#btnFollowList').addClass('pulsing');
  loadPreviousAttempts();
  ajaxGetAllMyFollowing('');
  waitForTrue(['loadedMyFollowings'], ajaxUnfollowAll, []);

}
//Same but for unfollow while Following
function initUnfollowMyFollowersWhileFollowing() {
  loadPreviousAttempts();
  ajaxGetAllMyFollowingWhileFollow('');
  waitForTrue(['loadedMyFollowings'], ajaxUnfollowAllWhileFollow, []);
}

function ajaxLoadAllUsersCommenters(after) {
  if (typeof after != 'string') {
    after = '';
  }

  var jsonvars = {
    id: currentProfilePage.id,
    first: 12
  }

  if (after != '') {
    jsonvars.after = after;
  }

  var urljsonvars = JSON.stringify(jsonvars);

  var url = 'https://www.instagram.com/graphql/query/?query_hash=6305d415e36c0a5f0abb6daba312f2dd&variables=' + encodeURIComponent(urljsonvars);

  $.ajax(url).done(function(r) {
    loadCommentsForMedia(r);
  }).fail(function(f) {
    if (f.status == 429) {
      outputMessage('429 rate limit from instagram. waiting 1 minute to attempt load more media, please be patient!');
      setTimeout(function() {
        ajaxLoadAllUsersCommenters(after);
      }, 60000);
    }
  });
}

async function loadCommentsForMedia(r) {
  for (var i = 0; i < r.data.user.edge_owner_to_timeline_media.edges.length; i++) {
    var media = r.data.user.edge_owner_to_timeline_media.edges[i];

    if (media.node.edge_media_to_comment.page_info.has_next_page == true) {
      var retMedia = await loadMoreCommentsForMedia(media);
      mediaForComments.push(retMedia);
    } else {
      mediaForComments.push(media);
    }
  }

  if (getCommentersFromMediaArray() == false) {
    outputMessage('Done (queue limit reached).');
    return false;
  }

  if (r.data.user.edge_owner_to_timeline_media.page_info.has_next_page == true) {
    if (gblOptions.useRandomTimeDelay == true) {
      gblOptions.timeDelay = getRandomInt(gblOptions.minRandomTimeDelay, gblOptions.maxRandomTimeDelay);
    }
    outputMessage('waiting  ' + (gblOptions.timeDelay / 1000) + ' seconds to load more media for comments');
    setTimeout(function() {
      ajaxLoadAllUsersCommenters(r.data.user.edge_owner_to_timeline_media.page_info.end_cursor);
    }, gblOptions.timeDelay);
  } else {
    outputMessage('Done.')
  }
}

function loadMoreCommentsForMedia(media) {
  return new Promise(function(resolve, reject) {
    var jsonvars = {
      shortcode: media.node.shortcode,
      first: 48
    }

    if (media.node.edge_media_to_comment.page_info.has_next_page === true) {
      jsonvars.after = media.node.edge_media_to_comment.page_info.end_cursor;
    }

    var urljsonvars = JSON.stringify(jsonvars);

    var url = 'https://www.instagram.com/graphql/query/?query_hash=33ba35852cb50da46f5b5e889df7d159&variables=' + encodeURIComponent(urljsonvars);

    let retMedia = media;

    $.ajax(url).done(function(r) {

      for (var i = 0; i < r.data.shortcode_media.edge_media_to_comment.edges.length; i++) {
        retMedia.node.edge_media_to_comment.edges.push(r.data.shortcode_media.edge_media_to_comment.edges[i]);
      }

      if (r.data.shortcode_media.edge_media_to_comment.page_info.has_next_page === true) {
        retMedia.node.edge_media_to_comment.page_info.end_cursor = r.data.shortcode_media.edge_media_to_comment.page_info.end_cursor;


        if (gblOptions.useRandomTimeDelay == true) {
          gblOptions.timeDelay = getRandomInt(gblOptions.minRandomTimeDelay, gblOptions.maxRandomTimeDelay);
        }
        outputMessage('waiting ' + (gblOptions.timeDelay / 1000) + ' seconds to load more comments');

        setTimeout(function() {
          resolve(loadMoreCommentsForMedia(retMedia));
        }, gblOptions.timeDelay);
      } else {
        resolve(retMedia);
      }


    }).fail(function(f) {
      if (f.status == 429) {
        outputMessage('429 rate limit from instagram. waiting 60 seconds to attempt load more commenters');
        setTimeout(function() {
          resolve(loadMoreCommentsForMedia(retMedia));
        }, 60000);
      }
    });

  });
}


function getCommentersFromMediaArray() {
  let accountsThatCommented = [];

  for (var i = 0; i < mediaForComments.length; i++) {
    var media = mediaForComments[i];

    for (var j = 0; j < media.node.edge_media_to_comment.edges.length; j++) {
      var comment = media.node.edge_media_to_comment.edges[j];

      if (accountIdsThatCommented.indexOf(comment.node.owner.id) == -1) {
        accountIdsThatCommented.push(comment.node.owner.id);
        accountsThatCommented.push(comment.node.owner);
      }
    }
  }

  if (acctsQueue.length == 0) {
    acctsQueue = accountsThatCommented;
  } else {
    for (var i = 0; i < accountsThatCommented.length; i++) {
      if ((gblOptions.limitQueue == true && acctsQueue.length < gblOptions.maxAcctQueueLength) || gblOptions.limitQueue == false) {
        if (findAcctById(accountsThatCommented[i].id, acctsQueue) === false) {
          acctsQueue.push(accountsThatCommented[i]);
        }
      } else {
        arrayOfUsersToDiv(accountsThatCommented, false);
        handleCheckBoxes(accountsThatCommented);
        handleImagePreload();
        return false;
      }
    }
  }

  arrayOfUsersToDiv(accountsThatCommented, false);
  handleCheckBoxes(accountsThatCommented);
  handleImagePreload();
}



function ajaxLoadAllUsersLikers(after) {
  if (typeof after != 'string') {
    after = '';
  }

  var jsonvars = {
    id: currentProfilePage.id,
    first: 12
  }

  if (after != '') {
    jsonvars.after = after;
  }

  var urljsonvars = JSON.stringify(jsonvars);

  var url = 'https://www.instagram.com/graphql/query/?query_hash=6305d415e36c0a5f0abb6daba312f2dd&variables=' + encodeURIComponent(urljsonvars);

  $.ajax(url).done(function(r) {
    beginLoadLikesForMedia(r);
  }).fail(function(f) {
    if (f.status == 429) {
      outputMessage('429 rate limit from instagram. waiting 1 minute to attempt load more media, please be patient!');
      setTimeout(function() {
        ajaxLoadAllUsersLikers(after);
      }, 60000);
    }
  });
}

async function beginLoadLikesForMedia(r) {

  for (var i = 0; i < r.data.user.edge_owner_to_timeline_media.edges.length; i++) {
    var media = r.data.user.edge_owner_to_timeline_media.edges[i];
    var retMedia = await loadLikesForMedia(media);
    mediaForLikes.push(retMedia);
  }

  if (getLikersFromMediaArray() == false) {
    outputMessage('Done (queue limit reached).');
    return false;
  }

  if (r.data.user.edge_owner_to_timeline_media.page_info.has_next_page == true) {
    if (gblOptions.useRandomTimeDelay == true) {
      gblOptions.timeDelay = getRandomInt(gblOptions.minRandomTimeDelay, gblOptions.maxRandomTimeDelay);
    }
    outputMessage('waiting  ' + (gblOptions.timeDelay / 1000) + ' seconds to load more media for likes');
    setTimeout(function() {
      ajaxLoadAllUsersLikers(r.data.user.edge_owner_to_timeline_media.page_info.end_cursor);
    }, gblOptions.timeDelay);
  } else {
    outputMessage('Done.')
  }
}

function loadLikesForMedia(media) {

  return new Promise(function(resolve, reject) {
    let retMedia = false;
    var shortcode;
    if (media.node) {
      shortcode = media.node.shortcode
    } else {
      retMedia = media;
      shortcode = media.data.shortcode_media.shortcode;
    }
    var jsonvars = {
      shortcode: shortcode,
      first: 48
    }
    if (media.data && media.data.shortcode_media && media.data.shortcode_media.edge_liked_by && media.data.shortcode_media.edge_liked_by.page_info.has_next_page === true) {
      jsonvars.after = media.data.shortcode_media.edge_liked_by.page_info.end_cursor;
    }
    var urljsonvars = JSON.stringify(jsonvars);
    var url = 'https://www.instagram.com/graphql/query/?query_hash=1cb6ec562846122743b61e492c85999f&variables=' + encodeURIComponent(urljsonvars);
    $.ajax(url).done(function(r) {
      if (retMedia == false) {
        retMedia = r;
      } else {
        for (var i = 0; i < r.data.shortcode_media.edge_liked_by.edges.length; i++) {
          retMedia.data.shortcode_media.edge_liked_by.edges.push(r.data.shortcode_media.edge_liked_by.edges[i].node);
        }
      }
      if (r.data.shortcode_media.edge_liked_by.page_info.has_next_page === true) {
        retMedia.data.shortcode_media.edge_liked_by.page_info.end_cursor = r.data.shortcode_media.edge_liked_by.page_info.end_cursor;
        if (gblOptions.useRandomTimeDelay == true) {
          gblOptions.timeDelay = getRandomInt(gblOptions.minRandomTimeDelay, gblOptions.maxRandomTimeDelay);
        }
        outputMessage('waiting ' + (gblOptions.timeDelay / 1000) + ' seconds to load more likes');
        setTimeout(function() {
          resolve(loadLikesForMedia(retMedia));
        }, gblOptions.timeDelay);
      } else {
        resolve(retMedia);
      }
    }).fail(function(f) {
      if (f.status == 429) {
        outputMessage('429 rate limit from instagram. waiting 60 seconds to attempt load more likers');
        setTimeout(function() {
          resolve(loadLikesForMedia(retMedia));
        }, 60000);
      }
    });

  });
}


function getLikersFromMediaArray() {
  let accountsThatLiked = [];
  for (var i = 0; i < mediaForLikes.length; i++) {
    var media = mediaForLikes[i];
    for (var j = 0; j < media.data.shortcode_media.edge_liked_by.edges.length; j++) {
      var like = media.data.shortcode_media.edge_liked_by.edges[j];
      if (accountIdsThatLiked.indexOf(like.id) == -1) {
        accountIdsThatLiked.push(like.id);
        accountsThatLiked.push(like);
      }
    }
  }

  if (acctsQueue.length == 0) {
    acctsQueue = accountsThatLiked;
  } else {
    for (var i = 0; i < accountsThatLiked.length; i++) {
      if ((gblOptions.limitQueue == true && acctsQueue.length < gblOptions.maxAcctQueueLength) || gblOptions.limitQueue == false) {
        if (findAcctById(accountsThatLiked[i].id, acctsQueue) === false) {
          acctsQueue.push(accountsThatLiked[i]);
        }
      } else {
        arrayOfUsersToDiv(accountsThatLiked, false);
        handleCheckBoxes(accountsThatLiked);
        handleImagePreload();
        return false;
      }
    }
  }
  arrayOfUsersToDiv(accountsThatLiked, false);
  handleCheckBoxes(accountsThatLiked);
  handleImagePreload();
}

function ajaxGetAllUsersFollowers(after) {
  if (typeof after != 'string') {
    // acctsQueue = [];
    after = '';
      gblOptions.truncateStart = 0;
  }

  var jsonvars = {
    id: currentProfilePage.id,
    first: 48
  }

  if (after != '') {
    jsonvars.after = after;
  }

  var urljsonvars = JSON.stringify(jsonvars);
  var url = 'https://www.instagram.com/graphql/query/?query_hash=37479f2b8209594dde7facb0d904896a&variables=' + encodeURIComponent(urljsonvars);

  $.ajax(url)
    .done(function(r) {

      var tmpQueue = [];

      $(r.data.user.edge_followed_by.edges).each(function(edge) {
        var u = $(this)[0].node;
        acctsQueue.push(u);
        tmpQueue.push(u);
      });

      arrayOfUsersToDiv(tmpQueue, false);
      handleCheckBoxes(tmpQueue);
      handleImagePreload();

      outputMessage(acctsQueue.length + ' followers loaded so far');


      if (r.data.user.edge_followed_by.page_info.has_next_page == true && (acctsQueue.length < (parseInt(gblOptions.truncateStart) + parseInt(gblOptions.maxAcctQueueLength)) || gblOptions.limitQueue != true || currentProfilePage.edge_followed_by.count < parseInt(gblOptions.maxAcctQueueLength))) {
        ajaxGetAllUsersFollowers(r.data.user.edge_followed_by.page_info.end_cursor);
      } else {

        truncateQueue(gblOptions.truncateStart);

        $('#btnGetAllUsersFollowers').removeClass('pulsing');

        arrayOfUsersToDiv(acctsQueue, true);
        handleCheckBoxes(acctsQueue);
        handleImagePreload();


        outputMessage(acctsQueue.length+' of ' + currentProfilePage.username + ' followers loaded.');
        outputMessage(' ');

      }


    }).fail(function(f) {
      if (f.status == 429) {
        outputMessage('429 rate limit from instagram. waiting 1 minute to attempt load more of your followers, please be patient!');
        setTimeout(function() {
          ajaxGetAllUsersFollowers(after);
        }, 60000);
      }
    });

}

function ajaxGetAllUsersFollowersAuto(username) {
  $.ajax({
      url: 'https://www.instagram.com/' + username + '/',
      method: 'GET',
      beforeSend: function(xhr) {
        xhr.setRequestHeader('x-csrftoken', user.csrf_token);
        xhr.setRequestHeader('x-instagram-ajax', '1');
      }
    }).done(function(data) {
      var u = extractJSONfromUserPageHTML(data);
      currentProfilePage = u;
      if (typeof after != 'string') {
        after = '';
        gblOptions.truncateStart = 0;
      }

      var jsonvars = {
        id: currentProfilePage.id,
        first: 48
      }

      if (after != '') {
        jsonvars.after = after;
      }
      var urljsonvars = JSON.stringify(jsonvars);
      var url = 'https://www.instagram.com/graphql/query/?query_hash=37479f2b8209594dde7facb0d904896a&variables=' + encodeURIComponent(urljsonvars);
      $.ajax(url)
        .done(function(r) {
          var tmpQueue = [];
          $(r.data.user.edge_followed_by.edges).each(function(edge) {
            var u = $(this)[0].node;
            acctsQueue.push(u);
            tmpQueue.push(u);
          });
          arrayOfUsersToDiv(tmpQueue, false);
          handleCheckBoxes(tmpQueue);
          handleImagePreload();
          if (r.data.user.edge_followed_by.page_info.has_next_page == true && (acctsQueue.length < (parseInt(gblOptions.truncateStart) + parseInt(gblOptions.maxAcctQueueLength)) || gblOptions.limitQueue != true || currentProfilePage.edge_followed_by.count < parseInt(gblOptions.maxAcctQueueLength))) {
            if(getfromcommenters == true){
	          	ajaxLoadAllUsersCommenters();
	          }else{
	          	ajaxGetAllUsersFollowers(r.data.user.edge_followed_by.page_info.end_cursor);
	          }
          }
          else {
            truncateQueue(gblOptions.truncateStart);
            $('#btnGetAllUsersFollowers').removeClass('pulsing');
            arrayOfUsersToDiv(acctsQueue, true);
            handleCheckBoxes(acctsQueue);
            handleImagePreload();
            outputMessage(acctsQueue.length+' of ' + currentProfilePage.username + ' followers loaded.');
            outputMessage(' ');
          }
          initStealFollowers();
        }).fail(function(f) {
          if (f.status == 429) {
            outputMessage('429 rate limit from instagram. waiting 1 minute to attempt load more of your followers, please be patient!');
            setTimeout(function() {
              ajaxGetAllUsersFollowers(after);
            }, 60000);
          }
        });
    }).fail(function(f){
        if (f.status == 429) {
            outputMessage(' ');
            outputMessage('429 rate limit from instagram (actions are temporary blocked) wait 12 hours, maybe you must login again!');
        }
    });
}

function ajaxLoadFollowing(after) {
  if (typeof after != 'string') {
    after = '';
    if (currentProfilePage.edge_follow.count > gblOptions.maxAcctQueueLength && gblOptions.limitQueue == true) {
      var promptAfter = window.prompt("Account is following " + currentProfilePage.edge_follow.count + " accounts, but your queue limit is set to " + gblOptions.maxAcctQueueLength + ". \n\n Enter following number to begin at (0 is the most recent following).", "0")
      if (!isNaN(parseInt(promptAfter))) {
        gblOptions.truncateStart = parseInt(promptAfter);
      }
    }
  }

  var jsonvars = {
    id: currentProfilePage.id,
    first: 48
  }

  if (after != '') {
    jsonvars.after = after;
  }
  var urljsonvars = JSON.stringify(jsonvars);
  var url = 'https://www.instagram.com/graphql/query/?query_hash=58712303d941c6855d4e888c5f0cd22f&variables=' + encodeURIComponent(urljsonvars);
  $.ajax(url)
    .done(function(r) {
      var tmpQueue = [];
      $(r.data.user.edge_follow.edges).each(function(edge) {
        var u = $(this)[0].node;
        acctsQueue.push(u);
        tmpQueue.push(u);
      });
      arrayOfUsersToDiv(tmpQueue, false);
      handleCheckBoxes(tmpQueue);
      handleImagePreload();
      outputMessage(acctsQueue.length + ' following loaded so far');
      if (r.data.user.edge_follow.page_info.has_next_page == true && (acctsQueue.length < (parseInt(gblOptions.truncateStart) + parseInt(gblOptions.maxAcctQueueLength)) || gblOptions.limitQueue != true || currentProfilePage.edge_follow.count < parseInt(gblOptions.maxAcctQueueLength))) {
        ajaxLoadFollowing(r.data.user.edge_follow.page_info.end_cursor);
      } else {
        truncateQueue(gblOptions.truncateStart);
        arrayOfUsersToDiv(acctsQueue, true);
        handleCheckBoxes(acctsQueue);
        handleImagePreload();
        outputMessage(currentProfilePage.username + ' following loaded.  Count: ' + acctsQueue.length);
        outputMessage(' ');
        loadedTheirFollowings = true;
      }
    });
}
function ajaxGetAllMyFollowers(after) {
  var jsonvars = {
    id: user.viewer.id,
    first: 48
  }
  if (after != '') {
    jsonvars.after = after;
  }
  var urljsonvars = JSON.stringify(jsonvars);
  var url = 'https://www.instagram.com/graphql/query/?query_hash=37479f2b8209594dde7facb0d904896a&variables=' + encodeURIComponent(urljsonvars);
  if (after != '') {
    url = url + '&after=' + after;
  }
  $.ajax(url)
    .done(function(r) {
      var tmpQueue = [];
      $(r.data.user.edge_followed_by.edges).each(function(edge) {
        var u = $(this)[0].node;
        myFollowers.push(u);
        tmpQueue.push(u);
      });
      outputMessage(myFollowers.length + ' of your followers loaded so far');
      if (r.data.user.edge_followed_by.page_info.has_next_page == true) {
        ajaxGetAllMyFollowers(r.data.user.edge_followed_by.page_info.end_cursor);
      } else {
        outputMessage('Your Followers loaded.  Count: ' + myFollowers.length);
        outputMessage(' ');
        loadedMyFollowers = true;
      }
    }).fail(function(f) {
      if (f.status == 429) {
        outputMessage('429 rate limit from instagram. waiting 1 minute to attempt load more of your followers, please be patient!');
        setTimeout(function() {
          ajaxGetAllMyFollowers(after);
        }, 60000);
      }
    });
}
function ajaxGetAllMyFollowing(after) {
  var jsonvars = {
    id: user.viewer.id,
    first: 48
  }
  if (after != '') {
    jsonvars.after = after;
  }
  var urljsonvars = JSON.stringify(jsonvars);
  var url = 'https://www.instagram.com/graphql/query/?query_hash=58712303d941c6855d4e888c5f0cd22f&variables=' + encodeURIComponent(urljsonvars);
  $.ajax(url)
    .done(function(r) {
      var tmpQueue = [];
      $(r.data.user.edge_follow.edges).each(function(edge) {
        var u = $(this)[0].node;
        acctsQueue.push(u);
        tmpQueue.push(u);
      });
      outputMessage(acctsQueue.length + ' of your following loaded so far');
      if (r.data.user.edge_follow.page_info.has_next_page == true) {
        ajaxGetAllMyFollowing(r.data.user.edge_follow.page_info.end_cursor);
      } else {
        outputMessage('Your following loaded.  Count: ' + acctsQueue.length);
        outputMessage(' ');
        loadedMyFollowings = true;
      }
    }).fail(function(f) {
      if (f.status == 429) {
        outputMessage('429 rate limit from instagram. waiting 1 minute to attempt load more of your following, please be patient!');
        setTimeout(function() {
          ajaxGetAllMyFollowing(after);
        }, 60000);
      }
    });
}
function ajaxGetAllMyFollowingWhileFollow(after) {
  var jsonvars = {
    id: user.viewer.id,
    first: 48
  }
  if (after != '') {
    jsonvars.after = after;
  }
  var urljsonvars = JSON.stringify(jsonvars);
  var url = 'https://www.instagram.com/graphql/query/?query_hash=58712303d941c6855d4e888c5f0cd22f&variables=' + encodeURIComponent(urljsonvars);
  $.ajax(url)
    .done(function(r) {
      var tmpQueueWhileFollow = [];
      $(r.data.user.edge_follow.edges).each(function(edge) {
        var uWhileFollow = $(this)[0].node;
        acctsQueueTmp.push(uWhileFollow);
        tmpQueueWhileFollow.push(uWhileFollow);
      });

      if (r.data.user.edge_follow.page_info.has_next_page == true) {
        ajaxGetAllMyFollowingWhileFollow(r.data.user.edge_follow.page_info.end_cursor);
      } else {
        loadedMyFollowings = true;
      }
    }).fail(function(f) {
      if (f.status == 429) {
        outputMessage('429 rate limit from instagram. Wait!');
        setTimeout(function() {
          ajaxGetAllMyFollowingWhileFollow(after);
      }, 120000);
      }
    });
}

function isAdditionalDataFullyLoaded(q) {
  for (var i = 0; i < q.length; i++) {
    if (!q[i].edge_followed_by) {
      return false;
    }
  }
  return true;
}

function sortQueue(q, property, asc) {
  var propertySplit = property.split('.');

  if (propertySplit.length === 1) {
    q.sort(function(a, b) {
      if (asc == true) {
        return a[property] - b[property];
      } else {
        return b[property] - a[property];
      }
    });
  } else if (propertySplit.length === 2) {
    q.sort(function(a, b) {
      if (asc == true) {
        return a[propertySplit[0]][propertySplit[1]] - b[propertySplit[0]][propertySplit[1]];
      } else {
        return b[propertySplit[0]][propertySplit[1]] - a[propertySplit[0]][propertySplit[1]];
      }
    });
  }
  return q;
}
function quickUnfollowAcct(acct) {
    $.ajax({
            url: 'https://www.instagram.com/web/friendships/' + acct.id + '/unfollow/',
            method: 'POST',
            beforeSend: function(xhr) {
                xhr.setRequestHeader('x-csrftoken', user.csrf_token);
                xhr.setRequestHeader('x-instagram-ajax', '1');
            }
        })
        .done(function() {
            outputMessage('Unfollowed ' + acct.username + ' (' + acct.id + ') using button');
            $('.igBotInjectedLinkWhitelist[data-username="' + acct.username + '"]').parents('article').fadeOut();
            //$('.igBotInjectedLinkUnfollow[data-username="' + acct.username + '"]').fadeOut();

        })
        .fail(function(data) {
            if (data.status == 403) {
                alert('soft rate limit encountered, failed to unfollow ' + acct.username);
            } else if (data.status == 400) {
                alert('hard rate limit encountered, failed to unfollow ' + acct.username);
            } else {
                alert('Error ' + data.status + ', failed to unfollow ' + acct.username);
            }
        })
}

function appendLastPostDateToAcct(a) {
  if (a.edge_owner_to_timeline_media.count > 0) {
    var sortedMedia = sortQueue(a.edge_owner_to_timeline_media.edges, 'node.taken_at_timestamp', false);
    var lastMediaDate = 0;
    if (sortedMedia.length > 0 && sortedMedia[0].node.taken_at_timestamp != 'undefined') {
      lastMediaDate = sortedMedia[0].node.taken_at_timestamp * 1000;
    }
    a.lastPostDate = lastMediaDate;
  }
}

function appendFollowersRatioToAcct(a) {
  if (a.edge_follow.count > 0 && a.edge_followed_by.count > 0) {
    a.followRatio = a.edge_followed_by.count / a.edge_follow.count;
  } else if (a.edge_followed_by.count > 0) {
    a.followRatio = a.edge_followed_by.count;
  } else {
    a.followRatio = 0;
  }
}

function appendLastPostDateToAccts(q) {
  for (var i = 0; i < q.length; i++) {
    appendLastPostDateToAcct(q[i]);
  }
}

function appendFollowersRatioToAccts(q) {
  for (var i = 0; i < q.length; i++) {
    appendFollowersRatioToAcct(q[i]);
  }
}

function truncateQueue(start) {
  if (isNaN(parseInt(start))) start = 0;

  if (acctsQueue.length > gblOptions.maxAcctQueueLength && gblOptions.limitQueue != false) {
    var end = (start + gblOptions.maxAcctQueueLength);
    acctsQueue = acctsQueue.slice(start, end);
  }
}

function arrayOfUsersToDiv(q, clearDiv) {

  if (typeof clearDiv == 'undefined') clearDiv = true;

  if (clearDiv === true) {
    $('#igBotQueueContainer').children().remove();
  } else {
    $('#igBotQueueContainer').children().not('.igBotQueueAcct').remove();
  }

  var c = document.createDocumentFragment();
  for (var i = 0; i < q.length; i++) {
    var u = q[i];

    if (document.getElementById('' + u.id + '_container')) continue;
    var newQueueItem = document.createElement("div");
    newQueueItem.id = '' + u.id + '_container';
    newQueueItem.className = 'igBotQueueAcct';

    var newCheckBox = document.createElement("input");
    newCheckBox.setAttribute('type', 'checkbox');
    newCheckBox.id = u.id;
    newCheckBox.value = u.id;
    newCheckBox.className = 'igBotQueueAcctCheckbox';
    newQueueItem.appendChild(newCheckBox);

    var newLabel = document.createElement("label");
    newLabel.setAttribute('for', u.id);

    var newImg = document.createElement("img");
    newImg.className = 'igBotQueueAcctProfilePicture';
    newImg.setAttribute('data-src', u.profile_pic_url);
    newLabel.appendChild(newImg);

    newQueueItem.appendChild(newLabel);

    var newLayoutDiv = document.createElement("div");
    newLayoutDiv.className = "igBotQueueAcctNameHolder";

    var newA = document.createElement("a");
    newA.href = '/' + u.username + '/';
    newA.textContent = u.username;
    newA.className = 'igBotQueueAcctUserName';
    if (u.is_private && u.is_private == true) {
      var iconPrivate = document.createElement('span');
      iconPrivate.className = 'iconPrivate';
      newA.appendChild(iconPrivate);
    }
    if (u.is_verified && u.is_verified == true) {
      var iconVerified = document.createElement('span');
      iconVerified.className = 'iconVerified';
      newA.appendChild(iconVerified);
    }
    newLayoutDiv.appendChild(newA);

    var nameSpan = document.createElement("span");
    nameSpan.className = 'igBotQueueAcctUserName';
    nameSpan.textContent = u.full_name;
    newLayoutDiv.appendChild(nameSpan);

    if (u.edge_followed_by) {
      var counts = document.createElement('span');
      counts.className = 'followerCounts'
      counts.textContent = u.edge_followed_by.count + ' | ' + u.edge_follow.count + ' | ' + u.edge_owner_to_timeline_media.count;
      counts.title = u.edge_followed_by.count + ' followers | ' + u.edge_follow.count + ' following' + ' | ' + u.edge_owner_to_timeline_media.count + ' posts | ' + new Date(u.lastPostDate).toString() + ' last post';
      newLayoutDiv.appendChild(counts);
    }
    newQueueItem.appendChild(newLayoutDiv);
    c.appendChild(newQueueItem);
  }
  document.getElementById('igBotQueueContainer').appendChild(c);
}


function handleImagePreload() {
  const images = document.querySelectorAll('#igBotQueueContainer img');
  const config = {
    rootMargin: '0px 0px 50px 0px',
    threshold: 0
  };
  let loaded = 0;

  let observer = new IntersectionObserver(function(entries, self) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        preloadImage(entry.target);
        self.unobserve(entry.target);
      }
    });
  }, config);

  images.forEach(image => {
    if (image.hasAttribute('data-src')) {
      observer.observe(image);
    }
  });

  function preloadImage(img) {
    const src = img.getAttribute('data-src');
    if (!src) {
      return;
    }
    img.src = src;
    img.removeAttribute('data-src');
  }

}

function handleCheckBoxes(q) {

  document.getElementById('igBotQueueCount').textContent = '' + q.length + ' accounts';


  function displaySelectedCount() {
    let boxCheckedCount = 0;
    boxes.forEach(box => {
      if (box.checked == true) boxCheckedCount++;
    });
    document.getElementById('igBotQueueSelectedCount').textContent = '' + boxCheckedCount + ' selected';
  }

  function selectAllCheckBoxes() {
    boxes.forEach(box => {
      if (document.getElementById(box.value + '_container').style.visibility != 'hidden') box.checked = true;
    });
    displaySelectedCount();
  }

  function selectNoneCheckBoxes() {
    boxes.forEach(box => {
      if (document.getElementById(box.value + '_container').style.visibility != 'hidden') box.checked = false;
    });
    displaySelectedCount();
  }

  function invertCheckBoxes() {
    boxes.forEach(box => box.checked = !box.checked);
    displaySelectedCount();
  }

  function removeSelected() {

    var useDefaultList = true;

    if (currentList == 'acctsWhiteList') {
      useDefaultList = false;
    }

    boxes.forEach(box => {
      if (box.checked) {
        if (useDefaultList == true) {
          acctsQueue = acctsQueue.filter(u => u.id !== box.value);
        } else if (currentList == 'acctsWhiteList') {
          acctsWhiteList = acctsWhiteList.filter(u => u.id !== box.value);
        }

        $('#' + box.value + '_container').remove();
      }
    });
    refreshBoxes();
    updateCount();
    displaySelectedCount();
  }

  function addAcctsToWhiteList() {
    boxes.forEach(box => {
      if (box.checked) {
        var acct = findAcctById(box.value, acctsQueue);
        var acctInWhiteList = findAcctById(box.value, acctsWhiteList);
        if (acct !== false && acctInWhiteList == false) {
          acctsWhiteList.push(acct);
          outputMessage(acct.username + ' added to whitelist');
        } else {
          outputMessage(acct.username + ' already on whitelist');
        }
      }
    });

    return true;
  }

  function checkIntermediateBoxes(first, second) {
    if (boxes.indexOf(first) > boxes.indexOf(second)) {
      [second, first] = [first, second];
    }
    intermediateBoxes(first, second).forEach(box => {
      if (document.getElementById(box.value + '_container').style.visibility != 'hidden') {
        box.click();
      }
    });
    displaySelectedCount();
  }

  function intermediateBoxes(start, end) {
    return boxes.filter((item, key) => {
      return boxes.indexOf(start) < key && key < boxes.indexOf(end);
    });
  }

  function changeBox(event) {
    if (event.shiftKey && this != lastChecked) {
      checkIntermediateBoxes(lastChecked, this);
    }
    lastChecked = this;
    displaySelectedCount();
  }

  function refreshBoxes() {
    boxes = Array.from(document.querySelectorAll('#igBotQueueContainer [type="checkbox"]'));
  }

  let lastChecked;
  var boxes;

  refreshBoxes();

  boxes.forEach(item => item.addEventListener('click', changeBox));

  $('#btnSelectAll').off('click.selectAllCheckBoxes').on('click.selectAllCheckBoxes', selectAllCheckBoxes);
  $('#btnSelectNone').off('click.selectNoneCheckBoxes').on('click.selectNoneCheckBoxes', selectNoneCheckBoxes);
  $('#btnInvertSelection').off('click.invertCheckBoxes').on('click.invertCheckBoxes', invertCheckBoxes);
  $('#btnRemoveSelected').off('click.removeSelected').on('click.removeSelected', removeSelected);
  $('#btnAddToWhiteList').off('click.addAcctsToWhiteList').on('click.addAcctsToWhiteList', addAcctsToWhiteList);
  $('#btnSaveWhiteList').off('click.saveWhiteListToStorageAndDisk').on('click.saveWhiteListToStorageAndDisk', saveWhiteListToStorageAndDisk);
  //$('#igBotQueueFilter').off('input.filterQueue').on('input.filterQueue', filterQueue);
  $('.close-icon').off('click.filterQueue').on('click.filterQueue', function() {
    setTimeout(filterQueue, 1);
  });
  updateCount();
  displaySelectedCount();
}


function alreadyAttempted(acct) {

  for (var i = 0; i < acctsPreviouslyAttempted.length; i++) {
    if (acctsPreviouslyAttempted[i].id && acctsPreviouslyAttempted[i].id == acct.id) return acctsPreviouslyAttempted[i];
  }

  return false;
}

function addToAttempted(acct) {

  var acctCopy = acct;

  var d = new Date();
  acctCopy["followAttemptDate"] = '' + d.getTime();

  acctsPreviouslyAttempted.push(acctCopy);
  chrome.storage.local.set({
    acctsAttempted: acctsPreviouslyAttempted
  });
}

function ajaxFollowAllFollowings() {
  acctsQueue = theirFollowings;
  ajaxFollowAll();
}

function ajaxFollowAll() {
  if (acctsQueue.length == 0) {
    outputMessage('No accounts left!');
    $('#btnGetAllUsersFollowers,#btnGetAllUsersFollowing').removeClass('pulsing');
    return false;
  }

  ajaxFollowUser(acctsQueue.shift());
}

function removeAcctFromQueueDisplay(id, gray) {
  if (gray === true) {
    $('#igBotQueueContainer #' + id + '_container').css({
      'opacity': '.5'
    });
  } else {
    $('#igBotQueueContainer #' + id + '_container').fadeOut(300, function() {
      $(this).remove();
    });
  }
  updateCount();
}

function updateCount() {
  if (currentList === 'acctsWhiteList') {
    document.getElementById('igBotQueueCount').textContent = '' + acctsWhiteList.length + ' accounts';
  } else {
    document.getElementById('igBotQueueCount').textContent = '' + acctsQueue.length + ' accounts';
  }
}

function ajaxFollowUser(acct) {
    var ignorestring = '';
    var promises = [];
    let followable = true;

    if (!acct) {
        outputMessage('no account');
        return false;
    }
    var acctFromStorage = alreadyAttempted(acct);
    if (acctFromStorage !== false) {
        acctsProcessed.push(acct);
        removeAcctFromQueueDisplay(acct.id);
        outputMessage(acct.username + ' already attempted ' + timeToDate(acctFromStorage.followAttemptDate));
        ajaxFollowAll();
        return false;
    } else if (acct.followed_by_viewer == true) {
        acctsProcessed.push(acct);
        removeAcctFromQueueDisplay(acct.id);
        outputMessage(acct.username + ' already being followed, skipping');
        ajaxFollowAll();
        return false;
    } else if (acct.requested_by_viewer == true) {
        acctsProcessed.push(acct);
        removeAcctFromQueueDisplay(acct.id);
        outputMessage(acct.username + ' already requested, skipping');
        ajaxFollowAll();
        return false;
    } else if (acct.is_private == true && gblOptions.followPrivateAccounts != true) {
        acctsProcessed.push(acct);
        removeAcctFromQueueDisplay(acct.id);
        outputMessage(acct.username + ' is private, skipping');
        ajaxFollowAll();
        return false;
    } else if (ignorestring != '' && acct.username.toLowerCase().indexOf(ignorestring.toLowerCase()) == -1) {
        removeAcctFromQueueDisplay(acct.id);
        acctsProcessed.push(acct);
        outputMessage(acct.username + ' does not contain ' + ignorestring + ', skipping');
        ajaxFollowAll();
        return false;
    } else if (gblOptions.filterOptions.applyFiltersAutomatically == true) {
        promises.push(filterCriteriaMet(acct).then((met) => {
          if (met == false) {
            followable = false;
          }
    }));
    }

  Promise.all(promises).then(function() {

    searchUrl = 'https://www.instagram.com/' + acct.username + '/?hl=de?__a=1';
    var set_comments = document.getElementById("setComments");
    var set_likes = document.getElementById("setLikes");
    var set_unfollow = document.getElementById("setUnfollow");
    var set_follow = document.getElementById("setFollow");
    var set_visitStories = document.getElementById("setVisitStories");
    var countoflikes = $("#countoflikes").val();

    if (followable === false) {
        if (set_follow.checked == true || set_comments.checked == true || set_unfollow.checked == true || set_likes.checked == true){
            removeAcctFromQueueDisplay(acct.id);
            acctsProcessed.push(acct);
            outputMessage(acct.username + ' skipped (did not match your filters)');
            if (noAcctsLeft()) return false;
            outputMessage(' ');
            setTimeout(ajaxFollowAll, 500);
            return false;
        }
    }

    if(set_comments.checked != true && set_likes.checked != true && set_follow.checked != true){
        outputMessage('Nothing to do. Chose an Action!');
        outputMessage(' ');
        $('#btnFollowQueue').removeClass('pulsing');
    }

    $.get(searchUrl, function(data, status) {
        const jsonObject = data.match(/<script type="text\/javascript">window\._sharedData = (.*)<\/script>/)[1].slice(0, -1);
        const userInfo = JSON.parse(jsonObject);
        const mediaArray = userInfo.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.edges.splice(0, 2);
        var schalteraus = new Boolean(false);
        // 2 Bilder werden geliket -> Entspricht 8640 am Tag
        if(set_likes.checked == true){
            for (let media of mediaArray) {
                const node = media.node;
                likethisguy(node.id, schalteraus);
            }
        }
        if(set_comments.checked == true && mediaArray[0]){
            if(mediaArray[0].node.edge_liked_by.count >= countoflikes){
                commentthisguy(mediaArray[0].node.id, schalteraus);
            }
            else {
                outputMessage('Not enough likes to comment');
                outputMessage(' ');
            }
        }
    }).fail(function(data, status) {
        if(data.status == 404) {
            console.log('Razupaltuf');
        }
    });
    //wenn checked unfollow ajaxUnfollowAll()
    if(set_unfollow.checked == true){
        initUnfollowMyFollowersWhileFollowing();
    }
    if(set_visitStories.checked == true){
        var path = "https://www.instagram.com/stories/"+ acct.username +"/";
        var win = window.open(path,'_blank', 'toolbar=no,status=no,menubar=no,scrollbars=no,resizable=no,width=400, height=600');
        win.moveTo(5000, 5000);
        win.blur();
        win.focus();
        setTimeout(win.close(), 1000);
        outputMessage('Story visited');
    }


    //wenn checked follow
    if(set_follow.checked == true){
        $.ajax({
            url: 'https://www.instagram.com/web/friendships/' + acct.id + '/follow/',
            method: 'POST',
            beforeSend: function(xhr) {
              xhr.setRequestHeader('x-csrftoken', user.csrf_token);
              xhr.setRequestHeader('x-instagram-ajax', '1');
            }
          })
          .done(function() {
            acctsProcessed.push(acct);
            removeAcctFromQueueDisplay(acct.id);
            addToAttempted(acct);
            outputMessage('Followed ' + acct.username + ' (' + acct.id + ') ' + acctsQueue.length + ' left to go');
            //TODO iwo hier
            if (gblOptions.useRandomTimeDelay == true) {
              gblOptions.timeDelay = getRandomInt(gblOptions.minRandomTimeDelay, gblOptions.maxRandomTimeDelay);
            }
            outputMessage('waiting  ' + (gblOptions.timeDelay / 1000) + ' seconds to follow ' + acctsQueue[0].username);
            outputMessage(' ');
            setTimeout(ajaxFollowAll, gblOptions.timeDelay);
            // fügt mehrere Hinzu die dann abgearbeitet werden
          })
          .fail(function(data) {
            acctsQueue.unshift(acct);
            if (data.status == 404) {
            } else if (data.status == 403) {
              outputMessage('soft rate limit encountered, waiting ' + (gblOptions.timeDelayAfterSoftRateLimit / 60000) + ' minutes');
              setTimeout(ajaxFollowAll, gblOptions.timeDelayAfterSoftRateLimit);
            } else if (data.status == 400) {
              outputMessage('hard rate limit encountered, waiting ' + (gblOptions.timeDelayAfterHardRateLimit / 3600000) + ' hours');
              setTimeout(ajaxFollowAll, gblOptions.timeDelayAfterHardRateLimit);
            } else {
              outputMessage(data.status + ' error, trying again in 5 seconds');
              setTimeout(ajaxFollowAll, 5000);
            }
         });
     }

    });
}
function followthisGuy(id){
    $.ajax({
        url: 'https://www.instagram.com/web/friendships/' + id + '/follow/',
        method: 'POST',
        beforeSend: function(xhr) {
          xhr.setRequestHeader('x-csrftoken', user.csrf_token);
          xhr.setRequestHeader('x-instagram-ajax', '1');
        }
      })
      .done(function() {
          outputMessage('Followed');
     });
}
function likethisguy(id, ishashtag) {
  $.ajax({
      url: 'https://www.instagram.com/web/likes/' + id + '/like/',
      method: 'POST',
      beforeSend: function(xhr) {
        xhr.setRequestHeader('x-csrftoken', user.csrf_token);
        xhr.setRequestHeader('x-instagram-ajax', '1');
      }
    })
    .done(function() {
      previousLikes.push(id);
      savePreviousLikesToStorage();
      outputMessage('Liked!');
      if(ishashtag === false){
          setTimeout(ajaxFollowAll, gblOptions.timeDelay);
      }

    })
    .fail(function(data) {
      mediaToLike.push(id);
      outputMessage('You maybe have reached the like limit!');
      outputMessage(' ');
    });
}

function commentthisguy(id, ishashtag) {
    var someArray = [];

    var commentArray = $("#commentArray").val();
    $.each(commentArray.split(","), function (i, name) {
      if(name != ""){
          someArray.push(name);
      }
    });
    function getMessage() {
       return someArray[Math.floor(Math.random() * someArray.length)];
    }
    $.ajax({
      url: 'https://www.instagram.com/web/comments/' + id + '/add/',
      method: 'POST',
      data: {comment_text: getMessage()},
      beforeSend: function(xhr) {
        xhr.setRequestHeader('x-csrftoken', user.csrf_token);
        xhr.setRequestHeader('x-instagram-ajax', '1');
        }
    })
    .done(function(data) {
        outputMessage('Commented!');
        outputMessage(' ');
        if(ishashtag === false){
            setTimeout(ajaxFollowAll, gblOptions.timeDelay);
        }
    })
    .fail(function(data) {
        outputMessage('Not Commented!');
        outputMessage(' ');
    });
}

function ajaxLikeAllPosts() {
  $('#btnLikeFeed').addClass('pulsing');
  loadPreviousLikes();
  var count = 50;
  if (!isNaN(document.getElementById('numberToLike').value)) {
    count = document.getElementById('numberToLike').value;
  }
  var url = 'https://www.instagram.com/graphql/query/?query_id=17882047975103825&variables=%7B%22fetch_media_item_count%22%3A' + count + '%2C%22fetch_comment_count%22%3A1%2C%22fetch_like%22%3A10%7D';

  $.ajax(url)
    .done(function(r) {
      $(r.data.user.edge_web_feed_timeline.edges).each(function(edge) {
        mediaToLike.push($(this)[0].node.id);
      });
      likeAllMedia();
    });
}

function likeAllMedia() {

  if (mediaToLike.length == 0) {
    outputMessage('Finished liking media');
    $('#btnLikeFeed,#btnLikeHashtag').removeClass('pulsing');
    return false;
  }

  var id = mediaToLike.pop();

  for (var i = 0; i < previousLikes.length; i++) {
    if (id == previousLikes[i]) {
      outputMessage('Already liked, moving on...');
      setTimeout(likeAllMedia, 1);
      return false;
    }
  }

  likeMedia(id);
}



function likeMedia(id) {
  $.ajax({
      url: 'https://www.instagram.com/web/likes/' + id + '/like/',
      method: 'POST',
      beforeSend: function(xhr) {
        xhr.setRequestHeader('x-csrftoken', user.csrf_token);
        xhr.setRequestHeader('x-instagram-ajax', '1');
      }
    })
    .done(function() {
      previousLikes.push(id);
      savePreviousLikesToStorage();
      outputMessage('Like successful, ' + mediaToLike.length + ' left to go');
      if (gblOptions.useRandomTimeDelay == true) {
        gblOptions.timeDelay = getRandomInt(gblOptions.minRandomTimeDelay, gblOptions.maxRandomTimeDelay);
      }

      outputMessage('waiting  ' + (gblOptions.timeDelay / 1000) + ' seconds to Like next');
      outputMessage(' ');
      setTimeout(likeAllMedia, gblOptions.timeDelay);

    })
    .fail(function(data) {
      mediaToLike.push(id);
      if (data.status == 403) {
        outputMessage('soft rate limit encountered, waiting 60 seconds to like next');
        setTimeout(likeAllMedia, 60000);
      } else if (data.status == 400) {
        outputMessage('hard rate limit encountered, waiting 5 minutes to like next');
        setTimeout(likeAllMedia, 300000);
      } else {
        outputMessage(data.status + ' error, trying again in 5 seconds');
        setTimeout(likeAllMedia, 5000);
      }
    });
}

async function populateAllQueueUsersInfo(q) {
  for (var i = 0; i < q.length; i++) {
    q[i] = await getAdditionalDataForAcct(q[i]);
    if (q[i].assumedDeleted) q.slice(i, 1);
  }
  outputMessage('Done loading additional info for all accounts');
  if (window.confirm('Finished getting additional info, save the queue now?')) {
    saveQueueToStorage();
  }
}

function ajaxUnfollowAll() {
    ajaxUnfollowAcct(acctsQueue.pop());
}
function ajaxUnfollowAllWhileFollow() {
  ajaxUnfollowWhileFollow(acctsQueueTmp.pop());
}

function ajaxUnfollowAcct(acct) {
  var promises = [];
  let timeoutpromises = [];
  let unfollowable = true;

  var acctFromStorage = alreadyAttempted(acct);
  var timeSinceFollowed = today - acctFromStorage.followAttemptDate;
  if (containsObject(acct, acctsWhiteList) == true) {
    outputMessage(acct.username + ' is whitelisted, skipping');
    removeAcctFromQueueDisplay(acct.id, true);
    acctsProcessed.push(acct);
    setTimeout(ajaxUnfollowAll, 1);
    return false;
  }

  if (acctFromStorage != false && acctFromStorage.followAttemptDate && gblOptions.unFollowFresh == false && timeSinceFollowed < gblOptions.unFollowDelay) {
    outputMessage(acct.username + ' was followed too recently to unfollow ' + millisecondsToHumanReadable(timeSinceFollowed, true));
    setTimeout(ajaxUnfollowAll, 1);
    removeAcctFromQueueDisplay(acct.id, true);
    acctsProcessed.push(acct);
    return false;
  }

  if (gblOptions.dontUnFollowFilters == true || gblOptions.dontUnFollowFollowers == true || gblOptions.unFollowIfOld == true) {
    promises.push(filterCriteriaMetForUnfollowing(acct).then((met) => {
      if (met == false) {
        unfollowable = false;
      }
    }));
  }

  Promise.all(promises).then(function() {
    if (unfollowable === false) {
      removeAcctFromQueueDisplay(acct.id, true);
      acctsProcessed.push(acct);
      if (noAcctsLeft()) {
        return false;
      } else {
        outputMessage('waiting 1min to unfollow ' + acctsQueue[acctsQueue.length - 1].username);
        setTimeout(ajaxUnfollowAll, 60000);
        return false;
      }
    }

    $.ajax({
        url: 'https://www.instagram.com/web/friendships/' + acct.id + '/unfollow/',
        method: 'POST',
        beforeSend: function(xhr) {
          xhr.setRequestHeader('x-csrftoken', user.csrf_token);
          xhr.setRequestHeader('x-instagram-ajax', '1');
        }
      })
      .done(function() {
        acctsProcessed.push(acct);
        removeAcctFromQueueDisplay(acct.id);
        outputMessage('Unfollowed ' + acct.username + ' (' + acct.id + ') | ' + acctsProcessed.length + ' processed, ' + acctsQueue.length + ' left to go');
        if (gblOptions.useRandomTimeDelay == true) {
          gblOptions.timeDelay = getRandomInt(gblOptions.minRandomTimeDelay, gblOptions.maxRandomTimeDelay);
        }
        if (noAcctsLeft()) {
          return false;
        } else {
          outputMessage('waiting  ' + (gblOptions.timeDelay / 1000) + ' seconds to unfollow ' + acctsQueue[acctsQueue.length - 1].username);
          timeoutpromises.push(new Promise((resolve) => setTimeout(resolve, gblOptions.timeDelay)));
        }
      })
      .fail(function(data) {
        acctsQueue.push(acct);
        if (data.status == 403) {
          outputMessage('soft rate limit encountered, waiting ' + (gblOptions.timeDelayAfterSoftRateLimit / 60000) + ' minutes');
          timeoutpromises.push(new Promise((resolve) => setTimeout(resolve, gblOptions.timeDelayAfterSoftRateLimit)));
        } else if (data.status == 400) {
          outputMessage('hard rate limit encountered, waiting ' + (gblOptions.timeDelayAfterHardRateLimit / 3600000) + ' hours');
          timeoutpromises.push(new Promise((resolve) => setTimeout(resolve, gblOptions.timeDelayAfterHardRateLimit)));
        } else {
          outputMessage(data.status + ' error, trying again in 5 seconds');
          timeoutpromises.push(new Promise((resolve) => setTimeout(resolve, 5000)));
        }
      }).always(function() {
        Promise.all(timeoutpromises).then(ajaxUnfollowAll);
      });
  });
}

function ajaxUnfollowWhileFollow(acct) {
  var promises = [];
  let timeoutpromises = [];
  let unfollowable = true;
  var acctFromStorage = alreadyAttempted(acct);
  var timeSinceFollowed = today - acctFromStorage.followAttemptDate;

  if (containsObject(acct, acctsWhiteList) == true) {
    acctsProcessed.push(acct);
    ajaxUnfollowAllWhileFollow();
    return false;
  }

  if (acctFromStorage != false && acctFromStorage.followAttemptDate && gblOptions.unFollowFresh == false && timeSinceFollowed < gblOptions.unFollowDelay) {
    outputMessage(acct.username + ' was followed too recently to unfollow ' + millisecondsToHumanReadable(timeSinceFollowed, true));
    setTimeout(ajaxUnfollowWhileFollow, 1);
    removeAcctFromQueueDisplay(acct.id, true);
    acctsProcessed.push(acct);
    return false;
  }

  if (gblOptions.dontUnFollowFilters == true || gblOptions.dontUnFollowFollowers == true || gblOptions.unFollowIfOld == true) {
    promises.push(filterCriteriaMetForUnfollowing(acct).then((met) => {
      if (met == false) {
        unfollowable = false;
      }
    }));
  }

  Promise.all(promises).then(function() {
    if (unfollowable === false) {
      removeAcctFromQueueDisplay(acct.id, true);
      acctsProcessed.push(acct);
      if (noAcctsLeft()) {
        return false;
      } else {
        outputMessage('waiting 1 min to unfollow ' + acctsQueue[acctsQueue.length - 1].username);
        setTimeout(ajaxUnfollowWhileFollow, 60000);
        return false;
      }
    }

    $.ajax({
        url: 'https://www.instagram.com/web/friendships/' + acct.id + '/unfollow/',
        method: 'POST',
        beforeSend: function(xhr) {
          xhr.setRequestHeader('x-csrftoken', user.csrf_token);
          xhr.setRequestHeader('x-instagram-ajax', '1');
        }
      })
      .done(function() {
        acctsProcessed.push(acct);
        removeAcctFromQueueDisplay(acct.id);
        outputMessage('Unfollowed ' + acct.username + ' | ');

        if (noAcctsLeft()) {
          return false;
        } else {
          timeoutpromises.push(new Promise((resolve) => setTimeout(resolve, gblOptions.timeDelay)));
        }
      })
      .fail(function(data) {
        acctsQueue.push(acct);
        if (data.status == 403) {
          outputMessage('soft rate limit encountered, waiting ' + (gblOptions.timeDelayAfterSoftRateLimit / 60000) + ' minutes');
          timeoutpromises.push(new Promise((resolve) => setTimeout(resolve, gblOptions.timeDelayAfterSoftRateLimit)));
        } else if (data.status == 400) {
          outputMessage('hard rate limit encountered, waiting ' + (gblOptions.timeDelayAfterHardRateLimit / 3600000) + ' hours');
          timeoutpromises.push(new Promise((resolve) => setTimeout(resolve, gblOptions.timeDelayAfterHardRateLimit)));
        } else {
          outputMessage(data.status + ' error, trying again in 5 seconds');
          timeoutpromises.push(new Promise((resolve) => setTimeout(resolve, 5000)));
        }
    });
  });
}


function noAcctsLeft() {
  if (acctsQueue.length === 0) {
    outputMessage('No accounts left!');
    $('#btnFollowList').removeClass('pulsing');
    return true;
  }
  return false;
}

function injectIcon() {
    var imgURL = chrome.extension.getURL("icon_48.svg");
    $('#instabotIcon').remove();
        if($("._47KiJ")[0]){
    $('._47KiJ').prepend('<div id="instabotIcon"></div>');
    }else {
        $('.mXkkY.KDuQp').prepend('<div id="instabotIcon"></div>');
    }

    $('#instabotIcon').css({
        'background-image': 'url("' + imgURL + '")',
        'background-repeat': 'no-repeat',
        'top': '0px'
    }).click(toggleControlsDiv);

}
function hideControlsDiv() {
  toggleControlsDiv();
  shakeInstabotIcon();
}

function shakeInstabotIcon() {
  $('#instabotIcon').shake(50, 2, 8);
}



function toggleControlsDiv() {
  $('#igBotInjectedContainer').slideToggle(function() {
    var isVisible = $('#igBotInjectedContainer').is(":visible");
    saveHiddenStatus(!isVisible);
  });
}

function openControlsDiv() {
  var isVisible = $('#igBotInjectedContainer').is(":visible");
  if (isVisible == false) {
    toggleControlsDiv();
  }
}

(function(win) {
    'use strict';

    var listeners = [],
        doc = win.document,
        MutationObserver = win.MutationObserver || win.WebKitMutationObserver,
        observer;

    function ready(selector, fn) {
        // Store the selector and callback to be monitored
        listeners.push({
            selector: selector,
            fn: fn
        });
        if (!observer) {
            // Watch for changes in the document
            observer = new MutationObserver(check);
            observer.observe(doc.documentElement, {
                childList: true,
                subtree: true
            });
        }
        // Check if the element is currently in the DOM
        check();
    }

    function check() {
        // Check the DOM for elements matching a stored selector
        for (var i = 0, len = listeners.length, listener, elements; i < len; i++) {
            listener = listeners[i];
            // Query for elements matching the specified selector
            elements = doc.querySelectorAll(listener.selector);
            for (var j = 0, jLen = elements.length, element; j < jLen; j++) {
                element = elements[j];
                // Make sure the callback isn't invoked with the 
                // same element more than once
                if (!element.ready) {
                    element.ready = true;
                    // Invoke the callback with the element
                    listener.fn.call(element, element);
                }
            }
        }
    }

    // Expose `ready`
    win.ready = ready;

})(this);


function injectControlsDiv() {
  $('#igBotInjectedContainer').remove();



  $.get(chrome.extension.getURL('bot.html'), function(data) {
    $('body').prepend($.parseHTML(data));
    loadOptions();
    loadWhiteList();
    bindEvents();
    ready('a.sqdOP.yWX7d._8A5w5.ZIAjV', function(element) { addNewConvenienceLinks(element); });
    ready('h2._7UhW9.fKFbl.yUEEX.KV-D4.fDxYl', function(element) { addNewConvenienceLinktoUserPage(element); });
    ready('a.FPmhX.notranslate._0imsa', function(element) { addNewConvenienceLinktoUserPage(element); }); 
  });
}

function bindEvents() {
    if (window.location.href.indexOf('stories') > -1) {
        $('#igBotInjectedContainer').remove();
        setTimeout(function() {
          $("._7UhW9.xLCgt.MMzan.h_zdq.uL8Hv").click();
      }, 500);
    }
    if (!localStorage['instabot_install_date']) {
        first_run = true;
        localStorage['instabot_install_date'] = '' + today;
    }

    var imgURL = chrome.extension.getURL("");
    $('.circle1').attr('src',imgURL + 'index-portal-red-semi.svg');
    $('.circle2').attr('src',imgURL + 'index-portal-red.svg');
    $('.circle3').attr('src',imgURL + 'index-portal-orange-semi.svg');
    $('.circle4').attr('src',imgURL + 'index-portal-orange.svg');
    $('.circle5').attr('src',imgURL + 'index-portal-yellow-semi.svg');
    $('.circle6').attr('src',imgURL + 'index-portal-yellow.svg');
    $('.circle7').attr('src',imgURL + 'index-portal-green-semi.svg');
    $('.circle8').attr('src',imgURL + 'index-portal-green.svg');
    $('.circle9').attr('src',imgURL + 'index-portal-blue-semi.svg');
    $('.circle10').attr('src',imgURL + 'index-portal-blue.svg');
    $('.settingssvg').attr('src',imgURL + 'settingstoolswheel.svg');


    var set_hashtagArr = document.getElementById("setHashtagArr");
    var set_usernameArr = document.getElementById("setUsernameArr");
    var set_userCommentersArr = document.getElementById("setCommentersArr");

    $('.modal-toggle.follow').on('click', function(e) {
      e.preventDefault();
      $('.modal.follow').toggleClass('is-visible');
    });
    $('.modal-toggle.unfollow').on('click', function(e) {
      e.preventDefault();
      $('.modal.unfollow').toggleClass('is-visible');
    });
    $('#igBotInjectedContainer #btnLikeFeed').click(ajaxLikeAllPosts).children().click(function(e) {
      return false;
    });
    $(".modal-toggle.save-unfollow").on("click", function(){
       saveThisOptions();
       $('.modal.unfollow').toggleClass('is-visible');
    });
    $(".modal-toggle.save-follow").on("click", function(){
       saveThisOptions();
       $('.modal.follow').toggleClass('is-visible');
    });
    $('#igBotInjectedContainer #btnFollowList').click(initUnfollowMyFollowers);
    $('#igBotInjectedContainer #btnHide').click(hideControlsDiv);


    $(document).on('click.convenienceUnFollow', 'a.igBotInjectedLinkUnfollow', function() {
        $(this).off('click.convenienceUnFollow').css({ "color": "white" }).append('<div class="igBotLoader"></div>');
        convenienceLinkUnfollowAcct($(this).attr('data-username'));
    })
    $(document).on('click.convenienceWhitelist', 'a.igBotInjectedLinkWhitelist', function() {
        $(this).off('click.convenienceWhitelist').css({ "color": "white" }).append('<div class="igBotLoader"></div>');
        convenienceLinkWhitelistAcct($(this).attr('data-username'));
    })


  //$('#btnFollowQueue').click(findAcc);
  $('#btnFollowQueue').click(function() {
      if(set_hashtagArr.checked == true){
          findAcc();
      }
      if(set_usernameArr.checked == true){
          findUsername();
      }
      if(set_userCommentersArr.checked == true){
          findUsernameForCommenters();
      }
  });
  $('#btnLoadSavedQueue').click(loadSavedQueue);
  $('#btnViewWhiteList').click(viewWhiteList);
  $('#btnSaveQueueToStorage').click(saveQueueToStorage);
  $('#btnGetAdditionalUserData').click(function() {
    populateAllQueueUsersInfo(acctsQueue);
  });

  if (getCurrentPageUsername() != '') {
    setCurrentPageUsername();
  } else {
    $('#igBotInjectedContainer #btnGetAllUsersFollowers').off('click.setCurrentPageUsername').on('click.setCurrentPageUsername', setCurrentPageUsername);
    $('#igBotInjectedContainer #btnGetAllUsersFollowing').off('click.setCurrentPageUsername').on('click.setCurrentPageUsername', setCurrentPageUsername);
  }

  if (getHashtagFromUrl() != '') {
    setCurrentPageHashtag();
  } else {
    $('#igBotInjectedContainer #btnLikeHashtag').off('click.setCurrentPageHashtag').on('click.setCurrentPageHashtag', setCurrentPageHashtag);
  }

}

function applyFiltersManually() {

  if (isAdditionalDataFullyLoaded(acctsQueue) === false) {
    if (window.confirm('Must load additional data about each user account in order to apply filters. Load data now?')) {
      populateAllQueueUsersInfo(acctsQueue).then(applyFiltersManually);
    }
  } else {

    var filtered = [];
    for (let i = acctsQueue.length - 1; i > -1; i--) {
      filtered.push(filterCriteriaMet(acctsQueue[i]).then((met) => {
        if (met === false) {
          outputMessage(acctsQueue[i].username + ' removed from queue (did not match your filters)');
          removeAcctFromQueueDisplay(acctsQueue[i].id);
          acctsQueue.splice(i, 1);
        }
      }));
    }

    Promise.all(filtered).then(function() {
      outputMessage('Filters applied.');
      if (window.confirm('Filters applied.  Save queue now?')) saveQueueToStorage();
    });

  }

}

function getAdditionalDataForAcct(a) {
  return new Promise(function(resolve, reject) {

    $.ajax({
        url: 'https://www.instagram.com/' + a.username + '/',
        method: 'GET',
        beforeSend: function(xhr) {
          xhr.setRequestHeader('x-csrftoken', user.csrf_token);
          xhr.setRequestHeader('x-instagram-ajax', '1');
        }
      })
      .done(function(r) {
        var u = extractJSONfromUserPageHTML(r);
        a = u;

        if (document.getElementById(u.id + '_container')) {
          var igBotQueueAcctNameHolder = document.getElementById(u.id + '_container').getElementsByClassName('igBotQueueAcctNameHolder')[0];

          var newA = igBotQueueAcctNameHolder.getElementsByClassName('igBotQueueAcctUserName')[0];
          if (u.is_private && u.is_private == true) {
            var iconPrivate = document.createElement('span');
            iconPrivate.className = 'iconPrivate';
            newA.appendChild(iconPrivate);
          }
          newA.title = u.biography || '';

          var counts = document.createElement('span');
          counts.className = 'followerCounts'
          counts.textContent = u.edge_followed_by.count + ' | ' + u.edge_follow.count + ' | ' + u.edge_owner_to_timeline_media.count;
          counts.title = u.edge_followed_by.count + ' followers | ' + u.edge_follow.count + ' following' + ' | ' + u.edge_owner_to_timeline_media.count + ' posts';

          igBotQueueAcctNameHolder.appendChild(counts);
        }

        appendFollowersRatioToAcct(a);
        appendLastPostDateToAcct(a);

        resolve(a);

        gbl404attempt = 0;

      }).fail(function(data) {
        if (data.status == 403) {
          outputMessage('soft rate limit encountered, waiting ' + (gblOptions.timeDelayAfterSoftRateLimit / 60000) + ' minutes');
          setTimeout(function() {
            resolve(getAdditionalDataForAcct(a));
          }, gblOptions.timeDelayAfterSoftRateLimit);
        } else if (data.status == 400) {
          outputMessage('hard rate limit encountered, waiting ' + (gblOptions.timeDelayAfterHardRateLimit / 3600000) + ' hours');
          setTimeout(function() {
            resolve(getAdditionalDataForAcct(a));
          }, gblOptions.timeDelayAfterHardRateLimit);
        } else if (data.status == 429) {
          outputMessage('429 rate limit (temporary banned), trying again in 5 minutes');
          setTimeout(function() {
            resolve(getAdditionalDataForAcct(a));
        }, 300000);
        } else if (data.status == 404) {
          gbl404attempt++;
          if (gbl404attempt < 11) {
            outputMessage('404 possible rate limit, trying again in 1 minute (attempt ' + gbl404attempt + ' of 10)');
            setTimeout(function() {
              resolve(getAdditionalDataForAcct(a));
            }, 60000);
            return false;
          } else {
            outputMessage('404 account assumed missing after 10 attempts');
            a.assumedDeleted = true;
            resolve(a);
          }
        } else {
          outputMessage('' + data.status + ' error, trying again in 5 seconds');
          setTimeout(function() {
            resolve(getAdditionalDataForAcct(a));
          }, 5000);
        }
        gbl404attempt = 0;
      });
  });
}


async function filterCriteriaMet(acct) {
  if (!acct.edge_followed_by) acct = await getAdditionalDataForAcct(acct);

  if (acct.assumedDeleted) return false;

  if (acct.edge_followed_by.count < gblOptions.filterOptions.followers[0] ||
    acct.edge_followed_by.count > gblOptions.filterOptions.followers[1] ||
    acct.edge_follow.count < gblOptions.filterOptions.following[0] ||
    acct.edge_follow.count > gblOptions.filterOptions.following[1] ||
    acct.followRatio < gblOptions.filterOptions.followRatio[0] ||
    acct.followRatio > gblOptions.filterOptions.followRatio[1] ||
    acct.edge_owner_to_timeline_media.count < gblOptions.filterOptions.posts[0] ||
    acct.edge_owner_to_timeline_media.count > gblOptions.filterOptions.posts[1] ||
    acct.lastPosted < gblOptions.filterOptions[0] ||
    acct.lastPosted > gblOptions.filterOptions[1] ||
    (acct.is_private == true && gblOptions.filterOptions.private == false) ||
    (acct.is_private == false && gblOptions.filterOptions.non_private == false) ||
    (acct.is_verified == true && gblOptions.filterOptions.verified == false) ||
    (acct.is_verified == false && gblOptions.filterOptions.non_verified == false) ||
    (acct.followed_by_viewer == true && gblOptions.filterOptions.followed_by_me == false) ||
    (acct.followed_by_viewer == false && gblOptions.filterOptions.non_followed_by_me == false) ||
    (acct.follows_viewer == true && gblOptions.filterOptions.follows_me == false) ||
    (acct.followed_by_viewer == false && gblOptions.filterOptions.non_follows_me == false)
  ) {
    return false;
  } else {
    return true;
  }

}

async function filterCriteriaMetForUnfollowing(acct) {

  var acctFromStorage = alreadyAttempted(acct);
  var timeSinceFollowed = today - acctFromStorage.followAttemptDate;

  if (!acct.edge_followed_by) acct = await getAdditionalDataForAcct(acct);

  if (acct.assumedDeleted) return false;

  if (gblOptions.dontUnFollowFollowers === true) {
    if (acct.follows_viewer == true) {
      if (gblOptions.unFollowIfOld == true && timeSinceFollowed > gblOptions.unFollowIfOlderThan) {
        outputMessage(acct.username + ' was followed more than ' + millisecondsToHumanReadable(gblOptions.unFollowIfOlderThan, false).days + ' days ago, OK to unfollow')
        return true;
      } else {
        outputMessage(acct.username + ' is one of your followers, skipping');
        return false;
      }
    }
  }


  if (gblOptions.dontUnFollowFilters === true) {
    if (acct.edge_followed_by.count < gblOptions.filterOptions.followers[0] ||
      acct.edge_followed_by.count > gblOptions.filterOptions.followers[1] ||
      acct.edge_follow.count < gblOptions.filterOptions.following[0] ||
      acct.edge_follow.count > gblOptions.filterOptions.following[1] ||
      acct.followRatio < gblOptions.filterOptions.followRatio[0] ||
      acct.followRatio > gblOptions.filterOptions.followRatio[1] ||
      acct.edge_owner_to_timeline_media.count < gblOptions.filterOptions.posts[0] ||
      acct.edge_owner_to_timeline_media.count > gblOptions.filterOptions.posts[1] ||
      acct.lastPosted < gblOptions.filterOptions[0] ||
      acct.lastPosted > gblOptions.filterOptions[1] ||
      (acct.is_private == true && gblOptions.filterOptions.private == false) ||
      (acct.is_private == false && gblOptions.filterOptions.non_private == false) ||
      (acct.is_verified == true && gblOptions.filterOptions.verified == false) ||
      (acct.is_verified == false && gblOptions.filterOptions.non_verified == false)
    ) {
      return true;
    } else {
      outputMessage(acct.username + ' skipped (matches your filters)');
      return false;
    }
  }

  return true;

}

function setCurrentPageUsername() {
  if (getCurrentPageUsername() != '') {
    $('#btnGetAllUsersFollowers').text('Get ' + getCurrentPageUsername() + ' Followers');
    $('#igBotInjectedContainer #btnGetAllUsersFollowers').off('click.ajaxGetAllUsersFollowers').on('click.ajaxGetAllUsersFollowers', ajaxGetAllUsersFollowers);
    $('#btnGetAllUsersFollowing').text('Get ' + getCurrentPageUsername() + ' Following');
    $('#igBotInjectedContainer #btnGetAllUsersFollowing').off('click.ajaxLoadFollowing').on('click.ajaxLoadFollowing', ajaxLoadFollowing);
  } else {
    $('#igBotInjectedContainer #btnGetAllUsersFollowers,#igBotInjectedContainer #btnGetAllUsersFollowing').click(function() {
      outputMessage('Error: must be on an instagram user page (or try reloading).');
    });
  }
}

function checkUsernameFreshness() {
  if ($('h1._rf3jb.notranslate').text() != getCurrentPageUsername()) {
    ajaxGetCurrentPageUserInfo();
    return false;
  }
  return true;
}

function getCurrentPageUsername() {
  if (currentProfilePage != false && currentProfilePage) {
    return currentProfilePage.username;
  } else {
    ajaxGetCurrentPageUserInfo();
    return '';
  }
}

function getQueryParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function ajaxGetCurrentPageUserInfo() {
  var username = $('h1._rf3jb.notranslate').text();
  if (username == '') username = window.location.pathname.split('/')[1];
  if (username == 'explore' || username == 'stories') username = '';

  if (username == 'p') username = getQueryParameterByName('taken-by') || getUsernameFromPostHtml();

  if ((currentProfilePage == false && username != '') || (username != '' && currentProfilePage.username != username)) {
    $.ajax('https://www.instagram.com/' + username + '/').done(function(data) {
      currentProfilePage = extractJSONfromUserPageHTML(data);
      setCurrentPageUsername();
    });
  }
}

function getUsernameFromPostHtml() {
  return document.getElementsByClassName('FPmhX')[0].textContent;
}

function extractJSONfromUserPageHTML(data) {
  var jsondata = JSON.parse(data.substring(data.indexOf('<script type="text/javascript">window._sharedData = ') + 52, data.indexOf(';</script>', data.indexOf('<script type="text/javascript">window._sharedData = '))));
  var user = jsondata.entry_data.ProfilePage[0].graphql.user;
  return user;
}

function extractJSONfromTagsPageHTML(data) {
  var jsondata = JSON.parse(data.substring(data.indexOf('<script type="text/javascript">window._sharedData = ') + 52, data.indexOf(';</script>', data.indexOf('<script type="text/javascript">window._sharedData = '))));
  //console.log(jsondata);
  var i;
  var tag = [];
  var count = jsondata.entry_data.TagPage[0].graphql.hashtag.edge_hashtag_to_media.edges.length;
  for(i = 1; i < count; i++){
    tag[i] = jsondata.entry_data.TagPage[0].graphql.hashtag.edge_hashtag_to_media.edges[count - i];
  }
  return tag;
}



function setCurrentPageHashtag() {
  var hashtagFromUrl = getHashtagFromUrl();

  if (hashtagFromUrl != '') {
    $('#btnLikeHashtag').text($('#btnLikeHashtag').text().replace("Current Page Hashtag", '#' + hashtagFromUrl));

  } else {
    outputMessage('Error: must be on an instagram hashtag page');
  }
}


function getHashtagFromUrl() {

  if (window.location.href.indexOf('/explore/tags/') == -1) {
    return '';
  }

  var tagFromUrl = window.location.href;
  tagFromUrl = tagFromUrl.replace('https://www.instagram.com/explore/tags/', '');
  tagFromUrl = tagFromUrl.slice(0, tagFromUrl.indexOf('/'));
  return tagFromUrl;
}


function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function saveHiddenStatus(hiddenStatus) {
  chrome.storage.sync.set({
    'igBotHidden': hiddenStatus
  });
}

function getHiddenStatus(callback) {

  chrome.storage.sync.get('igBotHidden', function(object) {

    var hiddenStatus = false;

    if (typeof object['igBotHidden'] != 'undefined') {
      hiddenStatus = object['igBotHidden'];
    } else {
      hiddenStatus = false;
    }

    callback(hiddenStatus);

  });

}

function hiddenStatusCallback(hiddenStatus) {
  if (hiddenStatus == true) {
    hideControlsDiv();
  }
}


$.fn.shake = function shake(interval, distance, times) {
  interval = interval || 100;
  distance = distance || 10;
  times = times || 4;

  for (var iter = 0; iter < (times + 1); iter++) {
    //this.animate({ left: ((iter%2==0 ? distance : distance*-1))}, interval);
    this.animate({
      top: ((iter % 2 == 0 ? distance : distance * -1))
    }, interval);
    this.animate({
      top: ''
    }, interval);
  }
}

//Eigenen Werte

function getBackgroundInfo() {


    if(user){
        $.ajax({
          url: 'https://www.instagram.com/' + user.viewer.username + '/',
          method: 'GET',
          beforeSend: function(xhr) {
            xhr.setRequestHeader('x-csrftoken', user.csrf_token);
            xhr.setRequestHeader('x-instagram-ajax', '1');
          }
        })
        .done(function(r) {
          var u = extractJSONfromUserPageHTML(r);
          var profileImg = u.profile_pic_url_hd;
          var followed_by = u.edge_followed_by.count;
          var following = u.edge_follow.count;



          $('.hero-header-item.hero-logo.middle .hero-logo-circles').append('<div class="following_count"><div class="following_span">Following:</br>'+ following +'</div></div><div class="follow_count"><div class="follow_span">Followers:</br>'+ followed_by +'</div></div>');

          $('.middle .hero-logo-circles .profilePic').css({
            'background-image': 'url("' + profileImg + '")',
            'background-repeat': 'no-repeat',
            'background-size': '100%',
            'width': '60%',
            'height': '60%',
            'border-radius': '360px',
            'border': '3px solid #dda032',
            'position': 'absolute',
            'display': 'flex',
            'margin': 'auto',
            'left': '0',
            'right': '0',
            'top': '0',
            'bottom': '0'
          });
        })
        .fail(function(data) {
        });
    }
}


function domReady() {
  if (window.location.href.indexOf('.instagram.com') === -1) return false;

  if (window.location.href.indexOf('/developer/') > -1) return false;

  injectControlsDiv();
  injectIcon();
  shakeInstabotIcon();

  setInterval(function() {

    if ($('#instabotIcon').length == 0) {
      injectIcon();
      shakeInstabotIcon();
    }

    if ($('#igBotInjectedContainer .pulsing').length > 0) {
      $('#instabotIcon').addClass('pulsing');
    } else {
      $('#instabotIcon').removeClass('pulsing');
    }

    checkUsernameFreshness();
  }, 2000);

  getHiddenStatus(hiddenStatusCallback);

}


$.fn.shake = function shake(interval, distance, times) {
    interval = interval || 100;
    distance = distance || 10;
    times = times || 4;

    for (var iter = 0; iter < (times + 1); iter++) {
        //this.animate({ left: ((iter%2==0 ? distance : distance*-1))}, interval);
        this.animate({
            top: ((iter % 2 == 0 ? distance : distance * -1))
        }, interval);
        this.animate({
            top: ''
        }, interval);
    }
}

if (document.readyState === 'complete' || document.readyState !== 'loading') {
  domReady();
  getBackgroundInfo();
} else {
  document.addEventListener('DOMContentLoaded', domReady);
}
