var dataFunction = function(d) { 
    var livePrograms = [];
    liveSeriesShows.Shows.each(function (e, d)
    {
        if((e.airTime > Date.now) && (e.endTime < Date.now))
        {
            livePrograms[e.programId] = e;
        }
    }); 
}

var rowFunction = function (r)
{
    if ((e.airTime > Date.now) && (e.endTime < Date.now))
    {
        //Length of the Program
        var seconds = e.endTime - e.airTime;
        var elapsedSecs = e.bookmarkTime - e.airTime;
        var percentageComplete = round((elapsedSecs / seconds) * 100);
        item.percentageComplete = percentageComplete;
        items.subtitle = 'LIVE';
    }
    if (user.subscription > 0)
    {
        items.limit = 25;
    }
}