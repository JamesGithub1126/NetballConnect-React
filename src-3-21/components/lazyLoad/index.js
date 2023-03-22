import React from 'react';
import { Skeleton } from 'antd';

const lazyLoad = Component => props => (
  <React.Suspense fallback={<Skeleton avatar paragraph={{ rows: 4 }} />}>
    <Component {...props} />
  </React.Suspense>
);

export default lazyLoad;
