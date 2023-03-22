import AppConstants from '../../../themes/appConstants';

export const buildFooterMenusInitialState = footerMenus => {
  if (footerMenus && footerMenus.length) {
    return footerMenus.map(menuItem => {
      let siteMenuIDs = menuItem.site_menus.data;

      if (siteMenuIDs) {
        siteMenuIDs = siteMenuIDs.map(siteMenu => siteMenu.id);
      } else {
        siteMenuIDs = [];
      }

      return {
        ...menuItem,
        site_menus: siteMenuIDs,
      };
    });
  }

  return [];
};

export const removeSocialMediaDomains = link => {
  const socialMediaItems = [
    AppConstants.facebookPreTab,
    AppConstants.instagramPreTab,
    AppConstants.twitterPreTab,
    AppConstants.youtubePreTab,
  ];

  for (let domain of socialMediaItems) {
    link = link.replace(domain, '');
  }

  return link;
};

export const getRandomNumber = (between) => {
    return Math.floor(Math.random() * between);
};
