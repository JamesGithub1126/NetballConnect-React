import React, { Component } from 'react';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

import TreeLeaf from './TreeLeaf';

class SideBar extends Component {
  constructor(props) {
    super(props);

    this.searchedTreeLeafArray = [-1];
    this.searchedArticleArray = [];

    this.state = {
      searchContent: '',
      searchApply: '',
    };
  }

  componentDidUpdate() {
    if (this.searchedTreeLeafArray.length === 0) {
      this.searchedTreeLeafArray = [-1];
    }
  }

  onChangeSearchText = e => {
    if (e.target.value.length === 0) {
      this.searchedTreeLeafArray = [];
      this.searchedArticleArray = [];

      this.setState({
        searchApply: e.target.value,
      });
    }
    this.setState({
      searchContent: e.target.value,
    });
  };

  onKeyEnterSearchText = e => {
    const code = e.keyCode || e.which;
    if (code === 13) {
      // input enter
      this.onClickSearchIcon();
    }
  };

  onClickSearchIcon = () => {
    this.setState({ searchApply: `${this.state.searchContent}` });
  };

  search = id => {
    if (id === -1) {
      this.searchedTreeLeafArray = [];
      for (let i = 0; i < this.props.content.length; i++) {
        if (
          this.props.content[i].article
            .toLowerCase()
            .search(this.state.searchApply.toLowerCase()) >= 0
        ) {
          this.searchedArticleArray.push(this.props.content[i].id);
          if (this.props.content[i].parentArticleId) {
            this.search(this.props.content[i].parentArticleId.id);
          }
        }
      }
    } else if (id > 0) {
      for (let i = 0; i < this.props.content.length; i++) {
        if (id === this.props.content[i].id) {
          this.searchedTreeLeafArray.push(this.props.content[i].id);
          if (this.props.content[i].parentArticleId) {
            this.search(this.props.content[i].parentArticleId.id);
          }
        }
      }
    }

    return true;
  };

  render() {
    const { content, setContentPanel } = this.props;

    const tree = [];
    let leaves = [];
    content.forEach(art => {
      if (art.parentArticleId === null) {
        tree.push({ ...art });
      } else {
        leaves.push({ ...art });
      }
    });

    if (this.state.searchApply.length > 0) {
      this.search(-1);
    }

    return (
      <div className="support-side-bar">
        <div className="search-box">
          <Input
            className="product-reg-search-input"
            onChange={this.onChangeSearchText}
            placeholder="Search for articles..."
            onKeyPress={this.onKeyEnterSearchText}
            prefix={
              <SearchOutlined
                className="search-prefix-icon-style"
                onClick={this.onClickSearchIcon}
              />
            }
            allowClear
          />
        </div>

        <div className="separator" />

        {tree.map(cont => {
          if (
            ((this.searchedTreeLeafArray.indexOf(-1) === 0 ||
              this.searchedTreeLeafArray.length === 0) &&
              this.searchedArticleArray.length === 0) ||
            this.searchedTreeLeafArray.indexOf(cont.id) > -1 ||
            this.searchedArticleArray.indexOf(cont.id) > -1 ||
            this.searchedArticleArray.length === 0
          ) {
            return (
              <div key={cont.article}>
                <TreeLeaf
                  searchedArray={this.searchedTreeLeafArray}
                  data={leaves}
                  content={cont}
                  setContentPanel={setContentPanel}
                />
                <div className="separator" />
              </div>
            );
          }
          return <></>;
        })}
      </div>
    );
  }
}

export default SideBar;
