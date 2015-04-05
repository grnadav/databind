describe("DataBind", function() {

//    beforeEach(function() {
//        // remove all bindings
//        var ids = [ 'in-text', 'textarea', 'in-checkbox', 'in-radio', 'select', 'select-mul', 'div1', 'span1', 'span2', 'has-children' ];
//        for (var i = 0; i < ids.length; i++) {
//            DataBind.unbind(ids[i]);
//        }
//    });

    function fireEvent(element,event){
        if (document.createEventObject){
            // dispatch for IE
            var evt = document.createEventObject();
            return element.fireEvent('on'+event,evt)
        }
        else{
            // dispatch for firefox + others
            var evt = document.createEvent("HTMLEvents");
            evt.initEvent(event, true, true ); // event type,bubbling,cancelable
            return !element.dispatchEvent(evt);
        }
    }

    function isArrayEqual(arr1, arr2) {
        if (arr1.length !== arr2.length) return false;
        // make sure both arrays have same values exactly
        var i;
        for (i=0; i<arr1.length; i++) {
            if (arr2.indexOf(arr1[i]) === -1) return false;
        }
        for (i=0; i<arr2.length; i++) {
            if (arr1.indexOf(arr2[i]) === -1) return false;
        }
        return true;
    }

    describe("Test different DOM element type", function() {
        var elementsTestbed = $('#elements-testbed');

        it("should input type text be 2-way bound", function() {
            var textElem = document.getElementById('in-text');
            $(textElem).attr('data-key', 'k1');
            var model = {k1: 'some text'};
            DataBind.bind(textElem, model);
            expect( $(textElem).val() ).toBe( model.k1 );

            model.k1 = 'changed via model';
            expect( $(textElem).val() ).toBe( 'changed via model' );

            $(textElem).val('changed via elem.');
            // simulate as if the change was a user input
            fireEvent(textElem, 'input');
            expect( model.k1 ).toBe( 'changed via elem.' );
        });

        it("should textarea be 2-way bound", function() {
            var textElem = document.getElementById('textarea');
            $(textElem).attr('data-key', 'k1');
            var model = {k1: 'some text'};
            DataBind.bind(textElem, model);
            expect( $(textElem).val() ).toBe( model.k1 );

            model.k1 = 'changed via model';
            expect( $(textElem).val() ).toBe( 'changed via model' );

            $(textElem).val('changed via elem.');
            // simulate as if the change was a user input
            fireEvent(textElem, 'input');
            expect( model.k1 ).toBe( 'changed via elem.' );
        });

        it("should checkbox be 2-way bound", function() {
            var elem = document.getElementById('in-checkbox');
            $(elem).attr('data-key', 'k1');
            var model = {k1: false};
            DataBind.bind(elem, model);
            expect( $(elem).prop('checked') ).toBe( model.k1 );

            model.k1 = true;
            expect( $(elem).prop('checked') ).toBe( true );

            $(elem).prop('checked', false);
            // simulate as if the change was a user input
            fireEvent(elem, 'change');
            expect( model.k1 ).toBe( false );
        });

        it("should radio be 2-way bound", function() {
            var elem = document.getElementById('in-radio');
            $(elem).attr('data-key', 'k1');
            var model = {k1: false};
            DataBind.bind(elem, model);
            expect( $(elem).prop('checked') ).toBe( model.k1 );

            model.k1 = true;
            expect( $(elem).prop('checked') ).toBe( true );

            $(elem).prop('checked', false);
            // simulate as if the change was a user input
            fireEvent(elem, 'change');
            expect( model.k1 ).toBe( false );
        });

        it("should select be 2-way bound", function() {
            var elem = document.getElementById('select');
            $(elem).attr('data-key', 'k1');
            var model = {k1: 'value1'};
            DataBind.bind(elem, model);
            expect( $(elem).val() ).toBe( model.k1 );

            model.k1 = 'value2';
            expect( $(elem).val() ).toBe( 'value2' );

            $(elem).val('value3');
            // simulate as if the change was a user input
            fireEvent(elem, 'change');
            expect( model.k1 ).toBe( 'value3' );
        });

        it("should select with multi-select be 2-way bound", function() {
            var elem = document.getElementById('select-mul');
            $(elem).attr('data-key', 'k1');
            var model = {k1: ['value1', 'value2']};
            DataBind.bind(elem, model);
            expect( isArrayEqual($(elem).val(), model.k1)).toBe(true);

            model.k1 = ['value1', 'value3'];
            expect( isArrayEqual($(elem).val(), ['value1', 'value3'])).toBe(true);

            $(elem).val('value3');
            // simulate as if the change was a user input
            fireEvent(elem, 'change');
            expect( isArrayEqual(model.k1, ['value3'])).toBe(true);
        });

        it("should div (block el) be 1-way bound as it has no user input", function() {
            var elem = document.getElementById('div1');
            $(elem).attr('data-key', 'k1');
            var model = {k1: 'value1'};
            DataBind.bind(elem, model);
            expect( $(elem).text() ).toBe( model.k1 );

            model.k1 = 'value2';
            expect( $(elem).text() ).toBe( 'value2' );
        });

        it("should span (inline el) be 1-way bound as it has no user input", function() {
            var elem = document.getElementById('span1');
            $(elem).attr('data-key', 'k1');
            var model = {k1: 'value1'};
            DataBind.bind(elem, model);
            expect( $(elem).text() ).toBe( model.k1 );

            model.k1 = 'value2';
            expect( $(elem).text() ).toBe( 'value2' );
        });

        it("should email be 2-way bound", function() {
            var elem = document.createElement('input');
            $(elem).attr('type', 'email');
            $(elem).attr('data-key', 'k1');
            elementsTestbed.append(elem);

            var model = {k1: 'x@a.com'};
            DataBind.bind(elem, model);
            expect( $(elem).val() ).toBe( model.k1 );

            model.k1 = 'x@b.com';
            expect( $(elem).val() ).toBe( 'x@b.com' );

            $(elem).val('x@c.com');
            // simulate as if the change was a user input
            // fireEvent(elem, 'change');
            // expect( $(elem).val() ).toBe( 'x@c.com' );

            // should be listening to the input event
            fireEvent(elem, 'input');
            // need to make sure that firing the event updates the model value
            expect( model.k1 ).toBe( $(elem).val() );
        });

        it("should url be 2-way bound", function() {
            var elem = document.createElement('input');
            $(elem).attr('type', 'url');
            $(elem).attr('data-key', 'k1');
            elementsTestbed.append(elem);

            var model = {k1: 'www.x.com'};
            DataBind.bind(elem, model);
            expect( $(elem).val() ).toBe( model.k1 );

            model.k1 = 'www.y.com';
            expect( $(elem).val() ).toBe( 'www.y.com' );

            $(elem).val('www.z.com');
            // simulate as if the change was a user input
            // fireEvent(elem, 'change');
            // expect( $(elem).val() ).toBe( 'www.z.com' );

            // should be listening to the input event
            fireEvent(elem, 'input');
            // need to make sure that firing the event updates the model value
            expect( model.k1 ).toBe( $(elem).val() );
        });

        it("should week be 2-way bound", function() {
            var elem = document.createElement('input');
            $(elem).attr('type', 'week');
            $(elem).attr('data-key', 'k1');
            elementsTestbed.append(elem);

            var model = {k1: '2013-W01'};
            DataBind.bind(elem, model);
            expect( $(elem).val() ).toBe( model.k1 );

            model.k1 = '2013-W02';
            expect( $(elem).val() ).toBe( '2013-W02' );

            $(elem).val('2013-W03');
            // simulate as if the change was a user input
            // fireEvent(elem, 'change');
            // expect( $(elem).val() ).toBe( '2013-W03' );

            // should be listening to the input event
            fireEvent(elem, 'input');
            // need to make sure that firing the event updates the model value
            expect( model.k1 ).toBe( $(elem).val() );
        });

        it("should time be 2-way bound", function() {
            var elem = document.createElement('input');
            $(elem).attr('type', 'time');
            $(elem).attr('data-key', 'k1');
            elementsTestbed.append(elem);

            var model = {k1: '01:02'};
            DataBind.bind(elem, model);
            expect( $(elem).val() ).toBe( model.k1 );

            model.k1 = '01:03';
            expect( $(elem).val() ).toBe( '01:03' );

            $(elem).val('01:04');
            // simulate as if the change was a user input
            // fireEvent(elem, 'change');
            // expect( $(elem).val() ).toBe( '01:04' );

            // should be listening to the input event
            fireEvent(elem, 'input');
            // need to make sure that firing the event updates the model value
            expect( model.k1 ).toBe( $(elem).val() );
        });

        it("should search be 2-way bound", function() {
            var elem = document.createElement('input');
            $(elem).attr('type', 'search');
            $(elem).attr('data-key', 'k1');
            elementsTestbed.append(elem);

            var model = {k1: 'a'};
            DataBind.bind(elem, model);
            expect( $(elem).val() ).toBe( model.k1 );

            model.k1 = 'b';
            expect( $(elem).val() ).toBe( 'b' );

            $(elem).val('c');
            // simulate as if the change was a user input
            // fireEvent(elem, 'change');
            // expect( $(elem).val() ).toBe( 'c' );

            // should be listening to the input event
            fireEvent(elem, 'input');
            // need to make sure that firing the event updates the model value
            expect( model.k1 ).toBe( $(elem).val() );
        });

        it("should tel be 2-way bound", function() {
            var elem = document.createElement('input');
            $(elem).attr('type', 'tel');
            $(elem).attr('data-key', 'k1');
            elementsTestbed.append(elem);

            var model = {k1: '111111'};
            DataBind.bind(elem, model);
            expect( $(elem).val() ).toBe( model.k1 );

            model.k1 = '111112';
            expect( $(elem).val() ).toBe( '111112' );

            $(elem).val('111113');
            // simulate as if the change was a user input
            // fireEvent(elem, 'change');
            // expect( $(elem).val() ).toBe( '111113' );

            // should be listening to the input event
            fireEvent(elem, 'input');
            // need to make sure that firing the event updates the model value
            expect( model.k1 ).toBe( $(elem).val() );
        });

        it("should range be 2-way bound", function() {
            var elem = document.createElement('input');
            $(elem).attr('type', 'range');
            $(elem).attr('min', '1');
            $(elem).attr('max', '10');
            $(elem).attr('data-key', 'k1');
            elementsTestbed.append(elem);

            var model = {k1: '1'};
            DataBind.bind(elem, model);
            expect( $(elem).val() ).toBe( model.k1 );

            model.k1 = '2';
            expect( $(elem).val() ).toBe( '2' );

            // make sure 'max' is preserved
            model.k1 = '12';
            expect( $(elem).val() ).toBe( '10' );

            // make sure 'min' is preserved
            model.k1 = '0';
            expect( $(elem).val() ).toBe( '1' );

            $(elem).val('3');
            // simulate as if the change was a user input
            // fireEvent(elem, 'change');
            // expect( $(elem).val() ).toBe( '3' );

            // should be listening to the input event
            fireEvent(elem, 'input');
            // need to make sure that firing the event updates the model value
            expect( model.k1 ).toBe( $(elem).val() );
        });


        it("should number be 2-way bound", function() {
            var elem = document.createElement('input');
            $(elem).attr('type', 'number');
            $(elem).attr('min', '1');
            $(elem).attr('max', '10');
            $(elem).attr('data-key', 'k1');
            elementsTestbed.append(elem);

            var model = {k1: '1'};
            DataBind.bind(elem, model);
            expect( $(elem).val() ).toBe( model.k1 );

            model.k1 = '2';
            expect( $(elem).val() ).toBe( '2' );

            // make sure 'max' is NOT preserved
            model.k1 = '12';
            expect( $(elem).val() ).toBe( '12' );

            // make sure 'min' is NOT preserved
            model.k1 = '0';
            expect( $(elem).val() ).toBe( '0' );

            $(elem).val('3');
            // simulate as if the change was a user input
            // fireEvent(elem, 'change');
            // expect( $(elem).val() ).toBe( '3' );

            // should be listening to the input event
            fireEvent(elem, 'input');
            // need to make sure that firing the event updates the model value
            expect( model.k1 ).toBe( $(elem).val() );
        });

        it("should month be 2-way bound", function() {
            var elem = document.createElement('input');
            $(elem).attr('type', 'month');
            $(elem).attr('data-key', 'k1');
            elementsTestbed.append(elem);

            var model = {k1: '2013-01'};
            DataBind.bind(elem, model);
            expect( $(elem).val() ).toBe( model.k1 );

            model.k1 = '2013-02';
            expect( $(elem).val() ).toBe( '2013-02' );

            // browser enforces valid values!
            model.k1 = '2013-13';
            expect( $(elem).val() ).toBe( '' );

            $(elem).val('2013-03');
            // simulate as if the change was a user input
            // fireEvent(elem, 'change');
            // expect( $(elem).val() ).toBe( '2013-03' );

            // should be listening to the input event
            fireEvent(elem, 'input');
            // need to make sure that firing the event updates the model value
            expect( model.k1 ).toBe( $(elem).val() );
        });

        it("should datetime-local be 2-way bound", function() {
            var elem = document.createElement('input');
            $(elem).attr('type', 'datetime-local');
            $(elem).attr('data-key', 'k1');
            elementsTestbed.append(elem);

            var model = {k1: "2013-04-10T01:02"};
            DataBind.bind(elem, model);
            expect( $(elem).val() ).toBe( model.k1 );

            model.k1 = "2013-04-10T01:02";
            expect( $(elem).val() ).toBe( "2013-04-10T01:02" );

            // browser enforces valid values!
            model.k1 = "2013-13-10T01:02";
            expect( $(elem).val() ).toBe( '' );

            $(elem).val("2013-04-10T01:03");
            // simulate as if the change was a user input
            // fireEvent(elem, 'change');
            // expect( $(elem).val() ).toBe( "2013-04-10T01:03" );

            // should be listening to the input event
            fireEvent(elem, 'input');
            // need to make sure that firing the event updates the model value
            expect( model.k1 ).toBe( $(elem).val() );
        });

        it("should date be 2-way bound", function() {
            var elem = document.createElement('input');
            $(elem).attr('type', 'date');
            $(elem).attr('data-key', 'k1');
            elementsTestbed.append(elem);

            var model = {k1: "2013-04-10"};
            DataBind.bind(elem, model);
            expect( $(elem).val() ).toBe( model.k1 );

            model.k1 = "2013-04-11";
            expect( $(elem).val() ).toBe( "2013-04-11" );

            // browser enforces valid values!
            model.k1 = "2013-13-11";
            expect( $(elem).val() ).toBe( '' );

            $(elem).val("2013-04-12");
            // simulate as if the change was a user input
            // fireEvent(elem, 'change');
            // expect( $(elem).val() ).toBe( "2013-04-12" );

            // should be listening to the input event
            fireEvent(elem, 'input');
            // need to make sure that firing the event updates the model value
            expect( model.k1 ).toBe( $(elem).val() );
        });

        it("should color be 2-way bound", function() {
            var elem = document.createElement('input');
            $(elem).attr('type', 'color');
            $(elem).attr('data-key', 'k1');
            elementsTestbed.append(elem);

            var model = {k1: "#000000"};
            DataBind.bind(elem, model);
            expect( elem.value ).toBe( "#000000" );

            model.k1 = "#000001";
            expect( $(elem).val() ).toBe( "#000001" );

            // browser enforces valid values!
            model.k1 = "#gggggg";
            expect( $(elem).val() ).toBe( '#000000' );

            $(elem).val("#000002");
            // simulate as if the change was a user input
            // fireEvent(elem, 'change');
            // expect( $(elem).val() ).toBe( "#000002" );

            // should be listening to the input event
            fireEvent(elem, 'input');
            // need to make sure that firing the event updates the model value
            expect( model.k1 ).toBe( $(elem).val() );
        });

        it("should password be 2-way bound", function() {
            var elem = document.createElement('input');
            $(elem).attr('type', 'password');
            $(elem).attr('data-key', 'k1');
            elementsTestbed.append(elem);

            var model = {k1: "abcd"};
            DataBind.bind(elem, model);
            expect( elem.value ).toBe( "abcd" );

            model.k1 = "efgh";
            expect( $(elem).val() ).toBe( "efgh" );

            $(elem).val("ijkl");
            // simulate as if the change was a user input
            fireEvent(elem, 'change');
            expect( $(elem).val() ).toBe( "ijkl" );
        });

    });

    describe("Test different input element types", function() {
        var elementsTestbed = $('#elements-testbed');

        it("should accept bare dom elements" ,function() {
            var model = {k1: 'value1'};
            var bareEl = document.createElement('div');
            bareEl.setAttribute('data-key', 'k1');
            bareEl.setAttribute('id', 'xxx');
            elementsTestbed.append(bareEl);

            DataBind.bind(bareEl, model);

            expect( $(bareEl).text() ).toBe( model.k1 );
            model.k1 = 'value1-mod';
            expect( $(bareEl).text() ).toBe( model.k1 );
        });

        it("should accept jquery wrapped dom elements" ,function() {
            var model = {k1: 'value1'};
            var jqEl = $('<div></div>').attr('id', 'xxx1').attr('data-key', 'k1');
            elementsTestbed.append(jqEl);

            DataBind.bind(jqEl, model);

            expect( $(jqEl).text() ).toBe( model.k1 );
            model.k1 = 'value1-mod';
            expect( $(jqEl).text() ).toBe( model.k1 );
        });
    });

    describe("Test binding works on nested elements", function() {
        var elementsTestbed = $('#elements-testbed');
        it("should bind a nested element via its parent", function() {
            var model = {k1: 'value1'};
            var childEl = $('<div></div>').attr('data-key', 'k1');
            var el = $('<div></div>').append(childEl);
            elementsTestbed.append(el);

            DataBind.bind(el, model);

            expect( $(childEl).text() ).toBe( model.k1 );
            model.k1 = 'value1-mod';
            expect( $(childEl).text() ).toBe( model.k1 );
        });

        it("should bind a nested element via its parent with multiple children", function() {
            var model = {k1: 'value1', k2: 'value2'};
            var childEl1 = $('<div></div>').attr('data-key', 'k1');
            var childEl2 = $('<div></div>').attr('data-key', 'k2');
            var el = $('<div></div>').append(childEl1);
            el.append(childEl2);
            elementsTestbed.append(el);

            DataBind.bind(el, model);

            expect( $(childEl1).text() ).toBe( model.k1 );
            expect( $(childEl2).text() ).toBe( model.k2 );
            model.k1 = 'value1-mod';
            model.k2 = 'value2-mod';
            expect( $(childEl1).text() ).toBe( model.k1 );
            expect( $(childEl2).text() ).toBe( model.k2 );

        });

        it("should bind a deeply nested element via its parent", function() {
            var model = {k1: 'value1'};
            var childEl = $('<div></div>').attr('data-key', 'k1');
            var midChildEl = $('<div></div>').append(childEl);
            var el = $('<div></div>').append(midChildEl);
            elementsTestbed.append(el);

            DataBind.bind(el, model);

            expect( $(childEl).text() ).toBe( model.k1 );
            model.k1 = 'value1-mod';
            expect( $(childEl).text() ).toBe( model.k1 );
        });
    });

    describe("Test binding works on keys with arrays", function() {
        var elementsTestbed = $('#elements-testbed');
        it("should bind to element inside array model", function() {
            var elem = document.createElement('input');
            $(elem).attr('type', 'text');
            $(elem).attr('data-key', 'k1[0].k2');
            elementsTestbed.append(elem);

            var model = {k1: [{k2: 'a'}, {k2: 'b'}]};
            DataBind.bind(elem, model);

            // test assignment to DOM from model
            expect( elem.value ).toBe( "a" );

            // test model change effects DOM
            model.k1[0].k2 = "c";
            expect( $(elem).val() ).toBe( "c" );

            // simulate as if the change was a user input
            $(elem).val("d");
            fireEvent(elem, 'input');
            expect( model.k1[0].k2).toBe( "d" );
        });

        it("should bind to element inside deep array model", function() {
            var elem = document.createElement('input');
            $(elem).attr('type', 'text');
            $(elem).attr('data-key', 'k1[1].k2[1].k3');
            elementsTestbed.append(elem);

            var model = {k1: [{k2: 'a'}, {k2: [{},{k3:'v'},{}] }]};
            DataBind.bind(elem, model);

            // test assignment to DOM from model
            expect( elem.value ).toBe( "v" );

            // test model change effects DOM
            model.k1[1].k2[1].k3 = "c";
            expect( $(elem).val() ).toBe( "c" );

            // simulate as if the change was a user input
            $(elem).val("d");
            fireEvent(elem, 'input');
            expect( model.k1[1].k2[1].k3).toBe( "d" );
        });

    });

    xdescribe("Test binding multiple times same el to same model does not affect", function() {
        var elementsTestbed = $('#elements-testbed');
        it("should once unbind no bindings exists", function() {
            var model = {k1: 'value1'};
            var el = $('<input/>').attr('data-key', 'k1').attr('type', 'text');
            elementsTestbed.append(el);

            DataBind.bind(el, model);
            DataBind.bind(el, model);
            DataBind.unbind(el, model);

            model.k1 = 'value1-new-val';
            expect( $(el).val() ).toBe( 'value1' );

            $(el).val('changed via elem.');
            // simulate as if the change was a user input
            fireEvent(el[0], 'input');
            expect( model.k1 ).toBe( 'value1-new-val' );
        });

        // re-attach
        // removes watches
    });

    describe("Test unbind detaches bindings", function() {
        // re-attach
        // removes watches
    });

    describe("Test binding configurable", function() {

    });

    describe("Test binding with nested key", function() {

    });

    describe("Test Watchable", function() {
        // dependant on config
        // watch
        // unwatch(fn)
        // unwatch()
        // add same fn twice does not fire it twice
    });


});
