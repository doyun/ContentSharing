function getRecepientsFromStorage() {
    var deferred = new $.Deferred();
    chrome.storage.sync.get('recepients', function (items) {
        deferred.resolve(items.recepients || new Array());
    });
    return deferred;
}
function setRecepientsToStorage(recepients) {
    chrome.storage.sync.set({ 'recepients': recepients }, function () {
        console.log('Recepients saved');
    });
}