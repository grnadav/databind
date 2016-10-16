/**
 * DEVELOPED BY
 * NADAV GREENBERG (grnadav)
 * grnadav@gmail.com
 *
 * WORKS WITH:
 * IE 9+, FF 4+, SF 5+, WebKit, CH 7+, OP 12+
 *
 * Version: 0.4.1
 *
 * FORK:
 * https://github.com/grnadav/databind.git
 */

"use strict";
(function (factory) {

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else {
        // Browser globals
        window.DataBind = factory();
    }

})(function () {

    // internalize watch.js 1.3.0 to remove external dependency
    /**
     * DEVELOPED BY
     * GIL LOPES BUENO
     * gilbueno.mail@gmail.com
     *
     * WORKS WITH:
     * IE 9+, FF 4+, SF 5+, WebKit, CH 7+, OP 12+, BESEN, Rhino 1.7+
     *
     * FORK:
     * https://github.com/melanke/Watch.JS
     */
    var WatchJS = (function () {

        var WatchJS = {
                noMore: false
            },
            lengthsubjects = [];

        var isFunction = function (functionToCheck) {
            var getType = {};
            return functionToCheck && getType.toString.call(functionToCheck) == '[object Function]';
        };

        var isInt = function (x) {
            return x % 1 === 0;
        };

        var isArray = function(obj) {
            return Object.prototype.toString.call(obj) === '[object Array]';
        };

        var getObjDiff = function(a, b){
            var aplus = [],
                bplus = [];

            if(!(typeof a == "string") && !(typeof b == "string") && !isArray(a) && !isArray(b)){

                for(var i in a){
                    if(!b[i]){
                        aplus.push(i);
                    }
                }

                for(var j in b){
                    if(!a[j]){
                        bplus.push(j);
                    }
                }
            }

            return {
                added: aplus,
                removed: bplus
            }
        };

        var clone = function(obj){

            if (null == obj || "object" != typeof obj) {
                return obj;
            }

            var copy = obj.constructor();

            for (var attr in obj) {
                copy[attr] = obj[attr];
            }

            return copy;

        }

        var defineGetAndSet = function (obj, propName, getter, setter) {
            try {
                Object.defineProperty(obj, propName, {
                    get: getter,
                    set: setter,
                    enumerable: true,
                    configurable: true
                });
            } catch(error) {
                try{
                    Object.prototype.__defineGetter__.call(obj, propName, getter);
                    Object.prototype.__defineSetter__.call(obj, propName, setter);
                }catch(error2){
                    throw "watchJS error: browser not supported :/"
                }
            }
        };

        var defineProp = function (obj, propName, value) {
            try {
                Object.defineProperty(obj, propName, {
                    enumerable: false,
                    configurable: true,
                    writable: false,
                    value: value
                });
            } catch(error) {
                obj[propName] = value;
            }
        };

        var watch = function () {

            if (isFunction(arguments[1])) {
                watchAll.apply(this, arguments);
            } else if (isArray(arguments[1])) {
                watchMany.apply(this, arguments);
            } else {
                watchOne.apply(this, arguments);
            }

        };


        var watchAll = function (obj, watcher, level, addNRemove) {

            if ((typeof obj == "string") || (!(obj instanceof Object) && !isArray(obj))) { //accepts only objects and array (not string)
                return;
            }

            var props = [];


            if(isArray(obj)) {
                for (var prop = 0; prop < obj.length; prop++) { //for each item if obj is an array
                    props.push(prop); //put in the props
                }
            } else {
                for (var prop2 in obj) { //for each attribute if obj is an object
                    props.push(prop2); //put in the props
                }
            }

            watchMany(obj, props, watcher, level, addNRemove); //watch all itens of the props
        };


        var watchMany = function (obj, props, watcher, level, addNRemove) {

            if ((typeof obj == "string") || (!(obj instanceof Object) && !isArray(obj))) { //accepts only objects and array (not string)
                return;
            }

            for (var prop in props) { //watch each attribute of "props" if is an object
                watchOne(obj, props[prop], watcher, level, addNRemove);
            }

        };

        var watchOne = function (obj, prop, watcher, level, addNRemove) {

            if ((typeof obj == "string") || (!(obj instanceof Object) && !isArray(obj))) { //accepts only objects and array (not string)
                return;
            }

            if(isFunction(obj[prop])) { //dont watch if it is a function
                return;
            }

            if(obj[prop] != null && (level === undefined || level > 0)){
                if(level !== undefined){
                    level--;
                }
                watchAll(obj[prop], watcher, level); //recursively watch all attributes of this
            }

            defineWatcher(obj, prop, watcher);

            if(addNRemove){
                pushToLengthSubjects(obj, prop, watcher, level);
            }

        };

        var unwatch = function () {

            if (isFunction(arguments[1])) {
                unwatchAll.apply(this, arguments);
            } else if (isArray(arguments[1])) {
                unwatchMany.apply(this, arguments);
            } else {
                unwatchOne.apply(this, arguments);
            }

        };

        var unwatchAll = function (obj, watcher) {

            if (obj instanceof String || (!(obj instanceof Object) && !isArray(obj))) { //accepts only objects and array (not string)
                return;
            }

            var props = [];


            if (isArray(obj)) {
                for (var prop = 0; prop < obj.length; prop++) { //for each item if obj is an array
                    props.push(prop); //put in the props
                }
            } else {
                for (var prop2 in obj) { //for each attribute if obj is an object
                    props.push(prop2); //put in the props
                }
            }

            unwatchMany(obj, props, watcher); //watch all itens of the props
        };


        var unwatchMany = function (obj, props, watcher) {

            for (var prop2 in props) { //watch each attribute of "props" if is an object
                unwatchOne(obj, props[prop2], watcher);
            }
        };

        var defineWatcher = function (obj, prop, watcher) {

            var val = obj[prop];

            watchFunctions(obj, prop);

            if (!obj.watchers) {
                defineProp(obj, "watchers", {});
            }

            if (!obj.watchers[prop]) {
                obj.watchers[prop] = [];
            }

            for(var i in obj.watchers[prop]){
                if(obj.watchers[prop][i] === watcher){
                    return;
                }
            }


            obj.watchers[prop].push(watcher); //add the new watcher in the watchers array


            var getter = function () {
                return val;
            };


            var setter = function (newval) {
                var oldval = val;
                val = newval;

                if (obj[prop]){
                    watchAll(obj[prop], watcher);
                }

                watchFunctions(obj, prop);

                if (!WatchJS.noMore){
                    if (JSON.stringify(oldval) !== JSON.stringify(newval)) {
                        callWatchers(obj, prop, "set", newval, oldval);
                        WatchJS.noMore = false;
                    }
                }
            };

            defineGetAndSet(obj, prop, getter, setter);

        };

        var callWatchers = function (obj, prop, action, newval, oldval) {

            for (var wr in obj.watchers[prop]) {
                if (isInt(wr)){
                    obj.watchers[prop][wr].call(obj, prop, action, newval, oldval);
                }
            }
        };

        // @todo code related to "watchFunctions" is certainly buggy
        var methodNames = ['pop', 'push', 'reverse', 'shift', 'sort', 'slice', 'unshift'];
        var defineArrayMethodWatcher = function (obj, prop, original, methodName) {
            defineProp(obj[prop], methodName, function () {
                var response = original.apply(obj[prop], arguments);
                watchOne(obj, obj[prop]);
                if (methodName !== 'slice') {
                    callWatchers(obj, prop, methodName,arguments);
                }
                return response;
            });
        };

        var watchFunctions = function(obj, prop) {

            if ((!obj[prop]) || (obj[prop] instanceof String) || (!isArray(obj[prop]))) {
                return;
            }

            for (var i = methodNames.length, methodName; i--;) {
                methodName = methodNames[i];
                defineArrayMethodWatcher(obj, prop, obj[prop][methodName], methodName);
            }

        };

        var unwatchOne = function (obj, prop, watcher) {
            for(var i in obj.watchers[prop]){
                var w = obj.watchers[prop][i];

                if(w == watcher) {
                    obj.watchers[prop].splice(i, 1);
                }
            }

            removeFromLengthSubjects(obj, prop, watcher);
        };

        var loop = function(){

            for(var i in lengthsubjects){

                var subj = lengthsubjects[i];
                var difference = getObjDiff(subj.obj[subj.prop], subj.actual);

                if(difference.added.length || difference.removed.length){
                    if(difference.added.length){
                        for(var j in subj.obj.watchers[subj.prop]){
                            watchMany(subj.obj[subj.prop], difference.added, subj.obj.watchers[subj.prop][j], subj.level - 1, true);
                        }
                    }

                    callWatchers(subj.obj, subj.prop, "differentattr", difference, subj.actual);
                }
                subj.actual = clone(subj.obj[subj.prop]);

            }

        };

        var pushToLengthSubjects = function(obj, prop, watcher, level){


            lengthsubjects.push({
                obj: obj,
                prop: prop,
                actual: clone(obj[prop]),
                watcher: watcher,
                level: level
            });
        };

        var removeFromLengthSubjects = function(obj, prop, watcher){

            for (var i in lengthsubjects) {
                var subj = lengthsubjects[i];

                if (subj.obj == obj && subj.prop == prop && subj.watcher == watcher) {
                    lengthsubjects.splice(i, 1);
                }
            }

        };

        setInterval(loop, 50);

        WatchJS.watch = watch;
        WatchJS.unwatch = unwatch;
        WatchJS.callWatchers = callWatchers;

        return WatchJS;

    })();
    // END OF WatchJS 1.3.0

    var listenersHash = {};
    var EVENT_NAME_MODEL_CHANGE = 'databind-model-change';
    var EVENT_NAME_DOM_CHANGE = 'databind-dom-change';

    /**
     * Key property to look for on the elements for a key to bind to
     * @type {string}
     */
    var KEY_PROP = 'data-key';

    /**
     * Test if element is a jQuery element
     * @private
     * @param el - element to test
     * @return {boolean} jquery element or not
     */
    function isJQueryEl(el) {
        return (el && window.jQuery && el instanceof window.jQuery);
    }

    /**
     * Get a simple DomElement from a possibly jQuery wrapped element
     * @private
     * @param el - DomElement\jQueryDomElement to get the simple one from
     * @returns DomElement simple
     */
    function getBareDomElement(el) {
        if (isJQueryEl(el)) return el[0];
        return el;
    }

    /**
     * Get\Set value for an element
     * @private
     * @param el - DomElement to get\set value of
     * @param newVal - Optional - new value to set on the el.
     * @returns (new) value of the element
     */
    function value(el, newVal) {
        if (!el) return undefined;
        var isSetter = (newVal !== undefined);
        if (['checkbox', 'radio'].indexOf(el.type) >= 0) {
            if (isSetter) {
                el.checked = !!newVal;
            }
            return el.checked;
        }
        if (['text', 'textarea', 'select-one', 'email', 'url', 'week', 'time', 'search', 'tel', 'range', 'number', 'month', 'datetime-local', 'date', 'color', 'password'].indexOf(el.type) >= 0) {
            if (isSetter) {
                el.value = newVal;
            }
            return el.value;
        }

        if (['select-multiple'].indexOf(el.type) >= 0) {
            if (isSetter) {
                if (!isArray(newVal)) {
                    newVal = [newVal];
                }
            }
            var result = [];
            var options = el && el.options;
            var opt;

            for (var i = 0, iLen = options.length; i < iLen; i++) {
                opt = options[i];

                if (isSetter) {
                    if (newVal.indexOf(opt.value) > -1) {
                        opt.selected = true;
                    } else {
                        opt.selected = false;
                    }
                }

                if (opt.selected) {
                    result.push(opt.value || opt.text);
                }
            }
            return result;
        }

        // else assume non-input element
        if (isSetter) {
            el.innerText = newVal;
        }
        return el.innerText;
    }

    /**
     * General purpose util that tells if a given input is an Array
     * @private
     * @param val - value to examine
     * @returns {boolean} array or not
     */
    function isArray(val) {
        return ( Object.prototype.toString.call(val) === '[object Array]' );
    }

    /**
     * Get the event name that the element fires then it changes value
     * @private
     * @param el DomElement to get event name for
     * @returns {string} - event name
     */
    function getEventNameForEl(el) {
        if (['checkbox', 'radio', 'select-one', 'select-multiple', 'password'].indexOf(el.type) >= 0) {
            return 'change';
        }
        if (['text', 'textarea', 'email', 'url', 'week', 'time', 'search', 'tel', 'range', 'number', 'month', 'datetime-local', 'date', 'color'].indexOf(el.type) >= 0) {
            return 'input';
        }
    }


    /**
     * Get a unique hash key for an Object or fetch previously given one to it
     * @private
     * @param el - DomElement to give hashkey to
     * @returns String - hash key of this element
     */
    function getOrGenElHashkey(el) {
        if (!el.hashkey) {
            el.hashkey = Date.now() + Math.floor(Math.random() * 100000);
        }

        return el.hashkey;
    }

    /**
     * Listen to value changes on given element and invoke given function
     * @private
     * @param el - DomElement to listen to
     * @param fn - Function to invoke if value changes on the el
     */
    function listen(el, fn) {
        if (!el || !fn) return;

        var hashkey = getOrGenElHashkey(el);
        // save the listener in listeners has for later removal
        listenersHash[hashkey] = listenersHash[hashkey] || [];
        // prevent double listening on same fn on same obj
        if (listenersHash[hashkey].indexOf(fn) > -1) return;
        // we're safe to add this handler
        listenersHash[hashkey].push(fn);

        var evName = getEventNameForEl(el);
        el.addEventListener(evName, fn, false);
    }

    /**
     * Unlisten to dom changes of a given function, previously listened to
     * @private
     * @param el - DomElement to unlisten
     * @param fn - Function to unlisten to
     */
    function unlistenOne(el, fn) {
        // check if this fn was ever listened to
        var hashkey = getOrGenElHashkey(el);
        var idx = listenersHash[hashkey].indexOf(fn);
        if (!listenersHash[hashkey] || idx === -1) return;
        // remove fn from the hash
        listenersHash[hashkey].splice(idx, 1);

        var evName = getEventNameForEl(el);
        el.removeEventListener(evName, fn, false);
    }

    /**
     * Unlisten to DOM changes
     * @private
     * @param el - DomElement to unbind from dom
     */
    function unlisten(el) {
        var hashkey = getOrGenElHashkey(el);
        var listeners = listenersHash[hashkey];
        if (!el || !listeners) return;
        var listenersClone = listeners.concat();
        var i, len = listenersClone.length;
        for (i = 0; i < len; i++) {
            unlistenOne(el, listenersClone[i]);
        }
    }

    /**
     * Get the value of a deep key from a model
     * @private
     * @param model - Obejct - Data model
     * @param key - String - key to fetch. can be deep key (e.g. a.b.c)
     * @returns The value of the given key on the model
     */
    function getModelDeepKey(model, key) {
        var isArrayKey = new RegExp(/.*\[(\d+)\]/);
        var splitKey = key.split('.');
        var modelDepth = model;
        var i;

        function diveIntoArray() {
            var justKey, isInArray;
            var didDive = false;
            isInArray = isArrayKey.exec(splitKey[i]);
            if (isInArray && isInArray.length) {
                justKey = splitKey[i].split('[')[0];
                modelDepth = modelDepth[justKey][+isInArray[1]];
                didDive = true;
            }

            return didDive;
        }

        for (i = 0; i < splitKey.length - 1; i++) {
            if (!diveIntoArray()) {
                modelDepth = modelDepth[ splitKey[i] ];
            }
        }
        diveIntoArray();

        return modelDepth;
    }

    /**
     * Get\Set a value for a given key on the model
     * @private
     * @param model - Object data model
     * @param key - String - key on the model. can be deep key (e.g. a.b.c)
     * @param newVal - Optional Any - new value to set for the key
     * @returns The (new) value of the given key on the model
     */
    function modelValue(model, key, newVal) {
        var splitKey = key.split('.');
        var deepModel = getModelDeepKey(model, key);
        if (newVal !== undefined) {
            deepModel[splitKey[ splitKey.length - 1 ]] = newVal;
        }
        return deepModel[splitKey[ splitKey.length - 1 ]];
    }

    /**
     * Bind a Dom element so when it's value changes it will change the given model's key's value
     * @private
     * @param el - DomElement to bind (listen to changes on)
     * @param deepModel - Object data model to update when dom's value change
     * @param deepKey - String key on model to update
     */
    function bindDom(el, deepModel, deepKey) {
        // listen to elem changes -> on change set model with new value
        var fn = (function (el, deepModel, deepKey, modelValueFn, valueFn, getDatasetKeyFn, fireEventFn, eventNameDomChange) {
            return function (ev) {
                var newVal = valueFn(this);
                var key = getDatasetKeyFn(this);
                var oldValue = modelValueFn(deepModel, deepKey);
                modelValueFn(deepModel, deepKey, newVal);
                fireEventFn(eventNameDomChange, this, {
                    key: key,
                    oldValue: oldValue,
                    newValue: newVal
                });
            };
        })(el, deepModel, deepKey, modelValue, value, getDatasetKey, fireEvent, EVENT_NAME_DOM_CHANGE);
        listen(el, fn);
    }

    /**
     * Unbind an element from dom binding, so it won't notify on value changes on the Dom element
     * Unbinds all previously attached functions
     * @private
     * @param el - DomElement to unbind
     */
    function unbindDom(el) {
        unlisten(el);
    }

    /**
     * Bind a model and key to an element, so when the model changes, the value of the key will too
     * @private
     * @param el - DomElement - elem to set the value when changes
     * @param deepModel - Object - Data model to bind to
     * @param deepKey - String - Key to bind to
     */
    function bindModel(el, deepModel, deepKey) {
        // watch model's key -> on change set el's new value
        var fn = (function (el, deepModel, deepKey, valueFn, fireEventFn, getDatasetKeyFn, eventNameModelChange) {
            return function (key, setOrGet, newVal, oldVal) {
                var key = getDatasetKeyFn(el);
                valueFn(el, newVal);
                fireEventFn(eventNameModelChange, el, {
                    key: key,
                    oldValue: oldVal,
                    newValue: newVal
                });
            }
        })(el, deepModel, deepKey, value, fireEvent, getDatasetKey, EVENT_NAME_MODEL_CHANGE);
        WatchJS.watch(deepModel, deepKey, fn);
    }

    /**
     * Unbind all previous functions between the model and key
     * @private
     * @param deepModel - Object - Data model to unbind from
     * @param deepKey - String - Key to unbind
     */
    function unbindModel(deepModel, deepKey) {
        // TODO not use internal impl of watch.js - deepModel.watchers[deepKey]
        var watchers = deepModel.watchers[deepKey];
        var i;
        for (i = 0; i < watchers.length; i++) {
            WatchJS.unwatch(deepModel, deepKey, watchers[i]);
        }
    }

    /**
     * Get the key from the element
     * @private
     * @param el - DomElement to extract from
     * @returns {string} - key or null if not found
     */
    function getDatasetKey(el) {
        if (!el) return;
        return el.getAttribute(KEY_PROP);
    }

    /**
     * Bind and Unbind have common config objects, with same defaults, get those from cfg provided
     * @private
     * @param cfg - Object - base config provided
     * @returns {dom: Boolean, model: Object, children: Boolean}
     */
    function getBindUnbindConfigDefaults(cfg) {
        cfg = cfg || {};
        cfg = {
            dom: (cfg.dom !== undefined) ? cfg.dom : true,
            model: (cfg.model !== undefined) ? cfg.model : true,
            children: (cfg.children !== undefined) ? cfg.children : true
        };
        return cfg;
    }


    /**
     * Get common values need both to binding and unbinding
     * @private
     * @param el - DomElement being inspected
     * @param model - Object data model being inspected
     * @returns Object {
     *              key:        String  - key of elem. to bind to model
     *              deepKey:    String  - if key is deep (e.g. k.x.f) then return deepest part (f)
     *              deepModel:  Object  - return the deepest path of the object where deepKey is an attribute
     *              keyExists:  Boolean - Does elem. contain the key attribute
     *          }
     */
    function getCommonBindingProps(el, model) {
        if (!el || !model) return {};

        // extract model's key to watch from el's data-key
        var key = getDatasetKey(el);
        if (!key) return {};
        // make sure the key is defined in the model
        var deepModel = getModelDeepKey(model, key);
        var deepKey = key.split('.');
        deepKey = deepKey[ deepKey.length - 1 ];

        return {
            key: key,
            deepKey: deepKey,
            deepModel: deepModel,
            keyExists: !!deepModel
        }
    }


    /**
     * Bind a single elem. to the model
     * @private
     * @param el - DomElement to bind
     * @param model - Model to bind to
     * @param cfg - Object {
     *                  dom:        Boolean - bind the DOM to the model, default true
     *                  model:      Boolean - bind the Model to the DOM, default true
     *              }
     */
    function bindSingleEl(el, model, cfg) {
        if (!el || !model) return false;

        var props = getCommonBindingProps(el, model);
        if (!props.keyExists) return false;

        // update elem from model
        var modelVal = modelValue(model, props.key);
        value(el, modelVal);

        if (cfg.dom) {
            bindDom(el, props.deepModel, props.deepKey);
        }

        if (cfg.model) {
            bindModel(el, props.deepModel, props.deepKey);
        }

        return true;
    }

    /**
     * Unbind a single elem. from the model
     * @private
     * @param el - DomElement to unbind
     * @param model - Model to unbind from
     * @param cfg - Object {
     *                  dom:        Boolean - bind the DOM to the model, default true
     *                  model:      Boolean - bind the Model to the DOM, default true
     *              }
     */
    function unbindSingleEl(el, model, cfg) {
        if (!el || !model) return;

        var props = getCommonBindingProps(el, model);
        if (!props.keyExists) return;

        if (cfg.dom) {
            unbindDom(el);
        }

        if (cfg.model) {
            unbindModel(props.deepModel, props.deepKey);
        }
    }

    /**
     * Get list of elements that needs to be bound\unbound
     * @private
     * @param el - head elem.
     * @param cfg - Object {
     *                  children:   Boolean - Bind all children in el's tree, default true
     *              }
     * @returns {Array} - List of elems.
     */
    function getElsToBindUnbind(el, cfg) {
        var res = [el], children, i;
        // if cfg.children traverse el's tree and bind all children that have the key
        if (cfg.children) {
            children = el.getElementsByTagName('*');
            // doing concat like this: elsToBind = res.concat( el.getElementsByTagName('*') );
            // does not work. it concats an empty NodeList array item
            for (i = 0; i < children.length; i++) {
                res.push(children[i]);
            }
        }

        return res;
    }

    /**
     * Fire a custom event
     * @private
     * @param name - event name
     * @param el - target element
     * @param data - data to hang to the event
     */
    function fireEvent(name, el, data) {
        //Ready: create a generic event
        var evt = document.createEvent("Events");
        //Aim: initialize it to be the event we want
        evt.initEvent(name, true, true); //true for can bubble, true for cancelable
        // attache data to event
        evt.data = data;
        //FIRE!
        el.dispatchEvent(evt);
    }

    // **************************** PUBLIC METHODS **************************** //

    function Watchable(els, eventNameModelChange, eventNameDomChange, cfg) {
        var watchFns = [];

        function addWatchFnOnEl(el, fn) {
            watchFns.push(fn);

            if (cfg.dom) {
                el.addEventListener(eventNameDomChange, fn, false);
            }

            if (cfg.model) {
                el.addEventListener(eventNameModelChange, fn, false);
            }
        }

        function removeWatchFnOnEl(el, fn) {
            var idx = watchFns.indexOf(fn);
            if (idx === -1) return;
            watchFns.splice(idx, 1);

            if (cfg.dom) {
                el.removeEventListener(EVENT_NAME_DOM_CHANGE, fn, false);
            }

            if (cfg.model) {
                el.removeEventListener(EVENT_NAME_MODEL_CHANGE, fn, false);
            }
        }

        function removeAllWatchFnOnEl(el) {
            var i, watchFnsClone = watchFns.concat();
            for (i=0; i<watchFnsClone.length; i++) {
                removeWatchFnOnEl(el, watchFnsClone[i]);
            }
        }

        function watch(fn) {
            var i;
            for (i=0; i<els.length; i++) {
                addWatchFnOnEl(els[i], fn);
            }
        }

        function unwatch(fn) {
            var i, removeFn = removeWatchFnOnEl;
            if (fn === undefined) {
                removeFn = removeAllWatchFnOnEl;
            }
            for (i=0; i<els.length; i++) {
                removeFn(els[i], fn);
            }
        }

        return {
            watch: watch,
            unwatch: unwatch
        };
    }

    /**
     * Bind element(s) who declare data-key to the model's key
     * @public
     * @param el - DomElement to bind
     * @param model - Object data model
     * @param cfg - Object {
     *                  dom:        Boolean - bind the DOM to the model, default true
     *                  model:      Boolean - bind the Model to the DOM, default true
     *                  children:   Boolean - Bind all children in el's tree, default true
     *              }
     */
    function bind(el, model, cfg) {
        if (!el || !model) return;

        // safe jQuery stripping
        var simpleEl = getBareDomElement(el);
        if (simpleEl !== el) {
            arguments[0] = simpleEl;
            return bind.apply(this, arguments);
        }

        cfg = getBindUnbindConfigDefaults(cfg);

        var elsToBind = getElsToBindUnbind(el, cfg);
        var i;

        var result, watchableEls = [];
        for (i = 0; i < elsToBind.length; i++) {
            result = bindSingleEl(elsToBind[i], model, {
                dom: cfg.dom,
                model: cfg.model
            });
            if (result) {
                watchableEls.push(elsToBind[i]);
            }
        }

        // pass in only elements that has the key
        var watchable = new Watchable(watchableEls, EVENT_NAME_MODEL_CHANGE, EVENT_NAME_DOM_CHANGE, cfg);
        // hang it on the element for reference usage in unbind
        el.watchable = watchable;

        return watchable;
    }

    /**
     * UnBind element(s) who declare data-key to the model's key
     * @public
     * @param el - DomElement to unbind
     * @param model - Object data model
     * @param cfg - Object {
     *                  dom:        Boolean - unbind the DOM to the model, default true
     *                  model:      Boolean - unbind the Model to the DOM, default true
     *                  children:   Boolean - UnBind all children in el's tree, default true
     *              }
     * @returns Object Watchable {
     *     watch( WatcherFn ),      // WatcherFn will be called with the event, and this as the elem fire upon
     *                              // ev.data.key      - the data-bound key on the element
     *                              // ev.data.oldValue - value before the change
     *                              // ev.data.newValue - value after the change
     *     unwatch( [WatcherFn] ),  // not providing the Fn to unwatch removes all watchers
     * }
     */
    function unbind(el, model, cfg) {
        if (!el || !model) return;

        // safe jQuery stripping
        var simpleEl = getBareDomElement(el);
        if (simpleEl !== el) {
            arguments[0] = simpleEl;
            return unbind.apply(this, arguments);
        }

        cfg = getBindUnbindConfigDefaults(cfg);

        var elsToBind = getElsToBindUnbind(el, cfg);
        var i;

        for (i = 0; i < elsToBind.length; i++) {
            unbindSingleEl(elsToBind[i], model, {
                dom: cfg.dom,
                model: cfg.model
            });
        }

        // remove all watchers on the watchable
        el.watchable.unwatch();
    }

    return {
        bind: bind,
        unbind: unbind
    };
});
