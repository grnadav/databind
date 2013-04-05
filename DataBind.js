DataBind = (function () {

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

    function addListener(el, ev, fn) {
        if (!el || !ev || !fn) return;
        return el.addEventListener(ev, fn, false);
    }

    function removeListener(el, ev, fn) {

    }

    function getEventNameForEl(el) {
        if (['checkbox', 'radio', 'select-one', 'select-multiple'].indexOf(el.type) >= 0) {
            return 'change';
        }
        if (['text', 'textarea'].indexOf(el.type) >= 0) {
            return 'input';
        }
    }

    function listen(el, fn) {
        if (!el || !fn) return;

        // save the listener in listeners has for later removal
        listenersHash[el] = listenersHash[el] || [];
        // prevent double listening on same fn on same obj
        if (listenersHash[el].indexOf(fn) > -1) return;
        // we're safe to add this handler
        listenersHash[el].push(fn);

        var evName = getEventNameForEl(el);
        el.addEventListener(evName, fn, false);
    }

    function unlistenOne(el, fn) {
        // check if this fn was ever listened to
        var idx = listenersHash[el].indexOf(fn);
        if (!listenersHash[el] || idx === -1) return;
        // remove fn from the hash
        listenersHash[el].splice(idx, 1);

        var evName = getEventNameForEl(el);
        el.removeEventListener(evName, fn, false);
    }

    function unlisten(el, fn) {
        var listeners = listenersHash[el];
        if (!el || !listeners) return;
        if (fn) {
            return unlistenOne(el, fn);
        }
        // no fn provided - remove all
        var i, keys = listeners.keys, key;
        for (i = 0; i < keys.length; i++) {
            key = keys[i];
            if (listeners.hasOwnProperty(key)) {
                unlistenOne(el, listeners[key]);
            }
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
        var fn = (function(el, deepModel, deepKey, modelValueFn, valueFn) {
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
        // TODO good chance i need the function to unwatch
        WatchJS.unwatch(deepModel, deepKey);
    }

    function getDatasetKey(el) {
        if (!el) return;
        return el.getAttribute(KEY_PROP);
    }

    function bindSingleEl(el, model, cfg) {
        if (!el || !model) return;
        // extract model's key to watch from el's data-key
        var key = getDatasetKey(el);
        // make sure the key is defined in the model
        if (!keyExists(model, key)) return;
        // update elem from model
        var modelVal = modelValue(model, key);
        var deepModel = getModelDeepKey(model, key);
        var deepKey = key.split('.');
        deepKey = deepKey[ deepKey.length - 1 ];
        value(el, modelVal);

        if (cfg.dom) {
            bindDom(el, deepModel, deepKey);
        }

        if (cfg.model) {
            bindModel(el, deepModel, deepKey);
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

    function bind(el, model, cfg) {
        if (!el || !model) return;
        cfg = getBindUnbindConfigDefaults(cfg);
        // TODO if cfg.children traverse el's tree and bind all children that have the key
        bindSingleEl(el, model, {
            dom: cfg.dom,
            model: cfg.model
        });
    }

    function unbindSingleEl(el, model, cfg) {

    }

    function unbind(el, model, cfg) {
        if (!el) return;
        cfg = getBindUnbindConfigDefaults(cfg);
        // TODO if cfg.children traverse el's tree and unbind all children that have the key
        unbindSingleEl(el, model, {
            dom: cfg.dom,
            model: cfg.model
        });

    }

    return {
        bind: bind,
        unbind: unbind
    };
})();
