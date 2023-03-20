import { FORM_ITEM_NAME } from "./constants";

export default function getFormNames(showSubEvents, showPositions){
    const {time, eventType, eventSubType, player, team, position} = FORM_ITEM_NAME;
    let formNames = [time, eventType, player, team,]
    if(showSubEvents){
      formNames.push(eventSubType);
    }
    if(showPositions){
      formNames.push(position)
    }
    return formNames;
}