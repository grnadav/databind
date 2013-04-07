Demo = (function () {

    function init() {
        var ids = [ 'in-text', 'textarea', 'in-checkbox', 'in-radio', 'select', 'select-mul', 'div1', 'span1', 'span2', 'has-children' ];
        var i;

        for (i = 0; i < ids.length; i++) {
            bind(ids[i]);
            attachBindUnbindHandlers(ids[i]);
        }

        buildModel($('.model'), model);
    }

    function attachBindUnbindHandlers(id) {
        var buttons = $('[name="'+id+'"]'); // 2 elems. first is 'bind', second 'unbind'
        $(buttons[0]).on('click', function() {
            bind(id);
        });
        $(buttons[1]).on('click', function() {
            unbind(id);
        });
    }

    function buildModel(container, innerModel, keyPrefix) {
        var key;
        var subcontainer, prefix;
        for (key in innerModel) {
            prefix = keyPrefix ? keyPrefix + '.' + key : key;
            subcontainer = $('<div></div>');
            if ($.isPlainObject(innerModel[key])) {
                buildModel(subcontainer, innerModel[key], prefix);
                container.append(subcontainer);
            } else {
                subcontainer.append($('<span></span>').html(prefix));
                var input = $('<input type="text"/>').val(innerModel[key]).attr('data-key', prefix);
                DataBind.bind(input, model);
                subcontainer.append(input);
                container.append(subcontainer);
            }
        }
    }

    function modelItemAppender(container, model, key) {

    }

    var model = {
        k1: {
            k11: 'text-k1'
        },
        k2: 'text-k2',
        k3: true,
        k4: true,
        k5: 'value1',
        k6: ['value1', 'value3'],
        k7: 'text-k3',
        k8: 'text-k4',
        k9: {
            k91: 'v1'
        },
        k10: {
            k101: 'bbbb',
            k102: 'Deep H1'
        }
    };

    /**
     * Debug util that prints info of given element to console
     * @private
     * @param ev - DomElement to print info for
     */
    function changeHandler(ev) {
        log('#' + this.id + ' ev:' + ev.type + ' new val:' + ev.data.newValue);
    }

    function bind(id) {
        log('bind:'+id);
        //        var el = document.getElementById(id);
        var el = $('#'+id);
        var watchable = DataBind.bind(el, model);
        watchable.watch(changeHandler);
    }

    function unbind(id) {
        log('unbind:'+id);
//        var el = document.getElementById(id);
        var el = $('#'+id);
        DataBind.unbind(el, model);
    }

    function log(text) {
        var bottom = $('.bottom');
        bottom.append($('<div class="log-line"></div>').html(text));
        bottom.animate({
            scrollTop: bottom[0].scrollHeight
        }, 500);
    }

    return {
        init: init,
        bind: bind,
        unbind: unbind,
        model: model
    };
})();
