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