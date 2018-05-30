app = {
    currentMousePos: {x: -1, y: -1, time: 0},
    config: {
        apiUrl: "http://localhost/",
        traceFrequency: 100
    },
    init: function () {
        // listening mouse position
        $.ajax({method: "GET", url: "/env"})
        .always(function (response, status) {
            if (status === "success" && response.code === "ok") {
                if(response.data && response.data.DEMO_API) {
                    app.config.apiUrl = "http://" + response.data.DEMO_API + "/";
                }
                app.loadFrontendInfo();
                app.api.init();
                app.socket.init();
                app.heatmap.init();
                $(document).mousemove(function (event) {
                    var t = new Date();
                    app.currentMousePos.time = t.getTime();
                    app.currentMousePos.href = window.location.href;
                    app.currentMousePos.x = event.pageX;
                    app.currentMousePos.y = event.pageY;
                }).mouseover();
            }
            else {
                app.tools.displayError("impossible de contacter le frontend www car " + (response.message || response));
            }
        });
    },
    loadFrontendInfo: function () {
        $.get('/info')
        .always(function(response, status) {
            if(status === 'success' && response.code === 'ok') {
                $('#appContainer').text(response.data.server.hostname);
                $('#appRelease').html(response.data.service.version + ' <span style="color:grey">via ' + response.data.server.hostname + '</span>');
            }
            else {
                app.tools.displayError(response.data.message || response.message || response.statusText);
            }
        });
    },
    socket: {
        io: null,
        init: function () {
            app.socket.io = io(app.config.apiUrl);
            app.socket.io.on('connect', app.socket.onConnectCallback);
            app.socket.on('disconnect', app.socket.onDisconnectCallback);
        },
        onConnectCallback: function () {
            app.tools.displaySuccess("Connection websocket avec l'API établie (session " + app.socket.io.id + ")");
            setInterval(app.socket.emitTrace, app.config.traceFrequency);
        },
        onDisconnectCallback: function () {
            app.tools.displayError("Deconnection websocket avec l'API");
        },
        on: function (event, callback) {
            return app.socket.io.on(event, callback);
        },
        emit: function (event, data, callback) {
            return app.socket.io.emit(event, data, callback);
        },
        emitTrace: function () {
            var t = new Date();
            app.currentMousePos.time = t.getTime();
            app.socket.emit('system:log:trace', app.currentMousePos);
        }
    },
    heatmap: {
        traces: [],
        mapDom: null,
        map: null,
        init: function () {
            this.mapDom = $("#heatmapDiv");
            this.map = h337.create({
                container: document.querySelector('.heatmap'),
                radius: 20,
                maxOpacity: .9,
                minOpacity: .1,
                blur: .75,
                gradient: {
                    '.2': 'blue',
                    '.4': 'green',
                    '.6': 'yellow',
                    '.8': 'red',
                    '.95': 'white'
                }
            });
            $(".HeatmapBtn").click(function () {
                if(app.heatmap.mapDom.hasClass("on")) {
                    app.heatmap.mapDom.removeClass("on").hide();
                }
                else {
                    app.heatmap.mapDom.addClass("on").show();
                }
            });
            $(document).mousemove(function(e) {
                app.heatmap.addTrace(e.pageX, e.pageY-200);
                app.heatmap.refreshHeatmap();
            });
            app.socket.on('log:trace', function(data) {
                app.heatmap.addTrace(e.pageX, e.pageY-200);
                app.heatmap.refreshHeatmap();
            });
        },
        addTrace: function(x, y) {
            var coords = x + '-' + y;
            if(typeof app.heatmap.traces[coords] === 'undefined') {
                app.heatmap.traces[coords] = 1;
            }
            else if(typeof app.heatmap.traces[coords] === 'number') {
                app.heatmap.traces[coords]++;
            }
            console.log(app.heatmap.traces[coords]);
        },
        refreshHeatmap: function() {
            var max = 3;
            var heatmapData = [];
            var keys = Object.keys(app.heatmap.traces);
            for(var i=0; i<keys.length; i++) {
                var coords = keys[i].split('-');
                var value = app.heatmap.traces[keys[i]];
                if(value > max) max = value;
                heatmapData.push({x: coords[0], y: coords[1], value: value});
            }
            this.map.setData({
                min: 1,
                max: max,
                data: heatmapData
            });
            console.log(max);
        }
    },
    api: {
        info: null,
        init: function () {
            this.get("info", null, function (error, response) {
                if(error) {
                    app.tools.displayError("impossible de contacter l'API car " + (error.message || error.statusText || error));
                }
                else {
                    app.api.info = response;
                    $("#appSvContainer").text(app.api.info.server.hostname);
                    $("#appSvRelease").html(app.api.info.service.version + " <span style='color:grey'>via " + app.api.info.server.hostname + "</span>");
                    var message = "Vous êtes connecté à l'API <b>" + app.api.info.service.name + "</b> servi depuis le container <b>" + app.api.info.server.hostname + "</b>";
                    app.tools.displayInfo(message);
                }
            });
        },
        get: function (path, query, callback) {
            return this.call("GET", path, query, callback);
        },
        post: function (path, query, callback) {
            return this.call("POST", path, query, callback);
        },
        put: function (path, query, callback) {
            return this.call("PUT", path, query, callback);
        },
        delete: function (path, query, callback) {
            return this.call("DELETE", path, query, callback);
        },
        call: function (method, path, query, callback) {
            var config = {
                method: method,
                url: app.config.apiUrl + path
            };
            if(query && query !== null && query !== false) {
                config.data = query;
            }
            $.ajax(config)
            .always(function (response, status) {
                if(status === "success") {
                    if(response.code === "ok") {
                        callback(null, response.data);
                    }
                    else {
                        callback(response);
                    }
                }
                else {
                    callback(response);
                }
            });
        }
    },
    tools: {
        alertBox: function (type, message) {
            return '<div class="alert alert-' + type + ' alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + message + "</div>";
        },
        displayInfo: function(message) {
            $(app.tools.alertBox("info", message)).prependTo(".page-content");
            console.info(message);
        },
        displaySuccess: function (message) {
            $(app.tools.alertBox("success", message)).prependTo(".page-content");
            console.info(message);
        },
        displayError: function (message) {
            $(app.tools.alertBox("danger", message)).prependTo(".page-content");
            console.error(message);
        }
    }
};

$(document).ready(app.init);
