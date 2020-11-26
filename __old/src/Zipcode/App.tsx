

// Packages
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { Map, Marker, TileLayer, Popup } from 'react-leaflet';
import { LatLngTuple } from 'leaflet';
import { FaMapMarkerAlt, FaMapMarked, FaTrash, FaEye } from 'react-icons/fa';

import Key from './Key';

// Styles
import './Global.css';
import styles from './App.module.css';
import { JsxAttribute } from 'typescript';
import { PropsWithChildren } from 'react';

const SideHeader : React.FC = (props : any) => 
{
  return (
    <div className={styles.sidebarHeader}>
      <FaMapMarkerAlt color="#ea4335" size={40} />
      <h1>{props.title}</h1>
    </div>
  );
}

const SideBody: React.FC = (props : any) => 
{
  // React-Hook-Form Control
  const { register, handleSubmit } = useForm();


  return (
    <div className={styles.sidebarBody}>
    <form onSubmit={handleSubmit(props.onSubmit)} autoComplete="off">
      <input type="text" placeholder="Pays" name="country" ref={register({ required: true })} />
      <input type="text" placeholder="District" name="district" ref={register}/>
      <input type="text" placeholder="Locality" name="locality" ref={register}/>
      <input type="text" placeholder="Address" name="address" ref={register}/>
      <button type="submit">
        Save Point
        <FaMapMarkerAlt />
      </button>
    </form>
    {
      props.points.length > 0 &&
      <div className={styles.pointsContainer}>
        <div className={styles.pointHeader}>
          <FaMapMarked color="#2a5ee8" />
          <h5>Saved Points</h5>
        </div>
        <ul className={styles.pointList}>
          {
            props.points.map((point, index) => (
              <li className={styles.pointItem} key={index}>
                <div className={styles.pointInfo}>
                  <h5>{point.country}</h5>
                  <p>{point.district}-{point.locality}-{point.address}</p>
                </div>
                <div className={styles.pointActions}>
                  <button onClick={props.showPoint(index)}><FaEye /></button>
                  <button onClick={props.deletePoint(index)}><FaTrash /></button>
                </div>
              </li>
            ))
          }
        </ul>
      </div>
    }
  </div>
  
  );
}

const SideBar: React.FC = (props : any) =>
{
  let headerProps : PropsWithChildren<any> = {title : "Adresse"};
  return (
    <div className={styles.sidebar}>
      <SideHeader {...headerProps}/>
      <SideBody {...props}/>
    </div>

  );
}

// Component
const App: React.FC = (props: any) => {

  interface Point {
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

    const searhCoordinates = await axios.get(`http://dev.virtualearth.net/REST/v1/Locations?countryRegion=${data.country}&adminDistrict=${data.district}&locality=${data.locality}&addressLine=${data.address}&maxResults=5&key=${Key}`);

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

  // Show Point
  function showPoint(pointIndex: number): void 
  {
    setMapPosition(points[pointIndex].coordinates);
    setSelectedPoint(points[pointIndex].coordinates);
  }

  // Delete Point
  function deletePoint(pointIndex: number): void 
  {
    const updatedPoints = [...points];
    updatedPoints.splice(pointIndex, 1);
    setPoints(updatedPoints);
  }

  const onMapZoom = (zoom) =>
  {
    setMapZoom(zoom)
  }

  let sideProps : PropsWithChildren<any> = {onSubmit : onSubmitForm, points : points, showPoint : () => showPoint,  deletePoint : () => deletePoint};

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
        </Map>
      </div>
    </div>
  );
}

export default App;
