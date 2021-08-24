var dataFunction = function(e) { 
    if ((e.airTime > Date.now) && (e.endTime < Date.now))
    {
        Video.ShowLiveIndicator = true;
        //Length of the Program
        var seconds = e.endTime - e.airTime;
        var elapsedSecs = e.bookmarkTime - e.airTime;
        var percentageComplete = round((elapsedSecs / seconds) * 100);
        item.percentageComplete = percentageComplete;
        items.subtitle = 'LIVE';

        //Read manifest for advertising breaks, render.
        if (user.subscription > 0 && e.subscriptionId)
        {
            items.limit = 25;
        }
        if (favoriteSeries.Contains(e.seriesId))
        {
            Video.isFavorite = true;
        }
    }
}