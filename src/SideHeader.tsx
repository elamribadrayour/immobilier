import React from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';

import './Global.css';
import styles from './App.module.css';

const SideHeader : React.FC = (props : any) => 
{
  return (
    <div className={styles.sidebarHeader}>
      <FaMapMarkerAlt color="#65e080" size={40} />
      <h1>{props.title}</h1>
    </div>
  );
}

export default SideHeader;