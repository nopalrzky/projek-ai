import { Account, Employee, Loan } from "@/types";

export interface EmployeeLoansIndexProps {
    employee: Employee;
    isLoading?: boolean;
}

export interface EmployeeLoansCreateProps {
    employee: Employee;
    accounts: Account[];
}

export interface EmployeeLoansEditProps {
    employee: Employee;
    loan: Loan;
    accounts: Account[];
}

export interface EmployeeLoansShowProps {
    employee: Employee;
    loan: Loan;
}
