import React, { PropsWithChildren } from 'react';
import styles from './App.module.css';

import SideHeader from './SideHeader';
import SideSaleBody from "./SideSaleBody"

const SideSaleBar: React.FC = (props : any) =>
{
  let headerProps : PropsWithChildren<any> = {title : "Détails"};
  return (
    <div className={styles.sidebar}>
      <SideHeader {...headerProps}/>
      <SideSaleBody {...props}/>
    </div>

  );
}

export default SideSaleBar;