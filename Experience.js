Experience.Configuration.Module = (function Module() {
    var _moduleControls;
    var _instance;

    function init(modules) {
        _moduleControls = modules;
        //Generate Base Module Properties
        var baseModuleConfig = GetConfigurationByName(modules, "Module");
        if ((!baseModuleConfig.Config.Properties) || (baseModuleConfig.Config.Properties.length > 0)) {
            $.each(baseModuleConfig.Config.Properties, function (i, property) {
                switch(property.type) {
                    case "String":
                        Object.defineProperty(Experience.Controls.Module.prototype, property.key, {
                            configurable: property.configurable,
                            value: property.value,
                            enumerable: property.enumerable,
                            writable: property.writable
                            /*get: function () {
                                if(!this._p[property.key]) {
                                    this._p[property.key] = property.value;
                                }
                                return this._p[property.key];
                            },
                            set: function (value) {
                                this._p[property.key] = value;
                                //Use the selector to set the value in the page.
                            }*/
                        }); 
                    break;
                }
                //Need a switch case to make different getters and setters based on type.
            });
        };

        $.each(modules, function (index, config) {
            if (baseModuleConfig.Index != index) {
                Experience.Controls[config.Name].prototype = new Experience.Controls.Module();
                $.each(config.Properties, function (i, property) {
                    switch(property.type) {
                        case "String":
                            Object.defineProperty(Experience.Controls[config.Name].prototype, property.key, {
                                configurable: property.configurable,
                                value: property.value,
                                enumerable: property.enumerable,
                                writable: property.writable
                                /*get: function () {
                                    if(!this._p[property.key]) {
                                        this._p[property.key] = property.value;
                                    }
                                    return this._p[property.key];
                                },
                                set: function (value) {
                                    this._p[property.key] = value;
                                    //Use the selector to set the value in the page.
                                }*/
                            });
                        break;
                    }
                });
                Experience.Controls[config.Name].constructor = Experience.Controls[config.Name];
                var blah = "blah";
            };
        });
        //private methods and variables go here.
        return {
            /* Public methods and variables go here.
            */
        };
    }
    return {

        // Get the Singleton instance if one exists
        // or create one if it doesn't
        Init: function (modules) {

            if (!_instance) {
                _instance = init(modules);
            }

            return _instance;
        }
    };
})();

Experience.Configuration.Template = function Template(controls) {
    var _templateControls = controls;

    $(function () {
        Experience.Controls.Template.Init();
    })
    return {
        Controls : _templateControls
    };
};

Experience.Configuration.Component = function Component(controls) {
    var _componentControls = controls;

    $(function () {
        Experience.Controls.Component.Init();
    })
    return {
        Controls : _componentControls
    };
};

function GetConfigurationByName(obj, value) {
    var returnConfig;
    $.each(obj, function (index, config) {
        if (config.Name == value) {
            returnConfig = { 
            "Config" : config,
            "Index" : index};
            return;
        }
    });
    return returnConfig;
};

Experience.Controls.Module = function Module(id) {

};

Experience.Controls.PageTemplate = function PageTemplate(templateConfig) {
    //Process the template
   var _controls = [];
    if (templateConfig)
    {
        _render(templateConfig);
    }

    function _render(template)
    {
        $.each(template.Modules, function (index, config)
        {
            var ID = config.ID;
            var tmp = new Experience.Controls[config.Type](config.ID);
            tmp.Init(config);
            tmp.Render();
        });
    };

    return {
        Render: _render,
        Controls: _controls
    }
}

