
(function ($) {
    var $friendList = $('.friend-list');
    var $chatList = $('.chat-list');
    var chatMap = new Map();
    var friendMap = new Map();
    var recepientsFromStorageForInit = [];

    $(document).ready(function () {
        $(".vk-login").click(function (event) {
            event.preventDefault();
            chrome.tabs.create({ url: "https://oauth.vk.com/authorize?client_id=5317904&display=page&redirect_uri=http://oauth.vk.com/blank.html&scope=friends,messages,photos,offline&response_type=token&v=5.45" },
                function (tab) {
                });
        });


        function init() {
            getRecepientsFromStorage().done(function (recepients) {
                recepientsFromStorageForInit = recepients;
                loadFriends();
                loadChats();
            });

        }

        function loadFriends() {
            invokeVkMethod('friends.get', { order: 'hints', count: 30, fields: 'photo_50' })
                .done(function (data) {
                    //$friendList.text(JSON.stringify(data));
                    data.response.items.forEach(function (value, index) {
                        var recepient = new Recepient(value.id, value.first_name + ' ' + value.last_name, value.photo_50, Recepient.prototype.TYPE_USER);
                        friendMap.set(recepient.id, recepient);
                        renderRecepient($friendList, recepient);
                    });
                });
        };
        function loadChats() {
            invokeVkMethod('messages.getDialogs', { count: 50 })
                .done(function (data) {
                    data.response.items.forEach(function (value, index) {
                        value = value.message;
                        if (value.chat_id) {
                            var recepient = new Recepient(2000000000 + value.chat_id, value.title, value.photo_50, Recepient.prototype.TYPE_CHAT);
                            chatMap.set(recepient.id, recepient);
                            renderRecepient($chatList, recepient);
                        }
                    });
                });
        };

        $('#receipents-form').on('change', 'input[type=checkbox]', function (e) {
            console.log(e);
            var id = parseInt(e.target.id);
            getRecepientsFromStorage().done(function (recepients) {
                if (recepients) {
                    var wasInArray = false;
                    recepients.forEach(function (value, index, array) {
                        if (value.id == id) {
                            array.splice(index, 1)
                            wasInArray = true;
                        }
                    });
                    if (!wasInArray) {
                        recepients.push(chatMap.get(id) || friendMap.get(id));
                    }
                    setRecepientsToStorage(recepients);
                    chrome.contextMenus.removeAll(function(){
                        initContextMenus();
                    });
                }
            });
        });



        function renderRecepient(list, recepient) {
            var $li = $('<li class="collection-item valign-wrapper card-panel grey lighten-5 z-depth-1 row "></li>');
            var $span = $('<h6 class="col s7"></h6>');
            var $img = $('<img class="circle col s3 responsive-img"></img>');
            var $checkboxWrapper = $('<div class="secondary-content col s2"></div>');
            var $checkbox = $('<input type="checkbox"/>');
            var $label = $('<label></label>');
            $checkbox.attr('id', recepient.id);
            $label.attr('for', recepient.id);
            $checkbox.attr('checked', isRecepientInList(recepientsFromStorageForInit, recepient.id));
            $img.attr('src', recepient.photo);
            $span.text(recepient.name);
            list.append($li.append($img).append($span).append($checkboxWrapper.append($checkbox).append($label)));
        };

        function isRecepientInList(recepients, id) {
            var isInList = false;
            recepients.some(function (value, index, array) {
                if (value.id == id) {
                    isInList = true;
                    return true;
                }
            });
            return isInList;
        };

        init();

    });

})(jQuery);
