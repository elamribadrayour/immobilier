
import React, { PropsWithChildren } from 'react';
import styles from './App.module.css';

import SideHeader from './SideHeader';
import SideBody from './SideBody';

const SideBar: React.FC = (props : any) =>
{
  let headerProps : PropsWithChildren<any> = {title : "Immobilier"};
  return (
    <div className={styles.sidebar}>
      <SideHeader {...headerProps}/>
      <SideBody {...props}/>
    </div>

  );
}

export default SideBar;