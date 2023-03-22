import React, { Component } from 'react';
import './swappable.css';
class CompetitionSwappable extends Component {
  constructor() {
    super();

    this.state = {
      customFunc: null,
    };
  }

  allowDrop(ev) {
    ev.preventDefault();
  }

  drag(ev, customFunc = null) {
    ev.dataTransfer.setData('src', ev.target.id);

    this.setState({
      initialParentNode: ev.target.parentNode,
    });
  }

  dragEnd(ev, customFunc = null) {
    if (customFunc && ev.target.parentNode != this.state.initialParentNode) {
      this.props.customFunc();
    }
  }

  drop(ev, dragableId, dropzoneId, customFunc = null, swappable = true) {
    if (swappable == false) {
      return;
    }
    ev.preventDefault();

    let src = document.getElementById(ev.dataTransfer.getData('src'));
    if (src == null) {
      return;
    }
    let srcParent = src.parentNode;

    let target = document.getElementById(dragableId);
    let targetParent = target.parentNode;

    swappable
      ? this.swapElements(src, target, srcParent, targetParent)
      : this.transferElement(src, dropzoneId);
  }

  swapElements(src, target, srcParent, targetParent) {
    target.replaceWith(src);
    srcParent.appendChild(target);
    this.props.onSwap(src.id, target.id);
  }

  transferElement(src, dropzoneId) {
    let dropzone = document.getElementById(dropzoneId);
    dropzone.appendChild(src);
  }

  render() {
    // const dropZoneStyle = {
    //     width: '50px',
    //     minHeight: '50px',
    //     //   padding: '10px',
    //     border: '1px solid #aaaaaa'
    // };

    // const draggableStyle = {
    //     width: '50px',
    //     height: '50px',
    //     //   padding: '10px',
    //     border: '1px solid red'
    // };

    const {
      id,
      // content,
      swappable,
      customFunc,
    } = this.props;
    const dropzoneId = 'drop' + id;
    // const dragableId = 'drag' + id;
    const dragableId = id;
    return (
      <div
        id={dropzoneId}
        onDrop={event => this.drop(event, dragableId, dropzoneId, customFunc, swappable)}
        onDragOver={event => this.allowDrop(event)}
        className="quickCompetitionDropzoneId"
      >
        <div
          id={dragableId}
          draggable={swappable}
          onDragStart={event => this.drag(event)}
          onDragEnd={event => this.dragEnd(event, customFunc)}
          className="quickCompetitionDragableId"
        >
          {this.props.children}
        </div>
      </div>
    );
  }
}

export default CompetitionSwappable;
