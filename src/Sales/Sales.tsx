

export const filterSales = (sales, priceMin : number, priceMax : number, surfaceMin : number, surfaceMax : number) =>
{
    sales.forEach((item, i) => 
    {
        item.id = (i + 1).toString();
    });

    return (
    sales.filter( node => node.valeur_fonciere >= priceMin && node.valeur_fonciere <= priceMax 
        && node.surface_terrain >= surfaceMin && node.surface_terrain <= surfaceMax)
    );
}