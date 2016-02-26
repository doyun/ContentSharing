
(function ($) {
    $(document).ready(function () {
        $(".vk-login").click(function (event) {
            event.preventDefault();
            chrome.tabs.create({ url: "https://oauth.vk.com/authorize?client_id=5317904&display=page&redirect_uri=http://oauth.vk.com/blank.html&scope=friends,messages,photos,offline&response_type=token&v=5.45" },
                function (tab) {
                });
        });
    })
})(jQuery);
