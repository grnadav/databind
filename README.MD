# DataBind.js 0.1.0 [Download](https://github.com/grnadav/databind/archive/master.zip)

## About

DataBind is a 2-way data binding library.
It lets you easily bind a DOM element (and optionally its subtree) to a Model (Object).

### Dependencies
It's only dependency is [Watch.JS](https://github.com/melanke/Watch.JS)


##Compatible with all serious browsers :P
Works with: IE 9+, FF 4+, SF 5+, WebKit, CH 7+, OP 12+

#### HTML Script TAG
```html
<script src="DataBind.js" type="text/javascript"></script>
<!-- watch will be global variable window.DataBind -->
```

#### RequireJS
```javascript
require("DataBind", function(DataBind){
    var bind = DataBind.bind;
    var unbind = DataBind.unbind;
});
```
