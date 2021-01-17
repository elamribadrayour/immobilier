import React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { LatLngTuple } from 'leaflet';
import { useMapEvents } from "react-leaflet";

import styles from './App.module.css';

const SideFilterBody: React.FC = (props : any) => 
{
  const { register, handleSubmit } = useForm();

  return (
    <div className={styles.sidebarBody}>
      <form onSubmit={handleSubmit(props.onZipcodeSubmit)} autoComplete="off">
        <input type="text" placeholder="Code Postal" name="zipcode" ref={register()} multiple/>
        <button type="submit">
          Filtrer
        </button>
      </form>
      <form onSubmit={handleSubmit(props.onFilteringSubmit)} autoComplete="off">
        <input type="number" placeholder="Surface min" name="surface_min" ref={register()} />
        <input type="number" placeholder="Surface max" name="surface_max" ref={register()} />
        <input type="number" placeholder="Prix min" name="price_min" ref={register()} />
        <input type="number" placeholder="Prix max" name="price_max" ref={register()} />
        <button type="submit">
          Filtrer
        </button>
      </form>
    </div>
  
  );
}

export default SideFilterBody;