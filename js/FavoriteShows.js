var Functions = {
    "dataFunction": function (d)
    {
        var livePrograms = [];
        if (user.subscription > 0)
        {
            items.limit = 25;
        }
    },
    "rowFunction": function (r, d, v, p)
    {
        var row = r;
        var data = d;
        var variables = v;
        var page = p;

        console.log(JSON.stringify(r));
    }
}