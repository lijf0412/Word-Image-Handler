# word-image-handler

A simple project which helps to upload word image to server.

Express App:

Press 'F1' to show the server log:

Press "F2" to show dev-tools


## How to run

1.  Clone the code repository.
2.  Open terminal to code repository.
3.  Run `npm install`.
4.  Change directories to the express-app folder and run `npm install`.
5.  Change directories back to the root of the code repository.
6.  Run `npm start` to start the application.

## Package with Electron-Builder

change in index.html:

```javascript
app = require("electron").remote.app),
node = require("child_process").fork(
    `${app.getAppPath()}/express-app/bin/www`,
    [],
    {
      stdio: ["pipe", "pipe", "pipe", "ipc"]
    };
```

## ueditor 
该应用是为ueditor的word image转存本地图片，原理是在客户端运行一个nodejs应用，传入本地图片地址，传回base64图片信息

先调sayHello接口判断是否在线，然后调用getImageData?url=file:///D:/img.png

在ueditor端的wordimage插件下增加两个命令，一个读取wordimage的图片信息，包括地址和图片的id(用于后边图片地址替换)
一个用于图片地址替换
```
UE.plugin.register('wordimage',function(){
    var me = this,
        images = [];
    return {
        commands : {
            'wordimage':{
                execCommand:function () {
                    var images = domUtils.getElementsByTagName(me.body, "img");
                    var urlList = [];
                    for (var i = 0, ci; ci = images[i++];) {
                        var url = ci.getAttribute("word_img");
                        url && urlList.push(url);
                    }
                    return urlList;
                },
                queryCommandState:function () {
                    images = domUtils.getElementsByTagName(me.body, "img");
                    for (var i = 0, ci; ci = images[i++];) {
                        if (ci.getAttribute("word_img")) {
                            return 1;
                        }
                    }
                    return -1;
                },
                notNeedUndo:true
            },
            /**
             * 该命令是为了word自动转存，getWordImageList得到需要转存的word信息
             * updateWordImageUrl,根据特定id更新图片链接
             */
            'getwordimagelist':{
                execCommand:function () {
                    var images = domUtils.getElementsByTagName(me.body, "img");
                    var urlList = [];
                    for (var i = 0, ci; ci = images[i++];) {
                        var url = ci.getAttribute("word_img");
                        var id = ci.getAttribute('id')
                        url && urlList.push({url, id});
                    }
                    return urlList;
                },
                notNeedUndo:true
            },
            'updatewordimageurl':{
                execCommand:function (cmdName, link, wordImageId) {
                    var img = me.document.getElementById(wordImageId);
                    if (img) {
                        img.setAttribute('src', link);
                        img.setAttribute('_src', link);
                        img.removeAttribute('id');
                        img.removeAttribute('word_img');
                        img.removeAttribute('style');
                        me.fireEvent('contentchange')
                    }
                },
                notNeedUndo:true
            },
        },
        inputRule : function (root) {
            function genUUID(){
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                    var r = Math.random() * 16 | 0,
                        v = c == 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
            }
            utils.each(root.getNodesByTagName('img'), function (img) {
                var attrs = img.attrs,
                    flag = parseInt(attrs.width) < 128 || parseInt(attrs.height) < 43,
                    opt = me.options,
                    src = opt.UEDITOR_HOME_URL + 'themes/default/images/spacer.gif';
                if (attrs['src'] && /^(?:(file:\/+))/.test(attrs['src'])) {
                    img.setAttr({
                        width:attrs.width,
                        height:attrs.height,
                        alt:attrs.alt,
                        word_img: attrs.src,
                        id: 'word_img'+genUUID(), //add by Mr.li 20200329
                        src:src,
                        'style':'background:url(' + ( flag ? opt.themePath + opt.theme + '/images/word.gif' : opt.langPath + opt.lang + '/images/localimage.png') + ') no-repeat center center;border:1px solid #ddd'
                    })
                }
            })
        }
    }
});
```
注： 增加的命令为getwordimagelist, updatewordimageurl