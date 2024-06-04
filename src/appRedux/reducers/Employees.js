import {
  DELETE_EMPLOYEE_SUCCESS,
  GET_All_EMPLOYEE_SUCCESS,
  ON_ADD_EMPLOYEE_SUCCESS,
  UPDATE_EMPLOYEE_SUCCESS
} from "../../constants/ActionTypes";

const INIT_STATE = {
  contactList: [],
  selectedContact: []
};


export default (state = INIT_STATE, action) => {
  switch (action.type) {


    case GET_All_EMPLOYEE_SUCCESS: {
      return {
        ...state,
        contactList: action.payload,
      }
    }

    case UPDATE_EMPLOYEE_SUCCESS:
      return {
        ...state,
        contactList: state.contactList.map((contact) => contact.id === action.payload.id ? action.payload : contact),
      };

    case DELETE_EMPLOYEE_SUCCESS:
      return {
        ...state,
        contactList: state.contactList.filter((contact) => contact.id !== action.payload.id),
      };

    case ON_ADD_EMPLOYEE_SUCCESS:
      return {
        ...state,
        contactList: action.payload.contact(state.contactList),
      };

    default:
      return state;
  }
}