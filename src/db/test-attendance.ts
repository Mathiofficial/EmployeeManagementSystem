
import {
  getAllAttendance,
  getAttendanceById,
  createAttendance,
  updateAttendance,
  deleteAttendance,
} from "../server/services/attendance.service";

import { getAllEmployees } from "../server/services/employee.service";

async function testAttendance() {
  // Get an existing employee for the foreign key
  const employees = await getAllEmployees();
  const employee = employees[0];
  

  if (employees.length === 0) {
    throw new Error("Please create an employee before testing attendance.");
  }

  // Use a future date to avoid conflicts with existing attendance
  const attendanceDate = "2099-12-31";

  // 1. GET ALL ATTENDANCE
  const allAttendance = await getAllAttendance();
  console.log("All Attendance:", allAttendance);

  // 2. CREATE ATTENDANCE
  const created = await createAttendance({
    employeeId: employee.id,
    attendanceDate,
    checkIn: "2099-12-31T09:00:00.000Z",
    checkOut: "2099-12-31T17:00:00.000Z",
    status: "PRESENT",
  });

  const attendanceRecord = created[0];
  const attendanceId = attendanceRecord.id;

  console.log("Created Attendance:", attendanceRecord);

  // 3. GET ATTENDANCE BY ID
  const fetched = await getAttendanceById(attendanceId);
  console.log("Attendance by ID:", fetched);

  // 4. UPDATE ATTENDANCE
  const updated = await updateAttendance(attendanceId, {
    employeeId: employee.id,
    attendanceDate,
    checkIn: "2099-12-31T09:30:00.000Z",
    checkOut: "2099-12-31T17:30:00.000Z",
    status: "PRESENT",
  });

  console.log("Updated Attendance:", updated);

  // 5. DELETE ATTENDANCE
  const deleted = await deleteAttendance(attendanceId);
  console.log("Deleted Attendance:", deleted);

  console.log("All Attendance CRUD tests completed!");
}

testAttendance().catch(console.error);
