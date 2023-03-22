import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Layout, Breadcrumb, Menu, Table, Select, Input, Pagination, DatePicker, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import AppConstants from 'themes/appConstants';
import {
  liveScoreSuspensionListAction,
  liveScoreSuspensionTypeListAction,
  liveScoreSuspensionSetFilterAction,
  liveScoreSuspensionUpdateFilter,
  liveScoreSuspensionSetSelectedAction,
} from '../../store/actions/LiveScoreAction/liveScoreSuspensionAction';
import InnerHorizontalMenu from 'pages/innerHorizontalMenu';
import DashboardLayout from 'pages/dashboardLayout';

//pcj
import { Col, Row, Typography } from 'antd';

const { Content } = Layout;
const { Option } = Select;
const { SubMenu } = Menu;

const { Title, Text } = Typography;

const SelectBox = ({ title, options, ...props }) => {
    console.log(options.length);
    return (
        <>
            <Text type="secondary">{ title }</Text>
            <Select
                // style={{ width: '100%' }}
                //onChange={onSecondCityChange}
                {...props}
            >
                <Option key={-1} value={-1}>
                    {AppConstants.all}
                </Option>
                {(options || []).map((item, index) => (
                    <Option key={index} value={item.id}>
                        {item.name}
                    </Option>
                ))}
            </Select>
        </>
    );
};

const HeaderView = () => {
    // style
    const container = {
        padding: '20px'
    }
    return (
        <Row style={{marginTop: '30px',marginBottom: '30px'}}>
            <Col md={{ span: 12, offset: 0 }} xs={{ span: 24, offset: 0 }}  justify="start">
                <Title level={3}>{AppConstants.suspensionsMyClone}</Title>
            </Col>
            <Col md={{ span: 6, offset: 6 }} xs={{ span: 24, offset: 0 }} justify="end">
                <Input 
                    status="error" 
                    prefix={<SearchOutlined />} 
                    placeholder="Search..." 
                />
            </Col>
        </Row>
    );
};

const DropDownView = () => {
    const { yearList, filter } = useSelector(state => state.LiveScoreSuspensionState);
    console.log("pcj"+yearList.length);
    return(
        <>
            <Row>
                <Col md={{ span: 6, offset: 0 }} xs={{ span: 24, offset: 0 }}  justify="start">
                    <SelectBox 
                        title={AppConstants.year}
                        value={filter.yearRefId}
                        options={(yearList || []).map(i => ({ id: i.id, name: i.description }))}
                    >
                    </SelectBox>
                </Col>
                <Col md={{ span: 6, offset: 18 }} xs={{ span: 24, offset: 0 }}  justify="end">
                    <SelectBox 
                        title={AppConstants.year}
                        value={filter.yearRefId}
                        options={(yearList || []).map(i => ({ id: i.id, name: i.description }))}
                    >
                    </SelectBox>
                </Col>
            </Row>
        </>
    );
}

const LiveScoreSuspensions = () => {
  

  return (
    <div className="fluid-width default-bg">
      <DashboardLayout menuHeading={AppConstants.matchDay} menuName={AppConstants.matchDay} />
      <InnerHorizontalMenu menu="matchDay" userSelectedKey="3" />
      <Layout>
        <HeaderView></HeaderView>
        <Content>
            <DropDownView></DropDownView>
        </Content>
      </Layout>
    </div>
  );
};

export default LiveScoreSuspensions;
