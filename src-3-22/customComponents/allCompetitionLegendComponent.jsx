import React from 'react';
import './legendComponent.css';

class AllLegendComponent extends React.Component {
  render() {
    const { allLegendArray } = this.props;
    return (
      <div>
        {allLegendArray.map((item, index) => (
          <div key={index + 'legend'} className="all-legend-main-div">
            <div className="col-sm pb-4 pt-4">
              <span className="legend-text" style={{ fontSize: 13, fontWeight: 600 }}>
                {item.competitionName}
              </span>
            </div>
            <div className="d-flex" style={{ paddingLeft: 40 }}>
              {item.legendArray.map((subItem, subIndex) => (
                <div key={subIndex + 'subLegend'} className="legend-color-text-div">
                  <div>
                    <div
                      className="legend-color-div"
                      style={{ backgroundColor: subItem.colorCode }}
                    ></div>
                  </div>
                  <div className="legend-text-div">
                    <span className="legend-text">
                      {subItem.divisionName}-{subItem.gradeName}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }
}

export default AllLegendComponent;
