import React from "react";
import { Badge } from "@/Components/Badge";
import { Card } from "@/Components/Card";
import { formatCurrency } from "@/lib/utils";
import { FinePageHeaderProps } from "../types";

const FinePageHeader: React.FC<FinePageHeaderProps> = ({ fine, isLoading }) => {
    return (
        <Card className="p-6">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-4">
                        <div className="flex-1">
                            <h1
                                className="text-2xl font-bold mb-2"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {fine.name}
                            </h1>

                            <div className="flex flex-wrap items-center gap-3 mb-3">
                                <Badge variant="warning" size="lg">
                                    <span className="font-semibold">
                                        {formatCurrency(fine.amount)}
                                    </span>
                                </Badge>

                                {fine.fineLogsCount > 0 && (
                                    <Badge variant="info" size="md">
                                        {fine.fineLogsCount} Catatan
                                    </Badge>
                                )}
                            </div>

                            {fine.description && (
                                <p
                                    className="text-sm max-w-2xl"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    {fine.description}
                                </p>
                            )}

                            <div
                                className="mt-3 text-sm"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                {fine.outlet && (
                                    <p>
                                        <strong>Outlet:</strong>{" "}
                                        {fine.outlet.name}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default FinePageHeader;
