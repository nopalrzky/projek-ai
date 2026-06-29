import React from "react";
import { motion } from "framer-motion";
import { Mail, Phone, Calendar, MapPin, ExternalLink } from "lucide-react";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import { formatDate } from "@/lib/utils";
import { FineLogEmployeeProps } from "../types";

const FineLogEmployee: React.FC<FineLogEmployeeProps> = ({ fineLog }) => {
    const employee = fineLog.employee;

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
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="p-6">
                <div className="flex items-start gap-6 mb-6">
                    <div
                        className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold"
                        style={{
                            backgroundColor: "var(--color-primary-100)",
                            color: "var(--color-primary-600)",
                        }}
                    >
                        {employee.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h2
                                className="text-2xl font-bold"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {employee.name}
                            </h2>
                            <Badge
                                variant={
                                    employee.isActive ? "success" : "error"
                                }
                            >
                                {employee.isActive ? "Aktif" : "Nonaktif"}
                            </Badge>
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                (window.location.href = route(
                                    "employees.show",
                                    employee.id,
                                ))
                            }
                            leftIcon={<ExternalLink className="w-4 h-4" />}
                        >
                            Lihat Profil Lengkap
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Contact Info */}
                    {employee.username && (
                        <div className="flex items-start gap-3">
                            <div
                                className="p-2 rounded-lg"
                                style={{
                                    backgroundColor: "var(--color-info-100)",
                                }}
                            >
                                <Mail
                                    className="w-5 h-5"
                                    style={{ color: "var(--color-info-600)" }}
                                />
                            </div>
                            <div>
                                <p
                                    className="text-sm font-medium mb-1"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    Email
                                </p>
                                <p
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {employee.username}
                                </p>
                            </div>
                        </div>
                    )}

                    {employee.phone && (
                        <div className="flex items-start gap-3">
                            <div
                                className="p-2 rounded-lg"
                                style={{
                                    backgroundColor: "var(--color-success-100)",
                                }}
                            >
                                <Phone
                                    className="w-5 h-5"
                                    style={{
                                        color: "var(--color-success-600)",
                                    }}
                                />
                            </div>
                            <div>
                                <p
                                    className="text-sm font-medium mb-1"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    Telepon
                                </p>
                                <p
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {employee.phone}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Join Date */}
                    {employee.startDate && (
                        <div className="flex items-start gap-3">
                            <div
                                className="p-2 rounded-lg"
                                style={{
                                    backgroundColor: "var(--color-primary-100)",
                                }}
                            >
                                <Calendar
                                    className="w-5 h-5"
                                    style={{
                                        color: "var(--color-primary-600)",
                                    }}
                                />
                            </div>
                            <div>
                                <p
                                    className="text-sm font-medium mb-1"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    Tanggal Bergabung
                                </p>
                                <p
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {formatDate(
                                        employee.startDate,
                                        "DD MMMM YYYY",
                                    )}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Address */}
                    {employee.address && (
                        <div className="flex items-start gap-3">
                            <div
                                className="p-2 rounded-lg"
                                style={{
                                    backgroundColor: "var(--color-warning-100)",
                                }}
                            >
                                <MapPin
                                    className="w-5 h-5"
                                    style={{
                                        color: "var(--color-warning-600)",
                                    }}
                                />
                            </div>
                            <div>
                                <p
                                    className="text-sm font-medium mb-1"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    Alamat
                                </p>
                                <p
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {employee.address}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        </motion.div>
    );
};

export default FineLogEmployee;
