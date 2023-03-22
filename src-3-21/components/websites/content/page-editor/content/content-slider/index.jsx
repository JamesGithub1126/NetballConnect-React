import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getRandomNumber } from '../../../../settings/utils';
import { Form, Select } from 'antd';
import InputWithHead from '../../../../../../customComponents/InputWithHead';
import AppConstants from '../../../../../../themes/appConstants';
import ImagePicker from '../../../../component/imagePicker';
import { EDITOR_PAGE_FIELDS } from '../../contants';
import { uploadImageAction } from '../../../../../../store/actions/strapiAction/strapiAction';
import { isArrayNotEmpty } from '../../../../../../util/helpers';

const Sliders = ({ sliders, updateSliders, websiteDomain }) => {
  const dispatch = useDispatch();
  const posts = useSelector(state => state.StrapiReducerState.posts.data);

  const removeFooterLink = item => {
    let index = sliders.findIndex(f => f.id === item.id);
    if (index > -1) {
      sliders.splice(index, 1);
      updateSliders([...sliders]);
    }
  };

  const addSlider = () => {
    sliders.push({
      id: getRandomNumber(100000),
      featured_posts: { data: [] },
      image: '',
    });
    updateSliders([...sliders]);
  };

  const handleChangeData = (field, updatedData, linkId) => {
    const updatedSliders = sliders.map(slider => {
      if (slider.id === linkId) {
        return {
          ...slider,
          [field]: updatedData,
        };
      }

      return slider;
    });

    updateSliders([...updatedSliders]);
  };

  const postOptions = useCallback(
    () => posts.map(post => ({ value: post.id, label: post.attributes.title })),
    [posts],
  );

  const handleUploadImage = linkId => image => {
    const payload = {
      file: image,
      domain: websiteDomain,
    };

    dispatch(
      uploadImageAction(payload, imageUrl => {
        handleChangeData('image', imageUrl, linkId);
      }),
    );
  };

  const getFeaturedPostsIds = featuredPosts => {
    if(featuredPosts.data && isArrayNotEmpty(featuredPosts.data)) {
      return featuredPosts.data.map(post => post.id)
    }

    return [];
  }

  const sliderView = item => {
    return (
      <div key={`slider_${item.id}`} className="fluid-width mt-3">
        <div className="row">
          <div className="col-sm">
            <ImagePicker
              onImageSelect={handleUploadImage(item.id)}
              imageSrc={item.image}
            />
          </div>
          <div className="col-sm">
            <Form.Item
              name={`${EDITOR_PAGE_FIELDS.featuredPosts}_${item.id}`}
              initialValue={getFeaturedPostsIds(item.featured_posts)}
            >
              <Select
                mode="multiple"
                className="division-age-select w-100"
                style={{ minWidth: 120 }}
                placeholder={AppConstants.featuredPosts}
                onChange={postIDs => handleChangeData('featured_posts', postIDs, item.id)}
              >
                {postOptions().map(option => (
                  <Select.Option key={'postItem_' + option.value} value={option.value}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>
          <div className="col-sm-2" onClick={() => removeFooterLink(item)}>
            <a className="transfer-image-view">
              <span className="user-remove-btn">
                <i className="fa fa-trash-o" aria-hidden="true" />
              </span>
              <span className="user-remove-text mr-0">{AppConstants.remove}</span>
            </a>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="inside-container-view pt-4">
      <InputWithHead heading={AppConstants.sliders} />
      <div className="fluid-width mt-3">
        <div className="row">
          <div className="col-sm">
            <InputWithHead heading={AppConstants.newsFeaturedImages} />
          </div>
          <div className="col-sm">
            <InputWithHead heading={AppConstants.featuredPosts} />
          </div>
          <div className="col-sm-2 transfer-image-view">
            <a className="transfer-image-view">
              <span className="user-remove-btn" />
              <span className="user-remove-text mr-0" />
            </a>
          </div>
        </div>
      </div>
      {sliders.map(sliderView)}
      <a>
        <span onClick={addSlider} className="input-heading-add-another">
          + {AppConstants.addSlider}
        </span>
      </a>
    </div>
  );
};

export default Sliders;
