// Packages
import { PropsWithChildren } from 'react';
import React, { useState, useEffect } from 'react';

import axios from 'axios';
import { LatLngTuple } from 'leaflet';
import { MapContainer, Marker, TileLayer, useMapEvent} from 'react-leaflet';

import Key from './Key';

import './Global.css';
import styles from './App.module.css';

import SideFilterBar from './SideFilterBar';
import SideSaleBar from './SideSaleBar';

import { renderToStaticMarkup } from 'react-dom/server';
import { divIcon } from 'leaflet';

import Point from "./Point"

const App: React.FC = () => 
{
  const iconMarkup = renderToStaticMarkup(<i className=" fa fa-map-marker-alt fa-3x" />);
  const customMarkerIcon = divIcon({html: iconMarkup});

  // Points
  const latlng : LatLngTuple = [43.2969500, 5.3810700];
  const point : Point = { country : "France", district : "7e", locality : "Marseille", address : "125 rue du vallon des auffes", price : 0, surface : 0, coordinates : latlng};
  
  const [mapZoom, setMapZoom] = useState<number>(12);
  const [mapPosition, setMapPosition] = useState<LatLngTuple>(latlng);

  const [selectedPoint, setSelectedPoint] = useState<Point>(point);
  const [selectedPoints, setSelectedPoints] = useState<Point[]>([]);

  function filter(data : Point[], priceMin : number, priceMax : number, surfaceMin : number, surfaceMax : number) : Point[]
  {
    if(!priceMin)
    {
      console.log("Setting price min to a default value : %s", 0)
      priceMin = 0;
    }

    if(!priceMax)
    {
      console.log("Setting price max to a default value : %s", Number.MAX_VALUE)
      priceMax = Number.MAX_VALUE
    }

    if(!surfaceMin )
    {
      surfaceMin = 0;
    }

    if(!surfaceMax)
    {
      surfaceMax = Number.MAX_VALUE
    }

    console.log("Price min : %s", priceMin);
    console.log("Price max : %s", priceMax);
    console.log("Surface min : %s", surfaceMin);
    console.log("Surface max : %s", surfaceMax);

    const points : Point[] = [];
    let length = data.length;
    for (let i = 0; i < length; i++) 
    {
      if(data[i].coordinates[0] && data[i].coordinates[1]) 
      {
        if(data[i].price >= priceMin && data[i].price <= priceMax)
        {
          if(data[i].surface >= surfaceMin && data[i].surface <= surfaceMax)
          {
            points.push(data[i]);
          }
        }
      }
    }

    console.log("Output : %s elements", points.length);
    return points;
  }

  function deleteOrigin(coordinates : Point[]) : Point[]
  {    
    const points = [...coordinates];
    for (let i = 0; i < points.length; i++) 
    {
      if(points[i].coordinates[0] === 0 && points[i].coordinates[1] === 0) 
      {
        points.splice(i, 1);
        i--;
      }
    }

    return points;
  }

  // Search Map Coordinates
  async function onFilteringSubmitForm(data: any) 
  {
    console.log("Filtering ...")
    console.log("Zipcode : %s.", data.zipcode);
    let output = await axios.get(`http://api.cquest.org/dvf?code_postal=${data.zipcode}`);
    let response = output.data.resultats;

    if(!response)
      return;

    let points: Point[] = response.map((item) => 
    {
      if(item.lat != null && item.lon != null)
        return {country : "France", district : item.zipcode, locality : item.commune, address : item.code_voie + " " + item.type_voie + " " + item.voie, price : item.valeur_fonciere, surface : item.surface_relle_bati, coordinates :  [item.lat, item.lon]}
      else 
        return {country : "France", district : "", locality : "", address : "", coordinates:  [0, 0]};
    });
    
    points = deleteOrigin(points);
    console.log("Bing outputs a set of %s elements.", points.length)
    
    points = filter(points, data.price_min, data.price_max, data.surface_min, data.surface_max);
    setSelectedPoints(points);
    setMapZoom(18)
}

  // Search Map Coordinates
  async function onZipcodeSubmitForm(data: any) 
  {
    console.log("Filtering ...")
    console.log("Zipcode : %s.", data.zipcode);
    console.log("City : %s.", data.city);
    console.log("Address : %s.", data.address);

    let output = await axios.get(`http://api.cquest.org/dvf?code_postal=${data.zipcode}`);
    let center = await axios.get(`http://dev.virtualearth.net/REST/v1/Locations/FR/${data.zipcode}/${data.city}/${data.address}?key=${Key}`)
    let response = output.data.resultats;

    if(!response)
      return;

    let points: Point[] = response.map((item) => 
    {
      if(item.lat != null && item.lon != null)
        return {country : "France", district : item.zipcode, locality : item.commune, address : item.code_voie + " " + item.type_voie + " " + item.voie, price : item.valeur_fonciere, surface : item.surface_relle_bati,  coordinates :  [item.lat, item.lon]}
      else 
        return {country : "France", district : "", locality : "", address : "", coordinates:  [0, 0]};
    });

    let centerPoint : LatLngTuple = [0,0]
    if (center) 
    {
      centerPoint = center.data.resourceSets[0].resources[0].geocodePoints[0].coordinates;
    }

    console.log("Center coordinates : %s - %s", centerPoint[0], centerPoint[1]);

    points = deleteOrigin(points);

    console.log("Initializing with a subset of 10 sales.");
    let sample : Point[] = points.slice(1, 10);
    setSelectedPoints(sample);
    setMapPosition(centerPoint);
    setMapZoom(12);
  }

  function onPointSelected(point : Point)
  {
    setSelectedPoint(point);
  }

  // Show Point
  function showPoint(pointIndex: number): void 
  {
    console.log("Point selected.");
    setMapPosition(selectedPoints[pointIndex].coordinates);
    setSelectedPoint(selectedPoints[pointIndex]);
  }

  async function onSeLogerProtobufGet(input : any)
  {

  }

  async function onSeLogerJsonCheck(input : any)
  {
    var myHeaders = new Headers();
    myHeaders.append("authority", "www.seloger.com");
    myHeaders.append("accept", "application/json");
    myHeaders.append("user-agent", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36 OPR/73.0.3856.344");
    myHeaders.append("content-type", "application/json");
    myHeaders.append("origin", "https://www.seloger.com");
    myHeaders.append("referer", "https://www.seloger.com/list.htm?projects=2,5&types=1,2&natures=1,2,4&places=[{%22inseeCodes%22:[130207]}]&price=100000/200000&enterprise=0&qsVersion=1.0&m=search_refine");
    myHeaders.append("accept-language", "en-US,en;q=0.9");
    myHeaders.append("cookie", "G_ENABLED_IDPS=google; G_AUTHUSER_H=0; didomi_token=eyJ1c2VyX2lkIjoiMTc3MTBmYTYtOTM5Zi02Y2VjLTlkNmEtZjA3M2MxZDVkYjExIiwiY3JlYXRlZCI6IjIwMjEtMDEtMTdUMTU6MzM6MjYuNDg5WiIsInVwZGF0ZWQiOiIyMDIxLTAxLTE3VDE1OjMzOjI2LjQ4OVoiLCJ2ZW5kb3JzIjp7ImVuYWJsZWQiOlsiZmFjZWJvb2siLCJnb29nbGUiLCJjOm9tbml0dXJlLWFkb2JlLWFuYWx5dGljcyIsImM6aGFydmVzdC1QVlRUdFVQOCIsImM6ZmFjZWJvb2stYnRDNFpXNnIiXX0sInB1cnBvc2VzIjp7ImVuYWJsZWQiOlsiYW5hbHlzZWRlLVZEVFVVaG42Iiwic29jaWFsIiwiZGV2aWNlX2NoYXJhY3RlcmlzdGljcyIsImdlb2xvY2F0aW9uX2RhdGEiXX0sInZlbmRvcnNfbGkiOnsiZW5hYmxlZCI6WyJnb29nbGUiXX0sInZlcnNpb24iOjIsImFjIjoiQWt1QUNBa3MuQWt1QUNBa3MifQ==; euconsent-v2=CPAK3fBPAK3fBAHABBENBICsAP_AAH_AAAAAHPNf_X_fb3_j-_59_9t0eY1f9_7_v-0zjgeds-8Nyd_X_L8X42M7vF36pq4KuR4Eu3LBIQdlHOHcTUmw6IkVrTPsbk2Mr7NKJ7PEinMbe2dYGH9_n9XTuZKY79_s___z__-__v__7_f_r-3_3_vp9X---_e_UDnQCTDUvgIsxLHAkmjSqFECEK4kOgFABRQjC0TWEBK4KdlcBH6CBgAgNQEYEQIMQUYsAgAAAACSiICQA8EAiAIgEAAIAVICEABGgCCwAkDAIABQDQsAIoAhAkIMjgqOUwICJFooJ5KwBKLvYwwhDKLACgUf0EAA.f_gAD_gAAAAA; visitId=1610897606594-1243479590; _gid=GA1.2.16492156.1610897607; _gcl_au=1.1.1392762776.1610897607; atuserid=%7B%22name%22%3A%22atuserid%22%2C%22val%22%3A%22632735e7-904a-4ae3-a4f3-bc1cb9dd1d0c%22%2C%22options%22%3A%7B%22end%22%3A%222022-02-18T15%3A33%3A27.495Z%22%2C%22path%22%3A%22%2F%22%7D%7D; AMCVS_366134FA53DB27860A490D44%40AdobeOrg=1; s_ecid=MCMID%7C78574570141984252503225943147794071161; s_visit=1; s_dl=1; c_m=undefinedTyped%2FBookmarkedTyped%2FBookmarkedundefined; stack_ch=%5B%5B%27Acces%2520Direct%27%2C%271610897608249%27%5D%5D; s_cc=true; AMCV_366134FA53DB27860A490D44%40AdobeOrg=1099438348%7CMCIDTS%7C18645%7CMCMID%7C78574570141984252503225943147794071161%7CMCAAMLH-1611502407%7C6%7CMCAAMB-1611502407%7CRKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y%7CMCOPTOUT-1610904807s%7CNONE%7CMCAID%7CNONE%7CMCSYNCSOP%7C411-18652%7CvVersion%7C2.1.0; ry_ry-s3oa268o_realytics=eyJpZCI6InJ5XzNGRjgzMkQ4LTQzNkYtNENFMy04Qzk1LTU5MDg5RDZCNDhEMCIsImNpZCI6bnVsbCwiZXhwIjoxNjQyNDMzNjA3NDMxLCJjcyI6MX0%3D; ry_ry-s3oa268o_so_realytics=eyJpZCI6InJ5XzNGRjgzMkQ4LTQzNkYtNENFMy04Qzk1LTU5MDg5RDZCNDhEMCIsImNpZCI6bnVsbCwib3JpZ2luIjp0cnVlLCJyZWYiOm51bGwsImNvbnQiOm51bGwsIm5zIjpmYWxzZX0%3D; realytics=1; mics_uaid=web:1056:b4fe7f83-41ce-4470-aa7a-f2f9fa268ca3; uid=b4fe7f83-41ce-4470-aa7a-f2f9fa268ca3; mics_vid=10901072455; mics_lts=1610897609844; mics_vid=10901072455; mics_lts=1610897609844; __gads=ID=771a2e197deba2bb:T=1610897707:S=ALNI_MZU21gangPRP_FZQmhdlssQitV6KA; _ga=GA1.1.706503622.1610897607; datadome=_Izu6NdtD3zrVqFDd7AjHlrYFRp95VZpIXbphc6JShk0RhFw~S1GqcZnmTzL5zX_whlwTQogSvVojs3SUfWtTxIRev0gBoSKIQ3Bp_ijOg; _ga_MC53H9VE57=GS1.1.1610897606.1.1.1610903801.0; s_getNewRepeat=1610903813744-New; s_sq=selogerprod%252Cselogerglobalprod%3D%2526c.%2526a.%2526activitymap.%2526page%253Dsearch_results%2526link%253DAppliquer%2526region%253Dagatha-kk1ef8j1%2526pageIDType%253D1%2526.activitymap%2526.a%2526.c%2526pid%253Dsearch_results%2526pidt%253D1%2526oid%253DAppliquer%2526oidt%253D3%2526ot%253DSUBMIT; datadome=Bu_yLgnxepCMqWelUfN7MpiWE7d~pc8lXVjV_rPQGAPvmk8V_iCft50npyhNQTqiTK8MdBH86~4Zn5NezzCVLHQF~TjLX5tZKrDj1cMqY4");

    var raw = JSON.stringify({"enterprise":false,"projects":[2,5],"types":[1,2],"places":[{"label":"Marseille 7ème","inseeCodes":[130207]}],"price":{"min":100000,"max":200000},"natures":[1,2,4]});

    var requestOptions : any = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };

    fetch("https://www.seloger.com/list/api/externaldata?from=0&size=25&isSeo=false", requestOptions)
      .then(response => response.text())
      .then(result => console.log(JSON.parse(result).classifiedsData))
      .catch(error => console.log('error', error));


  }

  let sideFilterProps : PropsWithChildren<any> = {onFilteringSubmit : onFilteringSubmitForm, onZipcodeSubmit : onZipcodeSubmitForm, points : selectedPoints, showPoint : () => showPoint};
  let sideSaleProps : PropsWithChildren<any> = {point : selectedPoint} 

  return (
    <div className={styles.container}>
      <SideFilterBar {...sideFilterProps}/>
      <div className={styles.map}>
        <MapContainer center={mapPosition} zoom={mapZoom}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
          />
          {selectedPoints.map(item =><Marker icon={customMarkerIcon} position={item.coordinates} eventHandlers={{click : () => onPointSelected(item)}}></Marker>)}
        </MapContainer>
      </div>
      <SideSaleBar {...sideSaleProps}/>
    </div>
  );
}

export default App;

// {selectedPoints.map(item =><Marker position={item.coordinates} eventHandlers={{click : () => {console.log("in")},}}><Popup eventHandlers={{click : () => {console.log("in")},}}>{showPointInfo(item)}</Popup></Marker>)}
