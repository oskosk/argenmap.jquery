/*! argenmap.jquery 1.5.0 2014-01-13 */
(function(a) {
    var b = [ "http://cg.aws.af.cm/tms", "http://190.220.8.216/tms", "http://mapaabierto.aws.af.cm/tms", "http://igntiles1.ap01.aws.af.cm/tms" ];
    var c = {};
    c.BASEURL = "http://www.ign.gob.ar/argenmap/argenmap.jquery/";
    var d = (Math.sqrt(5) - 1) / 2;
    function f(a, b) {
        var c = 1, e, f;
        f = a.length;
        for (e = 0, f; e < f; e++) {
            c *= a.charCodeAt(e) * d;
            c -= Math.floor(c);
        }
        return b[Math.floor(c * b.length)];
    }
    var g = {
        unit: "km",
        zoom: 5,
        mapTypeControl: true,
        center: {
            lat: -34,
            lng: -59
        }
    };
    function h(b, d) {
        var f = null;
        this.element = b;
        this.$el = a(b);
        this.opts = a.extend({}, g, d);
        this.gmap = null;
        this._marcadores = {};
        this._dragging = false;
        this.init = function() {
            var a = this;
            a.opts.center = new google.maps.LatLng(a.opts.center.lat, a.opts.center.lng);
            a.opts.streetViewControl = false;
            a.opts.scaleControl = true;
            a.opts.mapTypeControlOptions = {
                style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
            };
            var b = c._prepararContenedor(this.$el);
            this.gmap = f = new google.maps.Map(b, a.opts);
            a.mapearEventosDelMapa();
            this.$el.data("gmap", f);
            google.maps.event.addListener(f, "maptypeid_changed", function() {
                f.setZoom(f.getZoom() + 1);
                f.setZoom(f.getZoom() - 1);
            });
            c.GmapAgregarCapaBase(f, new c.CapaBaseArgenmap());
            c.GmapAgregarCapa(f, new c.CapaTMSArgenmap());
            this.gmap.setMapTypeId("Mapa IGN");
            return true;
        };
        this.mapearEventosDelMapa = function() {
            var a = this;
            google.maps.event.addListener(a.gmap, "zoom_changed", function(b) {
                a.$el.trigger("zoomend", a.gmap.getZoom());
                a.$el.trigger("moveend", [ a.gmap.getZoom(), a.$el.centro() ]);
            });
            google.maps.event.addListener(a.gmap, "dragstart", function(b) {
                a._dragging = true;
            });
            google.maps.event.addListener(a.gmap, "dragend", function(b) {
                a._dragging = false;
                a.$el.trigger("moveend", [ a.gmap.getZoom(), a.$el.centro() ]);
            });
            google.maps.event.addListener(a.gmap, "center_changed", function(b) {
                if (!a._dragging) {
                    a.$el.trigger("moveend", [ a.gmap.getZoom(), a.$el.centro() ]);
                }
            });
        };
        this.agregarCapaKML = function(b) {
            var c = this, d = {
                preserveViewport: true,
                map: c.$el.data("gmap")
            };
            b = a.extend(d, b);
            var e = new google.maps.KmlLayer(b);
        };
        this.infoWindow = function() {
            if (this._infoWindow === undefined) {
                this._infoWindow = new google.maps.InfoWindow();
            }
            return this._infoWindow;
        };
        this.agregarMarcador = function(b) {
            var d = this, e = {
                lat: d.gmap.getCenter().lat(),
                lng: d.gmap.getCenter().lng(),
                icono: c.BASEURL + "img/marcadores/punto.png",
                nombre: "Marcador_" + Math.floor(Math.random() * 10100),
                contenido: undefined
            };
            b = a.extend({}, e, b);
            if (b.hasOwnProperty("long")) {
                b.lng = b["long"];
            } else if (b.hasOwnProperty("lon")) {
                b.lng = b.lon;
            } else if (b.hasOwnProperty("lat") && typeof b.lat === "function") {
                b.lat = b.lat();
                b.lng = b.lng();
            }
            var f = {};
            f.icon = b.icono;
            f.data = b.contenido;
            f.position = new google.maps.LatLng(b.lat, b.lng);
            f.title = b.nombre;
            f.map = d.gmap;
            var g = new google.maps.Marker(f);
            this._marcadores[b.nombre] = g;
            google.maps.event.addListener(g, "click", function() {
                if (!b.contenido) {
                    return;
                }
                d.infoWindow().open(d.$el.data("gmap"), g);
                d.infoWindow().setContent(b.contenido);
            });
            return;
        };
        this.quitarMarcador = function(a) {
            if (this._marcadores[a] !== undefined) {
                this._marcadores[a].setMap(null);
                delete this._marcadores[a];
            }
        };
        this.modificarMarcador = function(b, c) {
            if (this._marcadores[b] === undefined) {
                return;
            }
            var d = this._marcadores[b];
            this.quitarMarcador(b);
            c = a.extend(d, c);
            c.nombre = b;
            this.agregarMarcador(c);
        };
        this.encuadrar = function(a) {
            var b = this, c = a.sur;
            w = a.oeste;
            n = a.norte;
            e = a.este;
            southwest = new google.maps.LatLng(c, w), northeast = new google.maps.LatLng(n, w), 
            boundingbox = new google.maps.LatLngBounds(southwest, northeast);
            b.gmap.fitBounds(boundingbox);
        };
        this.geocodificar = function(b, c) {
            var d = this;
            a.getJSON("http://nominatim.openstreetmap.org/search?format=json&limit=5&q=" + b, function(a) {
                if (a.length) {
                    c(a);
                }
                console.log(a);
            }, d);
        };
    }
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function(a) {
            var b = this.length >>> 0;
            var c = Number(arguments[1]) || 0;
            c = c < 0 ? Math.ceil(c) : Math.floor(c);
            if (c < 0) c += b;
            for (;c < b; c++) {
                if (c in this && this[c] === a) return c;
            }
            return -1;
        };
    }
    c.cacheDeCliente = function() {
        this.MAX_TILES = 150;
        this.cache = [];
        this.cacheRef = {};
    };
    c.cacheDeCliente.prototype = {
        recuperar: function(a, b, c) {
            var d = a + "-" + b + "-" + c;
            if (this.cache.indexOf(d) !== -1) {
                return this.cacheRef[d];
            }
            return false;
        },
        guardar: function(a, b, c, d) {
            if (typeof this.baseURL === "string") {
                return;
            }
            var e = a + "-" + b + "-" + c;
            this.cache.push(e);
            this.cacheRef[e] = d;
            var f;
            if (this.cache.length > this.MAX_TILES) {
                f = this.cache.shift();
                delete this.cacheRef[f];
            }
        }
    };
    c.CapaBaseWMS = function(a) {
        this.imageMapType = null;
        this.gmap = null;
        this.name = "Capa base WMS";
        this.tipo = "wms-1.1.1";
        jQuery.extend(this, a);
        var b = {
            alt: this.name,
            getTileUrl: jQuery.proxy(this.getTileUrl, this),
            isPng: true,
            maxZoom: 17,
            minZoom: 3,
            name: this.name,
            tileSize: new google.maps.Size(256, 256)
        };
        this.imageMapType = new google.maps.ImageMapType(b);
    };
    c.CapaBaseWMS.prototype.getTileUrl = function(a, b) {
        var d = this.gmap.getProjection();
        var e = Math.pow(2, b);
        var f = new google.maps.Point(a.x * 256 / e, (a.y + 1) * 256 / e);
        var g = new google.maps.Point((a.x + 1) * 256 / e, a.y * 256 / e);
        var h = d.fromPointToLatLng(f);
        var i = d.fromPointToLatLng(g);
        var j = this.baseURL;
        var k = "1.1.1";
        var l = "GetMap";
        var m = "image%2Fpng";
        var n = this.layers;
        h = c.latLngAMercator(h.lat(), h.lng());
        i = c.latLngAMercator(i.lat(), i.lng());
        var o = "EPSG:3857";
        var p = h.lng + "," + h.lat + "," + i.lng + "," + i.lat;
        var q = "WMS";
        var r = "256";
        var s = "256";
        var t = "";
        var u = j + "LAYERS=" + n + "&TRANSPARENT=FALSE" + "&VERSION=" + k + "&SERVICE=" + q + "&REQUEST=" + l + "&STYLES=" + t + "&FORMAT=" + m + "&SRS=" + o + "&BBOX=" + p + "&WIDTH=" + r + "&HEIGHT=" + s;
        return u;
    };
    c.CapaBaseTMS = function(a) {
        this.cache = new c.cacheDeCliente();
        this.imageMapType = null;
        this.gmap = null;
        this.name = "Capa base TMS";
        this.tipo = "tms-1.0.0";
        jQuery.extend(this, a);
        var b = {
            alt: this.name,
            getTileUrl: jQuery.proxy(this.getTileUrl, this),
            isPng: true,
            maxZoom: 17,
            minZoom: 3,
            name: this.name,
            tileSize: new google.maps.Size(256, 256)
        };
        this.imageMapType = new google.maps.ImageMapType(b);
    };
    c.CapaBaseTMS.prototype.getTileUrl = function(a, b) {
        var c = this.baseURL;
        if (typeof c !== "string") {
            c = f(a.x + "" + a.y, c);
            var d = this.cache.recuperar(a.x, a.y, b);
            if (d) {
                return d;
            }
        }
        var e = this.layers;
        var g = (1 << b) - a.y - 1;
        var h = c + "/" + e + "/" + b + "/" + a.x + "/" + g + ".png";
        this.cache.guardar(a.x, a.y, b, h);
        return h;
    };
    c.CapaWMS = function(a) {
        this.imageMapType = null;
        this.gmap = null;
        this.tipo = "wms-1.1.1";
        this.name = "CAPA WMS";
        this.alt = "CAPA WMS";
        jQuery.extend(this, a);
        var b = {
            alt: this.alt,
            getTileUrl: jQuery.proxy(this.getTileUrl, this),
            isPng: false,
            maxZoom: 17,
            minZoom: 6,
            name: this.name,
            tileSize: new google.maps.Size(256, 256)
        };
        this.imageMapType = new google.maps.ImageMapType(b);
    };
    c.CapaWMS.prototype.getTileUrl = function(a, b) {
        var d = this.gmap.getProjection();
        var e = Math.pow(2, b);
        var f = new google.maps.Point(a.x * 256 / e, (a.y + 1) * 256 / e);
        var g = new google.maps.Point((a.x + 1) * 256 / e, a.y * 256 / e);
        var h = d.fromPointToLatLng(f);
        var i = d.fromPointToLatLng(g);
        var j = this.baseURL;
        var k = "1.1.1";
        var l = "GetMap";
        var m = "image/png";
        var n = this.layers;
        h = c.latLngAMercator(h.lat(), h.lng());
        i = c.latLngAMercator(i.lat(), i.lng());
        var o = "EPSG:3857";
        var p = h.lng + "," + h.lat + "," + i.lng + "," + i.lat;
        var q = "256";
        var r = "256";
        var s = "";
        var t = j + "VERSION=" + k + "&SERVICE=WMS" + "&REQUEST=" + l + "&LAYERS=" + n + "&STYLES=" + s + "&SRS=" + o + "&BBOX=" + p + "&WIDTH=" + q + "&HEIGHT=" + r + "&FORMAT=" + m + "&TRANSPARENT=TRUE";
        return t;
    };
    c.CapaTMS = function(a) {
        this.cache = new c.cacheDeCliente();
        this.imageMapType = null;
        this.gmap = null;
        this.tipo = "tms-1.0.0";
        this.name = "CAPA TMS";
        this.alt = "CAPA TMS";
        jQuery.extend(this, a);
        var b = {
            alt: this.alt,
            getTileUrl: jQuery.proxy(this.getTileUrl, this),
            isPng: false,
            maxZoom: 17,
            minZoom: 6,
            name: this.name,
            tileSize: new google.maps.Size(256, 256)
        };
        this.imageMapType = new google.maps.ImageMapType(b);
    };
    c.CapaTMS.prototype.getTileUrl = function(a, b) {
        var c = this.baseURL;
        if (typeof c !== "string") {
            c = f(a.x + "" + a.y, c);
            var d = this.cache.recuperar(a.x, a.y, b);
            if (d) {
                return d;
            }
        }
        var e = this.layers;
        var g = (1 << b) - a.y - 1;
        var h = c + "/" + e + "/" + b + "/" + a.x + "/" + g + ".png";
        this.cache.guardar(a.x, a.y, b, h);
        return h;
    };
    c.CapaBaseArgenmap = function() {
        var a = {
            name: "Mapa IGN",
            baseURL: b,
            layers: "capabaseargenmap"
        };
        c.CapaBaseTMS.apply(this, [ a ]);
    };
    c.CapaBaseArgenmap.prototype.getTileUrl = function() {
        return c.CapaBaseTMS.prototype.getTileUrl.apply(this, arguments);
    };
    c.CapaTMSArgenmap = function() {
        var a = {
            name: "IGN",
            baseURL: b,
            layers: "capabasesigign"
        };
        c.CapaTMS.apply(this, [ a ]);
    };
    c.CapaTMSArgenmap.prototype.getTileUrl = function(a, b) {
        if (this.gmap.getMapTypeId() !== "satellite") {
            return false;
        }
        return c.CapaTMS.prototype.getTileUrl.apply(this, arguments);
    };
    c.GmapAgregarCapaBase = function(a, b) {
        var c;
        b.gmap = a;
        a.mapTypes.set(b.imageMapType.name, b.imageMapType);
        if (a.mapTypeControlOptions) {
            c = a.mapTypeControlOptions.mapTypeIds;
            if (c) {
                c.splice(0, 0, b.imageMapType.name);
            } else {
                c = [ b.imageMapType.name, "satellite" ];
            }
        } else {
            c = [ b.imageMapType.name, "satellite" ];
        }
        a.setOptions({
            mapTypeControlOptions: {
                mapTypeIds: c,
                style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
            }
        });
    };
    c.GmapAgregarCapa = function(a, b) {
        b.gmap = a;
        a.overlayMapTypes.push(b.imageMapType);
    };
    c._prepararContenedor = function(b) {
        var d = c.BASEURL + "img/logoignsintexto-25px.png";
        var e = a('<div class="argenmapMapCanvas" />').css({
            width: "100%",
            "min-height": "200px"
        });
        var f = a('<div class="argenmapMapFooter" />').css({
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
        var g = a("<img />").css({
            height: "20px"
        });
        var h = a('<a style="float:left" target="_blank" href="http://www.ign.gob.ar/argenmap/argenmap.jquery/docs"></a>').append(g);
        var i = b;
        g.attr("src", d).css({
            border: "0"
        });
        i.append(e);
        i.append(f);
        f.append(h);
        f.append('<a style="color:white;text-decoration:underline;font-weight:normal" target="_blank" href="http://www.ign.gob.ar/argenmap/argenmap.jquery/docs/#datosvectoriales">Top&oacute;nimos, datos topogr&aacute;ficos - IGN Argentina // Calles - OpenStreetMap</a>');
        c._maximizarCanvas(i, f, e);
        return e.get(0);
    };
    c._maximizarCanvas = function(a, b, c) {
        var d = a.innerHeight() - b.outerHeight();
        c.height(d);
        a.bind("resized", function(d) {
            var e = a.innerHeight() - b.outerHeight();
            c.height(e);
            google.maps.event.trigger(a.data().gmap, "resize");
        });
    };
    c.latLngAMercator = function(a, b) {
        var c = b * 20037508.34 / 180;
        var d = Math.log(Math.tan((90 + a) * Math.PI / 360)) / (Math.PI / 180);
        d = d * 20037508.34 / 180;
        return {
            lat: d,
            lng: c
        };
    };
    a.event.special.resized = {
        interval: 0,
        setup: function() {
            var b = this, c = a(this);
            var d = c.width();
            var e = c.height();
            a.event.special.resized.interval = setInterval(function() {
                if (d !== c.width() || e !== c.height()) {
                    d = c.width();
                    e = c.height();
                    jQuery.event.handle.call(b, {
                        type: "resized"
                    });
                }
            }, 100);
        },
        teardown: function() {
            clearInterval(a.event.special.resized.interval);
        }
    };
    a.fn.argenmap = function(b) {
        var c, d, e = [];
        a.each(this, function() {
            var c = a(this).data("argenmap");
            if (!c) {
                c = new h(this, b);
                a(this).data("argenmap", c);
                c.init();
            }
        });
        if (e.length) {
            if (e.length === 1) {
                return e[0];
            } else {
                return e;
            }
        }
        return this;
    };
    a.fn.agregarCapaBaseWMS = function(b) {
        return this.each(function() {
            var d = a(this).data("argenmap");
            if (!d) {
                return;
            }
            var e = a(this).data("gmap");
            c.GmapAgregarCapaBase(e, new c.CapaBaseWMS({
                name: b.nombre,
                baseURL: b.url,
                layers: b.capas
            }));
        });
    };
    a.fn.agregarCapaBaseTMS = function(b) {
        return this.each(function() {
            var d = a(this).data("argenmap");
            if (!d) {
                return;
            }
            var e = a(this).data("gmap");
            c.GmapAgregarCapaBase(e, new c.CapaBaseTMS({
                name: b.nombre,
                baseURL: b.url,
                layers: b.capas
            }));
        });
    };
    a.fn.agregarCapaWMS = function(b) {
        return this.each(function() {
            var d = a(this).data("argenmap");
            if (!d) {
                return;
            }
            var e = a(this).data("gmap");
            c.GmapAgregarCapa(e, new c.CapaWMS({
                name: b.nombre,
                baseURL: b.url,
                layers: b.capas
            }));
        });
    };
    a.fn.agregarCapaTMS = function(b) {
        return this.each(function() {
            var d = a(this).data("argenmap");
            if (!d) {
                return;
            }
            var e = a(this).data("gmap");
            c.GmapAgregarCapaTMS(e, new c.CapaTMS({
                name: b.nombre,
                baseURL: b.url,
                layers: b.capas
            }));
        });
    };
    a.fn.agregarCapaKML = function(b) {
        return this.each(function() {
            var c = a(this).data("argenmap");
            if (!c) {
                return;
            }
            c.agregarCapaKML(b);
        });
    };
    a.fn.centro = function(b, c) {
        if (arguments.length === 0) {
            if (!this.data("argenmap")) {
                return [];
            }
            var d = this.data("gmap").getCenter();
            return d ? [ d.lat(), d.lng() ] : [];
        }
        return this.each(function() {
            var d = a(this).data("argenmap");
            if (!d) {
                return;
            }
            a(this).data("gmap").setCenter(new google.maps.LatLng(b, c));
        });
    };
    a.fn.zoom = function(b) {
        if (undefined === b) {
            if (!this.data("argenmap")) {
                return null;
            }
            var c = this.data("gmap").getZoom();
            return c ? c : null;
        }
        return this.each(function() {
            var c = a(this).data("argenmap");
            if (!c || !a.isNumeric(b)) {
                return;
            }
            a(this).data("gmap").setZoom(b);
        });
    };
    a.fn.capaBase = function(b) {
        if (undefined === b) {
            if (!this.data("argenmap")) {
                return null;
            }
            var c = this.data("gmap").mapTypeId;
            return c ? c : null;
        }
        return this.each(function() {
            var c = a(this).data("argenmap");
            if (!c) {
                return;
            }
            a(this).data("gmap").setMapTypeId(b);
        });
    };
    a.fn.agregarMarcador = function(b) {
        return this.each(function() {
            var c = a(this).data("argenmap");
            if (!c) {
                return;
            }
            c.agregarMarcador(b);
        });
    };
    a.fn.agregarMarcadores = function(b) {
        return this.each(function() {
            var c = this;
            var d = a(this).data("argenmap");
            if (!d) {
                return;
            }
            a(b).each(function(b, d) {
                a(c).agregarMarcador(d);
            });
        });
    };
    a.fn.limpiarMapa = function(b) {
        return this.each(function() {
            var b = a(this).data("argenmap");
            if (!b) {
                return;
            }
            a(this).argenmap({
                accion: "limpiar"
            });
        });
    };
    a.fn.quitarMarcador = function(b) {
        var c = b;
        return this.each(function(b, d) {
            if (typeof c !== "string") {
                return;
            }
            var e = a(this).data("argenmap");
            if (!e) {
                return;
            }
            e.quitarMarcador(c);
        });
    };
    a.fn.modificarMarcador = function(b, c) {
        var d = b;
        var e = c;
        return this.each(function(b, c) {
            if (typeof d !== "string") {
                return;
            }
            if (e === undefined || typeof e !== "object") {
                return;
            }
            var f = a(this).data("argenmap");
            if (!f) {
                return;
            }
            f.modificarMarcador(d, e);
        });
    };
    a.fn.encuadrar = function(b) {
        return this.each(function() {
            var c = a(this).data("argenmap");
            a(this).data("argenmap").encuadrar(b);
        });
    };
})(jQuery);