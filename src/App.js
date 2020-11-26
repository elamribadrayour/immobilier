import './App.css';
import React from 'react';



import Input from './Input';
import {filterSales} from './Sales';
import {useSemiPersistentState} from './States';
import Zipcodes, {formatZipcodes, parseInputZipcodes} from './Zipcodes';

import {MapContainer, TileLayer, Marker, Popup} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from "leaflet";
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

let DefaultIcon = L.icon(
    {
      ...L.Icon.Default.prototype.options,
      iconUrl: icon,
      iconRetinaUrl: iconRetina,
      shadowUrl: iconShadow
    });

L.Marker.prototype.options.icon = DefaultIcon;



const App = () => 
{
  const [zipCode, setZipCode] = useSemiPersistentState('zipCode', '13007');
  const [isLoadingZipCodes, setIsLoadingZipCodes] = React.useState(true);
  const [zipCodes, setZipCodes] = React.useState([]);

  const [priceMin, setPriceMin] = useSemiPersistentState('priceMin', '0');
  const [priceMax, setPriceMax] = useSemiPersistentState('priceMax', '1');

  const [surfaceMin, setSurfaceMin] = useSemiPersistentState('surfaceMin', '0');
  const [surfaceMax, setSurfaceMax] = useSemiPersistentState('surfaceMax', '0');

  const [latitude, setLatitude] = useSemiPersistentState('latitude', 43.296482);
  const [longitude, setLongitude] = useSemiPersistentState('longitude', 5.36978);

  const [geographicalInfo, setGeographicalInfo] = useSemiPersistentState('longitudes', []);

  const [sales, setSales] = useSemiPersistentState('sales', []);
  const [isLoadingSales, setIsLoadingSales] = React.useState(true);

  const [url, setUrl] = useSemiPersistentState('url', 'http://api.cquest.org/dvf?code_postal=13007');

  React.useEffect(() => 
  {
      setIsLoadingZipCodes(true);
      fetch("./Zipcodes.csv")
      .then(response => response.text())
      .then(text => 
      {
          setZipCodes(parseInputZipcodes(text));
          setIsLoadingZipCodes(false);
      })
  }, []);

  React.useEffect(() => 
  {
    setIsLoadingSales(true);
    fetch(`${url}`)
      .then(response => response.json())
      .then(output => 
      {
        setSales(output.resultats);
        setGeographicalInfo(filterSales(sales, priceMin, priceMax, surfaceMin, surfaceMax));
        setIsLoadingSales(false);
      });
  }, [url, setSales]);

  const onZipCodeChanged = (event) => 
  {
    const row = zipCodes.data.filter(item => item[1] === event.target.value);
    const values = row[0][5].split(',');
    const tmp_latitude = parseFloat(values[0].trim());
    const tmp_longitude = parseFloat(values[1].trim());
    const zipcode = row[0][2];
    
    setZipCode(zipcode);
    setLatitude(tmp_latitude);
    setLongitude(tmp_longitude);
    setUrl(`http://api.cquest.org/dvf?code_postal=${zipCode.toString()}`);

    console.log("out");
    console.log(latitude, longitude)
  }

  const onPriceMinChanged = (event) =>
  {
    setPriceMin(event.target.value)
    setGeographicalInfo(filterSales(sales, priceMin, priceMax, surfaceMin, surfaceMax));
  }

  const onPriceMaxChanged = (event) =>
  {
    setPriceMax(event.target.value)
    setGeographicalInfo(filterSales(sales, priceMin, priceMax, surfaceMin, surfaceMax));
  }

  const onSurfaceMinChanged = (event) =>
  {
    setSurfaceMin(event.target.value)
    setGeographicalInfo(filterSales(sales, priceMin, priceMax, surfaceMin, surfaceMax));
  }

  const onSurfaceMaxChanged = (event) =>
  {
    setSurfaceMax(event.target.value)
    setGeographicalInfo(filterSales(sales, priceMin, priceMax, surfaceMin, surfaceMax));
  }

  return (
    <>
      <div>
        {
          isLoadingZipCodes ?
          (<p>Loading zipcodes ...</p>) :
          (<Zipcodes data = {formatZipcodes(zipCodes)}  onChange = {onZipCodeChanged}/>)
        }
        <Input id="priceMin" label="Price Min : " type="number" value={priceMin} unit="€" onChange={onPriceMinChanged}/>
        <Input id="priceMax" label="Price Max : " type="int" value={priceMax} unit="€" onChange={onPriceMaxChanged}/>
        <Input id="surfaceMin" label="Surface Min : " type="number" value={surfaceMin} unit="m2" onChange={onSurfaceMinChanged}/>
        <Input id="surfaceMax" label="Surface Max : " type="number" value={surfaceMax} unit="m2" onChange={onSurfaceMaxChanged}/>
      </div>
      <MapContainer center={[latitude, longitude]} zoom={13} scrollWheelZoom={false}>
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
      </MapContainer>,
    </>
  );
}

export default App;

/**
 *           {
            !isLoadingSales &&
            geographicalInfo.map(item => <Marker position={[item.lat, item.lon]}><Popup>{item.numero_voie} {item.type_voie} {item.voie}</Popup></Marker>)
          }
 */