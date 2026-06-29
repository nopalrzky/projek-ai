import React from "react";
import { motion } from "framer-motion";
import { User, Mail, Building2, MapPin, Phone } from "lucide-react";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { Loan } from "@/types";

interface LoanEmployeeProps {
    loan: Loan;
}

const LoanEmployee: React.FC<LoanEmployeeProps> = ({ loan }) => {
    const employee = loan.employee;

    if (!employee) {
        return (
            <Card className="p-6">
                <p
                    className="text-center"
                    style={{ color: "var(--color-text-tertiary)" }}
                >
                    Data karyawan tidak tersedia
                </p>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Card className="p-6">
                    <div className="flex items-start gap-6">
                        <div
                            className="p-4 rounded-xl"
                            style={{
                                backgroundColor: "var(--color-primary-100)",
                            }}
                        >
                            <User
                                className="w-12 h-12"
                                style={{ color: "var(--color-primary-600)" }}
                            />
                        </div>

                        <div className="flex-1">
                            <h2
                                className="text-2xl font-bold mb-2"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {employee.name}
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                {employee.username && (
                                    <div className="flex items-center gap-3">
                                        <Mail
                                            className="w-5 h-5"
                                            style={{
                                                color: "var(--color-text-tertiary)",
                                            }}
                                        />
                                        <div>
                                            <p
                                                className="text-xs font-medium mb-1"
                                                style={{
                                                    color: "var(--color-text-tertiary)",
                                                }}
                                            >
                                                Email
                                            </p>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                {employee.username}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {employee.phone && (
                                    <div className="flex items-center gap-3">
                                        <Phone
                                            className="w-5 h-5"
                                            style={{
                                                color: "var(--color-text-tertiary)",
                                            }}
                                        />
                                        <div>
                                            <p
                                                className="text-xs font-medium mb-1"
                                                style={{
                                                    color: "var(--color-text-tertiary)",
                                                }}
                                            >
                                                Telepon
                                            </p>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                {employee.phone}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {loan.outlet && (
                                    <div className="flex items-center gap-3">
                                        <Building2
                                            className="w-5 h-5"
                                            style={{
                                                color: "var(--color-text-tertiary)",
                                            }}
                                        />
                                        <div>
                                            <p
                                                className="text-xs font-medium mb-1"
                                                style={{
                                                    color: "var(--color-text-tertiary)",
                                                }}
                                            >
                                                Outlet
                                            </p>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                {loan.outlet.name}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {employee.address && (
                                    <div className="flex items-start gap-3 md:col-span-2">
                                        <MapPin
                                            className="w-5 h-5 mt-0.5"
                                            style={{
                                                color: "var(--color-text-tertiary)",
                                            }}
                                        />
                                        <div>
                                            <p
                                                className="text-xs font-medium mb-1"
                                                style={{
                                                    color: "var(--color-text-tertiary)",
                                                }}
                                            >
                                                Alamat
                                            </p>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                {employee.address}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
};

export default LoanEmployee;
