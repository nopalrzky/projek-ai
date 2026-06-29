import { PayrollPreviewRequest, PayrollPreviewResponse } from "@/types";
import { router } from "@inertiajs/react";
import axios from "axios";

export const payrollService = {
    /**
     * Navigate to payroll index page
     */
    goToIndex: () => {
        router.visit(route("payrolls.index"));
    },

    /**
     * Navigate to create payroll page
     */
    goToCreate: () => {
        router.visit(route("payrolls.create"));
    },

    /**
     * Navigate to edit payroll page
     */
    goToEdit: (payrollId: number) => {
        router.visit(route("payrolls.edit", payrollId));
    },

    /**
     * Get payroll preview (AJAX call)
     */
    async getPreview(
        request: PayrollPreviewRequest,
    ): Promise<PayrollPreviewResponse> {
        try {
            const response = await axios.post<{
                success: boolean;
                data: PayrollPreviewResponse;
                message?: string;
            }>("/api/payrolls/preview", request);

            if (!response.data.success) {
                throw new Error(
                    response.data.message || "Failed to get payroll preview",
                );
            }

            return response.data.data;
        } catch (error: any) {
            console.error("Get payroll preview error:", error);
            throw new Error(
                error.response?.data?.message ||
                    error.message ||
                    "Failed to get payroll preview",
            );
        }
    },

    /**
     * Navigate to view payroll page
     */
    goToView: (payrollId: number) => {
        router.visit(route("payrolls.show", payrollId));
    },
};

export default payrollService;
