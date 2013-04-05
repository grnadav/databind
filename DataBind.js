DataBind = (function () {
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

    function listen(el, fn) {
        if (!el || !fn) return;
        if (['checkbox', 'radio', 'select-one', 'select-multiple'].indexOf(el.type) >= 0) {
            addListener(el, 'change', fn);
        }
        if (['text', 'textarea'].indexOf(el.type) >= 0) {
            addListener(el, 'input', fn);
        }
    }

    function keyExists(model, key) {
        var splitKey = key.split('.');
        var modelDepth = model;
        var i;

        for (i=0; i<splitKey.length; i++) {
            if (!modelDepth.hasOwnProperty(splitKey[i])) return false;
            modelDepth = modelDepth[ splitKey[i] ];
        }
        return true;
    }

    function getModelDeepKey(model, key) {
        var splitKey = key.split('.');
        var modelDepth = model;
        var i;

        for (i=0; i<splitKey.length-1; i++) {
            modelDepth = modelDepth[ splitKey[i] ];
        }
        return modelDepth;
    }

    function modelValue(model, key, newVal) {
        var splitKey = key.split('.');
        var deepModel = getModelDeepKey(model, key);
        if (newVal !== undefined) {
            deepModel[splitKey[ splitKey.length-1 ]] = newVal;
        }
        return deepModel[splitKey[ splitKey.length-1 ]];
    }

    function bind(el, model, cfg) {
        if (!el || !model) return;
        cfg = cfg || {};
        cfg = {
            watchDom: (cfg.watchDom !== undefined) ? cfg.watchDom : true,
            watchModel: (cfg.watchModel !== undefined) ? cfg.watchModel : true
        };
        // extract model's key to watch from el's data-key
        var key = el.dataset.key;
        // make sure the key is defined in the model
        if (!keyExists(model,key)) return;
        // update elem from model
        var modelVal = modelValue(model, key);
        var deepModel = getModelDeepKey(model, key);
        var deepKey = key.split('.');
        deepKey = deepKey[ deepKey.length-1 ];
        value(el, modelVal);
        // listen to elem changes -> on change set model with new value
        listen(el, function (ev) {
            var newVal = value(this);
            // TODO consider colsuring the model here
            modelValue(deepModel, deepKey, newVal);
        });
        // listen again, just to print it out
        // TODO remove this debug calls
        listen(el, changeHandler);

        // watch model's key -> on change set el's new value
        WatchJS.watch(deepModel, deepKey, function(key,setOrGet,newVal,oldVal) {
            // TODO consider colsuring the el here
            value(el, newVal);
        });
    }

    return {
        bind: bind
    };
})();
