import React from 'react';
import PropTypes from 'prop-types';
import { Spin } from 'antd';

import AppImages from '../themes/appImages';

function ImageLoader(props) {
  const {
    className,
    closeable,
    timeout,
    video,
    src,
    poster,
    width,
    height,
    borderRadius,
    removeImage,
  } = props;

  if (!src) {
    return (
      <div className="image-viewport">
        <div className="banner-image" />
      </div>
    );
  }

  return (
    <div className="image-viewport">
      {closeable && (
        <button type="button" className="closable-icon" onClick={removeImage}>
          X
        </button>
      )}

      {timeout ? (
        <label
          className="d-flex align-items-center justify-content-center"
          style={{ width: 100, height: 100 }}
        >
          <Spin />
        </label>
      ) : video ? (
        <label>
          <video src={src} height="120" width="120" poster={poster} />
        </label>
      ) : (
        <label>
          <img
            className={`${className} ml-0`}
            src={src}
            alt=""
            height={height ? null : '120'}
            width={width ? null : '120'}
            style={{ borderRadius: borderRadius ? null : 60 }}
            name="image"
            onError={ev => {
              ev.target.src = AppImages.circleImage;
            }}
          />
        </label>
      )}
    </div>
  );
}

ImageLoader.propTypes = {
  className: PropTypes.string,
  closeable: PropTypes.bool,
  timeout: PropTypes.bool,
  video: PropTypes.bool,
  src: PropTypes.string,
  poster: PropTypes.string,
  width: PropTypes.bool,
  height: PropTypes.bool,
  borderRadius: PropTypes.bool,
  removeImage: PropTypes.func,
};

ImageLoader.defaultProps = {
  className: '',
  closeable: false,
  timeout: false,
  video: false,
  src: null,
  poster: '',
  width: false,
  height: false,
  borderRadius: false,
  removeImage: () => {},
};

export default ImageLoader;