Experience.Controls.List = function List(id) {
    //Experience.Controls.Module.apply(this, arguments);

    //var parentInit = this.Init;

    this._p = [];
    moduleTemplate = '<div id="ListTemplate" class="Module" exp-type="List">{Module.Header}{Module.Controls}</div>';
    headerTemplate = '\
                <header> \
                    <div>{ex:Title}</div> \
                    <a href="#">{ex:More}</a> \
                </header> \
                <div class="clearfix"></div>';
    listTemplate = '\
                    <div class="List"> \
                        <ul class="HorizontalList"> \
                            {Module.ListItem}\
                        </ul>\
                    </div>';
    listItemTemplate = '\
                <li class="item"> \
                    <div class="PosterItemImage" style="background-image: url({ex:Items.Thumbnail}); background-repeat:no-repeat; background-size:cover;"> \
                        <span><a class="FavoriteEmpty" href="#"></a></span>\
                        <span><a class="PlayIcon" href="#"></a></span>\
                    </div>\
                    <div class="info_container">\
                        <span>{ex:Items.Title}</span>\
                        <a class="GetInfoIcon" href="#"></a>\
                    </div>\
                    <div class="details_container">\
                        <span>{ex:Items.Subtitle}</span>\
                            <br />\
                        <span>{ex:Items.Info}</span>\
                    </div>\
                </li>';
    if (this.Direction == "Vertical")
    {
        listTemplate = '\
                    <div class="List"> \
                        <ul class="VerticalList">\
                            {Module.ListItem}\
                        </ul>\
                    </div>';

        listItemTemplate = '\
                    <li class="Item">\
                        <div class="ItemWrapper">\
                            <div class="ThumbWrapperCircle">\
                                <span><a class="FavoriteEmpty" href="#"></a></span>\
                                <img class="Thumb" src="{ex:Items.Thumbnail}" />\
                            </div>\
                            <div class="InfoWrapper">\
                                <div class="info_container">\
                                    <span>{ex:Items.Title}</span>\
                                    <a class="GetInfoIcon" href="#"></a>\
                                </div>\
                                <div class="details_container">\
                                    <span>{ex:Items.Subtitle}</span>\
                                    <br />\
                                    <span>{ex:Items.Info}</span>\
                                </div>\
                            </div>\
                        </div>\
                    </li>';
    }

    this.Render = function ()
    {
        //console.log("------------ new Experience.Controls." + this.Type + "(" + this.ID + ")--------");

        //Build the variables....
        //Iterate through values and replace identifiers in the template.

        var listItems = "";
        //Process Data
        $.ajax({
            type: "GET",
            url: this.Data,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: $.proxy(function (data)
            {
                root = JSON.search(data, this['Items.Root'], false);
                listItems = [];

                $.each(root, $.proxy(function (i, e)
                {
                    var re = /{ex:([A-Za-z\.]+)}/gm;
                    var m;
                    var listItem = listItemTemplate;
                    $.each(listItemTemplate.match(re), $.proxy(function (index, match)
                    {
                        var path = this[match.replace("{ex:", "").replace("}", "")];
                        if (path !== undefined)
                        {
                            var result = JSON.search(e, path, true);
                            listItem = listItem.replace(match, result);
                        }
                        else
                        {
                            listItem = listItem.replace(match, "");
                        }
                    }, this));
                    listItems.push(listItem);
                }, this));

              var wrappedList = listTemplate.replace("{Module.ListItem}", listItems.join(""));
              var re = /{ex:([A-Za-z\.]+)}/gm;
              var m;
              var header = headerTemplate;
              $.each(headerTemplate.match(re), $.proxy(function (index, match)
              {
                  var result = this[match.replace("{ex:", "").replace("}", "")];
                  if (result !== undefined && result)
                  {
                      header = header.replace(match, result);
                  }
                  else
                  {
                      header = header.replace(match, "");
                  }
              }, this));
             
              $("#Modules").append(moduleTemplate.replace("{Module.Header}", header).replace("{Module.Controls}", wrappedList));
              Experience.Page.getInstance().AddControl(this);

            }, this)
        });
    }
    this.Init = function(fields)
    {
        //parentInit.call(this);
        if (fields)
        {
            for(var property in this.__proto__) {
                if (typeof(fields[property]) !== "undefined" && fields[property])
                {
                    this[property] = fields[property];
                }
            }
        }
    }

    return this;
}

