import { router } from "@inertiajs/react";

export const employeeService = {
    goToIndex: () => {
        router.visit(route("employees.index"));
    },

    goToCreate: () => {
        router.visit(route("employees.create"));
    },
    goToEdit: (employeeId: number) => {
        router.visit(route("employees.edit", employeeId));
    },

    goToView: (employeeId: number) => {
        router.visit(route("employees.show", employeeId));
    },

    goToCreateEmployeeCommission: (employeeId: number) => {
        router.visit(
            route("employees.employee-commissions.create", employeeId),
        );
    },

    goToEditEmployeeProcessCommission: (
        employeeId: number,
        employeeProcessCommissionId: number,
    ) => {
        router.visit(
            route("employees.employee-process-commissions.edit", {
                employeeId: employeeId,
                employeeProcessCommissionId: employeeProcessCommissionId,
            }),
        );
    },

    goToCreateEmployeeSalary: (employeeId: number) => {
        router.visit(route("employees.employee-salaries.create", employeeId));
    },

    goToEditEmployeeSalary: (employeeId: number, employeeSalaryId: number) => {
        router.visit(
            route("employees.employee-salaries.edit", {
                employeeId,
                employeeSalaryId: employeeSalaryId,
            }),
        );
    },

    goToCreateEmployeeProcess: (employeeId: number) => {
        router.visit(
            route("employees.employee-processes.create", {
                employeeId,
            }),
        );
    },

    goToEditEmployeeProcess: (
        employeeId: number,
        employeeProcessId: number,
    ) => {
        router.visit(
            route("employees.employee-processes.edit", {
                employeeId,
                employeeProcessId,
            }),
        );
    },

    goToCreateFineLog(employeeId: number) {
        router.visit(
            route("employees.fine-logs.create", { employeeId: employeeId }),
        );
    },

    goToEditFineLog(employeeId: number, fineLogId: number) {
        router.visit(
            route("employees.fine-logs.edit", {
                employeeId: employeeId,
                fineLogId: fineLogId,
            }),
        );
    },
    goToViewFineLog(employeeId: number, fineLogId: number) {
        router.visit(
            route("employees.fine-logs.show", {
                employeeId: employeeId,
                fineLogId: fineLogId,
            }),
        );
    },

    goToCreateLoanPage(employeeId: number) {
        router.visit(
            route("employees.loans.create", { employeeId: employeeId }),
        );
    },

    goToEditLoanPage(employeeId: number, loanId: number) {
        router.visit(
            route("employees.loans.edit", {
                employeeId: employeeId,
                loanId: loanId,
            }),
        );
    },

    goToViewLoanPage(employeeId: number, loanId: number) {
        router.visit(
            route("employees.loans.show", {
                employeeId: employeeId,
                loanId: loanId,
            }),
        );
    },

    async getAll(outletId?: number) {
        try {
            const url = route(
                "api.employees.index",
                outletId ? { outletId } : {},
            );
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();

            if (result.success) {
                return result.data || [];
            } else {
                throw new Error(result.message || "Failed to fetch employees");
            }
        } catch (error) {
            console.error("Failed to get employees:", error);
            throw error;
        }
    },
};

export default employeeService;
