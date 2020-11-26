import React from 'react';
import { useForm } from 'react-hook-form';

import { FaMapMarkerAlt, FaMapMarked, FaTrash, FaEye } from 'react-icons/fa';

import styles from './App.module.css';

const SideBody: React.FC = (props : any) => 
{
  // React-Hook-Form Control
  const { register, handleSubmit } = useForm();

  return (
    <div className={styles.sidebarBody}>
      <form onSubmit={handleSubmit(props.onZipcodeSubmit)} autoComplete="off">
        <input type="text" placeholder="Code Postal" name="zipcode" ref={register()} />
        <button type="submit">
          Enregistrer le code postal
        </button>
      </form>
      <form onSubmit={handleSubmit(props.onFilteringSubmit)} autoComplete="off">
        <input type="number" placeholder="Surface min" name="surface_min" ref={register()} />
        <input type="number" placeholder="Surface max" name="surface_max" ref={register()} />
        <input type="number" placeholder="Prix min" name="price_min" ref={register()} />
        <input type="number" placeholder="Prix max" name="price_max" ref={register()} />
        <button type="submit">
          Enregistrer le filtrage
        </button>
      </form>
    </div>
  
  );
}

/*
      <form onSubmit={handleSubmit(props.onSubmit)} autoComplete="off">
        <input type="text" placeholder="Pays" name="country" ref={register()} />
        <input type="text" placeholder="Ville" name="city" ref={register}/>
        <input type="text" placeholder="Addresse" name="address" ref={register()}/>
        <input type="text" placeholder="Code Postal" name="zipcode" ref={register}/>
        <button type="submit">
          Enregistrer l'adresse
        </button>
      </form>
*/

export default SideBody;