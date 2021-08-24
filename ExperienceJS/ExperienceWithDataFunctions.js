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
    this.ID = id;
};

Experience.Controls.PageTemplate = function PageTemplate(templateConfig) {
    //Process the template
   var _controls = [];
   if (templateConfig)
   {
       this.SectionID = templateConfig.SectionID;
       this.ShowMainMenu = templateConfig.ShowMainMenu;
       this.ShowSearchMenu = templateConfig.ShowSearchMenu;

       _render(templateConfig);
   }

   function _render(template)
   {
        $.each(template.Modules, function (index, config)
        {
            var ID = config.ID;
            var tmp = new Experience.Controls[config.Type](config.ID);
            tmp.RenderComplete = BindActions;
            tmp.PopulateData = PopulateData;
            tmp.Init = Init;
            tmp.Init(config);
            tmp.InitTemplate();
            tmp.PreRender();
        });
   };

   return {
    Render: _render,
    Controls: _controls,
    SectionID: this.SectionID,
    ShowMainMenu: this.ShowMainMenu,
    ShowSearchMenu: this.ShowSearchMenu
   }
}

function ExecuteAction(action, value) {
    switch(action) {
        case "nav":
            $.getJSON("configs/"+value+".json", function (data)
                {
                    Experience.Page.getInstance().Clear();
                    $("#Modules").empty();
                    console.log("PageTemplate Initializing");
                    Page = new Experience.Controls.PageTemplate(data.Template);
                    console.log("PageTemplate Initialized");
                }).error(function (e)
                {
                    alert(e);
                });
        break;
        case "url":

        break;
    }
}

BindActions = function(ID) {
    $("#" + ID + " a[exp-action]").click(function (e)
    {
        var re = /(nav|url)\('(.*)'\)/;
        var m;
        var actionValue = $(this).attr("exp-action");
        var action = actionValue.match(re)[1];
        var value = actionValue.match(re)[2];
        ExecuteAction(action, value);
        console.log("Executing action:" + action + " with value:" + value);
    });
}

PopulateData = function(renderedModule) {
    var re = /{ex:([A-Za-z\.]+)}/gm;
    var previousMatches = [];
    $.each(renderedModule.match(re), $.proxy(function (index, match)
    {
        var field = match.replace("{ex:", "").replace("}", "");
        if(previousMatches[field]) {
            return;
        }
        var result = this[field];
        if (result !== undefined && result)
        {
            renderedModule = renderedModule.replace(match, result);
        }
        else
        {
            renderedModule = renderedModule.replace(match, "");
        }
        previousMatches[field] = true;
    }, this));
    return renderedModule;
}

Init = function(fields)
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

Experience.Controls.List = function List(id) {
    Experience.Controls.Module.apply(this, arguments);
    var moduleTemplate, headerTemplate, listTemplate, listItemTemplate, wrappedList, renderedModule;
    //var parentInit = this.Init;
    this.InitTemplate = function ()
    {
        this._p = [];
        moduleTemplate = '<div id="{ex:ID}" class="Module" exp-type="List"><header> \
                        <div>{ex:Title}</div> \
                        <a href="#">{ex:More}</a> \
                    </header> \
                    <div class="clearfix"></div>{Module.Controls}</div>';
        headerTemplate = '\
                    ';
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
    }

    this.PreRender = function ()
    {
        console.log("------------ new Experience.Controls." + this.Type + "(" + this.ID + ")--------");

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
                    var listItem = listItemTemplate;
                    //Collect Data
                    var data = {}, row = {}, variables = {}, page = {};
                    if(this.dataFunction) {
                        $.each(listItemTemplate.match(re), $.proxy(function (index, match)
                        {
                            var fieldName = match.replace("{ex:", "").replace("}", "");
                            var path = this[fieldName];
                            if (path !== undefined)
                            {
                                data[fieldName.replace("Items.", "")] = JSON.search(e, path, true)[0];
                                row[fieldName.replace("Items.", "")] = "";
                                page = Page;

                                $.getScript(this.dataFunction, $.proxy(function (data)
                                {
                                    var func = JSONfn.parse(data);
                                    var blah = " blah";

                                },this));
                            }
                            else
                            {
                                listItem = listItem.replace(match, "");
                            }
                        }, this));
                    }

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
                renderedModule = moduleTemplate.replace("{Module.Controls}", wrappedList);
                this.Render(renderedModule);
            }, this)
        });
        return true;
    }

    this.Render = function(renderedModule) {
        renderedModule = this.PopulateData(renderedModule);
        $("#Modules").append(renderedModule);
        Experience.Page.getInstance().AddControl(this);
        this.RenderComplete(this.ID);
    }

    return this;
}

