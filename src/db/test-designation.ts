
import {
  getAllDesignations,
  getDesignationById,
  createDesignation,
  updateDesignation,
  deleteDesignation,
} from "../server/services/designation.service";

import { getAllDepartments } from "../server/services/department.service";

async function testDesignation() {
  let designationId: string | undefined;

  try {
    // 1. GET ALL DESIGNATIONS
    const allDesignations = await getAllDesignations();
    console.log("All Designations:", allDesignations);

    // 2. GET AN EXISTING DEPARTMENT
    const departments = await getAllDepartments();

    if (departments.length === 0) {
      throw new Error("Please create a department before testing designations.");
    }

    const departmentId = departments[0].id;

    // 3. CREATE DESIGNATION
    const created = await createDesignation({
      title: `Testing Designation ${Date.now()}`,
      departmentId,
    });

    const designation = created[0];

    if (!designation) {
      throw new Error("Designation creation failed.");
    }

    designationId = designation.id;

    console.log("Created Designation:", designation);

    // 4. GET DESIGNATION BY ID
    const fetched = await getDesignationById(designationId);
    console.log("Designation by ID:", fetched);

    // 5. UPDATE DESIGNATION
    const updated = await updateDesignation(designationId, {
      title: `Updated Designation ${Date.now()}`,
      departmentId,
    });

    console.log("Updated Designation:", updated);

    // 6. DELETE DESIGNATION
    const deleted = await deleteDesignation(designationId);
    console.log("Deleted Designation:", deleted);

    designationId = undefined;

    console.log("All Designation CRUD tests completed!");
  } finally {
    // Clean up if an earlier operation fails
    if (designationId) {
      await deleteDesignation(designationId);
    }
  }
}

testDesignation().catch(console.error);
