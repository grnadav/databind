# DataBind.js 0.3.1 [Download](https://github.com/grnadav/databind/archive/master.zip)

## About

DataBind is a 2-way data binding library.  
It lets you easily bind a DOM element (and optionally its subtree) to a Model (Object) and keep them at sync.  
At 3039 bytes minified & gzipped, it is the smallest 2-way binding library available to date!

### Dependencies
Non what so ever!  
~~It's only dependency is [Watch.JS](https://github.com/melanke/Watch.JS)~~ not needed since 0.1.1 internalized the library

##Compatible with all serious browsers :P
Works with: IE 9+, FF 4+, SF 5+, WebKit, CH 7+, OP 12+

#### HTML Script TAG
```html
<script src="DataBind.js" type="text/javascript"></script>
<!-- DataBind will be global variable window.DataBind -->
```

#### RequireJS
```javascript
require("DataBind", function(DataBind){
    var bind = DataBind.bind;
    var unbind = DataBind.unbind;
});
```

# Examples

## Live Demo!
On CodePen.io - [here](http://codepen.io/grnadav/pen/ptJKg)

```html
<textarea   data-key="k1" id="id1" rows="5" cols="30"></textarea>
```

```javascript
var model = {
    k1: 'Some text'
};
DataBind.bind( document.getElementById('id1'), model );
```

## Allow deep key bindings
```html
<textarea   data-key="k1.x" id="id1" rows="5" cols="30"></textarea>
```

```javascript
var model = {
    k1: {
        x: 'Some text'
    }
};
DataBind.bind( document.getElementById('id1'), model );
```

## Allow binding to jQuery elements
```html
<textarea   data-key="k1" id="id1" rows="5" cols="30"></textarea>
```

```javascript
var model = {
    k1:  'Some text'
};
DataBind.bind( $('#id1'), model );
```

## Allow binding of entire subtree (by default)
```html
<div id="id1">
    <div>
        <textarea data-key="k1" rows="5" cols="30"></textarea>    
    </div>
    <div data-key="k2" ></div>
</div>
```

```javascript
var model = {
    k1:  'Some text',
    k2:  'Some Div'
};
DataBind.bind( $('#id1'), model );
```

## Confiureable binding
```html
<textarea   data-key="k1" id="id1" rows="5" cols="30"></textarea>
```

```javascript
var model = {
    k1: 'Some text'
};
DataBind.bind( document.getElementById('id1'), model, {
    dom: true, // bind dom to model changes
    model: true, // bind model to dom changes
    children: true // bind entire element's tree
} );
```

## Unbind whenever you want, whatever you want
```html
<textarea   data-key="k1" id="id1" rows="5" cols="30"></textarea>
```

```javascript
var model = {
    k1: 'Some text'
};
DataBind.unbind( document.getElementById('id1'), model, {
    dom: true, // unbind dom to model changes - does not have to be same as given to 'bind'
    model: true, // unbind model to dom changes  - does not have to be same as given to 'bind'
    children: true // unbind entire element's tree  - does not have to be same as given to 'bind'
} );
```

## bind returns a Watchable
```html
<textarea   data-key="k1" id="id1" rows="5" cols="30"></textarea>
```

```javascript
var model = {
    k1: 'Some text'
};
var watchable = DataBind.bind( document.getElementById('id1'), model);
var printer = function(ev) {
    console.log('#' + this.id + 
                ' ev:' + ev.type + 
                ' old val:' + ev.data.oldValue +
                ' new val:' + ev.data.newValue +
                ' key:' + ev.data.key);
};
watchable.watch( printer );
// later on...
watchable.unwatch( printer );
// or remove all watchers
watchable.unwatch();
```

# Coming up!
Plans for future release includes:
* Remove unused code from intercorporated watch.js code
* Automate build and minification process
* Improve demo to enable editing the model and displaying the logs visually
* More browsers support (IE8, IE7? IE6?!)
* Other things you request :)
 
# Contributing
If you wish to help with improving this library, feel free to fork and pull-request
