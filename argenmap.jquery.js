/*
 *  Argenmap Plugin para JQuery 
 *  Version   : 0.1
 *  Date      : 2011-11-18
 *  Licence   : GPL v3 : http://www.gnu.org/licenses/gpl.html  
 *  Author    : Oscar López
 *  Contact   : olopez@ign.gob.ar
 *  Web site  : http://ign.gob.ar/argenmap
 *   
 *  Copyright (c) 2012 Instituto Geográfico Nacional de la República Argentina
 *  Todos los derechos reservados.
 *   
 */ (function ($) {

    /***************************************************************************/
    /*                                STACK                                    */
    /***************************************************************************/
    function Stack() {
        var st = [];
        this.empty = function () {
            for (var i = 0; i < st.length; i++) {
                if (st[i]) {
                    return false
                }
            }
            return true;
        }
        this.add = function (v) {
            st.push(v);
        }
        this.addNext = function (v) {

            var t = [],
                i, k = 0;
            for (i = 0; i < st.length; i++) {
                if (!st[i]) {
                    continue;
                }
                if (k == 1) {
                    t.push(v);
                }
                t.push(st[i]);
                k++;
            }
            if (k < 2) {
                t.push(v);
            }
            st = t;
        }
        this.get = function () {
            for (var i = 0; i < st.length; i++) {
                if (st[i]) {
                    return st[i];
                }
            }
            return false;
        }
        this.ack = function () {
            for (var i = 0; i < st.length; i++) {
                if (st[i]) {
                    delete st[i];
                    break;
                }
            }
            if (this.empty()) {
                st = [];
            }
        }
    }

    /***************************************************************************/
    /*                                STORE                                    */
    /***************************************************************************/
    function Store() {
        var store = {};

        /**
         * add a mixed to the store
         **/
        this.add = function (name, obj, todo) {
            name = name.toLowerCase();
            if (!store[name]) {
                store[name] = [];
            }
            store[name].push({
                obj: obj,
                tag: ival(todo, 'tag')
            });
            return name + '-' + (store[name].length - 1);
        }

        /**
         * return a stored mixed
         **/
        this.get = function (name, last, tag) {
            var i, idx, add;
            name = name.toLowerCase();
            if (!store[name] || !store[name].length) {
                return null;
            }
            idx = last ? store[name].length : -1;
            add = last ? -1 : 1;
            for (i = 0; i < store[name].length; i++) {
                idx += add;
                if (store[name][idx]) {
                    if (tag !== undefined) {
                        if ((store[name][idx].tag === undefined) || ($.inArray(store[name][idx].tag, tag) < 0)) {
                            continue;
                        }
                    }
                    return store[name][idx].obj;
                }
            }
            return null;
        }

        /**
         * return all stored mixed
         **/
        this.all = function (name, tag) {
            var i, result = [];
            name = name.toLowerCase();
            if (!store[name] || !store[name].length) {
                return result;
            }
            for (i = 0; i < store[name].length; i++) {
                if (!store[name][i]) {
                    continue;
                }
                if ((tag !== undefined) && ((store[name][i].tag === undefined) || ($.inArray(store[name][i].tag, tag) < 0))) {
                    continue;
                }
                result.push(store[name][i].obj);
            }
            return result;
        }

        /**
         * return all storation groups
         **/
        this.names = function () {
            var name, result = [];
            for (name in store) {
                result.push(name);
            }
            return result;
        }

        /**
         * return an object from its reference
         **/
        this.refToObj = function (ref) {
            ref = ref.split('-'); // nombre - índice
            if ((ref.length == 2) && store[ref[0]] && store[ref[0]][ref[1]]) {
                return store[ref[0]][ref[1]].obj;
            }
            return null;
        }

        /**
         * remove one object from the store
         **/
        this.rm = function (name, tag, pop) {
            var idx, i, tmp;
            name = name.toLowerCase();
            if (!store[name]) {
                return false;
            }
            if (tag !== undefined) {
                if (pop) {
                    for (idx = store[name].length - 1; idx >= 0; idx--) {
                        if ((store[name][idx] !== undefined) && (store[name][idx].tag !== undefined) && ($.inArray(store[name][idx].tag, tag) >= 0)) {
                            break;
                        }
                    }
                } else {
                    for (idx = 0; idx < store[name].length; idx++) {
                        if ((store[name][idx] !== undefined) && (store[name][idx].tag !== undefined) && ($.inArray(store[name][idx].tag, tag) >= 0)) {
                            break;
                        }
                    }
                }
            } else {
                idx = pop ? store[name].length - 1 : 0;
            }
            if (!(idx in store[name])) {
                return false;
            }
            // Elemento de Google maps
            if (typeof (store[name][idx].obj.setMap) === 'function') {
                store[name][idx].obj.setMap(null);
            }
            // jQuery
            if (typeof (store[name][idx].obj.remove) === 'function') {
                store[name][idx].obj.remove();
            }
            // interno (cluster)
            if (typeof (store[name][idx].obj.free) === 'function') {
                store[name][idx].obj.free();
            }
            delete store[name][idx].obj;
            if (tag !== undefined) {
                tmp = [];
                for (i = 0; i < store[name].length; i++) {
                    if (i !== idx) {
                        tmp.push(store[name][i]);
                    }
                }
                store[name] = tmp;
            } else {
                if (pop) {
                    store[name].pop();
                } else {
                    store[name].shift();
                }
            }
            return true;
        }

        /**
         * remove objects from the store
         **/
        this.clear = function (list, last, first, tag) {
            var k, i, name;
            if (!list || !list.length) {
                list = [];
                for (k in store) {
                    list.push(k);
                }
            } else {
                list = array(list);
            }
            for (i = 0; i < list.length; i++) {
                if (list[i]) {
                    name = list[i].toLowerCase();
                    if (!store[name]) {
                        continue;
                    }
                    if (last) {
                        this.rm(name, tag, true);
                    } else if (first) {
                        this.rm(name, tag, false);
                    } else {
                        // todos
                        while (this.rm(name, tag, false)) {}
                    }
                }
            }
        }
    }

    /***************************************************************************/
    /*                              CLUSTERER                                  */
    /***************************************************************************/

    function Clusterer() {
        var markers = [],
            events = [],
            stored = [],
            latest = [],
            redrawing = false,
            redraw;

        this.events = function () {
            for (var i = 0; i < arguments.length; i++) {
                events.push(arguments[i]);
            }
        }

        this.startRedraw = function () {
            if (!redrawing) {
                redrawing = true;
                return true;
            }
            return false;
        }

        this.endRedraw = function () {
            redrawing = false;
        }

        this.redraw = function () {
            var i, args = [],
                that = this;
            for (i = 0; i < arguments.length; i++) {
                args.push(arguments[i]);
            }
            if (this.startRedraw) {
                redraw.apply(that, args);
                this.endRedraw();
            } else {
                setTimeout(function () {
                    that.redraw.apply(that, args);
                },
                50);
            }
        };

        this.setRedraw = function (fnc) {
            redraw = fnc;
        }

        this.store = function (data, obj, shadow) {
            stored.push({
                data: data,
                obj: obj,
                shadow: shadow
            });
        }

        this.free = function () {
            for (var i = 0; i < events.length; i++) {
                google.maps.event.removeListener(events[i]);
            }
            events = [];
            this.freeAll();
        }

        this.freeIndex = function (i) {
            if (typeof (stored[i].obj.setMap) === 'function') {
                stored[i].obj.setMap(null);
            }
            if (typeof (stored[i].obj.remove) === 'function') {
                stored[i].obj.remove();
            }
            if (stored[i].shadow) { // solo los overlays tienen sombra
                if (typeof (stored[i].shadow.remove) === 'function') {
                    stored[i].obj.remove();
                }
                if (typeof (stored[i].shadow.setMap) === 'function') {
                    stored[i].shadow.setMap(null);
                }
                delete stored[i].shadow;
            }
            delete stored[i].obj;
            delete stored[i].data;
            delete stored[i];
        }

        this.freeAll = function () {
            var i;
            for (i = 0; i < stored.length; i++) {
                if (stored[i]) {
                    this.freeIndex(i);
                }
            }
            stored = [];
        }

        this.freeDiff = function (clusters) {
            var i, j, same = {}, idx = [];
            for (i = 0; i < clusters.length; i++) {
                idx.push(clusters[i].idx.join('-'));
            }
            for (i = 0; i < stored.length; i++) {
                if (!stored[i]) {
                    continue;
                }
                j = $.inArray(stored[i].data.idx.join('-'), idx);
                if (j >= 0) {
                    same[j] = true;
                } else {
                    this.freeIndex(i);
                }
            }
            return same;
        }

        this.add = function (latLng, marker) {
            markers.push({
                latLng: latLng,
                marker: marker
            });
        }

        this.get = function (i) {
            return markers[i];
        }

        this.clusters = function (map, radius, maxZoom, force) {
            var proj = map.getProjection(),
                nwP = proj.fromLatLngToPoint(
                new google.maps.LatLng(
                map.getBounds().getNorthEast().lat(),
                map.getBounds().getSouthWest().lng())),
                i, j, j2, p, x, y, k, k2,
                z = map.getZoom(),
                pos = {},
                saved = {},
                unik = {},
                clusters = [],
                cluster,
                chk,
                lat, lng, keys, cnt,
                bounds = map.getBounds(),
                noClusters = maxZoom && (maxZoom <= map.getZoom()),
                chkContain = map.getZoom() > 2;

            cnt = 0;
            keys = {};
            for (i = 0; i < markers.length; i++) {
                if (chkContain && !bounds.contains(markers[i].latLng)) {
                    continue;
                }
                p = proj.fromLatLngToPoint(markers[i].latLng);
                pos[i] = [
                Math.floor((p.x - nwP.x) * Math.pow(2, z)),
                Math.floor((p.y - nwP.y) * Math.pow(2, z))];
                keys[i] = true;
                cnt++;
            }
            // checqueo si los marcadores visibles cambiaron
            if (!force && !noClusters) {
                for (k = 0; k < latest.length; k++) {
                    if (k in keys) {
                        cnt--;
                    } else {
                        break;
                    }
                }
                if (!cnt) {
                    return false; // no hubo cambio
                }
            }

            // guardo las keys actuales para chequear más tarde si se hizo
            // una actualización
            latest = keys;

            keys = [];
            for (i in pos) {
                x = pos[i][0];
                y = pos[i][1];
                if (!(x in saved)) {
                    saved[x] = {};
                }
                if (!(y in saved[x])) {
                    saved[x][y] = i;
                    unik[i] = {};
                    keys.push(i);
                }
                unik[saved[x][y]][i] = true;
            }
            radius = Math.pow(radius, 2);
            delete(saved);

            k = 0;
            while (1) {
                while ((k < keys.length) && !(keys[k] in unik)) {
                    k++;
                }
                if (k == keys.length) {
                    break;
                }
                i = keys[k];
                lat = pos[i][0];
                lng = pos[i][1];
                saved = null;


                if (noClusters) {
                    saved = {
                        lat: lat,
                        lng: lng,
                        idx: [i]
                    };
                } else {
                    do {
                        cluster = {
                            lat: 0,
                            lng: 0,
                            idx: []
                        };
                        for (k2 = k; k2 < keys.length; k2++) {
                            if (!(keys[k2] in unik)) {
                                continue;
                            }
                            j = keys[k2];
                            if (Math.pow(lat - pos[j][0], 2) + Math.pow(lng - pos[j][1], 2) <= radius) {
                                for (j2 in unik[j]) {
                                    cluster.lat += markers[j2].latLng.lat();
                                    cluster.lng += markers[j2].latLng.lng();
                                    cluster.idx.push(j2);
                                }
                            }
                        }
                        cluster.lat /= cluster.idx.length;
                        cluster.lng /= cluster.idx.length;
                        if (!saved) {
                            chk = cluster.idx.length > 1;
                            saved = cluster;
                        } else {
                            chk = cluster.idx.length > saved.idx.length;
                            if (chk) {
                                saved = cluster;
                            }
                        }
                        if (chk) {
                            p = proj.fromLatLngToPoint(new google.maps.LatLng(saved.lat, saved.lng));
                            lat = Math.floor((p.x - nwP.x) * Math.pow(2, z));
                            lng = Math.floor((p.y - nwP.y) * Math.pow(2, z));
                        }
                    } while (chk);
                }

                for (k2 = 0; k2 < saved.idx.length; k2++) {
                    if (saved.idx[k2] in unik) {
                        delete(unik[saved.idx[k2]]);
                    }
                }
                clusters.push(saved);
            }
            return clusters;
        }

        this.getBounds = function () {
            var i, bounds = new google.maps.LatLngBounds();
            for (i = 0; i < markers.length; i++) {
                bounds.extend(markers[i].latLng);
            }
            return bounds;
        }
    }

    /***************************************************************************/
    /*                           GLOBALS de Argenmap                                 */
    /***************************************************************************/

    var _default = {},
    _properties = ['events', 'onces', 'opciones', 'apply', 'callback', 'data', 'tag'],
        _noInit = ['init', 'geolatlng', 'getlatlng', 'getroute', 'getelevation', 'getdistance', 'addstyledmap', 'setdefault', 'destroy'],
        _directs = ['get'],
        geocoder = directionsService = elevationService = maxZoomService = distanceMatrixService = null;

    function setDefault(values) {
        for (var k in values) {
            if (typeof (_default[k]) === 'object') {
                _default[k] = $.extend({}, _default[k], values[k]);
            } else {
                _default[k] = values[k];
            }
        }
    }

    function autoInit(iname) {
        if (!iname) {
            return true;
        }
        for (var i = 0; i < _noInit.length; i++) {
            if (_noInit[i] === iname) {
                return false;
            }
        }
        return true;
    }


    /**
     * return true if action has to be executed directly
     **/
    function isDirect(todo) {
        var action = ival(todo, 'accion');
        for (var i = 0; i < _directs.length; i++) {
            if (_directs[i] === action) {
                return true;
            }
        }
        return false;
    }

    //-----------------------------------------------------------------------//
    // herramientas de Objetos
    //-----------------------------------------------------------------------//

    /**
     * return the real key by an insensitive seach
     **/
    function ikey(object, key) {
        if (key.toLowerCase) {
            key = key.toLowerCase();
            for (var k in object) {
                if (k.toLowerCase && (k.toLowerCase() == key)) {
                    return k;
                }
            }
        }
        return false;
    }

    /**
     * return the value of real key by an insensitive seach
     **/
    function ival(object, key, def) {
        var k = ikey(object, key);
        return k ? object[k] : def;
    }

    /**
     * return true if at least one key is set in object
     * nb: keys in lowercase
     **/
    function hasKey(object, keys) {
        var n, k;
        if (!object || !keys) {
            return false;
        }
        keys = array(keys);
        for (n in object) {
            if (n.toLowerCase) {
                n = n.toLowerCase();
                for (k in keys) {
                    if (n == keys[k]) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     * return a standard object
     * nb: include in lowercase
     **/
    function extractObject(todo, include, result /* = {} */ ) {
        if (hasKey(todo, _properties) || hasKey(todo, include)) { // #1 definición clásico de objetos
            var i, k;
            // valores de propiedades definidos en todo
            for (i = 0; i < _properties.length; i++) {
                k = ikey(todo, _properties[i]);
                result[_properties[i]] = k ? todo[k] : {};
            }
            if (include && include.length) {
                for (i = 0; i < include.length; i++) {
                    if (k = ikey(todo, include[i])) {
                        result[include[i]] = todo[k];
                    }
                }
            }
            return result;
        } else { // #2 objeto simplificado (todo excepto "accion" son opciones)
            result.opciones = {};
            for (k in todo) {
                if (k !== 'accion') {
                    result.opciones[k] = todo[k];
                }
            }
            return result;
        }
    }

    /**
     * identify object from object list or parameters list : [ objectName:{data} ] or [ otherObject:{}, ] or [ object properties ]
     * nb: include, exclude in lowercase
     **/
    function getObject(name, todo, include, exclude) {
        var iname = ikey(todo, name),
            i, result = {}, keys = ['map'];
        // incluyo la  callback de un nivel más alto
        result['callback'] = ival(todo, 'callback');
        include = array(include);
        exclude = array(exclude);
        if (iname) {
            return extractObject(todo[iname], include, result);
        }
        if (exclude && exclude.length) {
            for (i = 0; i < exclude.length; i++) {
                keys.push(exclude[i]);
            }
        }
        if (!hasKey(todo, keys)) {
            result = extractObject(todo, include, result);
        }
        // inicio las properties q faltan
        for (i = 0; i < _properties.length; i++) {
            if (_properties[i] in result) {
                continue;
            }
            result[_properties[i]] = {};
        }
        return result;
    }

    //-----------------------------------------------------------------------//
    // herramientas de Servicios
    //-----------------------------------------------------------------------//

    function getGeocoder() {
        if (!geocoder) {
            geocoder = new google.maps.Geocoder();
        }
        return geocoder;
    }

    function getDirectionsService() {
        if (!directionsService) {
            directionsService = new google.maps.DirectionsService();
        }
        return directionsService;
    }

    function getElevationService() {
        if (!elevationService) {
            elevationService = new google.maps.ElevationService();
        }
        return elevationService;
    }

    function getMaxZoomService() {
        if (!maxZoomService) {
            maxZoomService = new google.maps.MaxZoomService();
        }
        return maxZoomService;
    }

    function getDistanceMatrixService() {
        if (!distanceMatrixService) {
            distanceMatrixService = new google.maps.DistanceMatrixService();
        }
        return distanceMatrixService;
    }

    //-----------------------------------------------------------------------//
    // herramientas de unidades
    //-----------------------------------------------------------------------//

    /**
     * return true if mixed is usable as number
     **/
    function numeric(mixed) {
        return (typeof (mixed) === 'number' || typeof (mixed) === 'string') && mixed !== '' && !isNaN(mixed);
    }

    /**
     * convert data to array
     **/
    function array(mixed) {
        var k, a = [];
        if (mixed !== undefined) {
            if (typeof (mixed) === 'object') {
                if (typeof (mixed.length) === 'number') {
                    a = mixed;
                } else {
                    for (k in mixed) {
                        a.push(mixed[k]);
                    }
                }
            } else {
                a.push(mixed);
            }
        }
        return a;
    }

    /**
     * convert mixed [ lat, lng ] objet to google.maps.LatLng
     **/
    function toLatLng(mixed, emptyReturnMixed, noFlat) {
        var empty = emptyReturnMixed ? mixed : null;
        if (!mixed || (typeof (mixed) === 'string')) {
            return empty;
        }
        // latLng definida
        if (mixed.latLng) {
            return toLatLng(mixed.latLng);
        }
        // objeto google.maps.LatLng
        if (typeof (mixed.lat) === 'function') {
            return mixed;
        }
        // objeto {lat:Y, lng:X}  
        else if (numeric(mixed.lat)) {
            return new google.maps.LatLng(mixed.lat, mixed.lng);
        }
        // objeto [X, Y]  
        else if (!noFlat && mixed.length) { // y objeto "no chato" permitido
            if (!numeric(mixed[0]) || !numeric(mixed[1])) {
                return empty;
            }
            return new google.maps.LatLng(mixed[0], mixed[1]);
        }
        return empty;
    }

    /**
     * convert mixed [ sw, ne ] object by google.maps.LatLngBounds
     **/
    function toLatLngBounds(mixed, flatAllowed, emptyReturnMixed) {
        var ne, sw, empty;
        if (!mixed) {
            return null;
        }
        empty = emptyReturnMixed ? mixed : null;
        if (typeof (mixed.getCenter) === 'function') {
            return mixed;
        }
        if (mixed.length) {
            if (mixed.length == 2) {
                ne = toLatLng(mixed[0]);
                sw = toLatLng(mixed[1]);
            } else if (mixed.length == 4) {
                ne = toLatLng([mixed[0], mixed[1]]);
                sw = toLatLng([mixed[2], mixed[3]]);
            }
        } else {
            if (('ne' in mixed) && ('sw' in mixed)) {
                ne = toLatLng(mixed.ne);
                sw = toLatLng(mixed.sw);
            } else if (('n' in mixed) && ('e' in mixed) && ('s' in mixed) && ('w' in mixed)) {
                ne = toLatLng([mixed.n, mixed.e]);
                sw = toLatLng([mixed.s, mixed.w]);
            }
        }
        if (ne && sw) {
            return new google.maps.LatLngBounds(sw, ne);
        }
        return empty;
    }

    /***************************************************************************/
    /*                                Argenmap                                    */
    /***************************************************************************/

    function Argenmap($this) {

        var stack = new Stack(),
            store = new Store(),
            map = null,
            styles = {},
            running = false;

        //-----------------------------------------------------------------------//
        // herramientas para la pila
        //-----------------------------------------------------------------------//

        /**
         * store actions to execute in a stack manager
         **/
        this._plan = function (list) {
            for (var k = 0; k < list.length; k++) {
                stack.add(list[k]);
            }
            this._run();
        }

        /**
         * store one action to execute in a stack manager after the current
         **/
        this._planNext = function (todo) {
            stack.addNext(todo);
        }

        /**
         * execute action directly
         **/
        this._direct = function (todo) {
            var action = ival(todo, 'accion');
            var aux2 = {};
            var aux3 = todo;
            if (action in _default) {
                aux2 = _default[action];
            }
            if (todo.args) {
                aux3 = todo.args;
            }
            aux = $.extend({}, aux2, aux3);
            return this[action](aux);
        }

        /**
         * called when action in finished, to acknoledge the current in stack and start next one
         **/
        this._end = function () {
            running = false;
            stack.ack();
            this._run();
        },
        /**
         * if not running, start next action in stack
         **/
        this._run = function () {
            if (running) {
                return;
            }
            var todo = stack.get();
            if (!todo) {
                return;
            }
            running = true;
            this._proceed(todo);
        }

        //-----------------------------------------------------------------------//
        // herramientas de las llamadas a función de argenmap.jquery
        //-----------------------------------------------------------------------//

        /**
         * run the appropriated function
         **/
        this._proceed = function (todo) {
            todo = todo || {};
            var action = ival(todo, 'accion') || 'init',
                iaction = action.toLowerCase(),
                ok = true,
                target = ival(todo, 'target'),
                args = ival(todo, 'args'),
                out;
            // chequeo si init tiene que ser llamada automáticamente


            //Mapa para traduccir las actions a castellano

            var mapaDeAcciones = {
                'agregarMarcador': 'addMarker',
                    'agregarMarcadores': 'addMarkers',
                    'agregarRectangulo': 'addRectangle',
                    'agregarCapaKml': 'addKmlLayer',
                    'limpiar': 'clear'
            }
            if (mapaDeAcciones[action]) {
                action = mapaDeAcciones[action];
                iaction = action.toLowerCase();
            }


            if (!map && autoInit(iaction)) {

                this.init($.extend({}, _default.init, todo.args && todo.args.map ? todo.args.map : todo.map ? todo.map : {}), true);
            }

            // función de Argenmap
            if (!target && !args && (iaction in this) && (typeof (this[iaction]) === 'function')) {
                this[iaction]($.extend({}, iaction in _default ? _default[iaction] : {}, todo.args ? todo.args : todo)); // call fnc and extends defaults data
            } else {
                // función del objeto "target"
                if (target && (typeof (target) === 'object')) {

                    if (ok = (typeof (target[action]) === 'function')) {
                        out = target[action].apply(target, todo.args ? todo.args : []);
                    }
                    // método directo de google.maps.Map :  
                } else if (map) {
                    if (ok = (typeof (map[action]) === 'function')) {
                        out = map[action].apply(map, todo.args ? todo.args : []);
                    }
                }
                if (!ok && _default.verbose) {
                    alert("Acción desconocida : " + action);
                }
                this._callback(out, todo);
                this._end();
            }
        }

        /**
         * returns the geographical coordinates from an address and call internal or given method
         **/
        this._resolveLatLng = function (todo, method, all, attempt) {
            var address = ival(todo, 'direccion'),
                params,
                that = this,
                fnc = typeof (method) === 'function' ? method : that[method];
            if (address) {
                if (!attempt) { // convertir undefined a int
                    attempt = 0;
                }
                if (typeof (address) === 'object') {
                    params = address;
                } else {
                    params = {
                        'address': address
                    };
                }
                getGeocoder().geocode(
                params,

                function (results, status) {
                    if (status === google.maps.GeocoderStatus.OK) {
                        fnc.apply(that, [todo, all ? results : results[0].geometry.location]);
                    } else if ((status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT) && (attempt < _default.queryLimit.attempt)) {
                        setTimeout(function () {
                            that._resolveLatLng(todo, method, all, attempt + 1);
                        },
                        _default.queryLimit.delay + Math.floor(Math.random() * _default.queryLimit.random));
                    } else {
                        if (_default.verbose) {
                            alert('Geocode error : ' + status);
                        }
                        fnc.apply(that, [todo, false]);;
                    }
                });
            } else {
                fnc.apply(that, [todo, toLatLng(todo, false, true)]);
            }
        }

        /**
         * returns the geographical coordinates from an array of object using "address" and call internal method
         **/
        this._resolveAllLatLng = function (todo, property, method) {
            var that = this,
                i = -1,
                solveNext = function () {
                    do {
                        i++;
                    } while ((i < todo[property].length) && !('direccion' in todo[property][i]));
                    if (i < todo[property].length) {
                        (function (todo) {
                            that._resolveLatLng(
                            todo,

                            function (todo, latLng) {
                                todo.latLng = latLng;
                                solveNext.apply(that, []); // resolver la siguiente o ejecutar el método de finalización
                            });
                        })(todo[property][i]);
                    } else {
                        that[method](todo);
                    }
                };
            solveNext();
        }

        /**
         * call a function of framework or google map object of the instance
         **/
        this._call = function ( /* fncName [, ...] */ ) {
            var i, fname = arguments[0],
                args = [];
            if (!arguments.length || !map || (typeof (map[fname]) !== 'function')) {
                return;
            }
            for (i = 1; i < arguments.length; i++) {
                args.push(arguments[i]);
            }
            return map[fname].apply(map, args);
        }

        /**
         * init if not and manage map subcall (zoom, center)
         **/
        this._subcall = function (todo, latLng) {
            var opts = {};
            if (!todo.map) return;
            if (!latLng) {
                latLng = ival(todo.map, 'latlng');
            }
            if (!map) {
                if (latLng) {
                    opts = {
                        center: latLng
                    };
                }
                this.init($.extend({}, todo.map, opts), true);
            } else {
                if (todo.map.center && latLng) {
                    this._call("setCenter", latLng);
                }
                if (todo.map.zoom !== undefined) {
                    this._call("setZoom", todo.map.zoom);
                }
                if (todo.map.mapTypeId !== undefined) {
                    this._call("setMapTypeId", todo.map.mapTypeId);
                }
            }
        }

        /**
         * attach an event to a sender 
         **/
        this._attachEvent = function (sender, name, fnc, data, once) {
            google.maps.event['addListener' + (once ? 'Once' : '')](sender, name, function (event) {
                fnc.apply($this, [sender, event, data]);
            });
        }

        /**
         * attach events from a container to a sender 
         * todo[
         *  events => { eventName => function, }
         *  onces  => { eventName => function, }  
         *  data   => mixed data         
         * ]
         **/
        this._attachEvents = function (sender, todo) {
            var name;
            if (!todo) {
                return
            }
            if (todo.events) {
                for (name in todo.events) {
                    if (typeof (todo.events[name]) === 'function') {
                        this._attachEvent(sender, name, todo.events[name], todo.data, false);
                    }
                }
            }
            if (todo.onces) {
                for (name in todo.onces) {
                    if (typeof (todo.onces[name]) === 'function') {
                        this._attachEvent(sender, name, todo.onces[name], todo.data, true);
                    }
                }
            }
        }

        /**
         * execute callback functions 
         **/
        this._callback = function (result, todo) {
            if (typeof (todo.callback) === 'function') {
                todo.callback.apply($this, [result]);
            } else if (typeof (todo.callback) === 'object') {
                for (var i = 0; i < todo.callback.length; i++) {
                    if (typeof (todo.callback[i]) === 'function') {
                        todo.callback[k].apply($this, [result]);
                    }
                }
            }
        }

        /**
         * execute ending functions 
         **/
        this._manageEnd = function (result, todo, internal) {
            var i, apply;
            if (result && (typeof (result) === 'object')) {
                // colgar eventos
                this._attachEvents(result, todo);
                // ejecutar "apply"
                if (todo.apply && todo.apply.length) {
                    for (i = 0; i < todo.apply.length; i++) {
                        apply = todo.apply[i];
                        // necesita una función de "accion" en el objeto resultante
                        if (!apply.action || (typeof (result[apply.action]) !== 'function')) {
                            continue;
                        }
                        if (apply.args) {
                            result[apply.action].apply(result, apply.args);
                        } else {
                            result[apply.action]();
                        }
                    }
                }
            }
            if (!internal) {
                this._callback(result, todo);
                this._end();
            }
        }

        //-----------------------------------------------------------------------//
        // funciones de Argenmap
        //-----------------------------------------------------------------------//

        /**
         * destroy an existing instance
         **/
        this.destroy = function (todo) {
            var k;
            store.clear();
            $this.empty();
            for (k in styles) {
                delete styles[k];
            }
            styles = {};
            if (map) {
                delete map;
            }
            this._callback(null, todo);
            this._end();
        }

        /**
         * Initialize google.maps.Map object
         **/
        this.init = function (todo, internal) {
            var o, k, opts;
            if (map) { // mapa ya iniciado
                return this._end();
            }

            o = getObject('map', todo);
            if ((typeof (o.opciones.center) === 'boolean') && o.opciones.center) {
                return false; // esperar la resolución de direcciones
            }
            opts = $.extend({}, _default.init, o.opciones);
            if (!opts.center) {
                opts.center = [_default.init.center.lat, _default.init.center.lng];
            }
            opts.center = toLatLng(opts.center);
            //Kludge pa que no muestre el tipito de streetView
            opts.streetViewControl = false;
            //Kludge pa que muestre escala gráfica
            // Las escalas cartográficas en la web son BULLSHIT!
            opts.scaleControl = true;
            //Preparo el div para que chapee el IGN
            // El div q aloja el mapa está rodeado
            // por un header y un footer
            var mapCanvas = argenmap._prepararContenedor($this);

            //var mapCanvas = $($this.get(0)).find('.argenmapMapCanvas').get(0);

            // var mapCanvas= $this.children('.argenmapMapCanvas');
            // console.log($('#prueba .argenmapMapCanvas').children().length);
            map = new _default.classes.Map(mapCanvas, opts);

			$this.data('gmap', map);
            //Agrego la capa base del IGN a los tipos de mapas
			google.maps.event.addListener(map, "maptypeid_changed",function(){
				map.setZoom(map.getZoom()+1);
				map.setZoom(map.getZoom()-1)
			});
            argenmap.GmapAgregarCapaBase(map, new argenmap.CapaBaseIGN());

            argenmap.GmapAgregarCapaWms(map, new argenmap.CapaWMSIGN());

            // y los estilos previamente agregados
            for (k in styles) {
                map.mapTypes.set(k, styles[k]);
            }

            this._manageEnd(map, o, internal);
            return true;
        }

        /**
         * returns the geographical coordinates from an address
         **/
        this.getlatlng = function (todo) {
            this._resolveLatLng(todo, '_getLatLng', true);
        },

        this._getLatLng = function (todo, results) {
            this._manageEnd(results, todo);
        },


        /**
         * returns address from latlng        
         **/
        this.getaddress = function (todo, attempt) {
            var latLng = toLatLng(todo, false, true),
                address = ival(todo, 'direccion'),
                params = latLng ? {
                    latLng: latLng
                } : (address ? (typeof (address) === 'string' ? {
                    address: address
                } : address) : null),
                callback = ival(todo, 'callback'),
                that = this;
            if (!attempt) { // convertir el  undefined a int
                attempt = 0;
            }
            if (params && typeof (callback) === 'function') {
                getGeocoder().geocode(
                params,

                function (results, status) {
                    if ((status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT) && (attempt < _default.queryLimit.attempt)) {
                        setTimeout(function () {
                            that.getaddress(todo, attempt + 1);
                        },
                        _default.queryLimit.delay + Math.floor(Math.random() * _default.queryLimit.random));
                    } else {
                        var out = status === google.maps.GeocoderStatus.OK ? results : false;
                        callback.apply($this, [out, status]);
                        if (!out && _default.verbose) {
                            alert('Geocode error : ' + status);
                        }
                        that._end();
                    }
                });
            } else {
                this._end();
            }
        }

        /**
         * return a route
         **/
        this.getroute = function (todo) {
            var callback = ival(todo, 'callback'),
                that = this;
            if ((typeof (callback) === 'function') && todo.opciones) {
                todo.opciones.origin = toLatLng(todo.opciones.origin, true);
                todo.opciones.destination = toLatLng(todo.opciones.destination, true);
                getDirectionsService().route(
                todo.opciones,

                function (results, status) {
                    var out = status == google.maps.DirectionsStatus.OK ? results : false;
                    callback.apply($this, [out, status]);
                    that._end();
                });
            } else {
                this._end();
            }
        }

        /**
         * return the elevation of a location
         **/
        this.getelevation = function (todo) {
            var fnc, path, samples, i,
            locations = [],
                callback = ival(todo, 'callback'),
                latLng = ival(todo, 'latlng'),
                that = this;

            if (typeof (callback) === 'function') {
                fnc = function (results, status) {
                    var out = status === google.maps.ElevationStatus.OK ? results : false;
                    callback.apply($this, [out, status]);
                    that._end();
                };
                if (latLng) {
                    locations.push(toLatLng(latLng));
                } else {
                    locations = ival(todo, 'locations') || [];
                    if (locations) {
                        locations = array(locations);
                        for (i = 0; i < locations.length; i++) {
                            locations[i] = toLatLng(locations[i]);
                        }
                    }
                }
                if (locations.length) {
                    getElevationService().getElevationForLocations({
                        locations: locations
                    }, fnc);
                } else {
                    path = ival(todo, 'path');
                    samples = ival(todo, 'samples');
                    if (path && samples) {
                        for (i = 0; i < path.length; i++) {
                            locations.push(toLatLng(path[i]));
                        }
                        if (locations.length) {
                            getElevationService().getElevationAlongPath({
                                path: locations,
                                samples: samples
                            }, fnc);
                        }
                    }
                }
            } else {
                this._end();
            }
        }

        /**
         * return the distance between an origin and a destination
         *      
         **/
        this.getdistance = function (todo) {
            var i,
            callback = ival(todo, 'callback'),
                that = this;
            if ((typeof (callback) === 'function') && todo.opciones && todo.opciones.origins && todo.opciones.destinations) {
                // los orígenes y destinos son una array con una o más cadenas de texto
                // con direcciones y/o objetos google.maps.LatLng
                todo.opciones.origins = array(todo.opciones.origins);
                for (i = 0; i < todo.opciones.origins.length; i++) {
                    todo.opciones.origins[i] = toLatLng(todo.opciones.origins[i], true);
                }
                todo.opciones.destinations = array(todo.opciones.destinations);
                for (i = 0; i < todo.opciones.destinations.length; i++) {
                    todo.opciones.destinations[i] = toLatLng(todo.opciones.destinations[i], true);
                }
                getDistanceMatrixService().getDistanceMatrix(
                todo.opciones,

                function (results, status) {
                    var out = status == google.maps.DistanceMatrixStatus.OK ? results : false;
                    callback.apply($this, [out, status]);
                    that._end();
                });
            } else {
                this._end();
            }
        }

        /**
         * Add a marker to a map after address resolution
         * if [infowindow] add an infowindow attached to the marker   
         **/
        this.addmarker = function (todo) {
            this._resolveLatLng(todo, '_addMarker');
        }

        this._addMarker = function (todo, latLng, internal) {
            //agrego el marker predeterminado de argenmap


            var result, oi, to,
            o = getObject('marker', todo, 'to');

            // Le meto desprolijamente acá e ícono de marcador default de argenmap
            if (!o.opciones.icon) {
                o.opciones.icon = argenmap.BASEURL + 'img/marcadores/punto.png';
            }

            if (!internal) {
                if (!latLng) {
                    this._manageEnd(false, o);
                    return;
                }
                this._subcall(todo, latLng);
            } else if (!latLng) {
                return;
            }
            if (o.to) {
                to = store.refToObj(o.to);
                result = to && (typeof (to.add) === 'function');
                if (result) {
                    to.add(latLng, todo);
                    if (typeof (to.redraw) === 'function') {
                        to.redraw();
                    }
                }
                if (!internal) {
                    this._manageEnd(result, o);
                }
            } else {

                o.opciones.position = latLng;
                o.opciones.map = map;

                result = new _default.classes.Marker(o.opciones);

                if (hasKey(todo, 'infowindow')) {

                    oi = getObject('infowindow', todo['infowindow'], 'open');

                    // si  "open" no está definido, lo agrego en la primera posición
                    if ((oi.open === undefined) || oi.open) {
                        oi.apply = array(oi.apply);
                        oi.apply.unshift({
                            action: 'open',
                            args: [map, result]
                        });
                    }
                    oi.action = 'addinfowindow';

                    this._planNext(oi);
                }
                if (!internal) {
                    store.add('marker', result, o);
                    this._manageEnd(result, o);
                }
            }
            return result;
        }

        /**
         * add markers (without address resolution)
         **/
        this.addmarkers = function (todo) {
            if (ival(todo, 'clusters')) {
                this._resolveAllLatLng(todo, 'markers', '_addclusteredmarkers');
            } else {
                this._resolveAllLatLng(todo, 'markers', '_addmarkers');
            }
        }

        this._addmarkers = function (todo) {
            //agrego el marker predeterminado de argenmap

            var result, o, i, latLng, marker, opciones = {}, tmp, to,
            markers = ival(todo, 'markers');
            this._subcall(todo);
            if (typeof (markers) !== 'object') {
                return this._end();
            }
            o = getObject('marker', todo, ['to', 'markers']);

            // Le meto desprolijamente acá e ícono de marcador default de argenmap
            if (!o.opciones.icon) {
                o.opciones.icon = argenmap.BASEURL + 'img/marcadores/punto.png';
            }

            if (o.to) {
                to = store.refToObj(o.to);
                result = to && (typeof (to.add) === 'function');
                if (result) {
                    for (i = 0; i < markers.length; i++) {
                        if (latLng = toLatLng(markers[i])) {
                            to.add(latLng, markers[i]);
                        }
                    }
                    if (typeof (to.redraw) === 'function') {
                        to.redraw();
                    }
                }
                this._manageEnd(result, o);
            } else {
                $.extend(true, opciones, o.opciones);
                opciones.map = map;
                result = [];
                for (i = 0; i < markers.length; i++) {
                    if (latLng = toLatLng(markers[i])) {
                        if (markers[i].opciones) {
                            tmp = {};
                            $.extend(true, tmp, opciones, markers[i].opciones);
                            o.opciones = tmp;
                        } else {
                            o.opciones = opciones;
                        }
                        o.opciones.position = latLng;
                        marker = new _default.classes.Marker(o.opciones);
                        result.push(marker);
                        o.data = markers[i].data;
                        o.tag = markers[i].tag;
                        store.add('marker', marker, o);
                        this._manageEnd(marker, o, true);
                    }
                }
                o.opciones = opciones; // restaurar la anterior para uso futuro
                this._callback(result, todo);
                this._end();
            }
        }

        this._addclusteredmarkers = function (todo) {
            var clusterer, i, latLng, storeId,
            that = this,
                radius = ival(todo, 'radius'),
                maxZoom = ival(todo, 'maxZoom'),
                markers = ival(todo, 'markers'),
                styles = ival(todo, 'clusters');

            if (!map.getBounds()) { // mapa no iniciado -> los límites no están disponibles
                // esperar al mapa
                google.maps.event.addListenerOnce(
                map,
                    'bounds_changed',

                function () {
                    that._addclusteredmarkers(todo);
                });
                return;
            }

            if (typeof (radius) === 'number') {
                clusterer = new Clusterer();
                for (i = 0; i < markers.length; i++) {
                    latLng = toLatLng(markers[i]);
                    clusterer.add(latLng, markers[i]);
                }
                storeId = this._initClusters(todo, clusterer, radius, maxZoom, styles);
            }

            this._callback(storeId, todo);
            this._end();
        }


        this._initClusters = function (todo, clusterer, radius, maxZoom, styles) {
            var that = this;

            clusterer.setRedraw(function (force) {
                var same, clusters = clusterer.clusters(map, radius, maxZoom, force);
                if (clusters) {
                    same = clusterer.freeDiff(clusters);
                    that._displayClusters(todo, clusterer, clusters, same, styles);
                }
            });

            clusterer.events(
            google.maps.event.addListener(
            map,
                'zoom_changed',

            function () {
                clusterer.redraw(true);
            }),
            google.maps.event.addListener(
            map,
                'bounds_changed',

            function () {
                clusterer.redraw();
            }));

            clusterer.redraw();
            return store.add('cluster', clusterer, todo);
        }

        this._displayClusters = function (todo, clusterer, clusters, same, styles) {
            var k, i, ii, m, done, obj, shadow, cluster, opciones, tmp, w, h,
            atodo, offset,
            ctodo = hasKey(todo, 'cluster') ? getObject('', ival(todo, 'cluster')) : {},
            mtodo = hasKey(todo, 'marker') ? getObject('', ival(todo, 'marker')) : {};
            for (i = 0; i < clusters.length; i++) {
                if (i in same) {
                    continue;
                }
                cluster = clusters[i];
                done = false;
                if (cluster.idx.length > 1) {
                    // look for the cluster design to use
                    m = 0;
                    for (k in styles) {
                        if ((k > m) && (k <= cluster.idx.length)) {
                            m = k;
                        }
                    }
                    if (styles[m]) { // cluster defined for the current markers count
                        w = ival(styles[m], 'width');
                        h = ival(styles[m], 'height');
                        offset = ival(styles[m], 'offset') || [-w / 2, -h / 2];

                        // create a custom _addOverlay command
                        atodo = {};
                        $.extend(
                        true,
                        atodo,
                        ctodo, {
                            opciones: {
                                pane: 'overlayLayer',
                                content: styles[m].content.replace('CLUSTER_COUNT', cluster.idx.length),
                                offset: {
                                    x: offset[0],
                                    y: offset[1]
                                }
                            }
                        });
                        obj = this._addOverlay(atodo, toLatLng(cluster), true);
                        atodo.opciones.pane = 'floatShadow';
                        atodo.opciones.content = $('<div></div>');
                        atodo.opciones.content.width(w);
                        atodo.opciones.content.height(h);
                        shadow = this._addOverlay(atodo, toLatLng(cluster), true);

                        // store data to the clusterer
                        ctodo.data = {
                            latLng: toLatLng(cluster),
                            markers: []
                        };
                        for (ii = 0; ii < cluster.idx.length; ii++) {
                            ctodo.data.markers.push(
                            clusterer.get(cluster.idx[ii]).marker);
                        }
                        this._attachEvents(shadow, ctodo);
                        clusterer.store(cluster, obj, shadow);
                        done = true;
                    }
                }
                if (!done) { // cluster not defined (< min count) or = 1 so display all markers of the current cluster
                    // save the defaults options for the markers
                    opciones = {};
                    $.extend(true, opciones, mtodo.opciones);
                    for (ii = 0; ii < cluster.idx.length; ii++) {
                        m = clusterer.get(cluster.idx[ii]);
                        mtodo.latLng = m.latLng;
                        mtodo.data = m.marker.data;
                        mtodo.tag = m.marker.tag;
                        if (m.marker.opciones) {
                            tmp = {};
                            $.extend(true, tmp, opciones, m.marker.opciones);
                            mtodo.opciones = tmp;
                        } else {
                            mtodo.opciones = opciones;
                        }
                        obj = this._addMarker(mtodo, mtodo.latLng, true);
                        this._attachEvents(obj, mtodo);
                        clusterer.store(cluster, obj);
                    }
                    mtodo.opciones = opciones; // restore previous for futur use
                }
            }
        }

        /**
         * add an infowindow after address resolution
         **/
        this.addinfowindow = function (todo) {
            this._resolveLatLng(todo, '_addInfoWindow');
        }

        this._addInfoWindow = function (todo, latLng) {
            var o, infowindow, args = [];
            this._subcall(todo, latLng);
            o = getObject('infowindow', todo, ['open', 'anchor']);
            if (latLng) {
                o.opciones.position = latLng;
            }

            infowindow = new _default.classes.InfoWindow(o.opciones);
            if ((o.open === undefined) || o.open) {
                o.apply = array(o.apply);
                args.push(map);
                if (o.anchor) {
                    args.push(o.anchor);
                }
                o.apply.unshift({
                    action: 'open',
                    args: args
                });
            }
            store.add('infowindow', infowindow, o);
            this._manageEnd(infowindow, o);
        }


        /**
         * add a polygone / polylin on a map
         **/
        this.addpolyline = function (todo) {
            this._addPoly(todo, 'Polyline', 'path');
        }

        this.addpolygon = function (todo) {
            this._addPoly(todo, 'Polygon', 'paths');
        }

        this._addPoly = function (todo, poly, path) {
            var i,
            obj, latLng,
            o = getObject(poly.toLowerCase(), todo, path);
            if (o[path]) {
                o.opciones[path] = [];
                for (i = 0; i < o[path].length; i++) {
                    if (latLng = toLatLng(o[path][i])) {
                        o.opciones[path].push(latLng);
                    }
                }
            }
            obj = new google.maps[poly](o.opciones);
            obj.setMap(map);
            store.add(poly.toLowerCase(), obj, o);
            this._manageEnd(obj, o);
        }

        /**
         * add a circle   
         **/
        this.addcircle = function (todo) {
            this._resolveLatLng(todo, '_addCircle');
        }

        this._addCircle = function (todo, latLng) {
            var c, o = getObject('circle', todo);
            if (!latLng) {
                latLng = toLatLng(o.opciones.center);
            }
            if (!latLng) {
                return this._manageEnd(false, o);
            }
            this._subcall(todo, latLng);
            o.opciones.center = latLng;
            o.opciones.map = map;
            c = new _default.classes.Circle(o.opciones);
            store.add('circle', c, o);
            this._manageEnd(c, o);
        }

        /**
         * add a rectangle   
         **/
        this.addrectangle = function (todo) {
            this._resolveLatLng(todo, '_addRectangle');
        }

        this._addRectangle = function (todo, latLng) {
            var r, o = getObject('rectangle', todo);
            o.opciones.bounds = toLatLngBounds(o.opciones.bounds, true);
            if (!o.opciones.bounds) {
                return this._manageEnd(false, o);
            }
            this._subcall(todo, o.opciones.bounds.getCenter());
            o.opciones.map = map;
            r = new _default.classes.Rectangle(o.opciones);
            store.add('rectangle', r, o);
            this._manageEnd(r, o);
        }

        /**
         * add an overlay to a map after address resolution
         **/
        this.addoverlay = function (todo) {
            this._resolveLatLng(todo, '_addOverlay');
        }

        this._addOverlay = function (todo, latLng, internal) {
            var ov,
            o = getObject('overlay', todo),

                opts = $.extend({
                    pane: 'floatPane',
                    content: '',
                    offset: {
                        x: 0,
                        y: 0
                    }
                },
                o.opciones),
                $div = $('<div></div>'),
                listeners = [];

            $div.css('border', 'none')
                .css('borderWidth', '0px')
                .css('position', 'absolute');
            $div.append(opts.content);

            function f() {
                _default.classes.OverlayView.call(this);
                this.setMap(map);
            }

            f.prototype = new _default.classes.OverlayView();

            f.prototype.onAdd = function () {
                var panes = this.getPanes();
                if (opts.pane in panes) {
                    $(panes[opts.pane]).append($div);
                }
            }
            f.prototype.draw = function () {
                var overlayProjection = this.getProjection(),
                    ps = overlayProjection.fromLatLngToDivPixel(latLng),
                    that = this;

                $div.css('left', (ps.x + opts.offset.x) + 'px')
                    .css('top', (ps.y + opts.offset.y) + 'px');

                $.each(("dblclick click mouseover mousemove mouseout mouseup mousedown").split(" "), function (i, name) {
                    listeners.push(
                    google.maps.event.addDomListener($div[0], name, function (e) {
                        google.maps.event.trigger(that, name);
                    }));
                });
                listeners.push(
                google.maps.event.addDomListener($div[0], "contextmenu", function (e) {
                    google.maps.event.trigger(that, "rightclick");
                }));
            }
            f.prototype.onRemove = function () {
                for (var i = 0; i < listeners.length; i++) {
                    google.maps.event.removeListener(listeners[i]);
                }
                $div.remove();
            }
            f.prototype.hide = function () {
                $div.hide();
            }
            f.prototype.show = function () {
                $div.show();
            }
            f.prototype.toggle = function () {
                if ($div) {
                    if ($div.is(':visible')) {
                        this.show();
                    } else {
                        this.hide();
                    }
                }
            }
            f.prototype.toggleDOM = function () {
                if (this.getMap()) {
                    this.setMap(null);
                } else {
                    this.setMap(map);
                }
            }
            f.prototype.getDOMElement = function () {
                return $div[0];
            }
            ov = new f();
            if (!internal) {
                store.add('overlay', ov, o);
                this._manageEnd(ov, o);
            }
            return ov;
        }

        /**
         * add a fix panel to a map
         **/
        this.addfixpanel = function (todo) {
            var o = getObject('fixpanel', todo),
                x = y = 0,
                $c, $div;
            if (o.opciones.content) {
                $c = $(o.opciones.content);

                if (o.opciones.left !== undefined) {
                    x = o.opciones.left;
                } else if (o.opciones.right !== undefined) {
                    x = $this.width() - $c.width() - o.opciones.right;
                } else if (o.opciones.center) {
                    x = ($this.width() - $c.width()) / 2;
                }

                if (o.opciones.top !== undefined) {
                    y = o.opciones.top;
                } else if (o.opciones.bottom !== undefined) {
                    y = $this.height() - $c.height() - o.opciones.bottom;
                } else if (o.opciones.middle) {
                    y = ($this.height() - $c.height()) / 2
                }

                $div = $('<div></div>')
                    .css('position', 'absolute')
                    .css('top', y + 'px')
                    .css('left', x + 'px')
                    .css('z-index', '1000')
                    .append($c);

                $this.first().prepend($div);
                this._attachEvents(map, o);
                store.add('fixpanel', $div, o);
                this._callback($div, o);
            }
            this._end();
        }

        /**
         * add a direction renderer to a map
         **/
        this.adddirectionsrenderer = function (todo, internal) {
            var dr, o = getObject('directionrenderer', todo, 'panelId');
            o.opciones.map = map;
            dr = new google.maps.DirectionsRenderer(o.opciones);
            if (o.panelId) {
                dr.setPanel(document.getElementById(o.panelId));
            }
            store.add('directionrenderer', dr, o);
            this._manageEnd(dr, o, internal);
            return dr;
        }

        /**
         * set a direction panel to a dom element from its ID
         **/
        this.setdirectionspanel = function (todo) {
            var dr = store.get('directionrenderer'),
                o = getObject('directionpanel', todo, 'id');
            if (dr && o.id) {
                dr.setPanel(document.getElementById(o.id));
            }
            this._manageEnd(dr, o);
        }

        /**
         * set directions on a map (create Direction Renderer if needed)
         **/
        this.setdirections = function (todo) {
            var dr = store.get('directionrenderer'),
                o = getObject('directions', todo);
            if (todo) {
                o.opciones.directions = todo.directions ? todo.directions : (todo.opciones && todo.opciones.directions ? todo.opciones.directions : null);
            }
            if (o.opciones.directions) {
                if (!dr) {
                    dr = this.adddirectionsrenderer(o, true);
                } else {
                    dr.setDirections(o.opciones.directions);
                }
            }
            this._manageEnd(dr, o);
        }

        /**
         * set a streetview to a map
         **/
        this.setstreetview = function (todo) {
            var panorama,
            o = getObject('streetview', todo, 'id');
            if (o.opciones.position) {
                o.opciones.position = toLatLng(o.opciones.position);
            }
            panorama = new _default.classes.StreetViewPanorama(document.getElementById(o.id), o.opciones);
            if (panorama) {
                map.setStreetView(panorama);
            }
            this._manageEnd(panorama, o);
        }

        /**
         * add a kml layer to a map
         **/
        this.addkmllayer = function (todo) {
            var kml,
            o = getObject('kmllayer', todo, 'url');
            o.opciones.map = map;
            if (typeof (o.url) === 'string') {
                kml = new _default.classes.KmlLayer(o.url, o.opciones);
            }
            store.add('kmllayer', kml, o);
            this._manageEnd(kml, o);
        }

        /**
         * add a traffic layer to a map
         **/
        this.addtrafficlayer = function (todo) {
            var o = getObject('trafficlayer', todo),
                tl = store.get('trafficlayer');
            if (!tl) {
                tl = new _default.classes.TrafficLayer();
                tl.setMap(map);
                store.add('trafficlayer', tl, o);
            }
            this._manageEnd(tl, o);
        }

        /**
         * add a bicycling layer to a map
         **/
        this.addbicyclinglayer = function (todo) {
            var o = getObject('bicyclinglayer', todo),
                bl = store.get('bicyclinglayer');
            if (!bl) {
                bl = new _default.classes.BicyclingLayer();
                bl.setMap(map);
                store.add('bicyclinglayer', bl, o);
            }
            this._manageEnd(bl, o);
        }

        /**
         * add a ground overlay to a map
         **/
        this.addgroundoverlay = function (todo) {
            var ov,
            o = getObject('groundoverlay', todo, ['bounds', 'url']);
            o.bounds = toLatLngBounds(o.bounds);
            if (o.bounds && (typeof (o.url) === 'string')) {
                ov = new _default.classes.GroundOverlay(o.url, o.bounds);
                ov.setMap(map);
                store.add('groundoverlay', ov, o);
            }
            this._manageEnd(ov, o);
        }

        /**
         * geolocalise the user and return a LatLng
         **/
        this.geolatlng = function (todo) {
            var callback = ival(todo, 'callback');
            if (typeof (callback) === 'function') {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(

                    function (position) {
                        var out = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                        callback.apply($this, [out]);
                    },

                    function () {
                        var out = false;
                        callback.apply($this, [out]);
                    });
                } else if (google.gears) {
                    google.gears.factory.create('beta.geolocation').getCurrentPosition(

                    function (position) {
                        var out = new google.maps.LatLng(position.latitude, position.longitude);
                        callback.apply($this, [out]);
                    },

                    function () {
                        out = false;
                        callback.apply($this, [out]);
                    });
                } else {
                    callback.apply($this, [false]);
                }
            }
            this._end();
        }

        /**
         * add a style to a map
         **/
        this.addstyledmap = function (todo, internal) {
            var o = getObject('styledmap', todo, ['id', 'style']);
            if (o.style && o.id && !styles[o.id]) {
                styles[o.id] = new _default.classes.StyledMapType(o.style, o.opciones);
                if (map) {
                    map.mapTypes.set(o.id, styles[o.id]);
                }
            }
            this._manageEnd(styles[o.id], o, internal);
        }

        /**
         * set a style to a map (add it if needed)
         **/
        this.setstyledmap = function (todo) {
            var o = getObject('styledmap', todo, ['id', 'style']);
            if (o.id) {
                this.addstyledmap(o, true);
                if (styles[o.id]) {
                    map.setMapTypeId(o.id);
                    this._callback(styles[o.id], todo);
                }
            }
            this._manageEnd(styles[o.id], o);
        }

        /**
         * remove objects from a map
         **/
        this.clear = function (todo) {
            var list = array(ival(todo, 'list') || ival(todo, 'name')),
                last = ival(todo, 'last', false),
                first = ival(todo, 'first', false),
                tag = ival(todo, 'tag');
            if (tag !== undefined) {
                tag = array(tag);
            }
            store.clear(list, last, first, tag);
            this._end();
        }

        /**
         * return objects previously created
         **/
        this.get = function (todo) {

            var name = ival(todo, 'name') || 'map',
                first = ival(todo, 'first'),
                all = ival(todo, 'all'),
                tag = ival(todo, 'tag');
            name = name.toLowerCase();
            if (name === 'map') {
                return map;
            }
            if (tag !== undefined) {
                tag = array(tag);
            }
            if (first) {
                return store.get(name, false, tag);
            } else if (all) {
                return store.all(name, tag);
            } else {
                return store.get(name, true, tag);
            }
        }

        /**
         * return the max zoom of a location
         **/
        this.getmaxzoom = function (todo) {
            this._resolveLatLng(todo, '_getMaxZoom');
        }

        this._getMaxZoom = function (todo, latLng) {
            var callback = ival(todo, 'callback'),
                that = this;
            if (callback && typeof (callback) === 'function') {
                getMaxZoomService().getMaxZoomAtLatLng(
                latLng,

                function (result) {
                    var zoom = result.status === google.maps.MaxZoomStatus.OK ? result.zoom : false;
                    callback.apply($this, [zoom, result.status]);
                    that._end();
                });
            } else {
                this._end();
            }
        }

        /**
         * modify default values
         **/
        this.setdefault = function (todo) {
            setDefault(todo);
            this._end();
        }

        /**
         * autofit a map using its overlays (markers, rectangles ...)
         **/
        this.autofit = function (todo, internal) {
            var names, list, obj, i, j,
            empty = true,
                bounds = new google.maps.LatLngBounds(),
                maxZoom = ival(todo, 'maxZoom', null);

            names = store.names();
            for (i = 0; i < names.length; i++) {
                list = store.all(names[i]);
                for (j = 0; j < list.length; j++) {
                    obj = list[j];
                    if (obj.getPosition) {
                        bounds.extend(obj.getPosition());
                        empty = false;
                    } else if (obj.getBounds) {
                        bounds.extend(obj.getBounds().getNorthEast());
                        bounds.extend(obj.getBounds().getSouthWest());
                        empty = false;
                    } else if (obj.getPaths) {
                        obj.getPaths().forEach(function (path) {
                            path.forEach(function (latLng) {
                                bounds.extend(latLng);
                                empty = false;
                            });
                        });
                    } else if (obj.getPath) {
                        obj.getPath().forEach(function (latLng) {
                            bounds.extend(latLng);
                            empty = false;
                        });
                    } else if (obj.getCenter) {
                        bounds.extend(obj.getCenter());
                        empty = false;
                    }
                }
            }

            if (!empty && (!map.getBounds() || !map.getBounds().equals(bounds))) {
                if (maxZoom !== null) {
                    // fitBouds Callback event => detect zoom level and check maxZoom
                    google.maps.event.addListenerOnce(
                    map,
                        'bounds_changed',

                    function () {
                        if (this.getZoom() > maxZoom) {
                            this.setZoom(maxZoom);
                        }
                    });
                }
                map.fitBounds(bounds);
            }
            if (!internal) {
                this._manageEnd(empty ? false : bounds, todo, internal);
            }
        }

    };

    //-----------------------------------------------------------------------//
    // jQuery plugin
    //-----------------------------------------------------------------------//

    $.fn.argenmap = function () {
        var i, args, list = [],
            empty = true,
            results = [];


        if ($.isEmptyObject(_default)) {
            _default = {
                verbose: true,
                queryLimit: {
                    attempt: 5,
                    delay: 250,
                    random: 250
                },
                unit: 'km',
                init: {
                    mapTypeId: 'Mapa IGN',
                    center: [-34, -59],
                    zoom: 5
                },
                classes: {
                    Map: google.maps.Map,
                    Marker: google.maps.Marker,
                    InfoWindow: google.maps.InfoWindow,
                    Circle: google.maps.Circle,
                    Rectangle: google.maps.Rectangle,
                    OverlayView: google.maps.OverlayView,
                    StreetViewPanorama: google.maps.StreetViewPanorama,
                    KmlLayer: google.maps.KmlLayer,
                    TrafficLayer: google.maps.TrafficLayer,
                    BicyclingLayer: google.maps.BicyclingLayer,
                    GroundOverlay: google.maps.GroundOverlay,
                    StyledMapType: google.maps.StyledMapType
                }
            };
        }

        // store all arguments in a todo list 
        for (i = 0; i < arguments.length; i++) {
            args = arguments[i] || {};
            // resolve string todo - action without parameters can be simplified as string 
            if (typeof (args) === 'string') {
                args = {
                    accion: args
                };
            }
            list.push(args);
        }
        // resolve empty call - run init
        if (!list.length) {
            list.push({});
        }
        // loop on each jQuery object
        $.each(this, function () {
            var $this = $(this),
                _argenmap = $this.data('argenmap');
            empty = false;
            if (!_argenmap) {
                _argenmap = new Argenmap($this);
                $this.data('argenmap', _argenmap);
            }
            // direct call : bypass jQuery method (not stackable, return mixed)
            if ((list.length == 1) && (isDirect(list[0]))) {
                results.push(_argenmap._direct(list[0]));
            } else {
                _argenmap._plan(list);
            }
        });
        // return for direct call (only) 
        if (results.length) {
            if (results.length === 1) { // 1 css selector
                return results[0];
            } else {
                return results;
            }
        }
        // manage setDefault call
        if (empty && (arguments.length == 2) && (typeof (arguments[0]) === 'string') && (arguments[0].toLowerCase() === 'setdefault')) {
            setDefault(arguments[1]);
        }
        return this;
    }

	$.fn.agregarCapaBaseWMS = function(opciones)
	{
		//chainability
		return this.each(function(){
			var $this = $(this);
			var a = $this.data('argenmap');
			if(!a) return;

			var map = $this.data('gmap');

            argenmap.GmapAgregarCapaBase(map, new argenmap.CapaBaseWMS({
                name: opciones.nombre,
                baseURL: opciones.url,
                layers: opciones.capas
            }));
		});
	}

	$.fn.agregarCapaWMS = function(opciones)
	{
		//chainability
		return this.each(function(){
			var $this = $(this);
			var a = $this.data('argenmap');
			if(!a) return;

			var map = $this.data('gmap');

            argenmap.GmapAgregarCapaWms(map, new argenmap.CapaWMS({
                name: opciones.nombre,
                baseURL: opciones.url,
                layers: opciones.capas
            }));
		});
	}
	
	$.fn.agregarCapaKML = function(opciones)
	{
		//chainability
		return this.each(function(){
			var $this = $(this);
			var a = $this.data('argenmap');
			if(!a) return;
			$this.argenmap({
				accion:'agregarCapaKml',
				opciones: {preserveViewport :true},
				url: opciones.url
			});

		});
	}
	
	$.fn.centro = function(lat,lng)
	{
		//getter
		//el getter/lector solo devuelve la primer coincidencia de selector
		if(arguments.length === 0)
		{
			if( !this.data('argenmap') ) return [];
			
			var ctro = this.data('gmap').getCenter();
			return ctro ? [ctro.lat(),ctro.lng()] : [];
		}
		//setter
		return this.each(function(){
			var $this = $(this);
			var a = $this.data('argenmap');
			if(!a) return;
			
			$this.data('gmap').setCenter(new google.maps.LatLng(lat,lng));
		});
	}
	
	$.fn.zoom = function(zoom)
	{
		if(undefined == zoom)
		{
			if( !this.data('argenmap') ) return null;
			var z = this.data('gmap').getZoom();
			return z ? z : null;
		}
		return this.each(function(){
			var $this = $(this);
			var a = $this.data('argenmap');
			if(!a || !$.isNumeric(zoom)) return;
			
			$this.data('gmap').setZoom(zoom);
		});
	}

	$.fn.capaBase = function(nombre)
	{
		if(undefined == nombre)
		{
			if( !this.data('argenmap') ) {
				return null;
			}
			var z = this.data('gmap').mapTypeId;
			return z ? z : null;
		}
		return this.each(function(){
			var $this = $(this);
			var a = $this.data('argenmap');
			if(!a ) {
				return;
			}
			
			$this.data('gmap').setMapTypeId(nombre);
		});
	}
	
	/**
	 * Agrega un marcador al mapa instanciado en el selector
	 * agregarMarcador(float,float)
	 * agregarMarcador(objeto): {lonlat:OpenLayers.LonLat} ó {lon:float,lat:float}
	 * agregarMarcador(string): "-35,-57"
	 * Opciones:
	 *   capa: string, nombre de la capa donde colocar el marcador
	 *   contenido: string/HTML, contenido descriptivo del marcador
	 *   nombre: string
	 *   eventos: TO DO
	 *   cuadro: objeto con opciones de cuadro (ver agregarCuadro)
	 */
	$.fn.agregarMarcador = function(opciones,lon)
	{
		var _arguments = arguments;
		//si llega con un par de numeros como args...
		/*
		if(undefined != lon && $.isNumeric(opciones) && $.isNumeric(lon))
		{
			opciones = [opciones,lon];
		}else if(typeof(opciones) == "string") {
			//si llega con un string estilo "-34.218,-56.813"...
			var arsplit = opciones.split(",");
			arsplit[0] = parseFloat(arsplit[0]);
			arsplit[1] = parseFloat(arsplit[1]);
			if(isNaN(arsplit[0]) || isNaN(arsplit[1]))
			{
				opciones = null;
			}else{
				opciones = arsplit;
			}
		}
		*/
		return this.each(function(){
			var o = $.extend({}, opciones);
			var $this = $(this);
			var a = $this.data('argenmap');
			if(!a) return;
			if ( _arguments.length == 0 ) {
				o.lat = $this.data('gmap').getCenter().lat();
				o.lng = $this.data('gmap').getCenter().lng();
			}

			$this.argenmap({
					accion: 'agregarMarcador',
					latLng: [o.lat,o.lng],
					data:o.contenido,
					events: {
						click: function(marker, event, data) {
							if (o.contenido == undefined) {
								return;
							}
							var map = $this.data('gmap'),
							infowindow = $this.argenmap({accion:'get', name:'infowindow'});
			 
							if (infowindow) {
								infowindow.open(map, marker);
								infowindow.setContent(data);
							} else {
								$(this).argenmap({
									accion:'addinfowindow',
									anchor:marker, 
									opciones:{content: data}});
							}
						}
					}

			});
		});
	}

	$.fn.agregarMarcadores = function(marcadores)
	{
		return this.each(function(){
			var $this = $(this);
			var a = $this.data('argenmap');
			if (!a) {
				return ;
			}
			$.each( marcadores, function(i, v) {
				$this.agregarMarcador( v ) ;
			});
		});	
	}

	$.fn.limpiarMapa = function(marcadores)
	{
	
		return this.each(function(){
			var $this = $(this);
			var a = $this.data('argenmap');
			if (!a) {
				return ;
			}
			$this.argenmap({accion:'limpiar'});

		});
		
	}
	
    var argenmap = argenmap || {};

    argenmap.BASEURL = 'http://www.ign.gob.ar/argenmap/argenmap.jquery/';

 
    
    

   /**
     * @class Representa una capa WMS opaca que puede ser utilizada como capa base de los mapas
     * @constructor
     * @param {Object} opts opciones para construir la capa
     * @export
     */
    argenmap.CapaBaseWMS = function (opts) {

        /**
         * El objeto ImageMapType q representa a esta capa en para la api de gmaps.
         * @public 
         * @type google.maps.ImageMapType
         */
        this.imageMapType = null;
        /**
         * Referencia al objeto map de google sobre el cual está capa está desplegada.
         * Se setea con argenmap.agregarCapaBaseWMS().
         * @public 
         * @type google.maps.Map
         */
        this.gmap = null;
        /**
         * Un identificador de texto para esta capa. Este identificador
         * es el que se mostrará en los selectores de capas del mapa.
         * @public
         * @default "Capa base WMS"
         * @type google.maps.Map
         */
        this.name = "Capa base WMS";

        this.tipo = 'wms-1.3';

        jQuery.extend(this, opts);
        //Creating the WMS layer options.  This code creates the Google imagemaptype options for each wms layer.  In the options the function that calls the individual 
        //wms layer is set 


        var wmsOptions = {
            alt: this.name,
            getTileUrl: jQuery.proxy(this.getTileUrl, this),
            isPng: true,
            maxZoom: 17,
            minZoom: 3,
            name: this.name,
            tileSize: new google.maps.Size(256, 256)

        };


        //Creating the object to create the ImageMapType that will call the WMS Layer Options.

        this.imageMapType = new google.maps.ImageMapType(wmsOptions);
    }


   /**
     * Devuelve la url para conseguir una tile de google maps equivalente
     * en el servidor WMS
     * @param {google.maps.MapTile} tile La tile de GMap que se necesita emular en el servidor WMS
     * @param {Number} zoom El nivel de zoom actual. Utilizado para los cálculos de resoluciones
     */
    argenmap.CapaBaseWMS.prototype.getTileUrl = function (tile, zoom) {
        var projection = this.gmap.getProjection();
        var zpow = Math.pow(2, zoom);
        var ul = new google.maps.Point(tile.x * 256.0 / zpow, (tile.y + 1) * 256.0 / zpow);
        var lr = new google.maps.Point((tile.x + 1) * 256.0 / zpow, (tile.y) * 256.0 / zpow);

        var ulw = projection.fromPointToLatLng(ul);

        var lrw = projection.fromPointToLatLng(lr);
        //The user will enter the address to the public WMS layer here.  The data must be in WGS84
        var baseURL = this.baseURL;
        var version = "1.3.0";
        var request = "GetMap";
        var format = "image%2Fpng"; //type of image returned  or image/jpeg
        //The layer ID.  Can be found when using the layers properties tool in ArcMap or from the WMS settings 
        var layers = this.layers;
        //projection to display. This is the projection of google map. Don't change unless you know what you are doing.  
        //Different from other WMS servers that the projection information is called by crs, instead of srs


        //usando mercator para pedir 3857
        ulw = argenmap.latLngAMercator(ulw.lat(), ulw.lng());
        lrw = argenmap.latLngAMercator(lrw.lat(), lrw.lng());

        var crs = "EPSG:3857";
        var bbox = ulw.lng + "," + ulw.lat + "," + lrw.lng + "," + lrw.lat;

        var service = "WMS";
        //the size of the tile, must be 256x256
        var width = "256";
        var height = "256";
        //Some WMS come with named styles.  The user can set to default.
        var styles = "";
        //Establish the baseURL.  Several elements, including &EXCEPTIONS=INIMAGE and &Service are unique to openLayers addresses.

        var url = baseURL + "Layers=" + layers + "&version=" + version + "&EXCEPTIONS=INIMAGE" + "&Service=" + service + "&request=" + request + "&Styles=" + styles + "&format=" + format + "&SRS=" + crs + "&CRS=" + crs + "&BBOX=" + bbox + "&width=" + width + "&height=" + height;
        return url;
    };


    argenmap.CapaBaseIGN = function(opts)
    {
    	var opts = {
            name: 'Mapa IGN',
            baseURL: 'http://www.ign.gob.ar/wms/?',
            //baseURL: 'http://wms.ign.gob.ar/geoserver/wms?',
            layers: 'capabasesigign'
    	};
    	argenmap.CapaBaseWMS.apply(this, [opts]);
    }
    argenmap.CapaBaseIGN.prototype.getTileUrl = function() {
    		return argenmap.CapaBaseWMS.prototype.getTileUrl.apply(this, arguments);
    }


    
   argenmap.CapaWMS = function (opts) {
        // El objeto ImageMapType q representa a esta capa en para la api de gmaps.
        this.imageMapType = null;
        // Referencia al objeto map de google. Se setea con argenmap.agregarCapaWMS
        this.gmap = null;

        this.tipo = 'wms-1.3';

		this.name = 'CAPA WMS';
		this.alt = 'CAPA WMS';
        jQuery.extend(this, opts);
        //Creating the WMS layer options.  This code creates the Google imagemaptype options for each wms layer.  In the options the function that calls the individual 
        //wms layer is set 


        var wmsOptions = {
            alt: this.alt,
            getTileUrl: jQuery.proxy(this.getTileUrl, this),
            isPng: false,
            maxZoom: 17,
            minZoom: 6,
            name: this.name,
            tileSize: new google.maps.Size(256, 256)
        };

        //Creating the object to create the ImageMapType that will call the WMS Layer Options.

        this.imageMapType = new google.maps.ImageMapType(wmsOptions);

    };
    
	argenmap.CapaWMS.prototype.getTileUrl = function (tile, zoom) {
  


        var projection = this.gmap.getProjection();
        var zpow = Math.pow(2, zoom);

        var ul = new google.maps.Point(tile.x * 256.0 / zpow, (tile.y + 1) * 256.0 / zpow);
        var lr = new google.maps.Point((tile.x + 1) * 256.0 / zpow, (tile.y) * 256.0 / zpow);
        var ulw = projection.fromPointToLatLng(ul);
        var lrw = projection.fromPointToLatLng(lr);
        //The user will enter the address to the public WMS layer here.  The data must be in WGS84
        var baseURL = this.baseURL;
        var version = "1.3.0";
        var request = "GetMap";
        var format = "image/png"; //type of image returned 
        var layers = this.layers;

        //usando mercator para pedir 900913
        ulw = argenmap.latLngAMercator(ulw.lat(), ulw.lng());
        lrw = argenmap.latLngAMercator(lrw.lat(), lrw.lng());

        var crs = "EPSG:3857";
        var bbox = ulw.lng + "," + ulw.lat + "," + lrw.lng + "," + lrw.lat;

        var width = "256";
        var height = "256";

        var styles = "";

        var url = baseURL + "version=" + version + "&request=" + request + "&Layers=" + layers + "&Styles=" + styles + "&SRS=" + crs + "&BBOX=" + bbox + "&width=" + width + "&height=" + height + "&format=" + format + "&TRANSPARENT=TRUE";
        return url;
    };

	argenmap.CapaWMSIGN = function()
	{
		var opts = {
	        name: 'IGN',
	        baseURL: 'http://www.ign.gob.ar/wms/?',
	        //baseURL: 'http://wms.ign.gob.ar/geoserver/wms?',
	        layers: 'capabasesigign'
		};
		argenmap.CapaWMS.apply(this, [opts]);
	}
	argenmap.CapaWMSIGN.prototype.getTileUrl = function(a, b) 
	{
		      // Solo cargo tiles para este overlay
		        // si estoy en la capa satelite
			    if (this.gmap.getMapTypeId() != 'satellite') {
		            return false;
		        }
			    return argenmap.CapaWMS.prototype.getTileUrl.apply(this, arguments);
		
    }


    argenmap.GmapAgregarCapaBase = function (gmap, capa) {
        var mapTypeIds;

        capa.gmap = gmap;

        // Agrego la capa base como un nuevo "tipo de mapa" a al gmap;
        gmap.mapTypes.set(capa.imageMapType.name, capa.imageMapType);

	

        if (gmap.mapTypeControlOptions) {
        	mapTypeIds = gmap.mapTypeControlOptions.mapTypeIds;
            if (mapTypeIds) {
                mapTypeIds.splice(0, 0, capa.imageMapType.name);
            } else {
                mapTypeIds = [capa.imageMapType.name, 'satellite'];
            }
        } else {
            mapTypeIds = [capa.imageMapType.name, 'satellite'];
        }


        gmap.setOptions({
            mapTypeControlOptions: {
                mapTypeIds: mapTypeIds,
                style: google.maps.MapTypeControlStyle.DROPDOWN_MENU 
            }
        });

    };

    /**
     * Superpone una capa WMS sobre las capas base y las demás capas ya superpuestas
     *
     * @param {Object} capa La capa WMS a superponer sobre al mapa.
     */
    argenmap.GmapAgregarCapaWms = function (gmap, capa) {

        capa.gmap = gmap;
        //gmap.overlayMapTypes.insertAt(0, capa.imageMapType);
        gmap.overlayMapTypes.push(capa.imageMapType);

    };

    /**
     * Prepara un div contenedor del mapa. Configura el encabezado
     * y el footer del mapa en donde se muestran el logo y la leyenda
     * de autor	ía de los datos.
     * @param {string} divId el id del div contenedor.
     * @private 
     */
    argenmap._prepararContenedor = function (div) {
        var LOGOURL = argenmap.BASEURL + 'img/logoignsintexto-25px.png';
        var mapCanvas_ = $('<div class="argenmapMapCanvas" />').css({
            'width': '100%',
                'min-height': '200px'
        });

        var mapFooter_ = $('<div class="argenmapMapFooter" />').css({
            'font-family': 'Arial',
                'color': '#444',
                'background-color': '#003964',
                'font-size': '10px',
                'text-align': 'right',
                'height': '30px',
				'line-height': '30px',
				'vertical-align':'middle',
                'color': 'white',
                'padding': '2px 5px'

        });
        var mapLogo_ = $('<img />');
        var mapLogoAnchor_ = $('<a style="float:left" target="_blank" href="http://www.ign.gob.ar/argenmap/argenmap.jquery/docs"></a>').append(
        mapLogo_);
        var contenedor_ = div;

        mapLogo_.attr('src', LOGOURL).css({
            'border': '0'
        });
        contenedor_.append(mapCanvas_);
        contenedor_.append(mapFooter_);
        mapFooter_.append(mapLogoAnchor_);
        mapFooter_.append('<a style="color:white;text-decoration:underline;font-weight:normal" target="_blank" href="http://www.ign.gob.ar/argenmap/argenmap.jquery/docs/datosvectoriales.html">Top&oacute;nimos, datos topogr&aacute;ficos - 2013 IGN Argentina // Calles - OpenStreetMap</a>');

        argenmap._maximizarCanvas(contenedor_, mapFooter_, mapCanvas_);
        return mapCanvas_.get(0);
    };

    /*
     * Cambia el tamaño del canvas del mapa de acuerdo al alto del contenedor
     * y setea el listener para cuando resizeo el div
     */
    argenmap._maximizarCanvas = function (contenedor_, mapFooter_, mapCanvas_) {
        var dif = contenedor_.innerHeight() -  mapFooter_.outerHeight();
        mapCanvas_.height(dif);

        //me encargo del cambio de tamaño del mapa
        contenedor_.bind('resized', function (e) {
            var dif = contenedor_.innerHeight() - mapFooter_.outerHeight();
            mapCanvas_.height(dif);
            google.maps.event.trigger(contenedor_.argenmap('get'), "resize");
        });

    }

    /**
     * Info de la proyección:
     *  - http://spatialreference.org/ref/user/google-projection/
     *  Cacho de código canibalizado de
     *  http://www.koders.com/javascript/fid6E870FE86135B30197CF121CF8ED16F4416B2588.aspx?s=wms
     *
     * Proj4 Text:
     *     +proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0
     *     +k=1.0 +units=m +nadgrids=@null +no_defs
     *
     * WKT:
     *     900913=PROJCS["WGS84 / Simple Mercator", GEOGCS["WGS 84",
     *     DATUM["WGS_1984", SPHEROID["WGS_1984", 6378137.0, 298.257223563]], 
     *     PRIMEM["Greenwich", 0.0], UNIT["degree", 0.017453292519943295], 
     *     AXIS["Longitude", EAST], AXIS["Latitude", NORTH]],
     *     PROJECTION["Mercator_1SP_Google"], 
     *     PARAMETER["latitude_of_origin", 0.0], PARAMETER["central_meridian", 0.0], 
     *     PARAMETER["scale_factor", 1.0], PARAMETER["false_easting", 0.0], 
     *     PARAMETER["false_northing", 0.0], UNIT["m", 1.0], AXIS["x", EAST],
     *     AXIS["y", NORTH], AUTHORITY["EPSG","900913"]]
     */
    argenmap.latLngAMercator = function (lat, lon) {
        var x = lon * 20037508.34 / 180;
        var y = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180);

        y = y * 20037508.34 / 180;

        return {
            lat: y,
            lng: x
        };
    }

    //-----------------------------------------------------------------------//
    // jQuery event
    //-----------------------------------------------------------------------//
    //resized event: se escucha desde un DOMElement y se dispara
    //cada vez que ese elemento cambia de tamanio (ancho o alto)
    $.event.special.resized = {
        setup: function () {
            var self = this,
                $this = $(this);
            var $w = $this.width();
            var $h = $this.height();
            interval = setInterval(function () {
                if ($w != $this.width() || $h != $this.height()) {
                    $w = $this.width();
                    $h = $this.height();
                    jQuery.event.handle.call(self, {
                        type: 'resized'
                    });
                }
            }, 100);
        },
        teardown: function () {
            clearInterval(interval);
        }
    };

})(jQuery);
