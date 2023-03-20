/* eslint-disable max-len */
import { FLAVOUR } from '../util/enums';
const { default: CommonTutorialConstants } = require('./common/tutorialConstants');
const flavour = process.env.REACT_APP_FLAVOUR || FLAVOUR.Netball;
const { default: FlavouredTutorialConstants } = require(`./${flavour}/tutorialConstants`);

const TutorialConstants = { ...CommonTutorialConstants, ...FlavouredTutorialConstants, flavour };

export default Object.values(TutorialConstants);