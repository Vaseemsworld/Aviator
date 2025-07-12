import React from "react";
import styles from "./Dashboard.module.css";

const Loader = () => {
  return (
    <div className={styles.loaderWrapper}>
      <div className={styles.loader} />
      <span className={styles.loaderText}>Connecting...</span>
    </div>
  );
};

export default Loader;
