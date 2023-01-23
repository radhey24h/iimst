import { Student } from "../model/Student";
import http from "./http-common";

class StudentService {
  getAll() {
    return http.get("/GetStudents");
  }

  get(id:number) {
    return http.get(`/GetStudent?id=${id}`);
  }

  create(data:Student) {
    return http.post("/AddStudent", data);
  }

  update(id:number, data:Student) {
    return http.put(`/UpdateStudent/${id}`, data);
  }

  delete(id:number) {
    return http.delete(`/DeleteStudent/${id}`);
  }
}

export default new StudentService();