import InputWithHead from '../../../../../customComponents/InputWithHead';
import AppConstants from '../../../../../themes/appConstants';
import ColorPicker from '../../../component/colorPicker';
import React from 'react';
import { DefaultColor } from '../../../utils';

const ColorSettings = ({ colorSettings, setColorSettings }) => {
  const handleChange = colorType => color => {
    setColorSettings(colors => ({ ...colors, [colorType]: color }));
  };

  return (
    <div className="inside-container-view pt-4">
      <span className="text-heading-large mb-0">{AppConstants.colourSettings}</span>
      <span>{AppConstants.colorSettingsText}</span>
      <div className="fluid-width mt-3">
        <div className="row">
          <div className="col-sm-3">
            <div className="row">
              <div className="col-sm-6">{AppConstants.primary}</div>
              <div className="col-sm">
                <ColorPicker
                  defaultColor={colorSettings.primary || DefaultColor.primary}
                  onChange={handleChange('primary')}
                />
              </div>
            </div>
          </div>
          <div className="col-sm-6">
            <div className="row">
              <div className="col-sm-4">{AppConstants.primaryText}</div>
              <div className="col-sm">
                <ColorPicker
                  defaultColor={colorSettings.primary_text || DefaultColor.primaryText}
                  onChange={handleChange('primary_text')}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-sm-3">
            <div className="row">
              <div className="col-sm-6">{AppConstants.secondary}</div>
              <div className="col-sm">
                <ColorPicker
                  defaultColor={colorSettings.secondary || DefaultColor.secondary}
                  onChange={handleChange('secondary')}
                />
              </div>
            </div>
          </div>
          <div className="col-sm-6">
            <div className="row">
              <div className="col-sm-4">{AppConstants.secondaryText}</div>
              <div className="col-sm">
                <ColorPicker
                  defaultColor={colorSettings.secondary_text || DefaultColor.secondaryText}
                  onChange={handleChange('secondary_text')}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-sm-3">
            <div className="row">
              <div className="col-sm-6">{AppConstants.tertiary}</div>
              <div className="col-sm">
                <ColorPicker
                  defaultColor={colorSettings.tertiary || DefaultColor.tertiary}
                  onChange={handleChange('tertiary')}
                />
              </div>
            </div>
          </div>
          <div className="col-sm-6">
            <div className="row">
              <div className="col-sm-4">{AppConstants.highlightText}</div>
              <div className="col-sm">
                <ColorPicker
                  defaultColor={colorSettings.highlight_text || DefaultColor.highlightText}
                  onChange={handleChange('highlight_text')}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-sm-3">
            <div className="row">
              <div className="col-sm-6">{AppConstants.footerBg}</div>
              <div className="col-sm">
                <ColorPicker
                  defaultColor={colorSettings.footer_bg || DefaultColor.footerBg}
                  onChange={handleChange('footer_bg')}
                />
              </div>
            </div>
          </div>
          <div className="col-sm-6">
            <div className="row">
              <div className="col-sm-4">{AppConstants.headingColor}</div>
              <div className="col-sm">
                <ColorPicker
                  defaultColor={colorSettings.heading_colour || DefaultColor.headingColor}
                  onChange={handleChange('heading_colour')}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-sm-3">
            <div className="row">
              <div className="col-sm-6">{AppConstants.bodyBg}</div>
              <div className="col-sm">
                <ColorPicker
                  defaultColor={colorSettings.body_bg || DefaultColor.bodyBg}
                  onChange={handleChange('body_bg')}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorSettings;
