
import {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../server/services/department.service";

async function testDepartment() {
  let departmentId: string | undefined;

  try {
    // 1. GET ALL DEPARTMENTS
    const allDepartments = await getAllDepartments();
    console.log("All Departments:", allDepartments);

    // 2. CREATE DEPARTMENT
    const created = await createDepartment({
      name: `Testing Department ${Date.now()}`,
      description: "Department CRUD testing",
    });

    const department = created[0];

    if (created.length === 0) {
      throw new Error("Department creation failed");
    }

    departmentId = department.id;
    console.log("Created Department:", department);

    // 3. GET DEPARTMENT BY ID
    const fetched = await getDepartmentById(departmentId);
    console.log("Department by ID:", fetched);

    // 4. UPDATE DEPARTMENT
    const updated = await updateDepartment(departmentId, {
      name: `Updated Department ${Date.now()}`,
      description: "Department updated successfully",
    });

    console.log("Updated Department:", updated);

    // 5. DELETE DEPARTMENT
    const deleted = await deleteDepartment(departmentId);
    console.log("Deleted Department:", deleted);

    departmentId = undefined;

    console.log("All Department CRUD tests completed!");
  } finally {
    // Clean up the test record if an earlier operation fails
    if (departmentId) {
      await deleteDepartment(departmentId);
    }
  }
}

testDepartment().catch(console.error);
