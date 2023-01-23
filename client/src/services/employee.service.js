import http from "./http-common";

class EmployeeService {
  getAll() {
    return http.get("/GetEmployees");
  }

  get(id) {
    return http.get(`/GetEmployee?id=${id}`);
  }

  create(data) {
    return http.post("/AddEmployee", data);
  }

  update(id, data) {
    return http.put(`/UpdateEmployee/${id}`, data);
  }

  delete(id) {
    return http.delete(`/DeleteEmployee/${id}`);
  }
}

export default new EmployeeService();