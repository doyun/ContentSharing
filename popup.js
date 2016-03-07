
(function ($) {
    var $friendList = $('.friend-list');
    var $chatList = $('.chat-list');
    var chatMap = new Map();
    var friendMap = new Map();

    $(document).ready(function () {
        $(".vk-login").click(function (event) {
            event.preventDefault();
            chrome.tabs.create({ url: "https://oauth.vk.com/authorize?client_id=5317904&display=page&redirect_uri=http://oauth.vk.com/blank.html&scope=friends,messages,photos,offline&response_type=token&v=5.45" },
                function (tab) {
                });
        });

        loadFriends();
        loadChats();

        function loadFriends() {
            invokeVkMethod('friends.get', { order: 'hints', count: 30, fields: 'photo_50' })
                .done(function (data) {
                    //$friendList.text(JSON.stringify(data));
                    data.response.forEach(function (value, index) {
                        var recepient = new Recepient(value.uid, value.first_name + ' ' + value.last_name, value.photo_50);
                        friendMap.set(recepient.id, recepient);
                        renderRecepient($friendList, recepient);
                    });
                });
        };
        function loadChats() {
            invokeVkMethod('messages.getDialogs', { count: 50 })
                .done(function (data) {
                    data.response.forEach(function (value, index) {
                        if (value.chat_id) {
                            var recepient = new Recepient(2000000000 + value.chat_id, value.title, value.photo_50);
                            chatMap.set(recepient.id, recepient);
                            renderRecepient($chatList, recepient);
                        }
                    });
                });
        };

        $('#receipents-form').on('change', 'input[type=checkbox]', function (e) {
            console.log(e);
            getRecepientsFromStorage().done(function (recepients) {
                if (recepients) {
                    var wasInArray = false;
                    recepients.forEach(function (value, index, array) {
                        if (value.id == e.target.id) {
                            array.splice(index, 1)
                            wasInArray = true;
                        }
                    });
                    if (!wasInArray) {
                        recepients.push(chatMap.get(e.target.id) || friendMap.get(e.target.id));
                    }
                    chrome.storage.sync.set({ 'recepients': recepients }, function () {
                        console.log('Recepients saved');
                    });
                }
            });
        });

        function getRecepientsFromStorage() {
            var deferred = new $.Deferred();
            chrome.storage.sync.get('recepients', function (items) {
                deferred.resolve(items.recepients || new Array());
            });
            return deferred;
        }

        function renderRecepient(list, recepient) {
            var $li = $('<li></li>');
            var $img = $('<img></img>');
            var $span = $('<span></span>');
            var $checkbox = $('<input type="checkbox"/>');
            $checkbox.attr('id', recepient.id);
            $img.attr('src', recepient.photo);
            $span.text(recepient.name);
            list.append($li.append($img).append($span).append($checkbox));
        };

        function addToStore() {
        };

    });

})(jQuery);
