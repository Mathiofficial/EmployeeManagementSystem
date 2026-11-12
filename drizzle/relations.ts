import { relations } from "drizzle-orm/relations";
import { departments, designations, employees, users, attendance, leaveRequests, leaveTypes } from "./schema";

export const designationsRelations = relations(designations, ({one, many}) => ({
	department: one(departments, {
		fields: [designations.departmentId],
		references: [departments.id]
	}),
	employees: many(employees),
}));

export const departmentsRelations = relations(departments, ({many}) => ({
	designations: many(designations),
	employees: many(employees),
}));

export const employeesRelations = relations(employees, ({one, many}) => ({
	department: one(departments, {
		fields: [employees.departmentId],
		references: [departments.id]
	}),
	designation: one(designations, {
		fields: [employees.designationId],
		references: [designations.id]
	}),
	users: many(users),
	attendances: many(attendance),
	leaveRequests: many(leaveRequests),
}));

export const usersRelations = relations(users, ({one, many}) => ({
	employee: one(employees, {
		fields: [users.employeeId],
		references: [employees.id]
	}),
	leaveRequests: many(leaveRequests),
}));

export const attendanceRelations = relations(attendance, ({one}) => ({
	employee: one(employees, {
		fields: [attendance.employeeId],
		references: [employees.id]
	}),
}));

export const leaveRequestsRelations = relations(leaveRequests, ({one}) => ({
	employee: one(employees, {
		fields: [leaveRequests.employeeId],
		references: [employees.id]
	}),
	leaveType: one(leaveTypes, {
		fields: [leaveRequests.leaveTypeId],
		references: [leaveTypes.id]
	}),
	user: one(users, {
		fields: [leaveRequests.approvedBy],
		references: [users.id]
	}),
}));

export const leaveTypesRelations = relations(leaveTypes, ({many}) => ({
	leaveRequests: many(leaveRequests),
}));