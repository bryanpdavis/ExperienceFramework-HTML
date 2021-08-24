//Create hash of the mapping variables.
String.prototype.hashcode = function () {
    return (this.hashCode() + 2147483647) + 1;
};
var templateSignature = String(section + providerid + seriesid + programid).hashcode;
var Experience = Experience || {};

var DEBUG = false;

Experience.createNS = function (namespace) {
    'use strict';
    var nsparts = namespace.split(".");

    var parent = Experience;
    // we want to be able to include or exclude the root namespace so we strip
    // it if it's in the namespace
    if (nsparts[0] === "Experience") {
        nsparts = nsparts.slice(1);
    }

    // loop through the parts and create a nested namespace if necessary
    for (var i = 0; i < nsparts.length; i++) {
        var partname = nsparts[i];
        // check if the current parent already has the namespace declared
        // if it isn't, then create it
        if (typeof parent[partname] === "undefined") {
            parent[partname] = {};

        }

        // get a reference to the deepest element in the hierarchy so far
        parent = parent[partname];
    }

    // the parent is now constructed with empty namespaces and can be used.
    // we return the outermost namespace
    return parent;
};

Experience.createNS("Experience.Controls");
Experience.createNS("Experience.Configuration");
Experience.createNS("Experience.Styles");
Experience.createNS("Experience.Page")

Experience.Page = (function Page() {
    var _moduleControls;
    var _instance;
    var _controls = [];

    function init() {

        //private methods and variables go here.
        function _append(e) {
            $.each(e, function (index, control) {
                _controls.push(control);
            });
        }
        return {
            Controls: _controls,
            AddControl: function(control){
                    _controls.push(control);
                    return _controls.length;
            },
            Clear: function ()
            {
                _controls = [];
            }
            
            /* Public methods and variables go here.
            */
        };
    }

    return {
        // Get the Singleton instance if one exists
        // or create one if it doesn't
        getInstance: function () {

            if (!_instance) {
                _instance = init();
            }
            return _instance;
        }
    };
})();

Experience.Page.Controls = Experience.Page.getInstance().Controls;



//Find experience controls in the page and create the references in the PageControls object
$("div[exp-type]").each(function (i, e) {
    //alert($(e).attr("id"));
    var moduletype = $(e).attr("exp-type");

    
});