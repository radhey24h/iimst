import employeeConstants from '../constants/employee';
import EmployeeService from '../services/employee.service'

const getEmployees = (employees) => ({
    type: employeeConstants.GET_EMPLOYEES,
    payload: employees
})
const getEmployee = (employee) => ({
    type: employeeConstants.GET_EMPLOYEE,
    payload: employee
})
const deletedEmployee = () => ({
    type: employeeConstants.DELETE_EMPLOYEE
})
const addedEmployee = () => ({
    type: employeeConstants.ADD_EMPLOYEES
})
const editedEmployee = () => ({
    type: employeeConstants.EDIT_EMPLOYEE
})

export const loadEmployees = () => {
    return function (dispatch) {
        EmployeeService.getAll().then(res => {
            dispatch(getEmployees(res.data));
        }).catch(err => {
            console.log('err', err);
        });

    }
}
export const deleteEmployee = (id) => {
    return function (dispatch) {
        EmployeeService.delete(id).then(resp => {
            dispatch(deletedEmployee());
            dispatch(loadEmployees());
        }).catch(err => {
            console.log(err)
        })
    }
}

export const addEmployee = (employee) => {
    return function (dispatch) {
        EmployeeService.create(employee).then(resp => {
            dispatch(addedEmployee());
            dispatch(loadEmployees());
        }).catch(err => {
            console.log(err)
        })
    }
}

export const loadEmployee = (id) => {
    return function (dispatch) {
        EmployeeService.get(id).then(resp => {
            dispatch(getEmployee(resp.data));
        }).catch(err => {
            console.log(err)
        })
    }
}

export const updateEmployee = (id, employee) => {
    return function (dispatch) {
        EmployeeService.update(id, employee).then(resp => {
            dispatch(editedEmployee());
            dispatch(loadEmployees());
        }).catch(err => {
            console.log(err)
        })
    }
}
