/* eslint-disable max-len */
import { FLAVOUR } from '../util/enums';
const { default: CommonValidationConstants } = require('./common/validationConstant');
const flavour = process.env.REACT_APP_FLAVOUR || FLAVOUR.Netball;
const { default: FlavouredValidationConstants } = require(`./${flavour}/validationConstant`);

const ValidationConstants = {
  ...CommonValidationConstants,
  ...FlavouredValidationConstants,
  flavour,
};

export default ValidationConstants;
