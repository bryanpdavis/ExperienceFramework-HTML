var dataFunction = function(d) { 
    var livePrograms = [];
    scheduleMetadata.Shows.each(function (e, d)
    {
        if((e.airTime > Date.now) && (e.endTime < Date.now))
        {
            livePrograms[e.programId] = e;
        }
    });

    if (livePrograms.length > 0)
    {
        //We have live content in the list.
        Video.Tune(livePrograms[0].programId);
    }
}

var rowFunction = function (r)
{
    if (airTime > Date.now)
    {
        items.subtitle = 'Premiere\'s tonight at {airtime}, on $data/Shows/Show[\'network\']';
    }
    if (user.subscription > 0)
    {
        items.limit = 25;
    }
}