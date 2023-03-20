let stripeKeys = {
  publicKey: process.env.REACT_APP_STRIPE_PUBLIC_KEY,
  clientId: process.env.REACT_APP_STRIPE_CLIENT_ID,
  url: process.env.REACT_APP_URL_WEB_COMP_ADMIN,
  apiURL: process.env.REACT_APP_URL_API_REGISTRATIONS,
  apiShopUrl: process.env.REACT_APP_URL_API_SHOP,
};

const StripeKeys = stripeKeys;
export default StripeKeys;
