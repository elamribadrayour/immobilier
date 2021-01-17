import { LatLngTuple } from 'leaflet';


interface Point 
{
  country: string,
  district: string,
  locality: string,
  address: string,
  price : number,
  surface : number,
  coordinates: LatLngTuple
}

export default Point;