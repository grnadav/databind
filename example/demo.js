Demo = (function () {

    function init() {
        var ids = [ 'in-text', 'textarea', 'in-checkbox', 'in-radio', 'select', 'select-mul', 'div1', 'span1', 'span2', 'has-children' ];
        var i;

        for (i = 0; i < ids.length; i++) {
            bind(ids[i]);
        }
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

    function bind(id) {
        console.log('bind:'+id);
        //        var el = document.getElementById(id);
        var el = $('#'+id);
        DataBind.bind(el, model);
    }

    function unbind(id) {
        console.log('unbind:'+id);
//        var el = document.getElementById(id);
        var el = $('#'+id);
        DataBind.unbind(el, model);
    }

    return {
        init: init,
        bind: bind,
        unbind: unbind,
        model: model
    };
})();
