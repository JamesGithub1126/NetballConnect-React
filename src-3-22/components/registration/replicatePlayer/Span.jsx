import React from 'react';
import './styles.css';

const Span = ({ children, className }) => {
  /**
   * A span element that has the default styling but as always, please pass in the values to override the class
   */
  return (
    <span className={`year-select-heading d-flex align-items-center isYearSelectBox ${className}`}>
      {children}
    </span>
  );
};

export default Span;
