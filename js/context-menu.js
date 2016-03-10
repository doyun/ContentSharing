
var Context = function (context, options) {
    this.context = context;
    this.caption = context;
    if (options) {
        this.caption = options.caption ? options.caption : context;
        this.handler = options.handler;
    }
    return this;
}

var contexts = [new Context("all", { caption: "page  link" }), new Context("selection"), new Context("image"), new Context("video")];

var contextMenuClickHandlers = new Map();
var contextMenuItemsAdditionalInfo = new Map();
contextMenuClickHandlers.set("all", pageLinkHandler);
contextMenuClickHandlers.set("image", imageHandler);
contextMenuClickHandlers.set("selection", selectionHandler);
contextMenuClickHandlers.set("video", videoHandler);

function defaultHandler() {
    console.log("Default handler");
}

function initFriendsMenu(parent, context) {
    getRecepientsFromStorage().done(function (recepients) {
        if (recepients) {
            recepients.forEach(function (value, index, array) {
                var child = chrome.contextMenus.create({ "title": value.name, "parentId": parent, "contexts": [context], "onclick": contextMenuClickHandlers.has(context) ? contextMenuClickHandlers.get(context) : defaultHandler });
                contextMenuItemsAdditionalInfo.set(child, value);
            });
        }
    });
}


function pageLinkHandler(info, tab) {
    console.log(contextMenuItemsAdditionalInfo.get(info.menuItemId).name);
    var data = {};
    data.message = info.pageUrl;
    setRecepient(info.menuItemId, data);
    invokeVkMethod("messages.send", data);
}

function imageHandler(info, tab) {
    invokeVkMethod("photos.getMessagesUploadServer", {}).done(function (data) {
        var formData = new FormData();
        var oReq = new XMLHttpRequest();
        oReq.open("GET", info.srcUrl, true);
        oReq.responseType = "arraybuffer";

        oReq.onload = function (oEvent) {
            var file = new File([oReq.response], info.srcUrl);
            formData.append("photo", file);
            postImage(data.response.upload_url, formData).done(function (photoData) {
                invokeVkMethod('photos.saveMessagesPhoto', JSON.parse(photoData)).done(function (pData) {
                    var data = {};
                    data.attachment = pData.response[0].id;
                    setRecepient(info.menuItemId, data);
                    invokeVkMethod("messages.send", data);
                });
            });
        };

        oReq.send();
    });
}

function selectionHandler(info, tab) {
    var data = {};
    data.message = info.selectionText;
    setRecepient(info.menuItemId, data);
    invokeVkMethod("messages.send", data);
}

function videoHandler(info, tab) {
    console.log(info);
    var data = {};
}

function setRecepient(menuItemId, resultData) {
    var recepient = contextMenuItemsAdditionalInfo.get(menuItemId);
    if (Recepient.prototype.TYPE_USER === recepient.type) {
        resultData.user_id = recepient.id;
    }
    else {
        resultData.peer_id = recepient.id;
    }
}


function initContextMenus() {
    for (var i = 0; i < contexts.length; i++) {
        var context = contexts[i];
        var title = "Send " + context.caption;
        var id = chrome.contextMenus.create({ "title": title, "contexts": [context.context] });
        console.log("Before initFriendsMenu " + context.context + " " + id);
        initFriendsMenu(id, context.context);
    }
}