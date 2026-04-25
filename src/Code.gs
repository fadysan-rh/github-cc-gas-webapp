var APP_NAME = 'SNS Post Manager';
var SHEET_NAME = 'posts';
var HEADERS = ['id', 'title', 'body', 'platform', 'scheduledAt', 'status', 'createdAt', 'updatedAt'];

function doGet(e) {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle(APP_NAME)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ---- Sheet management ----

function getSheet_() {
  var props = PropertiesService.getScriptProperties();
  var ssId = props.getProperty('SPREADSHEET_ID');
  var ss;

  if (ssId) {
    try {
      ss = SpreadsheetApp.openById(ssId);
    } catch (e) {
      ssId = null;
    }
  }

  if (!ssId) {
    ss = SpreadsheetApp.create('SNS Posts');
    props.setProperty('SPREADSHEET_ID', ss.getId());
  }

  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function getSheetUrl() {
  var props = PropertiesService.getScriptProperties();
  var ssId = props.getProperty('SPREADSHEET_ID');
  if (!ssId) {
    getSheet_();
    ssId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  }
  return 'https://docs.google.com/spreadsheets/d/' + ssId;
}

// ---- CRUD ----

function listPosts(filter) {
  var sheet = getSheet_();
  var rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];

  var posts = rows.slice(1).map(function(row) {
    return rowToPost_(row);
  });

  if (filter && filter !== 'all') {
    posts = posts.filter(function(p) { return p.status === filter; });
  }

  return posts.sort(function(a, b) {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
}

function createPost(post) {
  var sheet = getSheet_();
  var now = new Date().toISOString();
  var newPost = {
    id:          Utilities.getUuid(),
    title:       post.title       || '',
    body:        post.body        || '',
    platform:    post.platform    || 'X',
    scheduledAt: post.scheduledAt || '',
    status:      post.status      || 'draft',
    createdAt:   now,
    updatedAt:   now,
  };
  sheet.appendRow(postToRow_(newPost));
  return newPost;
}

function updatePost(id, updates) {
  var sheet = getSheet_();
  var rows = sheet.getDataRange().getValues();

  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] === id) {
      var post = rowToPost_(rows[i]);
      var updated = Object.assign(post, updates, { updatedAt: new Date().toISOString() });
      sheet.getRange(i + 1, 1, 1, HEADERS.length).setValues([postToRow_(updated)]);
      return updated;
    }
  }
  throw new Error('Post not found: ' + id);
}

function deletePost(id) {
  var sheet = getSheet_();
  var rows = sheet.getDataRange().getValues();

  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] === id) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  throw new Error('Post not found: ' + id);
}

// ---- Helpers ----

function rowToPost_(row) {
  return {
    id:          row[0],
    title:       row[1],
    body:        row[2],
    platform:    row[3],
    scheduledAt: row[4],
    status:      row[5],
    createdAt:   row[6],
    updatedAt:   row[7],
  };
}

function postToRow_(post) {
  return HEADERS.map(function(h) { return post[h] !== undefined ? post[h] : ''; });
}
