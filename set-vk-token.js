

(function () {
    var matching = location.href.match(/access_token=([^&]*)/);
    chrome.storage.sync.set({ 'vkaccess_token': matching[1] }, function () {
        console.log('Token saved');
    });
})();