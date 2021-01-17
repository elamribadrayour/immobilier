
import React, { PropsWithChildren } from 'react';
import styles from './App.module.css';

import SideHeader from './SideHeader';
import SideFilterBody from './SideFilterBody';

const SideBarFilter: React.FC = (props : any) =>
{
  let headerProps : PropsWithChildren<any> = {title : "Immobilier"};
  return (
    <div className={styles.sidebar}>
      <SideHeader {...headerProps}/>
      <SideFilterBody {...props}/>
    </div>

  );
}

export default SideBarFilter;