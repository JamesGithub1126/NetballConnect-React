import React, { Component } from 'react';
import { Menu, Dropdown, Switch } from 'antd';
import { DownOutlined, CaretUpOutlined } from '@ant-design/icons';
import ChartCard from 'customComponents/ChartCard';
import './index.css';

/* TODO: it's the old chartBox component */
/* TODO: delete as Referee Payments chart functionality is ready  */
export default class ChartBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedDateRange: 0,
      dateRanges: [
        { id: 0, description: 'Last week' },
        { id: 1, description: 'Last 1 month' },
        { id: 2, description: 'Last 3 months' },
      ],
      leftTitle: 'Yesterday',
      leftValue: '2122',
      rightTitle: 'Change',
      rightValue: '12%',
      mainValue: 3212,
    };
  }

  handleMenuClick = e => {
    this.setState({ selectedDateRange: e.key });
  };

  render() {
    const { useSwitch, title, currencyFormat } = this.props;
    const { leftTitle, leftValue, rightTitle, rightValue, mainValue } = this.state;
    return (
      <div>
        <ChartCard
          extra={this.getTimeView()}
          toggle={
            useSwitch ? <Switch checkedChildren="$" unCheckedChildren="#" defaultChecked /> : null
          }
          data={[]}
          title={title}
          trend={<CaretUpOutlined style={{ color: '#50c315', fontSize: 18 }} />}
          subvalue={{
            lvalue: this.formatValue(leftValue),
            ltitle: leftTitle,
            rvalue: rightValue,
            rtitle: rightTitle,
          }}
          mainValue={ this.formatValue(mainValue)}
        />
      </div>
    );
  }

  getTimeView = () => {
    const { dateRanges, selectedDateRange } = this.state;
    let dateRange = null;
    if (dateRanges.length) {
      dateRange = dateRanges[selectedDateRange].description;
    }

    return (
      <>
        <span>
          <Dropdown
            trigger={['hover']}
            overlay={
              <Menu onClick={this.handleMenuClick}>
                {dateRanges.map(date => (
                  <Menu.Item key={date.id}>{date.description}</Menu.Item>
                ))}
              </Menu>
            }
          >
            <a className="ant-dropdown-link">
              {' '}
              {dateRange}
              <DownOutlined />
            </a>
          </Dropdown>
        </span>
      </>
    );
  };

  formatValue = num => {
    var str = num.toString();
    var reg = str.indexOf('.') > -1 ? /(\d)(?=(\d{3})+\.)/g : /(\d)(?=(?:\d{3})+$)/g;
    return str.replace(reg, '$1,');
  };
}
