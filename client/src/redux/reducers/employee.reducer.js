import employeeConstants from "../constants/employee";

const initialState = {
    employeeList: [],
    employee:{},
    loading: true
}

const employeeReducer = (state = initialState, action) => {
    switch (action.type) {
        case employeeConstants.GET_EMPLOYEES:
            return {
                ...state,
                employeeList: action.payload,
                loading: false
            };
        case employeeConstants.GET_EMPLOYEE:
            return {
                ...state,
                employee: action.payload,
                loading: false
            };

        case employeeConstants.ADD_EMPLOYEES:
        case employeeConstants.EDIT_EMPLOYEE:
        case employeeConstants.DELETE_EMPLOYEE:
            return {
                ...state,
                loading: false
            }

        default:
            return state;

    }
}
export default employeeReducer;