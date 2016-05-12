(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.eyeRunRequestor = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function EyeosAppGateway(innerRequestor, pWindow) {
    this._innerRequestor = innerRequestor;
    this.window = pWindow || window;
}
EyeosAppGateway.closeAppEvent = function () {
    return '/eyeosapp_closed';
};
EyeosAppGateway.prototype.isChromeInstalled = function (fp) {
    this._innerRequestor.sendRequest('/eyeosapp_is_chrome_installed', null, function () {
        fp(true);
    }, function () {
        fp(false);
    });
};
EyeosAppGateway.prototype.openApp = function (appUrl) {
    this._innerRequestor.sendRequest('/eyeosapp_open_app/' + encodeURIComponent(appUrl));
};
EyeosAppGateway.prototype.closeApp = function () {
    var closeAppEvent = EyeosAppGateway.closeAppEvent();
    var eyeRunAccess = this.window.open(this._innerRequestor.getEyeRunLocation() + closeAppEvent);
    eyeRunAccess.close();
};
module.exports = EyeosAppGateway;
},{}],2:[function(require,module,exports){
var MouseChecker = require('./MouseChecker');
'use strict';
function MacExtensionPopupGateway(requestor, pWindow, mouseChecker) {
    this.requestor = requestor;
    this.window = pWindow || window;
    this.mouseChecker = mouseChecker || new MouseChecker();
}
MacExtensionPopupGateway.focusEvent = function () {
    return '/windowManager_focus';
};
MacExtensionPopupGateway.startMouseTrackingEvent = function () {
    return '/windowManager_startMouseTracking';
};
MacExtensionPopupGateway.stopMouseTrackingEvent = function () {
    return '/windowManager_stopMouseTracking';
};
MacExtensionPopupGateway.addWindowEvent = function () {
    return '/windowManager_addWindow';
};
MacExtensionPopupGateway.resetWindowsEvent = function () {
    return '/windowManager_resetWindows';
};
MacExtensionPopupGateway.removeWindowEvent = function () {
    return '/windowManager_removeWindow';
};
MacExtensionPopupGateway.isWindowVisibleEvent = function () {
    return '/windowManager_isWindowVisible';
};
MacExtensionPopupGateway.prototype.focus = function (callback) {
    var self = this;
    var focusEvent = MacExtensionPopupGateway.focusEvent();
    var _doCallBackIfClickedInsideDocument = function () {
        var position = {
                x: self.requestor.getImage().width,
                y: self.requestor.getImage().height
            };
        if (self.mouseChecker.isInsideDocument(position)) {
            callback();
        }
    };
    this.requestor.sendRequest(focusEvent, null, _doCallBackIfClickedInsideDocument);
};
MacExtensionPopupGateway.prototype.startMouseTracking = function () {
    var startMouseTrackingEvent = MacExtensionPopupGateway.startMouseTrackingEvent();
    this.requestor.sendRequest(startMouseTrackingEvent, null);
};
MacExtensionPopupGateway.prototype.stopMouseTracking = function () {
    var stopMouseTrackingEvent = MacExtensionPopupGateway.stopMouseTrackingEvent();
    var eyeRunAccess = this.window.open(this.requestor.getEyeRunLocation() + stopMouseTrackingEvent);
    eyeRunAccess.close();
};
MacExtensionPopupGateway.prototype.resetWindows = function () {
    this.requestor.sendRequest(MacExtensionPopupGateway.resetWindowsEvent(), null);
};
MacExtensionPopupGateway.prototype.addWindow = function (windowId) {
    this.requestor.sendRequest(MacExtensionPopupGateway.addWindowEvent() + '/' + windowId, null);
};
MacExtensionPopupGateway.prototype.removeWindow = function (windowId) {
    this.requestor.sendRequest(MacExtensionPopupGateway.removeWindowEvent() + '/' + windowId, null);
};
MacExtensionPopupGateway.prototype.isWindowVisible = function (windowId, fp) {
    this.requestor.sendRequest(MacExtensionPopupGateway.isWindowVisibleEvent() + '/' + windowId, null, function () {
        fp(true);
    }, function () {
        fp(false);
    });
};
module.exports = MacExtensionPopupGateway;
},{"./MouseChecker":3}],3:[function(require,module,exports){
function MouseChecker() {
}
MouseChecker.prototype.isInsideDocument = function (position) {
    return true;
};
module.exports = MouseChecker;
},{}],4:[function(require,module,exports){
function NullPopupGateway() {
}
NullPopupGateway.prototype.focus = function (callback) {
    callback();
};
NullPopupGateway.prototype.startMouseTracking = function () {
};
NullPopupGateway.prototype.stopMouseTracking = function () {
};
NullPopupGateway.prototype.resetWindows = function () {
};
NullPopupGateway.prototype.addWindow = function () {
};
NullPopupGateway.prototype.removeWindow = function () {
};
NullPopupGateway.prototype.isWindowVisible = function (windowId, fp) {
    fp(true);
};
NullPopupGateway._instance = null;
NullPopupGateway.instance = function () {
    if (NullPopupGateway._instance == null) {
        NullPopupGateway._instance = new NullPopupGateway();
    }
    return NullPopupGateway._instance;
};
module.exports = NullPopupGateway;
},{}],5:[function(require,module,exports){
var settings = require('./settings'), MacExtensionPopupGateway = require('./MacExtensionPopupGateway'), NullPopupGateway = require('./NullPopupGateway'), EyeosAppGateway = require('./EyeosAppGateway');
function EyeRunRequestor() {
    this.EYERUN_LOCATION = settings.EYERUN_LOCATION;
    this._image = new Image();
}
EyeRunRequestor.prototype.getImage = function () {
    return this._image;
};
EyeRunRequestor.prototype._macPopupGateway = function () {
    return new MacExtensionPopupGateway(this);
};
EyeRunRequestor.prototype.getEyeRunLocation = function () {
    return this.EYERUN_LOCATION;
};
EyeRunRequestor.prototype.appGateway = function () {
    return new EyeosAppGateway(this);
};
EyeRunRequestor.prototype.popupGateway = function (isMac) {
    return NullPopupGateway.instance();
};
EyeRunRequestor.prototype.eyeRunInstalled = function (cb) {
    this.sendRequest('', null, function () {
        cb(true);
    }, function () {
        cb(false);
    });
};
EyeRunRequestor.prototype.renewCard = function (credentials, callback, errorCallback) {
    var data = { credentials: credentials };
    this.sendRequest('/renewCard', data, callback, errorCallback);
};
EyeRunRequestor.prototype.setSession = function (credentials, domain, transactionId, callback, errorCallback) {
    var data = {
            credentials: credentials,
            domain: domain,
            transactionId: transactionId
        };
    this.sendRequest('/setSession', data, callback, errorCallback);
};
EyeRunRequestor.prototype.sendRequest = function (endpoint, data, callback, errorCallback) {
    var credentials, domain;
    var transactionId;
    var card;
    if (data) {
        credentials = data.credentials;
        domain = data.domain;
        transactionId = data.transactionId;
        card = credentials.card;
        if (typeof card === 'object') {
            card = JSON.stringify(card);
        }
    }
    var src = this.EYERUN_LOCATION + endpoint + '/';
    if (credentials) {
        src += encodeURIComponent(card) + '/' + encodeURIComponent(credentials.signature);
    }
    if (domain) {
        src += '/' + encodeURIComponent(data.domain);
    }
    if (transactionId) {
        src += '/' + encodeURIComponent(transactionId);
    }
    this._image.src = src;
    this._image.onload = callback;
    this._image.onerror = errorCallback;
};
module.exports = EyeRunRequestor;
},{"./EyeosAppGateway":1,"./MacExtensionPopupGateway":2,"./NullPopupGateway":4,"./settings":6}],6:[function(require,module,exports){
'use strict';
module.exports = { EYERUN_LOCATION: 'http://localhost:7000' };
},{}]},{},[5])(5)
});