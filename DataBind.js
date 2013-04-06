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

    var listenersHash = {};
    var KEY_PROP = 'data-key';

    function changeHandler(ev) {
        console.log('#' + this.id + ' ev:' + ev.type + ' new val:' + value(this));
    }

    function value(el, newVal) {
        if (!el) return undefined;
        var isSetter = (newVal !== undefined);
        if (['checkbox', 'radio'].indexOf(el.type) >= 0) {
            if (isSetter) {
                el.checked = !!newVal;
            }
            return el.checked;
        }
        if (['text', 'textarea', 'select-one'].indexOf(el.type) >= 0) {
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

    function isArray(val) {
        return ( Object.prototype.toString.call(val) === '[object Array]' );
    }

    function getEventNameForEl(el) {
        if (['checkbox', 'radio', 'select-one', 'select-multiple'].indexOf(el.type) >= 0) {
            return 'change';
        }
        if (['text', 'textarea'].indexOf(el.type) >= 0) {
            return 'input';
        }
    }

    function getOrGenElHashkey(el) {
        if (!el.hashkey) {
            el.hashkey = Date.now() + Math.floor(Math.random() * 100000);
        }

        return el.hashkey;
    }

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

    function unlisten(el, fn) {
        var hashkey = getOrGenElHashkey(el);
        var listeners = listenersHash[hashkey];
        if (!el || !listeners) return;
        if (fn) {
            return unlistenOne(el, fn);
        }
        // no fn provided - remove all
        var listenersClone = listeners.concat();
        var i, len = listenersClone.length;
        for (i = 0; i < len; i++) {
            unlistenOne(el, listenersClone[i]);
        }
    }

    function keyExists(model, key) {
        var splitKey = key.split('.');
        var modelDepth = model;
        var i;

        for (i = 0; i < splitKey.length; i++) {
            if (!modelDepth.hasOwnProperty(splitKey[i])) return false;
            modelDepth = modelDepth[ splitKey[i] ];
        }
        return true;
    }

    function getModelDeepKey(model, key) {
        var splitKey = key.split('.');
        var modelDepth = model;
        var i;

        for (i = 0; i < splitKey.length - 1; i++) {
            modelDepth = modelDepth[ splitKey[i] ];
        }
        return modelDepth;
    }

    function modelValue(model, key, newVal) {
        var splitKey = key.split('.');
        var deepModel = getModelDeepKey(model, key);
        if (newVal !== undefined) {
            deepModel[splitKey[ splitKey.length - 1 ]] = newVal;
        }
        return deepModel[splitKey[ splitKey.length - 1 ]];
    }

    function bindDom(el, deepModel, deepKey) {
        // listen to elem changes -> on change set model with new value
        var fn = (function (el, deepModel, deepKey, modelValueFn, valueFn) {
            return function (ev) {
                var newVal = valueFn(this);
                modelValueFn(deepModel, deepKey, newVal);
            };
        })(el, deepModel, deepKey, modelValue, value);
        listen(el, fn);
        // listen again, just to print it out
        // TODO remove this debug calls
        listen(el, changeHandler);
    }

    function unbindDom(el) {
        unlisten(el);
    }

    function bindModel(el, deepModel, deepKey) {
        // watch model's key -> on change set el's new value
        var fn = (function (el, deepModel, deepKey, valueFn) {
            return function (key, setOrGet, newVal, oldVal) {
                valueFn(el, newVal);
            }
        })(el, deepModel, deepKey, value);
        WatchJS.watch(deepModel, deepKey, fn);
    }

    function unbindModel(deepModel, deepKey) {
        // TODO not use internal impl of watch.js - deepModel.watchers[deepKey]
        var watchers = deepModel.watchers[deepKey];
        var i;
        for (i = 0; i < watchers.length; i++) {
            WatchJS.unwatch(deepModel, deepKey, watchers[i]);
        }

    }

    function getDatasetKey(el) {
        if (!el) return;
        return el.getAttribute(KEY_PROP);
    }

    function bindSingleEl(el, model, cfg) {
        if (!el || !model) return;

        var props = getCommonBindingProps(el, model);
        if (!props.keyExists) return;

        // update elem from model
        var modelVal = modelValue(model, props.key);
        value(el, modelVal);

        if (cfg.dom) {
            bindDom(el, props.deepModel, props.deepKey);
        }

        if (cfg.model) {
            bindModel(el, props.deepModel, props.deepKey);
        }
    }

    function getBindUnbindConfigDefaults(cfg) {
        cfg = cfg || {};
        cfg = {
            dom: (cfg.dom !== undefined) ? cfg.dom : true,
            model: (cfg.model !== undefined) ? cfg.model : true,
            children: (cfg.children !== undefined) ? cfg.children : true
        };
        return cfg;
    }

    function getCommonBindingProps(el, model) {
        if (!el || !model) return {};

        // extract model's key to watch from el's data-key
        var key = getDatasetKey(el);
        if (!key) return {};
        // make sure the key is defined in the model
        var isKeyExists = keyExists(model, key);
        var deepModel = getModelDeepKey(model, key);
        var deepKey = key.split('.');
        deepKey = deepKey[ deepKey.length - 1 ];

        return {
            key: key,
            deepKey: deepKey,
            deepModel: deepModel,
            keyExists: isKeyExists
        }
    }

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

    function bind(el, model, cfg) {
        if (!el || !model) return;
        cfg = getBindUnbindConfigDefaults(cfg);

        var elsToBind = getElsToBindUnbind(el, cfg);
        var i;

        for (i = 0; i < elsToBind.length; i++) {
            bindSingleEl(elsToBind[i], model, {
                dom: cfg.dom,
                model: cfg.model
            });
        }
    }

    function unbind(el, model, cfg) {
        if (!el || !model) return;
        cfg = getBindUnbindConfigDefaults(cfg);

        var elsToBind = getElsToBindUnbind(el, cfg);
        var i;

        for (i = 0; i < elsToBind.length; i++) {
            unbindSingleEl(elsToBind[i], model, {
                dom: cfg.dom,
                model: cfg.model
            });
        }
    }

    return {
        bind: bind,
        unbind: unbind
    };
});
