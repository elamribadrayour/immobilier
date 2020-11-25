import './App.css';
import React from 'react';

// import { AgGridColumn, AgGridReact } from 'ag-grid-react';
// import 'ag-grid-community/dist/styles/ag-grid.css';
// import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

import Papa from "papaparse";
import Map from 'pigeon-maps';
import Marker from "pigeon-marker";

import Input from './Input';
import Title from './Title';
import Zipcodes from './Zipcodes';
// import TilerMap from './TilerMap';

const useSemiPersistentState = (key, initialState) =>
{
  const [value, setValue] = React.useState(initialState);
  React.useEffect(() => { localStorage.setItem(key, value); }, [value, key]);    
  return [value, setValue];
}

const filteredSales = (sales, priceMin, priceMax) =>
{
  sales.forEach((item, i) => 
  {
    item.id = (i + 1).toString();
  });

  var output = sales.filter( node => node.valeur_fonciere >= priceMin && node.valeur_fonciere < priceMax);
  output.sort(function(a, b) 
  {
    return a.valeur_fonciere - b.valeur_fonciere;
  })

  return output;
}

const ParseInput = (text) => 
{
    var output = Papa.parse(text);
    output.data.sort(function(a, b) 
    {
      return a[2] - b[2];
    })

    var obj = {};

    for ( var i=0, len=output.data.length; i < len; i++ )
        obj[output.data[i][0]] = output.data[i];
    
    output.data = [];
    for ( var key in obj )
      output.data.push(obj[key]);

    return output;
}

const Data = (input) =>
{   
  const output = input.data.map(item =>  ({label : item[1], value : item[2] }));
  return output;
}

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

  const [latlongitudes, setLatLongitudes] = useSemiPersistentState('longitudes', []);

  const [sales, setSales] = useSemiPersistentState('sales', []);
  const [isLoadingSales, setIsLoadingSales] = React.useState(true);

  const url = "http://api.cquest.org/dvf?code_postal=" + zipCode.toString();

  React.useEffect(() => 
  {
      setIsLoadingZipCodes(true);
      fetch("./Zipcodes.csv")
      .then(response => response.text())
      .then(text => 
      {
          var csvData = ParseInput(text);
          setZipCodes(csvData);
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
        setIsLoadingSales(false);
      });
  }, [zipCode, url]);

  const onZipCodeChanged = (event) => 
  {
    const row = zipCodes.data.filter(item => item[2] === event.value && item[1] === event.label);
    const values = row[0][5].split(',');
    const latitude = parseFloat(values[0].trim());
    const longitude = parseFloat(values[1].trim());
    setZipCode(event.value);
    setLatitude(latitude);
    setLongitude(longitude);
    setLatLongitudes(filteredSales(sales, priceMin, priceMax).map(item => [item.lat, item.lon]));
  }

  const onPriceMinChanged = (event) =>
  {
    setPriceMin(event.target.value)
    setLatLongitudes(filteredSales(sales, priceMin, priceMax).map(item => [item.lat, item.lon]));
  }

  const onPriceMaxChanged = (event) =>
  {
    setPriceMax(event.target.value)
    setLatLongitudes(filteredSales(sales, priceMin, priceMax).map(item => [item.lat, item.lon]));
  }

  const onSurfaceMinChanged = (event) =>
  {
    setSurfaceMin(event.target.value)
    setLatLongitudes(filteredSales(sales, priceMin, priceMax).map(item => [item.lat, item.lon]));
  }

  const onSurfaceMaxChanged = (event) =>
  {
    setSurfaceMax(event.target.value)
    setLatLongitudes(filteredSales(sales, priceMin, priceMax).map(item => [item.lat, item.lon]));
  }


  return (
    <div>
      <Title label="Immobilier"/>
      <div>
        {
            isLoadingZipCodes ?
            (<p>Loading zipcodes ...</p>) :
            (<Zipcodes data = {Data(zipCodes)}  onChange = {onZipCodeChanged}/>)
        }
      </div>
      <Input id="priceMin" label="Price Min :" type="number" value={priceMin} onChange={onPriceMinChanged}/>
      <Input id="priceMax" label="Price Max :" type="int" value={priceMax} onChange={onPriceMaxChanged}/>
      <Input id="surfaceMin" label="Surface Min :" type="number" value={surfaceMin} onChange={onSurfaceMinChanged}/>
      <Input id="surfaceMax" label="Surface Max :" type="number" value={surfaceMax} onChange={onSurfaceMaxChanged}/>
      <div style={ { height: 700, width: 1850 } }>
        {
          sales.isError && <p>Something went wrong ...</p>
        }
        <Map center={[latitude, longitude]}>
          {
            !isLoadingSales &&
            latlongitudes.map(item => <Marker anchor={[item[0], item[1]]}/>)
          }
        </Map>
      </div>
    </div>
  );
}

export default App;

/**
 *        { sales.isLoading ? 
          (<p>IsLoading ...</p>) :
          (<div className="ag-theme-alpine" style={ { height: 400, width: 1850 } }>
            <AgGridReact
                rowData={output}>
                <AgGridColumn field="id" sortable={true}></AgGridColumn>
                <AgGridColumn field="valeur_fonciere" sortable={true} ></AgGridColumn>
                <AgGridColumn field="surface_terrain" sortable={true} ></AgGridColumn>
                <AgGridColumn field="code_voie"></AgGridColumn>
                <AgGridColumn field="type_voie"></AgGridColumn>
                <AgGridColumn field="voie"></AgGridColumn>
                <AgGridColumn field="code_postal" sortable={true}></AgGridColumn>
                <AgGridColumn field="lat" sortable={true}></AgGridColumn>
                <AgGridColumn field="lon" sortable={true}></AgGridColumn>
            </AgGridReact>
          </div>)
        }
 */