Experience.Controls.Table = function Table(id)
{
    //Experience.Controls.Module.apply(this, arguments);

    //var parentInit = this.Init;

    this._p = [];
    tablemoduleTemplate = '<div id="TableTemplate" class="Module" exp-type="Table">{Module.Header}{Module.Controls}</div>';

    cnbcheaderTemplate = '\
                <header class="CNBCHeader"> \
                    <div></div> \
                    <a href="#">{ex:More}</a> \
                </header>';


    TableTemplate = '\
                <table id="MyStocksListTable" class="StocksTable"> \
                </table>';

    TableColumnTemplate = '\
                   <tr class="ListHeading"> \
                          <th>{var:}</th> \
                   </tr>';
  
    TableCellTemplate = '\
                <td><div class="StockSymbol">AERI</div><div class="CompanyName" data-stockname="StockName">Aerie Pharmaceuticals Inc</div></td> \
                    ';



    this.Render = function ()
    {
        console.log("------------ new Experience.Controls." + this.Type + "(" + this.ID + ")--------");

        //Build the variables....
        //Iterate through values and replace identifiers in the template.

        var tableItems = "";

        
        //Process Data
        $.ajax({
            type: "GET",
            url: this.Data,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: $.proxy(function (data)
            {
                
                
                root = JSON.search(data, this['Items.Root'], false);



                tableItems = [];

                console.log(tableItems);



                console.log('@@@@@@@@@@@@@@@@@@@@@@');
                console.log(this['ID']);
                console.log(this['Type']);
                console.log(this['Columns']);
                console.log('@@@@@@@@@@@@@@@@@@@@@@');

               $.each(root, $.proxy(function (i, e)
               {

                   


                   var re = /{ex:([A-Za-z\.]+)}/gm;
                   var m;
                   var tableItem = TableCellTemplate;

                   


                   $.each(TableCellTemplate.match(re), $.proxy(function (index, match)
                   {
                       var path = this[match.replace("{var:", "").replace("}", "")];
                       if (path !== undefined)
                       {
                           var result = JSON.search(e, path, true);
                           tableItem = tableItem.replace(match, result);
                       }
                       else
                       {
                           tableItem = tableItem.replace(match, "");
                       }
                   }, this));
                   tableItems.push(tableItem);

               }, this));



                var tableTemplateReplace = TableTemplate.replace("{Module.TableItem}", tableItems);
                var re = /{ex:([A-Za-z\.]+)}/gm;
                var m;
                var header = cnbcheaderTemplate;
                $.each(cnbcheaderTemplate.match(re), $.proxy(function (index, match)
                {
                    var result = this[match.replace("{var:", "").replace("}", "")];
                    if (result !== undefined && result)
                    {
                        header = header.replace(match, result);
                    }
                    else
                    {
                        header = header.replace(match, "");
                    }
                }, this));

                console.log('?????????????????????????');
                console.log(tablemoduleTemplate);
                console.log(tableTemplateReplace);
                console.log('?????????????????????????');

                $("#Modules").append(tablemoduleTemplate.replace("{Module.Header}", header).replace("{Module.Controls}", tableTemplateReplace));
                Experience.Page.getInstance().AddControl(this);

            }, this)
        });
    }
    this.Init = function(fields)
    {
        //parentInit.call(this);
        if (fields)
        {
            for(var property in this.__proto__) {
                if (typeof(fields[property]) !== "undefined" && fields[property])
                {
                    this[property] = fields[property];
                }
            }
        }
    }

    return this;
}

$.fn.xpathEvaluate = function (xpathExpression)
{
    // NOTE: vars not declared local for debug purposes
    $this = this.first(); // Don't make me deal with multiples before coffee

    // Evaluate xpath and retrieve matching nodes
    xpathResult = this[0].evaluate(xpathExpression, this[0], null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);

    result = [];
    while (elem = xpathResult.iterateNext())
    {
        result.push(elem);
    }

    $result = jQuery([]).pushStack(result);
    return $result;
}

Experience.Controls.SearchBar = function SearchBar(id) {}

Experience.Controls.MainMenu = function MainMenu(id) {}

Experience.Controls.Video = function Video(id) { }

Experience.Controls.BannerAd = function BannerAd(id) { }

