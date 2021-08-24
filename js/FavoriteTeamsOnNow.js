var rowFunction = function (r, d, v, p)
{
    item.favoriteAction = "data/setFavorites.json?id={device.guid|acct.guid}&name=FavoriteTeams&app=Home&seriesid=" + r.teamId;

    if (r.airTime > Date.now)
    {
        items.subtitle = 'Premiere\'s tonight at {airtime}, on $data/Shows/Show[\'network\']';
    }
    if (user.subscription > 0)
    {
        items.limit = 25;
    }
}