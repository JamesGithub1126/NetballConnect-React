import React from 'react';
import AppConstants from '../../../../../../themes/appConstants';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { MenuOutlined } from '@ant-design/icons';
import { EditHeaderView } from '../../../../component/headerView';
import { updateSiteMenuAction } from '../../../../../../store/actions/strapiAction/strapiAction';
import { useDispatch, useSelector } from 'react-redux';

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result.map((item, index) => {
    item.attributes.menu_order = ++index;

    return item;
  });
};

const MenuListOrdering = ({ menuItems }) => {
  const dispatch = useDispatch();
  const strapiJWTToken = useSelector(state => state.StrapiReducerState.token);

  const onDragEnd = result => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const orderedMenuItems = reorder(menuItems, result.source.index, result.destination.index);

    orderedMenuItems.forEach(menuItem => {
      dispatch(
        updateSiteMenuAction(menuItem.id, {
          strapi_auth_token: strapiJWTToken,
          id: menuItem.id,
          menu_order: menuItem.attributes.menu_order,
        }),
      );
    });
  };

  const orderedManuItems = () => {
    return menuItems.sort((a, b) => a.attributes.menu_order - b.attributes.menu_order);
  };

  const dragableMenuView = () => {
    return (
      <div className="position-relative mt-2" style={{ paddingBottom: 35 }}>
        <div className="inside-container-view mb-2 mt-4">
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable">
              {provided => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {orderedManuItems().map((menuItem, index) => (
                    <Draggable
                      key={menuItem.id}
                      draggableId={'menuItem_' + menuItem.id}
                      index={index}
                    >
                      {provided => (
                        <div
                          key={index}
                          className="row mt-4"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <div className="col-xl-4">
                            <div className="d-flex align-items-center">
                              <MenuOutlined />
                              <span className="ml-2">{menuItem.attributes.name}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>
    );
  };

  return (
    <div className="fluid-width page-list mt-10">
      <EditHeaderView header={AppConstants.menuItemsOrdering} />
      <div className="comp-player-grades-header-drop-down-view">{dragableMenuView()}</div>
    </div>
  );
};

export default MenuListOrdering;
