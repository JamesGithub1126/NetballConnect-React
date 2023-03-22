import React, { useRef, useState } from 'react';
import InputWithHead from '../../../customComponents/InputWithHead';
import AppImages from '../../../themes/appImages';
import AppConstants from '../../../themes/appConstants';
import {
  isImageFormatValid,
  isImageResolutionValid,
  isImageSizeValid,
} from '../../../util/helpers';
import { message } from 'antd';

const ImagePicker = ({
  header,
  imageSrc,
  onImageSelect,
  button,
  checkFaviconResolution,
  formatText,
}) => {
  const [imageFile, setImage] = useState(null);
  const uploadRef = useRef(null);

  const selectImage = () => {
    const fileInput = uploadRef.current;
    fileInput.setAttribute('type', 'file');
    fileInput.setAttribute('accept', 'image/*');
    if (!!fileInput) {
      fileInput.click();
    }
  };

  const handleSetImage = async data => {
    const file = data.files[0];

    if (file) {
      let extension = file.name.split('.').pop().toLowerCase();
      let imageSizeValid = isImageSizeValid(file.size);
      let isSuccess = isImageFormatValid(extension);

      if (checkFaviconResolution) {
        let validFaviconResolution = await isImageResolutionValid(file, 32);

        if (!validFaviconResolution) {
          message.error(AppConstants.favicon_Image_Resolution);
          return;
        }
      }

      if (!isSuccess) {
        message.error(AppConstants.logo_Image_Format);
        return;
      }

      if (!imageSizeValid) {
        message.error(AppConstants.logo_Image_Size);
        return;
      }

      setImage(URL.createObjectURL(file));
      onImageSelect(file);
    }
  };

  const imageStyles = {
    borderRadius: imageFile || imageSrc ? 0 : 60,
  };

  return (
    <>
      <InputWithHead required="required-field" heading={header} />
      <div className="fluid-width">
        <div className="row">
          <div className="col-sm-4">
            <div className="reg-competition-logo-view" onClick={selectImage}>
              <label>
                <img
                  src={imageFile || imageSrc || AppImages.circleImage}
                  alt=""
                  height="120"
                  width="120"
                  style={imageStyles}
                  name="image"
                  onError={ev => {
                    ev.target.src = AppImages.circleImage;
                  }}
                />
              </label>
            </div>
            <input
              type="file"
              id="user-pic"
              ref={uploadRef}
              className="d-none"
              onChange={evt => handleSetImage(evt.target)}
              onClick={event => {
                event.target.value = null;
              }}
            />
          </div>
          {button ? (
            <div className="d-flex justify-content-center align-items-center">{button}</div>
          ) : null}
        </div>
        <span className="image-size-format-text">
          {formatText || AppConstants.imageSizeFormatText}
        </span>
      </div>
    </>
  );
};

export default ImagePicker;
