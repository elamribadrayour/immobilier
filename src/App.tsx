// Packages
import { PropsWithChildren } from 'react';
import React, { useState, useEffect } from 'react';

import axios from 'axios';
import { LatLngTuple } from 'leaflet';
import { Map, Marker, TileLayer, Popup } from 'react-leaflet';

import Key from './Key';

// Styles
import './Global.css';
import styles from './App.module.css';

import SideBar from './SideBar';

// Component
const App: React.FC = () => 
{

  interface Point 
  {
    country: string,
    district: string,
    locality: string,
    address: string,
    coordinates: LatLngTuple
  }

  // Initial Values
  const initialMapPosition: LatLngTuple = [51.505, -0.09];

  // Map
  const [mapPosition, setMapPosition] = useState<LatLngTuple>(initialMapPosition);
  const [mapZoom, setMapZoom] = useState<number>(12);

  // Points
  const point : Point = { country : "France", district : "7e", locality : "Marseille", address : "125 rue du vallon des auffes", coordinates : [10, 10]};
  const [points, setPoints] = useState<Point[]>([point]);
  const [allPoints, setAllPoints] = useState<LatLngTuple[]>([[0, 0]]);
  const [selectedPoint, setSelectedPoint] = useState<LatLngTuple>([0, 0]);
  const [selectedPoints, setSelectedPoints] = useState<LatLngTuple[]>([[0, 0]]);

  // Get user current position
  useEffect(() => 
  {
    navigator.geolocation.getCurrentPosition(({ coords }) => 
    {
      setMapPosition([coords.latitude, coords.longitude]);
    }, (err) => {
      setMapPosition(initialMapPosition);
    });
  }, []);

  // Search Map Coordinates
  async function onSubmitForm(data: any) 
  {
    const searhCoordinates = await axios.get(`http://dev.virtualearth.net/REST/v1/Locations/FR/${data.zipcode}/${data.city}/${data.address}?key=${Key}`)

    if (searhCoordinates) 
    {
      const coordinates: LatLngTuple = searhCoordinates.data.resourceSets[0].resources[0].geocodePoints[0].coordinates;

      const newPoint: Point = 
      {
        ...data,
        coordinates
      }

      setPoints(currentPoints => [...currentPoints, newPoint]);
      setSelectedPoint(coordinates);
      setSelectedPoints([...selectedPoints, coordinates]);
    }
  }

  function filter(data : any, priceMin : number, priceMax : number, surfaceMin : number, surfaceMax : number) : LatLngTuple[]
  {
    const updatedselectedPoints : LatLngTuple[] = [];
    let length = data.length;
    for (let i = 0; i < length; i++) 
    {
      if(data[i].lat != null && data[i].lon != null) 
      {
        if(data[i].valeur_fonciere >= priceMin && data[i].valeur_fonciere <= priceMax)
        {
          if(data[i].surface_terrain >= surfaceMin && data[i].surface_terrain <= surfaceMax)
          {
            updatedselectedPoints.push([data[i].lat, data[i].lon]);
          }
        }
      }
    }

    return updatedselectedPoints;
  }

  function deleteOrigin(coordinates : LatLngTuple[]): LatLngTuple[] 
  {    
    const updatedselectedPoints = [...coordinates];
    for (let i = 0; i < updatedselectedPoints.length; i++) 
    {
      if(updatedselectedPoints[i][0] === 0 && updatedselectedPoints[i][1] === 0) 
      {
        updatedselectedPoints.splice(i, 1);
        i--;
      }
    }
    return updatedselectedPoints;
  }

  // Search Map Coordinates
  async function onFilteringSubmitForm(data: any) 
  {
    let output = await axios.get(`http://api.cquest.org/dvf?code_postal=${data.zipcode}`);
    let response = output.data.resultats;

    let coordinates: LatLngTuple[] = response.map((item) => 
    {
      if(item.lat != null && item.lon != null)
        return [item.lat, item.lon]
      else 
        return [0, 0];
    });
    coordinates = deleteOrigin(coordinates);

    setAllPoints(response)
    let x = filter(response, data.price_min, data.price_max, data.surface_min, data.surface_max);
    setSelectedPoints(x);
  }

  // Search Map Coordinates
  async function onZipcodeSubmitForm(data: any) 
  {
    let output = await axios.get(`http://api.cquest.org/dvf?code_postal=${data.zipcode}`);
    let center = await axios.get(`http://dev.virtualearth.net/REST/v1/Locations/FR/${data.zipcode}/${data.city}/${data.address}?key=${Key}`)
    let centerCoordinates: LatLngTuple = center.data.resourceSets[0].resources[0].geocodePoints[0].coordinates;
    let response = output.data.resultats;

    let coordinates: LatLngTuple[] = response.map((item) => 
    {
      if(item.lat != null && item.lon != null)
        return [item.lat, item.lon]
      else 
        return [0, 0];
    });
    coordinates = deleteOrigin(coordinates);

    let mini_response = coordinates.slice(1, 10);
    setAllPoints(response);
    setSelectedPoints(mini_response);
    setMapPosition(centerCoordinates);
  }

  // Show Point
  function showPoint(pointIndex: number): void 
  {
    setMapPosition(points[pointIndex].coordinates);
    setSelectedPoint(points[pointIndex].coordinates);
  }

  const onMapZoom = (zoom) =>
  {
    setMapZoom(zoom)
  }

  let sideProps : PropsWithChildren<any> = {onSubmit : onSubmitForm, onFilteringSubmit : onFilteringSubmitForm, onZipcodeSubmit : onZipcodeSubmitForm, points : points, showPoint : () => showPoint};

  // Component
  return (
    <div className={styles.container}>
      <SideBar {...sideProps}/>
      <div className={styles.map}>
        <Map center={mapPosition} zoom={mapZoom} onViewportChange={({ zoom }) => onMapZoom(zoom)}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
          />
          <Marker position={selectedPoint}>
            <Popup>{selectedPoint[0]} , {selectedPoint[1]}</Popup>
          </Marker>
          {selectedPoints.map(item =><Marker position={item}><Popup>{selectedPoint[0]} , {selectedPoint[1]}</Popup></Marker>)}
        </Map>
      </div>
    </div>
  );
}

export default App;
