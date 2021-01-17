import React from 'react';
import { useForm } from 'react-hook-form';

import styles from './App.module.css';

import Point from "./Point"
import { LatLngTuple } from 'leaflet';


const SideFilterBody: React.FC = (props : any) => 
{
  const { register, handleSubmit } = useForm();

  return (
    <div className={styles.sidebarBody}>
        <p>{props.point.locality}</p>
        <p>{props.point.address}</p>
        <p>{props.point.surface} m2</p>
        <p>{props.point.price.toLocaleString('fr-FR', {style: 'currency', currency: 'EUR',})}</p>
    </div>
  
  );
}

export default SideFilterBody;