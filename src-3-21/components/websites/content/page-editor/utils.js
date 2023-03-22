import { isArrayNotEmpty } from '../../../../util/helpers';

export const transformSlidersFormToSave = sliders => {
  if (!isArrayNotEmpty(sliders) || !sliders[0].image) return [];

  let slidersForm = [];

  for (const slider of sliders) {
    const formItem = {
      featured_posts: [],
      image: '',
    };
    let validItem = true;

    if (slider.image) {
      formItem.image = slider.image;
    } else {
      validItem = false;
    }

    if (validItem) {
      if (slider.featured_posts.data && isArrayNotEmpty(slider.featured_posts.data)) {
        formItem.featured_posts = slider.featured_posts.data.map(post => post.id);
      } else if (isArrayNotEmpty(slider.featured_posts)) {
        formItem.featured_posts = slider.featured_posts;
      }

      slidersForm.push(formItem);
    }
  }

  return slidersForm;
};