Experience.Controls.Table = function Table(id)
{
    //Experience.Controls.Module.apply(this, arguments);
    var moduleTemplate, headerTemplate, listTemplate, listItemTemplate, renderedModule, wrappedList;
    //var parentInit = this.Init;
    this.InitTemplate = function ()
    {
        this._p = [];
        moduleTemplate = '<div id="{ex:ID}" class="Module" exp-type="List">{Module.Header}{Module.Controls}</div>';
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
    }

    this.PreRender = function ()
    {
        console.log("------------ new Experience.Controls." + this.Type + "(" + this.ID + ")--------");

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

                wrappedList = listTemplate.replace("{Module.ListItem}", listItems);
                var re = /{ex:([A-Za-z\.]+)}/gm;
                var m;
                renderedModule = moduleTemplate.replace("{Module.Header}", headerTemplate).replace("{Module.Controls}", wrappedList);
                this.Render(renderedModule);
            }, this)
        });
        
        return true;
    }

    this.Render = function(renderedModule) {
        renderedModule = this.PopulateData(renderedModule);
        $("#Modules").append(renderedModule);
        Experience.Page.getInstance().AddControl(this);
        this.RenderComplete(this.ID);
    }

    return this;
}

Experience.Controls.SearchBar = function SearchBar(id) {

    var moduleTemplate, renderedModule;
    this.InitTemplate = function ()
    {
        moduleTemplate = '<div id="{ex:ID}" class="Module">\
                <!--<img class="moduleMockup" src="img/01-SearchBar.jpg" />-->\
                <div class="moduleControls">\
                    <div class="SearchMenuWrapper">\
                        <div id="guideWrapper">\
                            <a href="#">GUIDE</a>\
                        </div>\
                        <div id="searchWrapper">\
                            <div id="searchWrapperInner">\
                                <span class="searchIconLeft"></span>\
                                <input type="search" placeholder="Search" />\
                                <a href="#" class="searchIconRight"></a>\
                            </div>\
                        </div>\
                        <div id="settingsWrapper">\
                            <a href="#"></a>\
                        </div>\
                    </div>\
                </div>\
            </div>';
    }

    this.PreRender = function() {
        var renderedModule = moduleTemplate;
        this.Render(renderedModule);
    }

    this.Render = function(renderedModule) {
        renderedModule = this.PopulateData(moduleTemplate);
        $("#Modules").append(renderedModule);
        this.RenderComplete(this.ID);
    }
    return this;
}

Experience.Controls.MainMenu = function MainMenu(id) {

    var moduleTemplate, menuItemTemplate, renderedModule;
    
    this.InitTemplate = function ()
    {
        moduleTemplate = '<div id="{ex:ID}" exp-type="MainMenu" exp-data="data/shows.json">\
                <div class="moduleControls">\
                    <div id="menuWrapper">\
                    {Module.MenuItems}\
                    </div>\
                </div>\
            </div>';
        menuItemTemplate = '<a class="MenuItem {page:SectionSelected}" href="#" exp-action="nav(\'{ex:Items.Link}\')" exp-sectionid="{ex:Items.Link}">{ex:Items.Title}</a>';
    }

    this.PreRender = function ()
    {
        console.log("------------ new Experience.Controls." + this.Type + "(" + this.ID + ")--------");

        //Build the variables....
        //Iterate through values and replace identifiers in the template.

        var listItems = [];
        //Process Data
        $.ajax({
            type: "GET",
            url: this.Data,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: $.proxy(function (data)
            {
                root = JSON.search(data, this['Items.Root'], false);
                $.each(root, $.proxy(function (i, e)
                {
                    var re = /{ex:([A-Za-z\.]+)}/gm;
                    var m;
                    var listItem = menuItemTemplate;
                    $.each(menuItemTemplate.match(re), $.proxy(function (index, match)
                    {
                        var path = this[match.replace("{ex:", "").replace("}", "")];
                        if (path !== undefined)
                        {
                            try {
                                var result = JSON.search(e, path, true);
                                }
                               catch(ex) {
                                   //ignore missing field and replace with empty.
                                   result = "";
                               }
                            listItem = listItem.replace(match, result);
                        }
                        else
                        {
                            listItem = listItem.replace(match, "");
                        }
                    }, this));
                    listItems.push(listItem);
                }, this));

                renderedModule = moduleTemplate.replace("{Module.MenuItems}", listItems.join(""));
                this.Render(renderedModule);

            }, this)
        });
    }

    this.Render = function() {
        renderedModule = this.PopulateData(renderedModule);
        $("#Modules").append(renderedModule);
        //Set the selected section
        $("#" + this.ID + " a[exp-sectionid='"+Page.SectionID + "']").addClass("selected");
        //If ShowMainMenu == false, hide the module
        if(!Page.ShowMainMenu) {
            $("#" + this.ID).addClass("hide");
        }
        Experience.Page.getInstance().AddControl(this);
        this.RenderComplete(this.ID);
    }

    return this;
}

Experience.Controls.Video = function Video(id) { }

Experience.Controls.BannerAd = function BannerAd(id) { }

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

