
var Context = function (context, options) {
    this.context = context;
    this.caption = context;
    if (options) {
        this.caption = options.caption ? options.caption : context;
        this.handler = options.handler;
    }
    return this;
}

var contexts = [new Context("all", { caption: "page  link" }), new Context("selection"), new Context("link"), new Context("image"), new Context("video"),
    new Context("audio")];

var contextMenuClickHandlers = new Map();
var contextMenuItemsAdditionalInfo = new Map();
contextMenuClickHandlers.set("all", pageLinkHandler);
contextMenuClickHandlers.set("image", imageHandler);

function defaultHandler() {
    console.log("Default handler");
}

function initFriendsMenu(parent, context) {
    var child1 = chrome.contextMenus.create({ "title": "Friend1", "parentId": parent, "contexts": [context], "onclick": contextMenuClickHandlers.has(context) ? contextMenuClickHandlers.get(context) : defaultHandler });
    contextMenuItemsAdditionalInfo.set(child1, { name: "asdf" });
    var child2 = chrome.contextMenus.create({ "title": "Friend2", "parentId": parent, "contexts": [context], "onclick": contextMenuClickHandlers.has(context) ? contextMenuClickHandlers.get(context) : defaultHandler });
    console.log("After initFriendsMenu " + context + "    " + parent);
    console.log("After initFriendsMenu " + child1 + "    " + child2);
}


function pageLinkHandler(info, tab) {
    console.log(info)
    alert(contextMenuItemsAdditionalInfo.get(info.menuItemId).name);
    var data = {};
    data.message = info.pageUrl;
    data.domain = "nikita.doyun";
    invokeVkMethod("messages.send", data);
}

function imageHandler(info, tab) {
    console.log(contextMenuItemsAdditionalInfo.get(info.menuItemId).name);
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
                    data.domain = "nikita.doyun";
                    invokeVkMethod("messages.send", data);
                });
            });
        };

        oReq.send();
    });
}

function invokeVkMethod(method, data) {
    var url = "https://api.vk.com/method/" + method;
    var deferred = new $.Deferred();
    chrome.storage.sync.get('vkaccess_token', function (items) {
        data.access_token = items.vkaccess_token;
        $.get(url, data)
            .done(function (data) {
                deferred.resolve(data);
            })
            .fail(function (data) {
                deferred.reject(data);
            });
    });
    return deferred;
}

function postImage(url, data) {
    var deferred = new $.Deferred();
    $.ajax({
        url: url,
        data: data,
        cache: false,
        contentType: false,
        processData: false,
        type: 'POST',
        success: function (data) {
            deferred.resolve(data);
        },
        fail: function (data) {
            deferred.reject(data);
        }
    });
    return deferred;
}


for (var i = 0; i < contexts.length; i++) {
    var context = contexts[i];
    var title = "Send '" + context.caption + "'";
    var id = chrome.contextMenus.create({ "title": title, "contexts": [context.context] });
    console.log("Before initFriendsMenu " + context.context + " " + id);
    initFriendsMenu(id, context.context);
}