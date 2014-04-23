/*!
 * argenmap.jquery v1
 * 
 * Version     : 1.5.0 (2014-04-23)
 * Licencia    : https://raw.github.com/oskosk/argenmap.jquery/master/LICENCIA
 * Web site    : http://ign.gob.ar/argenmap
 * Repositorio : http://github.com/oskosk/argenmap.jquery
 * Issues      : https://github.com/oskosk/argenmap.jquery/issues
 * Contacto    : argenmap@ign.gob.ar
 * 
 * Instituto Geografico Nacional de Argentina
 * Todos los derechos reservados.
 *
 */

(function($) {
    if (!$.argenmap) {
        $.argenmap = {};
    }
    $.argenmap.BASE_URL = "http://static.ign.gob.ar/dist/";
    $.argenmap.IGN_CACHES = [ "http://igntiles2.eu01.aws.af.cm/tms", "http://mapaabierto.aws.af.cm/tms", "http://igntiles1.ap01.aws.af.cm/tms" ];
    var _defaults = {
        unit: "km",
        zoom: 5,
        mapTypeControl: true,
        centro: {
            lat: -34,
            lng: -59
        },
        center: null
    };
    function Argenmap(element, opciones) {
        var map = null;
        this.element = element;
        this.$el = $(element);
        this.opts = $.extend({}, _defaults, opciones);
        this.gmap = null;
        this._marcadores = {};
        this.capasWms = [];
        this.infoMenuActivado = false;
        this._dragging = false;
    }
    Argenmap.prototype = {
        init: function() {
            var _this = this;
            _this.opts.center = new google.maps.LatLng(_this.opts.centro.lat, _this.opts.centro.lng);
            _this.opts.streetViewControl = false;
            _this.opts.scaleControl = true;
            _this.opts.mapTypeControlOptions = {
                style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
            };
            var mapCanvas = $.argenmap._crearDivParaElMapa(this.$el);
            this.gmap = map = new google.maps.Map(mapCanvas, _this.opts);
            _this.mapearEventosDelMapa();
            this.$el.data("gmap", map);
            google.maps.event.addListener(map, "maptypeid_changed", function() {
                map.setZoom(map.getZoom() + 1);
                map.setZoom(map.getZoom() - 1);
            });
            $.argenmap.GmapAgregarCapaBase(map, new $.argenmap.CapaBaseArgenmap());
            $.argenmap.GmapAgregarCapa(map, new $.argenmap.CapaTMSArgenmap());
            this.gmap.setMapTypeId("Mapa IGN");
            return true;
        },
        activarInfoMenu: function() {
            var _this = this;
            if (this.infoMenuActivado === true) {
                return;
            }
            this.infoMenuActivado = true;
            google.maps.event.addListener(map, "click", $.proxy(this.mostrarInfoMenu, this));
            _this.$el.find(".argenmapMapCanvas").on("mouseenter", "a.argenmapFeatureInfo", function(e) {
                $(this).css({
                    "background-color": "#1C74A5",
                    color: "white"
                });
            });
            _this.$el.find(".argenmapMapCanvas").on("mouseleave", "a.argenmapFeatureInfo", function(e) {
                $(this).css({
                    "background-color": "transparent",
                    color: "#1C74A5"
                });
            });
            _this.$el.find(".argenmapMapCanvas").on("click", "a.argenmapFeatureInfo", $.proxy(this.pedirInformacion, this));
        },
        desactivarInfoMenu: function() {
            google.maps.event.clearListeners(map, "click");
        },
        mostrarInfoMenu: function(event) {
            var infow = this.infoWindow();
            infow.close();
            var c = '<div id="infoMenu" style="width:200px;margin:0;padding:0">Lat/Long: <br /><strong>' + parseInt(event.latLng.lat() * 1e4, 10) / 1e4 + ", " + parseInt(event.latLng.lng() * 1e4, 10) / 1e4 + "</strong></div>" + '<a style="color:#1C74A5;text-decoration:none;display:block;padding:3px;" data-y="' + event.pixel.y + '" ' + 'data-x="' + event.pixel.x + '" data-maxwidth="' + parseInt(this.$el.width() * .6, 10) + '" href="#" class="argenmapFeatureInfo">Obtener información</a>';
            infow.setOptions({
                position: event.latLng,
                maxWidth: 500,
                content: c
            });
            infow.open(this.gmap);
        },
        pedirInformacion: function(event) {
            var _this = this;
            var infow = _this.infoWindow();
            infow.close();
            event.preventDefault();
            if (_this.capasWms.length === 0) {
                alert("No hay capas para consultar");
                return false;
            }
            var content = $('<div style="width:500px"  />');
            var x = parseInt($(event.currentTarget).data("x"), 10);
            var y = parseInt($(event.currentTarget).data("y"), 10);
            var sw = _this.gmap.getBounds().getSouthWest();
            var ne = _this.gmap.getBounds().getNorthEast();
            var version = "1.1.1";
            var request = "GetFeatureInfo";
            var nw = {
                lat: ne.lat(),
                lng: sw.lng()
            };
            var se = {
                lat: sw.lat(),
                lng: ne.lng()
            };
            var crs = "EPSG:4326";
            var bbox = sw.lng() + "," + sw.lat() + "," + ne.lng() + "," + ne.lat();
            var service = "WMS";
            var width = _this.$el.width();
            var height = _this.$el.height();
            var styles = "";
            $.each(_this.capasWms, function(i, e) {
                if (e.consultable !== true) {
                    return;
                }
                var baseURL = e.url;
                var layers = e.capas;
                var url = baseURL + "SERVICE=" + service + "&VERSION=" + version + "&REQUEST=" + request + "&LAYERS=" + layers + "&STYLES=" + styles + "&SRS=" + crs + "&BBOX=" + bbox + "&WIDTH=" + width + "&HEIGHT=" + height + "&QUERY_LAYERS=" + layers + "&FEATURE_COUNT=50" + "&X=" + x + "&Y=" + y + "&INFO_FORMAT=text/html";
                var disclaimer = '<p style="margin:0;padding:0;font-size:12px;line-height:12px;">Los datos a continuación son provistos por:<br />' + " <strong>" + baseURL + "</strong><br />" + '<a target="_otra" href="' + url + '">Abrir en otra ventana</a></p>';
                content.append(disclaimer);
                content.append('<iframe src="' + url + '" style="margin:0;padding:0;width:480px;display:block;border:none;" />');
                content.append("<hr />");
            });
            infow.setContent($("<div>").append(content).html());
            infow.open(_this.gmap);
            return;
        },
        mapearEventosDelMapa: function() {
            var _this = this;
            google.maps.event.addListener(_this.gmap, "zoom_changed", function(e) {
                _this.$el.trigger("zoomend", _this.gmap.getZoom());
                _this.$el.trigger("moveend", [ _this.gmap.getZoom(), _this.$el.centro() ]);
            });
            google.maps.event.addListener(_this.gmap, "dragstart", function(e) {
                _this._dragging = true;
            });
            google.maps.event.addListener(_this.gmap, "dragend", function(e) {
                _this._dragging = false;
                _this.$el.trigger("moveend", [ _this.gmap.getZoom(), _this.$el.centro() ]);
            });
            google.maps.event.addListener(_this.gmap, "center_changed", function(e) {
                if (!_this._dragging) {
                    _this.$el.trigger("moveend", [ _this.gmap.getZoom(), _this.$el.centro() ]);
                }
            });
        },
        agregarCapaKML: function(opciones) {
            var _this = this, defaults = {
                preserveViewport: true,
                map: _this.$el.data("gmap")
            };
            opciones = $.extend(defaults, opciones);
            var kml = new google.maps.KmlLayer(opciones);
        },
        infoWindow: function(opciones) {
            if (this._infoWindow === undefined) {
                this._infoWindow = new google.maps.InfoWindow();
            }
            this._infoWindow.setOptions($.extend({}, opciones));
            return this._infoWindow;
        },
        agregarMarcador: function(opciones) {
            var _this = this, defaults = {
                lat: _this.gmap.getCenter().lat(),
                lng: _this.gmap.getCenter().lng(),
                icono: $.argenmap.BASE_URL + "img/marcadores/punto.png",
                nombre: "Marcador_" + Math.floor(Math.random() * 10100),
                contenido: undefined
            };
            opciones = $.extend({}, defaults, opciones);
            if (opciones.hasOwnProperty("long")) {
                opciones.lng = opciones["long"];
            } else if (opciones.hasOwnProperty("lon")) {
                opciones.lng = opciones.lon;
            } else if (opciones.hasOwnProperty("lat") && typeof opciones.lat === "function") {
                opciones.lat = opciones.lat();
                opciones.lng = opciones.lng();
            }
            var marker = {};
            marker.icon = opciones.icono;
            marker.data = opciones.contenido;
            marker.position = new google.maps.LatLng(opciones.lat, opciones.lng);
            marker.title = opciones.nombre;
            marker.map = _this.gmap;
            var m = new google.maps.Marker(marker);
            this._marcadores[opciones.nombre] = m;
            google.maps.event.addListener(m, "click", function() {
                if (!opciones.contenido) {
                    return;
                }
                _this.infoWindow().close();
                _this.infoWindow().setContent(opciones.contenido);
                _this.infoWindow().open(_this.$el.data("gmap"), m);
            });
            return;
        },
        quitarMarcador: function(nombre) {
            if (this._marcadores[nombre] !== undefined) {
                this._marcadores[nombre].setMap(null);
                delete this._marcadores[nombre];
            }
        },
        modificarMarcador: function(nombre, opciones) {
            if (this._marcadores[nombre] === undefined) {
                return;
            }
            var m = this._marcadores[nombre];
            this.quitarMarcador(nombre);
            opciones = $.extend(m, opciones);
            opciones.nombre = nombre;
            this.agregarMarcador(opciones);
        },
        encuadrar: function(extent) {
            var _this = this, s = extent.sur, w = extent.oeste, n = extent.norte, e = extent.este, southwest = new google.maps.LatLng(s, w), northeast = new google.maps.LatLng(n, w), boundingbox = new google.maps.LatLngBounds(southwest, northeast);
            _this.gmap.fitBounds(boundingbox);
        },
        geocodificar: function(str, callback) {
            var _this = this;
            $.getJSON("http://nominatim.openstreetmap.org/search?format=json&limit=5&q=" + str, function(data) {
                if (data.length) {
                    callback(data);
                }
                console.log(data);
            }, _this);
        }
    };
    $.argenmap.CacheDeCliente = function() {
        this.MAX_TILES = 150;
        this.cache = [];
        this.cacheRef = {};
    };
    $.argenmap.CacheDeCliente.prototype = {
        recuperar: function(x, y, z) {
            var tilecode = x + "-" + y + "-" + z;
            if ($.inArray(tilecode, this.cache) !== -1) {
                return this.cacheRef[tilecode];
            }
            return false;
        },
        guardar: function(x, y, z, url) {
            if (typeof this.baseURL === "string") {
                return;
            }
            var tilecode = x + "-" + y + "-" + z;
            this.cache.push(tilecode);
            this.cacheRef[tilecode] = url;
            var sale;
            if (this.cache.length > this.MAX_TILES) {
                sale = this.cache.shift();
                delete this.cacheRef[sale];
            }
        }
    };
    $.argenmap.CapaWMS = function(opts) {
        var defaults = {
            imageMapType: null,
            gmap: null,
            tipo: "wms-1.1.1",
            url: "",
            capas: "",
            nombre: "Capa WMS",
            consultable: true,
            crs: "EPSG:3857",
            transparente: true
        };
        jQuery.extend(this, defaults, opts);
        var wmsOptions = {
            alt: this.nombre,
            getTileUrl: jQuery.proxy(this.getTileUrl, this),
            isPng: false,
            maxZoom: 17,
            minZoom: 6,
            name: this.nombre,
            tileSize: new google.maps.Size(256, 256)
        };
        this.imageMapType = new google.maps.ImageMapType(wmsOptions);
    };
    $.argenmap.CapaWMS.prototype = {
        getTileUrl: function(tile, zoom) {
            var projection = this.gmap.getProjection();
            var zpow = Math.pow(2, zoom);
            var ul = new google.maps.Point(tile.x * 256 / zpow, (tile.y + 1) * 256 / zpow);
            var lr = new google.maps.Point((tile.x + 1) * 256 / zpow, tile.y * 256 / zpow);
            var ulw = projection.fromPointToLatLng(ul);
            var lrw = projection.fromPointToLatLng(lr);
            var baseURL = this.url;
            var version = "1.1.1";
            var request = "GetMap";
            var format = "image/png";
            var layers = this.capas;
            ulw = $.argenmap.latLngAMercator(ulw.lat(), ulw.lng());
            lrw = $.argenmap.latLngAMercator(lrw.lat(), lrw.lng());
            var crs = this.crs;
            var bbox = ulw.lng + "," + ulw.lat + "," + lrw.lng + "," + lrw.lat;
            var width = "256";
            var height = "256";
            var styles = "";
            var transparent = this.transparente ? "TRUE" : "FALSE";
            var url = baseURL + "VERSION=" + version + "&SERVICE=WMS" + "&REQUEST=" + request + "&LAYERS=" + layers + "&STYLES=" + styles + "&SRS=" + crs + "&BBOX=" + bbox + "&WIDTH=" + width + "&HEIGHT=" + height + "&FORMAT=" + format + "&TRANSPARENT=" + transparent;
            return url;
        }
    };
    $.argenmap.CapaBaseWMS = function(opts) {
        var defaults = {
            imageMapType: null,
            gmap: null,
            tipo: "wms-1.1.1",
            url: "",
            capas: "",
            nombre: "Capa base WMS",
            consultable: true,
            crs: "EPSG:3857",
            transparente: false
        };
        jQuery.extend(this, defaults, opts);
        var wmsOptions = {
            alt: this.nombre,
            getTileUrl: jQuery.proxy($.argenmap.CapaWMS.prototype.getTileUrl, this),
            isPng: true,
            maxZoom: 17,
            minZoom: 3,
            name: this.nombre,
            tileSize: new google.maps.Size(256, 256)
        };
        this.imageMapType = new google.maps.ImageMapType(wmsOptions);
    };
    $.argenmap.CapaTMS = function(opts) {
        var defaults = {
            cache: new $.argenmap.CacheDeCliente(),
            imageMapType: null,
            gmap: null,
            tipo: "tms-1.0.0",
            nombre: "CAPA TMS",
            url: "",
            capas: ""
        };
        jQuery.extend(this, defaults, opts);
        var tmsOptions = {
            alt: this.nombre,
            getTileUrl: $.proxy(this.getTileUrl, this),
            isPng: false,
            maxZoom: 17,
            minZoom: 6,
            name: this.nombre,
            tileSize: new google.maps.Size(256, 256)
        };
        this.imageMapType = new google.maps.ImageMapType(tmsOptions);
    };
    $.argenmap.CapaTMS.prototype = {
        URL_HASH_FACTOR: (Math.sqrt(5) - 1) / 2,
        selectURL: function(paramString, urls) {
            var _this = this, product = 1, i, len;
            len = paramString.length;
            for (i = 0, len; i < len; i++) {
                product *= paramString.charCodeAt(i) * _this.URL_HASH_FACTOR;
                product -= Math.floor(product);
            }
            return urls[Math.floor(product * urls.length)];
        },
        getTileUrl: function(tile, zoom) {
            var baseURL = this.url;
            if (typeof baseURL !== "string") {
                baseURL = this.selectURL(tile.x + "" + tile.y, baseURL);
                var cached = this.cache.recuperar(tile.x, tile.y, zoom);
                if (cached) {
                    return cached;
                }
            }
            var layers = this.capas;
            var ytms = (1 << zoom) - tile.y - 1;
            var url = baseURL + "/" + layers + "/" + zoom + "/" + tile.x + "/" + ytms + ".png";
            this.cache.guardar(tile.x, tile.y, zoom, url);
            return url;
        }
    };
    $.argenmap.CapaBaseArgenmap = function() {
        var opts = {
            nombre: "Mapa IGN",
            url: $.argenmap.IGN_CACHES,
            capas: "capabaseargenmap"
        };
        $.argenmap.CapaTMS.apply(this, [ opts ]);
    };
    $.argenmap.CapaBaseArgenmap.prototype = new $.argenmap.CapaTMS();
    $.argenmap.CapaBaseArgenmap.prototype.constructor = $.argenmap.CapaBaseArgenmap;
    $.argenmap.CapaTMSArgenmap = function() {
        var opts = {
            nombre: "IGN",
            url: $.argenmap.IGN_CACHES,
            capas: "capabasesigign"
        };
        $.argenmap.CapaTMS.apply(this, [ opts ]);
    };
    $.argenmap.CapaTMSArgenmap.prototype = new $.argenmap.CapaTMS();
    $.argenmap.CapaTMSArgenmap.prototype.constructor = $.argenmap.CapaTMSArgenmap;
    $.argenmap.CapaTMSArgenmap.prototype.getTileUrl = function(a, b) {
        if (this.gmap.getMapTypeId() !== "satellite") {
            return false;
        }
        return $.argenmap.CapaTMS.prototype.getTileUrl.apply(this, arguments);
    };
    $.argenmap.GmapAgregarCapaBase = function(gmap, capa) {
        var mapTypeIds;
        capa.gmap = gmap;
        gmap.mapTypes.set(capa.imageMapType.name, capa.imageMapType);
        if (gmap.mapTypeControlOptions) {
            mapTypeIds = gmap.mapTypeControlOptions.mapTypeIds;
            if (mapTypeIds) {
                mapTypeIds.splice(0, 0, capa.imageMapType.name);
            } else {
                mapTypeIds = [ capa.imageMapType.name, "satellite" ];
            }
        } else {
            mapTypeIds = [ capa.imageMapType.name, "satellite" ];
        }
        gmap.setOptions({
            mapTypeControlOptions: {
                mapTypeIds: mapTypeIds,
                style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
            }
        });
    };
    $.argenmap.GmapAgregarCapa = function(gmap, capa) {
        capa.gmap = gmap;
        gmap.overlayMapTypes.push(capa.imageMapType);
    };
    $.argenmap._crearDivParaElMapa = function(div) {
        var LOGOURL = $.argenmap.BASE_URL + "img/logoignsintexto-25px.png";
        var mapCanvas_ = $('<div class="argenmapMapCanvas" />').css({
            width: "100%",
            "min-height": "200px"
        });
        var mapFooter_ = $('<div class="argenmapMapFooter" />').css({
            "font-family": "Arial",
            "background-color": "#1C74A5",
            "box-shadow": "0 0 11px rgb(5, 66, 100) inset",
            "font-size": "10px",
            "text-align": "right",
            height: "20px",
            "vertical-align": "middle",
            color: "white",
            "min-height": "15px",
            "line-height": "15px",
            padding: "5px 5px",
            margin: 0,
            border: 0
        });
        var mapLogo_ = $("<img />").css({
            height: "20px"
        });
        var mapLogoAnchor_ = $('<a style="float:left" target="_blank" href="http://www.ign.gob.ar/argenmap/argenmap.jquery/docs"></a>').append(mapLogo_);
        var $contenedor_ = div;
        mapLogo_.attr("src", LOGOURL).css({
            border: "0"
        });
        $contenedor_.append(mapCanvas_);
        $contenedor_.append(mapFooter_);
        mapFooter_.append(mapLogoAnchor_);
        mapFooter_.append('<a style="color:white;text-decoration:underline;font-weight:normal" target="_blank" href="http://www.ign.gob.ar/argenmap/argenmap.jquery/docs/#datosvectoriales">Top&oacute;nimos, datos topogr&aacute;ficos - IGN Argentina // Calles - OpenStreetMap</a>');
        $.argenmap._maximizarCanvas($contenedor_, mapFooter_, mapCanvas_);
        return mapCanvas_.get(0);
    };
    $.argenmap._maximizarCanvas = function(contenedor_, mapFooter_, mapCanvas_) {
        var dif = contenedor_.innerHeight() - mapFooter_.outerHeight();
        mapCanvas_.height(dif);
        contenedor_.bind("resized", function(e) {
            var dif = contenedor_.innerHeight() - mapFooter_.outerHeight();
            mapCanvas_.height(dif);
            google.maps.event.trigger(contenedor_.data().gmap, "resize");
        });
    };
    $.argenmap.latLngAMercator = function(lat, lon) {
        var x = lon * 20037508.34 / 180;
        var y = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180);
        y = y * 20037508.34 / 180;
        return {
            lat: y,
            lng: x
        };
    };
    $.event.special.resized = {
        interval: 0,
        setup: function() {
            var self = this, $this = $(this);
            var $w = $this.width();
            var $h = $this.height();
            $.event.special.resized.interval = setInterval(function() {
                if ($w !== $this.width() || $h !== $this.height()) {
                    $w = $this.width();
                    $h = $this.height();
                    jQuery.event.dispatch.call(self, {
                        type: "resized"
                    });
                }
            }, 100);
        },
        teardown: function() {
            clearInterval($.event.special.resized.interval);
        }
    };
    $.expr[":"]["argenmap"] = function(elem) {
        return !!$.data(elem, "argenmap");
    };
    $.fn.argenmap = function(opciones) {
        var i, args, results = [];
        $.each(this, function() {
            var _argenmap = $(this).data("argenmap");
            if (!_argenmap) {
                _argenmap = new Argenmap(this, opciones);
                $(this).data("argenmap", _argenmap);
                _argenmap.init();
            }
        });
        if (results.length) {
            if (results.length === 1) {
                return results[0];
            } else {
                return results;
            }
        }
        return this;
    };
    $.fn.agregarCapaBaseWMS = function(opciones) {
        return this.each(function() {
            var a = $(this).data("argenmap");
            if (!a) {
                return;
            }
            var map = $(this).data("gmap");
            a.activarInfoMenu();
            var capa = new $.argenmap.CapaBaseWMS(opciones);
            a.capasWms.push(capa);
            $.argenmap.GmapAgregarCapaBase(map, capa);
        });
    };
    $.fn.agregarCapaWMS = function(opciones) {
        return this.each(function() {
            var a = $(this).data("argenmap");
            if (!a) {
                return;
            }
            var map = $(this).data("gmap");
            a.activarInfoMenu();
            var capa = new $.argenmap.CapaWMS(opciones);
            a.capasWms.push(capa);
            $.argenmap.GmapAgregarCapa(map, capa);
        });
    };
    $.fn.agregarCapaBaseTMS = function(opciones) {
        return this.each(function() {
            var a = $(this).data("argenmap");
            if (!a) {
                return;
            }
            var map = $(this).data("gmap");
            $.argenmap.GmapAgregarCapaBase(map, new $.argenmap.CapaBaseTMS(opciones));
        });
    };
    $.fn.agregarCapaTMS = function(opciones) {
        return this.each(function() {
            var a = $(this).data("argenmap");
            if (!a) {
                return;
            }
            var map = $(this).data("gmap");
            $.argenmap.GmapAgregarCapaTMS(map, new $.argenmap.CapaTMS(opciones));
        });
    };
    $.fn.agregarCapaKML = function(opciones) {
        return this.each(function() {
            var a = $(this).data("argenmap");
            if (!a) {
                return;
            }
            a.agregarCapaKML(opciones);
        });
    };
    $.fn.centro = function(lat, lng) {
        if (arguments.length === 0) {
            if (!this.data("argenmap")) {
                return [];
            }
            var ctro = this.data("gmap").getCenter();
            return ctro ? [ ctro.lat(), ctro.lng() ] : [];
        }
        return this.each(function() {
            var a = $(this).data("argenmap");
            if (!a) {
                return;
            }
            $(this).data("gmap").setCenter(new google.maps.LatLng(lat, lng));
        });
    };
    $.fn.zoom = function(zoom) {
        if (undefined === zoom) {
            if (!this.data("argenmap")) {
                return null;
            }
            var z = this.data("gmap").getZoom();
            return z ? z : null;
        }
        return this.each(function() {
            var a = $(this).data("argenmap");
            if (!a || !$.isNumeric(zoom)) {
                return;
            }
            $(this).data("gmap").setZoom(zoom);
        });
    };
    $.fn.capaBase = function(nombre) {
        if (undefined === nombre) {
            if (!this.data("argenmap")) {
                return null;
            }
            var z = this.data("gmap").mapTypeId;
            return z ? z : null;
        }
        return this.each(function() {
            var a = $(this).data("argenmap");
            if (!a) {
                return;
            }
            $(this).data("gmap").setMapTypeId(nombre);
        });
    };
    $.fn.agregarMarcador = function(opciones) {
        return this.each(function() {
            var a = $(this).data("argenmap");
            if (!a) {
                return;
            }
            a.agregarMarcador(opciones);
        });
    };
    $.fn.agregarMarcadores = function(marcadores) {
        return this.each(function() {
            var _this = this;
            var a = $(this).data("argenmap");
            if (!a) {
                return;
            }
            $(marcadores).each(function(i, v) {
                $(_this).agregarMarcador(v);
            });
        });
    };
    $.fn.quitarMarcador = function(nombre) {
        var _nombre = nombre;
        return this.each(function(i, e) {
            if (typeof _nombre !== "string") {
                return;
            }
            var a = $(this).data("argenmap");
            if (!a) {
                return;
            }
            a.quitarMarcador(_nombre);
        });
    };
    $.fn.modificarMarcador = function(nombre, opciones) {
        var _nombre = nombre;
        var _opciones = opciones;
        return this.each(function(i, e) {
            if (typeof _nombre !== "string") {
                return;
            }
            if (_opciones === undefined || typeof _opciones !== "object") {
                return;
            }
            var a = $(this).data("argenmap");
            if (!a) {
                return;
            }
            a.modificarMarcador(_nombre, _opciones);
        });
    };
    $.fn.encuadrar = function(encuadre) {
        return this.each(function() {
            var a = $(this).data("argenmap");
            $(this).data("argenmap").encuadrar(encuadre);
        });
    };
})(jQuery);