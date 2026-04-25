var APP_NAME = 'GAS Web App Skeleton';

function doGet(e) {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle(APP_NAME)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function hello() {
  return 'Hello from GAS!';
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
