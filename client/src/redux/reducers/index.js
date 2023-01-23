import employeeReducer from './employee.reducer';
import { combineReducers } from 'redux';

const rootReducer = combineReducers({
    employees: employeeReducer
});

export default rootReducer;