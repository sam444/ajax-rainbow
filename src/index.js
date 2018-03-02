require('whatwg-fetch');
import URLSearchParams from 'url-search-params';
import html2canvas from "html2canvas";
var loading = null;
module.exports = {

    call: function (url, param, setting) {

        const self = this;

        const _setting = this.handleSetting(setting);

        const _url = this.handleGetUrl(url, param, _setting);

        const _request = this.buildRequest(_url, param, _setting);

        if (_setting["block"]) {
            this.show();
        }

        return new Promise((resolve, reject) => fetch(_request).then(function (response) {

            const _response = self.handleResponse(response, _setting);

            if (_response) {
                resolve(_response);
            } else {
                reject(_response);
            }

            if (_setting["block"]) {
                self.hide();
            }

        }, function (error) {
            console.log(error);
            reject(error)
        }))
    },

    show: function () {
        const loading = document.getElementById("rloading");
        const rloadingImg = document.getElementById("rloadingImg");
        let height = document.body.offsetHeight;
        const screen = window.screen.height;
        const imgHight = screen / 2;
        if (screen > height) {
            height = screen;
        }
        loading.style.height = height + 'px';
        rloadingImg.style.position = 'fixed';
        rloadingImg.style.top = '20%';
        rloadingImg.style.left = '50%';
        loading.style.display = 'block';
        document.body.style.overflowX = "hidden";
        document.body.style.overflowY = "hidden";
    },

    hide: function () {
        const loading = document.getElementById("rloading");
        loading.style.display = 'none';
        document.body.style.overflowX = "auto";
        document.body.style.overflowY = "auto";
    },

    handleSetting: function (setting) {
        const config = JSON.parse(sessionStorage.getItem("project_config"));
        const screenShotSetting = config.screenShotSetting;
        if (setting == null) {
            setting = {};
            setting.method = "GET";
            setting.block = false;
            setting.dataType = "json";
            setting.contentType = "application/json; charset=UTF-8";
            setting.stringify = true;
            if (screenShotSetting) {
                setting.screenShot = screenShotSetting.screenShot;
                setting.newWindowUrl = screenShotSetting.newWindowUrl;
            } else {
                setting.screenShot = true;
                setting.newWindowUrl = null;
            }
        } else {
            if (setting["method"] == null) {
                setting.method = "GET";
            }
            if (setting["block"] == null) {
                setting.block = false;
            }
            if (setting["dataType"] == null) {
                setting.dataType = "json";
            }
            if (setting["contentType"] == null) {
                setting.contentType = "application/json; charset=UTF-8";
            }
            if (setting["stringify"] == null) {
                setting.stringify = true;
            }
            if (setting["screenShot"] == null) {
                if (screenShotSetting) {
                    setting.screenShot = screenShotSetting.screenShot;
                }else{
                    setting.screenShot = true;
                }
            }
            if (setting["newWindowUrl"] == null || setting["newWindowUrl"] == "") {
                if (screenShotSetting) {
                    setting.newWindowUrl = screenShotSetting.newWindowUrl;
                }
            }
        }
        return setting;
    },
    handleGetUrl: function (url, param, setting) {

        if (param != null && setting["method"] == 'GET') {
            const u = new URLSearchParams();
            for (let key in param) {
                u.append(key, param[key]);
            }
            return url + "?" + u;
        } else {
            return url;
        }
    },
    checkContentType: function (type, _setting) {
        if (_setting["contentType"].indexOf(type) > 0) {
            return true;
        } else {
            return false;
        }
    },
    buildRequest: function (_url, param, _setting) {

        const headers = new Headers();
        // headers.append('X-Frame-Options','DENY');
        // headers.append('X-XSS-Protection',"1");
        // if (!this._isLocal()) {
        //     headers.append('Content-Security-Policy',"default-src 'self';");
        // }
        if (this.checkContentType("json", _setting)) {
            headers.append('Accept', 'application/json');
            headers.append('Content-Type', 'application/json; charset=UTF-8');
        } else if (_setting["contentType"]) {
            headers.append('Content-Type', _setting["contentType"]);
        }

        const setionToken = sessionStorage.getItem("Authorization");
        if (setionToken) {
            headers.append("Authorization", 'Bearer ' + setionToken.substr(13).split("&")[0]);
        }
        const headerSetting = _setting['headers'];
        if (headerSetting) {
            for (let key in headerSetting) {
                headers.append(key + "", headerSetting[key] + "");
            }
        }

        let request = null;
        let requestObject = {
            method: _setting.method,
            mode: "cors",
            headers: headers
        }
        const requestSetting = _setting['requests'];
        if (requestSetting) {
            for (let key in requestSetting) {
                requestObject[key] = requestSetting[key];
            }
        }

        if (param != null && _setting["method"] == 'POST') {
            requestObject["body"] = JSON.stringify(param);
        }
        request = new Request(_url, requestObject);

        return request;

    },
    handleResponse: function (response, _setting) {
        if (!response.ok) {
            if (toastr) {
                toastr.options = $.extend({}, toastr.options, {
                    timeOut: "50000",
                    onclick: _setting.screenShot ? this._screenShot.bind(this, "RAINBOW_SCREENSHOT", "registerForm", _setting) : null,
                    closeButton: true
                });
                let helpMessage = _setting.screenShot ? "click to send email" : "";
                try {
                    response.json().then((json) => {
                        if (json.status == 500) {
                            if(_setting.screenShot){
                                sessionStorage.setItem("RAINBOW_EXCEPTION_MESSAGE", JSON.stringify(json));
                            }
                            toastr["error"](`<div><a href="javascript:void(0);">${helpMessage}</a><br/>${json.message.replace(/\\n/g, "<br>")}</div>`, `Status Code: ${response.status}`)
                        }
                        if (json.status == 401) {
                            const config = JSON.parse(sessionStorage.getItem("project_config"));
                            window.logout ? window.logout(config) : null;
                        }
                    })
                } catch (error) {
                    toastr["error"](`<div>Please contact system administrator.<br/><a href="javascript:void(0);">${helpMessage}</a><div>`, `Status Code: ${response.status}`)
                }

            } else if (this._isLocal()) {
                window.location.href = `http://knowledge.ebaotech.com/static/error/${response.status}.html`;
            } else {
                window.location.href = `/static/error/${response.status}.html`;
            }
            this.hide();
            return null;
        } else if ("204" == response.status) {
            const myJson = new Blob();
            const init = { "status": 200, "statusText": "no content" };
            const myResponse = new Response(myJson, init);
            return myResponse.blob();
        } else if (this.checkContentType("json", _setting)) {
            return response.json();
        } else if (this.checkContentType("text", _setting)) {
            return response.text();
        } else {
            return response;
        }
    },

    _isLocal: function (context) {
        return window.location.href.indexOf("localhost") > -1 || window.location.href.indexOf("127.0.0.1") > -1;
    },

    //获取像素密度
    _getPixelRatio: function (context) {
        var backingStore = context.backingStorePixelRatio ||
            context.webkitBackingStorePixelRatio ||
            context.mozBackingStorePixelRatio ||
            context.msBackingStorePixelRatio ||
            context.oBackingStorePixelRatio ||
            context.backingStorePixelRatio || 1;
        return (window.devicePixelRatio || 1) / backingStore;
    },


    /**
     * scrrenshot by documentId
     * @param  {String} traceId 
     *  @param  {String} documentId 
     */
    _screenShot: function (traceId, documentId, _setting) {
        return new Promise(resolve => {
            var content = document.querySelector("#" + documentId);;// 需要绘制的部分的 (原生）dom 对象 ，注意容器的宽度不要使用百分比，使用固定宽度，避免缩放问题
            if (content) {
                var width = content.offsetWidth;  // 获取(原生）dom 宽度
                var height = content.offsetHeight; // 获取(原生）dom 高
                var offsetTop = content.offsetTop;  //元素距离顶部的偏移量

                var canvas = document.createElement('canvas');  //创建canvas 对象
                var context = canvas.getContext('2d');
                var scaleBy = this._getPixelRatio(context);  //获取像素密度的方法 (也可以采用自定义缩放比例)
                canvas.width = width * scaleBy;   //这里 由于绘制的dom 为固定宽度，居中，所以没有偏移
                canvas.height = (height + offsetTop) * scaleBy;  // 注意高度问题，由于顶部有个距离所以要加上顶部的距离，解决图像高度偏移问题
                context.scale(scaleBy, scaleBy);

                var opts = {
                    allowTaint: true,//允许加载跨域的图片
                    tainttest: true, //检测每张图片都已经加载完成
                    scale: scaleBy, // 添加的scale 参数
                    canvas: canvas, //自定义 canvas
                    logging: true, //日志开关，发布的时候记得改成false
                    width: width, //dom 原始宽度
                    height: height //dom 原始高度
                };

                html2canvas(content, opts).then(function (canvas) {
                    sessionStorage.setItem(traceId, canvas.toDataURL("image/jpeg"));
                    resolve(canvas.toDataURL("image/jpeg"));
                    if (_setting && _setting.newWindowUrl) {
                        window.open(_setting.newWindowUrl);
                    }
                });
            }
        });
    }

};


