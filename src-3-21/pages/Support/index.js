import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import AppConstants from '../../themes/appConstants';
import { getSupportContentAction } from '../../store/actions/supportAction';
import Loader from '../../customComponents/loader';
import DashboardLayout from '../dashboardLayout';
import SideBar from './SideBar';
import ContentPanel from './ContentPanel';

import './style.scss';
import './gridStyles.scss';

function Support(props) {
  const { supportState, getSupportContent } = props;

  const { onLoad, result } = supportState;

  const [currentArticle, setCurrentArticle] = useState(1);

  useEffect(() => {
    getSupportContent();
  }, [getSupportContent]);

  let content = null;
  result.forEach(article => {
    if (article.id === currentArticle) {
      content = article.content;
    }
  });

  return (
    <div className="fluid-width default-bg">
      <DashboardLayout menuHeading={AppConstants.support} menuName={AppConstants.support} />

      <div className="support-panel">
        <SideBar content={result} setContentPanel={setCurrentArticle} />
        <ContentPanel content={content} />
      </div>

      <Loader visible={onLoad} />
    </div>
  );
}

const mapDispatchToProps = dispatch => ({
  getSupportContent: email => dispatch(getSupportContentAction(email)),
});

const mapStateToProps = state => ({
  appState: state.AppState,
  supportState: state.SupportState,
});

export default connect(mapStateToProps, mapDispatchToProps)(Support);
