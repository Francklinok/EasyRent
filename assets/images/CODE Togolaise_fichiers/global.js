function g_$(selector) {
  return document.querySelector(selector);
}

function g_$$(selector) {
  return document.querySelectorAll(selector);
}

function getScreenWidth() {
    var width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    return width;
}

function isMobile() {
    return getScreenWidth() < 576;
}

function isTablet() {
    return getScreenWidth() >= 576 && getScreenWidth() < 992;
}