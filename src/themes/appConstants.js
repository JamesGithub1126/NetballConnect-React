/* eslint-disable max-len */
import { FLAVOUR } from '../util/enums';
const { default: CommonAppConstants } = require('./common/appConstants');
const flavour = process.env.REACT_APP_FLAVOUR || FLAVOUR.Netball;
const { default: FlavouredAppConstants } = require(`./${  flavour  }/appConstants`);

const AppConstants = { ...CommonAppConstants, ...FlavouredAppConstants, flavour };

export default AppConstants;
