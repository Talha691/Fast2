import {
  DELETE_CARINSURANCE_SUCCESS,
  ON_ADD_CARINSURANCE_SUCCESS,
  UPDATE_CARINSURANCE_SUCCESS
} from "../../constants/ActionTypes";

const INIT_STATE = {
  contactList: [],
  selectedContact: []
};


export default (state = INIT_STATE, action) => {
  switch (action.type) {
    case UPDATE_CARINSURANCE_SUCCESS:
      return {
        ...state,
        contactList: state.contactList.map((contact) => contact.id === action.payload.id ? action.payload : contact),
      };

    case DELETE_CARINSURANCE_SUCCESS:
      return {
        ...state,
        contactList: state.contactList.filter((contact) => contact.id !== action.payload.id),
      };

    case ON_ADD_CARINSURANCE_SUCCESS:
      return {
        ...state,
        contactList: action.payload.contact(state.contactList),
      };

    default:
      return state;
  }
}
