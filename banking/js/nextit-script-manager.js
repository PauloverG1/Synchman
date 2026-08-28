(function () {
    // get script reference
    var scriptTags = document.getElementsByTagName('script');
    var url = '';
    for (const tag of scriptTags) {
        const src = tag.getAttribute('src', -1);
        // Use indexOf for IE 11 support
        // eslint-disable-next-line @typescript-eslint/prefer-includes
        if (src > '' && src.toLowerCase().indexOf('nextit-script-manager.js') > -1) {
            url = src;
            break;
        }
    }

    var baseUrl = url.substring(0, url.toLowerCase().lastIndexOf('/'));

    var scriptTag = document.createElement('script');
    scriptTag.id = "alme-script-loader";
    scriptTag.setAttribute('type', 'text/javascript');
    scriptTag.setAttribute('language', 'javascript');
    scriptTag.setAttribute('async', 'true');
    scriptTag.setAttribute('defer', 'true');

    var currentTime = new Date().getTime();
    scriptTag.setAttribute('src', baseUrl + '/alme-loader.js?' + currentTime);

    var parent = document.getElementsByTagName('head')[0];
    if (parent) {
        parent.appendChild(scriptTag);
    }
})();