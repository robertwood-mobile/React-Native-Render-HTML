import React from 'react';
//@ts-ignore
import discoveryVideoUrl from '@site/static/video/discovery.webm';
import styles from './DiscoveryFrame.module.scss';

function DeviceContainer({ children }) {
  return (
    <div className={styles['device-iphone-x']}>
      <div className={styles['device-frame']}>{children}</div>
      <div className={styles['device-header']} />
      <div className={styles['device-sensors']} />
      <div className={styles['device-btns']} />
      <div className={styles['device-power']} />
    </div>
  );
}

export default function DiscoveryFrame({}) {
  return (
    <DeviceContainer>
      <video
        controls={false}
        loop
        autoPlay
        muted
        preload="lazy"
        className={styles['device-content']}>
        <source src={discoveryVideoUrl} type="video/webm" />
      </video>
    </DeviceContainer>
  );
}
