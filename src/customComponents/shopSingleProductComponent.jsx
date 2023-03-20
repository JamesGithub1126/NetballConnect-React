import React from 'react';
import { Menu } from 'antd';
import './shopSingleProductComponent.css';
import AppImages from '../themes/appImages';
import { currencyFormat } from '../util/currencyFormat';
import { isArrayNotEmpty, getAmountWithTax } from '../util/helpers';
import { getOrganisationData } from '../util/sessionStorage';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css'; // requires a loader

const { SubMenu } = Menu;
class ShopSingleProductComponent extends React.Component {
  /////check product is for parent or for affiliate
  isParentCreator = creatorOrgKey => {
    let orgData = getOrganisationData() ? getOrganisationData() : null;
    let organisationUniqueKey = orgData ? orgData.organisationUniqueKey : 0;
    if (organisationUniqueKey == creatorOrgKey) {
      return true;
    } else {
      return false;
    }
  };

  productItemPriceCheck = productItem => {
    let price = 0;
    let variantOptions = isArrayNotEmpty(productItem.variants)
      ? productItem.variants[0].options
      : [];
    if (isArrayNotEmpty(variantOptions)) {
      price = Math.min.apply(
        null,
        variantOptions.map(function (item) {
          return item.properties.price;
        }),
      );
    } else {
      price = productItem.price;
    }

    return ((isArrayNotEmpty(variantOptions)) ? 'From ' : '')
      + currencyFormat(getAmountWithTax(price, productItem.tax)) 
      + ((productItem.tax === 1) ? ' (inc GST)' : '');
  };

  render() {
    const { productItem, editOnclick, deleteOnclick, viewOnclick } = this.props;
    let imagesArr = isArrayNotEmpty(productItem.images)
      ? [...productItem.images]
      : [];
    if (productItem.priorityBanner) {
      /// Find banner image
      const index = imagesArr.findIndex(image => !!image.isBanner);
      if (index >= 0) {
        imagesArr.splice(index, 1);
      }
    }
    if (imagesArr.length <= 0) {
      imagesArr.push({ id: 0, url: AppImages.squareImage })
    }
    return (
      <div className="shop-single-prd-main-view mt-3">
        <div className="product-menu-option-view">
          <Menu
            className="action-triple-dot-submenu"
            theme="light"
            mode="horizontal"
            style={{ lineHeight: '25px' }}
          >
            <SubMenu
              key="sub1"
              style={{ borderBottomStyle: 'solid', borderBottom: 0 }}
              title={
                <img
                  className="dot-image"
                  src={AppImages.moreTripleDot}
                  alt=""
                  width="13"
                  height="13"
                />
              }
            >
              {this.isParentCreator(productItem.organisationUniqueKey) && (
                <Menu.Item onClick={editOnclick}>
                  <span>Edit</span>
                </Menu.Item>
              )}
              {this.isParentCreator(productItem.organisationUniqueKey) && (
                <Menu.Item onClick={deleteOnclick}>
                  <span>Delete</span>
                </Menu.Item>
              )}
              {this.isParentCreator(productItem.organisationUniqueKey) == false && (
                <Menu.Item onClick={viewOnclick}>
                  <span>View</span>
                </Menu.Item>
              )}
            </SubMenu>
          </Menu>
        </div>
        <div className="product-img-view">
          <div>
            <Carousel showStatus={false} showThumbs={false} infiniteLoop showArrows>
              {isArrayNotEmpty(imagesArr) &&
                imagesArr.map((item, index) => {
                  return (
                    <div className="carousel-div" key={item + index}>
                      <img
                        src={item ? item.url : AppImages.squareImage}
                        className="carousel-img"
                        alt={''}
                      />
                    </div>
                  );
                })}
            </Carousel>
          </div>
        </div>
        <div className="product-text-view">
          <span className="product-name">{productItem.productName}</span>
          <span className="product-price-text-style">
            {this.productItemPriceCheck(productItem)}
          </span>
          <span className="product-type-grey-text">
            {productItem.type ? productItem.type : 'N/A'}
          </span>
          <div className="mt-3">
            {productItem &&
              isArrayNotEmpty(productItem.variants) &&
              productItem.variants.map((subItem, subIndex) => {
                let optionCount = subItem ? subItem.options.length : 0;
                let checkOptionDisplayCount = optionCount <= 3 ? 2 : 1;
                return (
                  <div key={'productItemvariantOptions' + subIndex} className="text-left">
                    {subIndex === 0 && (
                      <>
                        {subItem &&
                          isArrayNotEmpty(subItem.options) &&
                          subItem.options.map((subItemOption, subIndexOption) => {
                            return (
                              subIndexOption <= checkOptionDisplayCount && (
                                <div className="d-flex flex-row" key={'options' + subIndexOption}>
                                  <div className="col-sm-3 pl-0">
                                    <span className="product-grey-detail-text">
                                      {subItemOption.optionName ? subItemOption.optionName : ''}
                                    </span>
                                  </div>
                                  <div className="col-sm-9">
                                    <span className="product-grey-detail-text">
                                      {subItemOption.properties
                                        ? subItemOption.properties.quantity
                                        : ''}
                                    </span>
                                  </div>
                                </div>
                              )
                            );
                          })}
                        {checkOptionDisplayCount === 1 && (
                          <span className="product-grey-detail-text">{'More...'}</span>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    );
  }
}

export default ShopSingleProductComponent;
