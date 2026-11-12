
import {
  getAllLeaveRequests,
  getLeaveRequestById,
  createLeaveRequest,
  updateLeaveRequest,
  deleteLeaveRequest,
  getAllLeaveTypes,
  createLeaveType,
  updateLeaveType,
  deleteLeaveType,
} from "../server/services/leave.service";

import { getAllEmployees } from "../server/services/employee.service";

async function testLeave() {
  let leaveTypeId: string | undefined;
  let leaveRequestId: string | undefined;

  try {
    // Get an existing employee
    const employees = await getAllEmployees();
    const employee = employees[0];
    const employeeId = employee.id;

    // 1. GET ALL LEAVE TYPES
    const allLeaveTypes = await getAllLeaveTypes();
    console.log("All Leave Types:", allLeaveTypes);

    // 2. CREATE LEAVE TYPE
    const createdType = await createLeaveType({
      name: `Testing Leave ${Date.now()}`,
      description: "Leave type CRUD testing",
    });

    leaveTypeId = createdType[0].id;
    console.log("Created Leave Type:", createdType);

    // 3. UPDATE LEAVE TYPE
    const updatedType = await updateLeaveType(leaveTypeId, {
      name: `Updated Leave ${Date.now()}`,
      description: "Leave type updated successfully",
    });

    console.log("Updated Leave Type:", updatedType);

    // 4. GET ALL LEAVE REQUESTS
    const allRequests = await getAllLeaveRequests();
    console.log("All Leave Requests:", allRequests);

    // 5. CREATE LEAVE REQUEST
    const createdRequest = await createLeaveRequest({
      employeeId,
      leaveTypeId,
      startDate: "2099-12-20",
      endDate: "2099-12-22",
      reason: "Testing leave request",
    });

    leaveRequestId = createdRequest[0].id;
    console.log("Created Leave Request:", createdRequest);

    // 6. GET LEAVE REQUEST BY ID
    const fetchedRequest = await getLeaveRequestById(leaveRequestId);
    console.log("Leave Request by ID:", fetchedRequest);

    // 7. UPDATE LEAVE REQUEST
    const updatedRequest = await updateLeaveRequest(
      leaveRequestId,
      {
        employeeId,
        leaveTypeId,
        startDate: "2099-12-20",
        endDate: "2099-12-22",
        reason: "Updated testing leave request",
        status: "PENDING",
      }
    );

    console.log("Updated Leave Request:", updatedRequest);

    // 8. DELETE LEAVE REQUEST
    const deletedRequest = await deleteLeaveRequest(leaveRequestId);
    console.log("Deleted Leave Request:", deletedRequest);

    leaveRequestId = undefined;

    // 9. DELETE LEAVE TYPE
    const deletedType = await deleteLeaveType(leaveTypeId);
    console.log("Deleted Leave Type:", deletedType);

    leaveTypeId = undefined;

    console.log("All Leave CRUD tests completed!");
  } finally {
    // Clean up temporary records if a test fails
    if (leaveRequestId) {
      await deleteLeaveRequest(leaveRequestId);
    }

    if (leaveTypeId) {
      await deleteLeaveType(leaveTypeId);
    }
  }
}

testLeave().catch(console.error);
