import { pgTable, unique, uuid, varchar, text, timestamp, foreignKey, index, check, date, numeric } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const departments = pgTable("departments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	unique("departments_name_key").on(table.name),
]);

export const designations = pgTable("designations", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: varchar({ length: 100 }).notNull(),
	departmentId: uuid("department_id"),
}, (table) => [
	foreignKey({
			columns: [table.departmentId],
			foreignColumns: [departments.id],
			name: "designations_department_id_fkey"
		}),
]);

export const employees = pgTable("employees", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	employeeCode: varchar("employee_code", { length: 50 }).notNull(),
	firstName: varchar("first_name", { length: 100 }).notNull(),
	lastName: varchar("last_name", { length: 100 }),
	email: varchar({ length: 150 }).notNull(),
	phone: varchar({ length: 20 }),
	dateOfBirth: date("date_of_birth"),
	gender: varchar({ length: 20 }),
	address: text(),
	departmentId: uuid("department_id"),
	designationId: uuid("designation_id"),
	joiningDate: date("joining_date"),
	salary: numeric({ precision: 12, scale:  2 }),
	status: varchar({ length: 20 }).default('ACTIVE'),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_employees_department").using("btree", table.departmentId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.departmentId],
			foreignColumns: [departments.id],
			name: "employees_department_id_fkey"
		}),
	foreignKey({
			columns: [table.designationId],
			foreignColumns: [designations.id],
			name: "employees_designation_id_fkey"
		}),
	unique("employees_employee_code_key").on(table.employeeCode),
	unique("employees_email_key").on(table.email),
	check("employees_salary_check", sql`salary >= (0)::numeric`),
]);

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	email: varchar({ length: 150 }).notNull(),
	passwordHash: varchar("password_hash", { length: 255 }).notNull(),
	role: varchar({ length: 20 }).notNull(),
	employeeId: uuid("employee_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.employeeId],
			foreignColumns: [employees.id],
			name: "users_employee_id_fkey"
		}),
	unique("users_email_key").on(table.email),
	unique("users_employee_id_key").on(table.employeeId),
	check("users_role_check", sql`(role)::text = ANY ((ARRAY['ADMIN'::character varying, 'EMPLOYEE'::character varying])::text[])`),
]);

export const attendance = pgTable("attendance", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	employeeId: uuid("employee_id").notNull(),
	attendanceDate: date("attendance_date").notNull(),
	checkIn: timestamp("check_in", { mode: 'string' }),
	checkOut: timestamp("check_out", { mode: 'string' }),
	status: varchar({ length: 20 }).notNull(),
}, (table) => [
	index("idx_attendance_employee").using("btree", table.employeeId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.employeeId],
			foreignColumns: [employees.id],
			name: "attendance_employee_id_fkey"
		}),
	unique("attendance_employee_id_attendance_date_key").on(table.employeeId, table.attendanceDate),
]);

export const leaveRequests = pgTable("leave_requests", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	employeeId: uuid("employee_id").notNull(),
	leaveTypeId: uuid("leave_type_id").notNull(),
	startDate: date("start_date").notNull(),
	endDate: date("end_date").notNull(),
	reason: text(),
	status: varchar({ length: 20 }).default('PENDING'),
	approvedBy: uuid("approved_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_leave_requests_employee").using("btree", table.employeeId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.employeeId],
			foreignColumns: [employees.id],
			name: "leave_requests_employee_id_fkey"
		}),
	foreignKey({
			columns: [table.leaveTypeId],
			foreignColumns: [leaveTypes.id],
			name: "leave_requests_leave_type_id_fkey"
		}),
	foreignKey({
			columns: [table.approvedBy],
			foreignColumns: [users.id],
			name: "leave_requests_approved_by_fkey"
		}),
	check("leave_requests_status_check", sql`(status)::text = ANY ((ARRAY['PENDING'::character varying, 'APPROVED'::character varying, 'REJECTED'::character varying])::text[])`),
	check("leave_requests_check", sql`end_date >= start_date`),
]);

export const leaveTypes = pgTable("leave_types", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	description: text(),
}, (table) => [
	unique("leave_types_name_key").on(table.name),
]);
