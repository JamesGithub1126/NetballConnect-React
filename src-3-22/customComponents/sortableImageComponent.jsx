import * as React from 'react';
import RLDD from 'react-list-drag-and-drop/lib/RLDD';
import AppImages from '../themes/appImages';

export default class SortableImage extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      items: props.images,
      allDisabled: props.allDisabled,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.images !== this.state.items) {
      this.setState({ items: nextProps.images });
    }
  }

  removeImage = index => {
    let items = JSON.parse(JSON.stringify(this.state.items));
    items.splice(index, 1);
    this.setState({ items });
    this.props.reorderedUrls(items);
  };

  render() {
    const { items } = this.state;
    return (
      <RLDD
        cssClasses="example-list-container flexWrap"
        layout="horizontal"
        items={items ? items : this.props.images}
        itemRenderer={this.itemRenderer}
        onChange={this.handleRLDDChange}
      />
    );
  }

  itemRenderer = (item, index) => {
    return (
      <div onClick={e => e.stopPropagation()}>
        <img
          src={item.image}
          width="160"
          height="160"
          style={{ margin: 10 }}
          onClick={e => e.stopPropagation()}
          alt=""
        />
        <div className="red-remove-cross-img-div pt-0" style={{ cursor: 'pointer' }}>
          <img
            className="dot-image"
            src={AppImages.redCross}
            alt=""
            width="16"
            height="16"
            onClick={() => (this.state.allDisabled == false ? this.removeImage(index) : null)}
          />
        </div>
      </div>
    );
  };

  handleRLDDChange = reorderedItems => {
    if (this.state.allDisabled == false) {
      this.setState({ items: reorderedItems });
      this.props.reorderedUrls(reorderedItems);
    }
  };
}
