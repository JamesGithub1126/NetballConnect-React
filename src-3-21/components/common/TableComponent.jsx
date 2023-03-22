import {Component} from "react";
import AppConstants from "../../themes/appConstants";

export class TableComponent extends Component {
  constructor(props, onSort) {
    super(props);
    this.onSort = onSort;
  }
  tableSort(key) {
    let sortBy = key;
    let sortOrder = null;
    if (this.state.sortBy !== key) {
      sortOrder = 'ASC';
    } else if (this.state.sortBy === key && this.state.sortOrder === 'ASC') {
      sortOrder = 'DESC';
    } else if (this.state.sortBy === key && this.state.sortOrder === 'DESC') {
      sortBy = sortOrder = null;
    }

    this.setState({ sortBy, sortOrder });
    this.onSort({ sortBy, sortOrder });
  }
  listeners(key) {
    return {
      onClick: () => this.tableSort(key),
    };
  }

  defaultCell({ title, titleKey, sortable = true, sortableKey, key, dataIndex, render }) {
    sortableKey = sortableKey ?? dataIndex ?? key;
    dataIndex = dataIndex ?? key;
    titleKey = titleKey ?? key;
    return {
      title: title ? title : AppConstants[titleKey],
      dataIndex,
      key,
      sorter: sortable,
      ...(sortable ? { onHeaderCell: () => this.listeners(sortableKey) } : undefined),
      render,
    };
  }
}
