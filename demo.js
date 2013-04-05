Demo = (function () {

    function init() {
        var ids = [ 'in-text', 'textarea', 'in-checkbox', 'in-radio', 'select', 'select-mul', 'div1', 'span1', 'span2' ];
        var i, el;

        for (i = 0; i < ids.length; i++) {
            el = document.getElementById(ids[i]);
            DataBind.bind(el, model);
        }
    }

    var model = {
        k1: 'text-k1',
        k2: 'text-k2',
        k3: true,
        k4: true,
        k5: 'value1',
        k6: ['value1', 'value3'],
        k7: 'text-k3',
        k8: 'text-k4',
        k9: {
            k91: 'v1'
        }
    };

    return {
        init: init,
        model: model
    };
})();
