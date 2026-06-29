// import React, { useMemo, useState, useEffect } from "react";
// import { Head, useForm } from "@inertiajs/react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//     Save,
//     ArrowLeft,
//     DollarSign,
//     FileText,
//     User,
//     Calendar,
//     CreditCard,
//     TrendingUp,
//     Wallet,
//     Building2,
//     AlertTriangle,
// } from "lucide-react";
// import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
// import { Form } from "@/Components/Form";
// import {
//     Input,
//     TextAreaInput,
//     SelectInput,
//     NumberInput,
// } from "@/Components/Input";
// import { Button } from "@/Components/Button";
// 1;
// import { Alert } from "@/Components/Alert";
// import { Card } from "@/Components/Card";
// import { LoanFormData, Employee, Account, Outlet, Loan } from "@/types";
// import { LoanEditProps } from "./types";
// import loanService from "@/Services/loan.service";
// import { formatCurrency } from "@/lib/utils";

// const LoansEdit = ({
//     loan,
//     outlets,
//     employees,
//     sourceAccounts,
// }: LoanEditProps) => {
//     const hasPayments = loan.loanPaymentsCount > 0;

//     const { data, setData, processing, errors } = useForm<LoanFormData>({
//         outletId: loan.outletId || "",
//         employeeId: loan.employeeId || "",
//         sourceAccountId: loan.sourceAccountId || "",
//         amount: loan.amount || "",
//         repaymentType: loan.repaymentType || "",
//         installmentAmount: loan.installmentAmount || null,
//         installmentPeriod: loan.installmentPeriod || null,
//         loanDate: loan.loanDate || new Date().toISOString().split("T")[0],
//         startRepayment: loan.startRepayment || "",
//         note: loan.note || "",
//     });

//     const [selectedOutlet, setSelectedOutlet] = useState<Outlet | null>(null);
//     const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
//         null
//     );
//     const [selectedSourceAccount, setSelectedSourceAccount] =
//         useState<Account | null>(null);

//     const repaymentTypes: Record<
//         string,
//         { label: string; description: string }
//     > = {
//         full: {
//             label: "Lunas",
//             description: "Pembayaran dilakukan sekaligus penuh",
//         },
//         installment: {
//             label: "Cicilan",
//             description: "Pembayaran dilakukan dengan cicilan bulanan",
//         },
//     };

//     const outletOptions = useMemo(() => {
//         return [
//             { value: "", label: "Pilih Outlet" },
//             ...outlets.map((outlet) => ({
//                 value: outlet.id.toString(),
//                 label: outlet.name,
//                 description: outlet.code || undefined,
//             })),
//         ];
//     }, [outlets]);

//     const employeeOptions = useMemo(() => {
//         return [
//             { value: "", label: "Pilih Karyawan" },
//             ...employees.map((employee) => ({
//                 value: employee.id.toString(),
//                 label: `${employee.name} - ${employee.id}`,
//             })),
//         ];
//     }, [employees]);

//     const sourceAccountOptions = useMemo(() => {
//         return [
//             { value: "", label: "Pilih Sumber Dana" },
//             ...sourceAccounts.map((account) => ({
//                 value: account.id.toString(),
//                 label: account.name,
//                 description: account.code || undefined,
//             })),
//         ];
//     }, [sourceAccounts]);

//     const repaymentTypeOptions = [
//         { value: "", label: "Pilih Tipe Pembayaran" },
//         ...Object.entries(repaymentTypes).map(([value, { label }]) => ({
//             value,
//             label,
//         })),
//     ];

//     useEffect(() => {
//         if (data.outletId) {
//             const outlet = outlets.find((o) => o.id === Number(data.outletId));
//             setSelectedOutlet(outlet || null);
//         } else {
//             setSelectedOutlet(null);
//         }
//     }, [data.outletId, outlets]);

//     useEffect(() => {
//         if (data.employeeId) {
//             const employee = employees.find(
//                 (e) => e.id === Number(data.employeeId)
//             );
//             setSelectedEmployee(employee || null);
//         } else {
//             setSelectedEmployee(null);
//         }
//     }, [data.employeeId, employees]);

//     useEffect(() => {
//         if (data.sourceAccountId) {
//             const account = sourceAccounts.find(
//                 (a) => a.id === Number(data.sourceAccountId)
//             );
//             setSelectedSourceAccount(account || null);
//         } else {
//             setSelectedSourceAccount(null);
//         }
//     }, [data.sourceAccountId, sourceAccounts]);

//     const suggestedInstallment = useMemo(() => {
//         if (
//             !data.amount ||
//             !data.installmentPeriod ||
//             data.repaymentType !== "installment"
//         )
//             return 0;

//         const amount = Number(data.amount);
//         const period = Number(data.installmentPeriod);

//         if (period > 0) {
//             return Math.ceil(amount / period);
//         }

//         return 0;
//     }, [data.amount, data.installmentPeriod, data.repaymentType]);

//     const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
//         event.preventDefault();

//         const cleanedData = {
//             ...data,
//             installmentAmount: data.installmentAmount || null,
//             installmentPeriod: data.installmentPeriod || null,
//             note: data.note || null,
//         };

//         await loanService.update(loan.id, cleanedData);
//     };

//     const handleOutletChange = (
//         event: React.ChangeEvent<HTMLSelectElement>
//     ) => {
//         const value = event.target.value;
//         const outletId = value ? parseInt(value, 10) : "";
//         setData("outletId", outletId);
//     };

//     const handleSourceAccountChange = (
//         event: React.ChangeEvent<HTMLSelectElement>
//     ) => {
//         const value = event.target.value;
//         const accountId = value ? parseInt(value, 10) : "";
//         setData("sourceAccountId", accountId);
//     };

//     return (
//         <>
//             <Head title={`Edit Kasbon - ${loan.employee?.name || loan.id}`} />

//             <div
//                 className="min-h-screen p-6"
//                 style={{ backgroundColor: "var(--color-background)" }}
//             >
//                 <div className=" mx-auto">
//                     <motion.div
//                         initial={{ opacity: 0, y: -20 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         transition={{ duration: 0.3 }}
//                         className="mb-8"
//                     >
//                         <div className="flex items-center gap-4 mb-6">
//                             <div>
//                                 <h1
//                                     className="text-2xl font-bold"
//                                     style={{
//                                         color: "var(--color-text-primary)",
//                                     }}
//                                 >
//                                     Edit Kasbon
//                                 </h1>
//                                 <p
//                                     className="mt-1"
//                                     style={{
//                                         color: "var(--color-text-secondary)",
//                                     }}
//                                 >
//                                     Ubah data kasbon untuk{" "}
//                                     {loan.employee?.name || "karyawan"}
//                                 </p>
//                             </div>
//                         </div>

//                         {hasPayments && (
//                             <Alert
//                                 variant="warning"
//                                 title="Perhatian: Kasbon Sudah Memiliki Riwayat Pembayaran"
//                                 description="Kasbon ini sudah memiliki riwayat pembayaran. Nominal, Outlet, Karyawan, dan Sumber Dana tidak dapat diubah untuk menjaga konsistensi akuntansi. Silakan hapus pembayaran terlebih dahulu jika ingin merevisi data tersebut."
//                                 className="mb-6"
//                             >
//                                 <div
//                                     className="flex items-start gap-2 mt-3 p-3 rounded-lg"
//                                     style={{
//                                         backgroundColor:
//                                             "var(--color-warning-100)",
//                                     }}
//                                 >
//                                     <AlertTriangle
//                                         className="w-5 h-5 flex-shrink-0 mt-0.5"
//                                         style={{
//                                             color: "var(--color-warning-600)",
//                                         }}
//                                     />
//                                     <div
//                                         className="text-sm"
//                                         style={{
//                                             color: "var(--color-warning-700)",
//                                         }}
//                                     >
//                                         <p className="font-medium mb-1">
//                                             Yang dapat diubah:
//                                         </p>
//                                         <ul className="list-disc list-inside space-y-1">
//                                             <li>Tipe Pembayaran</li>
//                                             <li>
//                                                 Jumlah Cicilan & Periode
//                                                 (Reschedule)
//                                             </li>
//                                             <li>Tanggal Mulai Pembayaran</li>
//                                             <li>Catatan</li>
//                                         </ul>
//                                     </div>
//                                 </div>
//                             </Alert>
//                         )}
//                     </motion.div>

//                     <motion.div
//                         initial={{ opacity: 0, y: 20 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         transition={{ duration: 0.3, delay: 0.1 }}
//                     >
//                         <Card className="p-8">
//                             <Form onSubmit={handleSubmit} className="space-y-8">
//                                 <div className="space-y-6">
//                                     <div
//                                         className="flex items-center gap-3 pb-4 border-b"
//                                         style={{
//                                             borderColor: "var(--color-border)",
//                                         }}
//                                     >
//                                         <div
//                                             className="p-3 rounded-lg"
//                                             style={{
//                                                 backgroundColor:
//                                                     "var(--color-primary-100)",
//                                             }}
//                                         >
//                                             <Building2
//                                                 className="w-6 h-6"
//                                                 style={{
//                                                     color: "var(--color-primary-600)",
//                                                 }}
//                                             />
//                                         </div>
//                                         <div>
//                                             <h2
//                                                 className="text-xl font-semibold"
//                                                 style={{
//                                                     color: "var(--color-text-primary)",
//                                                 }}
//                                             >
//                                                 Informasi Outlet
//                                             </h2>
//                                             <p
//                                                 className="text-sm"
//                                                 style={{
//                                                     color: "var(--color-text-secondary)",
//                                                 }}
//                                             >
//                                                 Lokasi tempat karyawan bekerja
//                                             </p>
//                                         </div>
//                                     </div>

//                                     <SelectInput
//                                         label="Outlet"
//                                         placeholder="Pilih outlet..."
//                                         value={data.outletId?.toString() || ""}
//                                         onChange={handleOutletChange}
//                                         error={errors.outletId}
//                                         required
//                                         disabled={processing || hasPayments}
//                                         options={outletOptions}
//                                         leftIcon={
//                                             <Building2 className="w-5 h-5" />
//                                         }
//                                         hint={
//                                             hasPayments
//                                                 ? "Outlet tidak dapat diubah karena sudah ada pembayaran"
//                                                 : "Pilih outlet karyawan"
//                                         }
//                                         searchable={!hasPayments}
//                                         clearable={!hasPayments}
//                                         multiple={false}
//                                         noOptionsText="Tidak ada outlet tersedia"
//                                     />

//                                     {selectedOutlet && (
//                                         <motion.div
//                                             initial={{ opacity: 0, y: -10 }}
//                                             animate={{ opacity: 1, y: 0 }}
//                                             className="p-4 rounded-lg border"
//                                             style={{
//                                                 backgroundColor:
//                                                     "var(--color-primary-50)",
//                                                 borderColor:
//                                                     "var(--color-primary-200)",
//                                             }}
//                                         >
//                                             <div className="flex items-center gap-3">
//                                                 <Building2 className="w-5 h-5 text-primary-600" />
//                                                 <div>
//                                                     <p className="font-medium text-primary-800">
//                                                         {selectedOutlet.name}
//                                                     </p>
//                                                     {selectedOutlet.code && (
//                                                         <p className="text-sm text-primary-600">
//                                                             Kode:{" "}
//                                                             {
//                                                                 selectedOutlet.code
//                                                             }
//                                                         </p>
//                                                     )}
//                                                 </div>
//                                             </div>
//                                         </motion.div>
//                                     )}
//                                 </div>

//                                 <div className="space-y-6">
//                                     <div
//                                         className="flex items-center gap-3 pb-4 border-b"
//                                         style={{
//                                             borderColor: "var(--color-border)",
//                                         }}
//                                     >
//                                         <div
//                                             className="p-3 rounded-lg"
//                                             style={{
//                                                 backgroundColor:
//                                                     "var(--color-primary-100)",
//                                             }}
//                                         >
//                                             <User
//                                                 className="w-6 h-6"
//                                                 style={{
//                                                     color: "var(--color-primary-600)",
//                                                 }}
//                                             />
//                                         </div>
//                                         <div>
//                                             <h2
//                                                 className="text-xl font-semibold"
//                                                 style={{
//                                                     color: "var(--color-text-primary)",
//                                                 }}
//                                             >
//                                                 Informasi Karyawan
//                                             </h2>
//                                             <p
//                                                 className="text-sm"
//                                                 style={{
//                                                     color: "var(--color-text-secondary)",
//                                                 }}
//                                             >
//                                                 Karyawan penerima kasbon
//                                             </p>
//                                         </div>
//                                     </div>

//                                     <SelectInput
//                                         label="Karyawan"
//                                         placeholder="Pilih karyawan..."
//                                         value={data.employeeId.toString()}
//                                         onChange={(e) =>
//                                             setData(
//                                                 "employeeId",
//                                                 e.target.value === ""
//                                                     ? ""
//                                                     : parseInt(e.target.value)
//                                             )
//                                         }
//                                         options={employeeOptions}
//                                         error={errors.employeeId}
//                                         required
//                                         disabled={processing || hasPayments}
//                                         leftIcon={<User className="w-5 h-5" />}
//                                         hint={
//                                             hasPayments
//                                                 ? "Karyawan tidak dapat diubah karena sudah ada pembayaran"
//                                                 : "Pilih karyawan penerima kasbon"
//                                         }
//                                         searchable={!hasPayments}
//                                         clearable={!hasPayments}
//                                         multiple={false}
//                                         noOptionsText="Tidak ada karyawan tersedia"
//                                     />

//                                     {selectedEmployee && (
//                                         <motion.div
//                                             initial={{ opacity: 0, y: -10 }}
//                                             animate={{ opacity: 1, y: 0 }}
//                                             className="p-4 rounded-lg border"
//                                             style={{
//                                                 backgroundColor:
//                                                     "var(--color-primary-50)",
//                                                 borderColor:
//                                                     "var(--color-primary-200)",
//                                             }}
//                                         >
//                                             <div className="flex items-center gap-3">
//                                                 <User className="w-5 h-5 text-primary-600" />
//                                                 <div>
//                                                     <p className="font-medium text-primary-800">
//                                                         {selectedEmployee.name}
//                                                     </p>
//                                                     <p className="text-sm text-primary-600">
//                                                         {selectedEmployee.email ||
//                                                             "Email tidak tersedia"}
//                                                     </p>
//                                                 </div>
//                                             </div>
//                                         </motion.div>
//                                     )}
//                                 </div>

//                                 <div className="space-y-6">
//                                     <div
//                                         className="flex items-center gap-3 pb-4 border-b"
//                                         style={{
//                                             borderColor: "var(--color-border)",
//                                         }}
//                                     >
//                                         <div
//                                             className="p-3 rounded-lg"
//                                             style={{
//                                                 backgroundColor:
//                                                     "var(--color-primary-100)",
//                                             }}
//                                         >
//                                             <DollarSign
//                                                 className="w-6 h-6"
//                                                 style={{
//                                                     color: "var(--color-primary-600)",
//                                                 }}
//                                             />
//                                         </div>
//                                         <div>
//                                             <h2
//                                                 className="text-xl font-semibold"
//                                                 style={{
//                                                     color: "var(--color-text-primary)",
//                                                 }}
//                                             >
//                                                 Detail Kasbon
//                                             </h2>
//                                             <p
//                                                 className="text-sm"
//                                                 style={{
//                                                     color: "var(--color-text-secondary)",
//                                                 }}
//                                             >
//                                                 Jumlah dan detail kasbon
//                                             </p>
//                                         </div>
//                                     </div>

//                                     <SelectInput
//                                         label="Sumber Dana"
//                                         placeholder="Pilih sumber dana..."
//                                         value={data.sourceAccountId.toString()}
//                                         onChange={handleSourceAccountChange}
//                                         options={sourceAccountOptions}
//                                         error={errors.sourceAccountId}
//                                         required
//                                         disabled={processing || hasPayments}
//                                         leftIcon={
//                                             <Wallet className="w-5 h-5" />
//                                         }
//                                         hint={
//                                             hasPayments
//                                                 ? "Sumber dana tidak dapat diubah karena sudah ada pembayaran"
//                                                 : "Pilih akun sumber dana untuk pencairan kasbon"
//                                         }
//                                         searchable={!hasPayments}
//                                         clearable={!hasPayments}
//                                         multiple={false}
//                                         noOptionsText="Tidak ada akun sumber dana tersedia"
//                                     />

//                                     {selectedSourceAccount && (
//                                         <motion.div
//                                             initial={{ opacity: 0, y: -10 }}
//                                             animate={{ opacity: 1, y: 0 }}
//                                             className="p-4 rounded-lg border"
//                                             style={{
//                                                 backgroundColor:
//                                                     "var(--color-success-50)",
//                                                 borderColor:
//                                                     "var(--color-success-200)",
//                                             }}
//                                         >
//                                             <div className="flex items-center gap-3">
//                                                 <Wallet className="w-5 h-5 text-success-600" />
//                                                 <div>
//                                                     <p className="font-medium text-success-800">
//                                                         {
//                                                             selectedSourceAccount.name
//                                                         }
//                                                     </p>
//                                                     {selectedSourceAccount.code && (
//                                                         <p className="text-sm text-success-600">
//                                                             {
//                                                                 selectedSourceAccount.code
//                                                             }
//                                                         </p>
//                                                     )}
//                                                 </div>
//                                             </div>
//                                         </motion.div>
//                                     )}

//                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                         <NumberInput
//                                             label="Jumlah Kasbon"
//                                             placeholder="Masukkan jumlah kasbon"
//                                             value={
//                                                 data.amount
//                                                     ? Number(data.amount)
//                                                     : null
//                                             }
//                                             onValueChange={(value) =>
//                                                 setData("amount", value || "")
//                                             }
//                                             error={errors.amount}
//                                             required
//                                             disabled={processing || hasPayments}
//                                             leftIcon={
//                                                 <DollarSign className="w-5 h-5" />
//                                             }
//                                             hint={
//                                                 hasPayments
//                                                     ? "Nominal tidak dapat diubah karena sudah ada pembayaran"
//                                                     : "Jumlah total kasbon yang diberikan"
//                                             }
//                                             min={1}
//                                             max={999999999.99}
//                                             step={1000}
//                                             precision={2}
//                                             allowNegative={false}
//                                             allowDecimal={true}
//                                             thousandSeparator="."
//                                             decimalSeparator=","
//                                             prefix="Rp "
//                                             clampValueOnBlur={true}
//                                             keepWithinRange={true}
//                                         />

//                                         <Input
//                                             type="date"
//                                             label="Tanggal Kasbon"
//                                             value={data.loanDate}
//                                             onChange={(e) =>
//                                                 setData(
//                                                     "loanDate",
//                                                     e.target.value
//                                                 )
//                                             }
//                                             error={errors.loanDate}
//                                             disabled={processing || hasPayments}
//                                             leftIcon={
//                                                 <Calendar className="w-5 h-5" />
//                                             }
//                                             hint={
//                                                 hasPayments
//                                                     ? "Tanggal tidak dapat diubah karena sudah ada pembayaran"
//                                                     : "Tanggal pemberian kasbon"
//                                             }
//                                             max={
//                                                 new Date()
//                                                     .toISOString()
//                                                     .split("T")[0]
//                                             }
//                                         />
//                                     </div>

//                                     {data.amount && Number(data.amount) > 0 && (
//                                         <motion.div
//                                             initial={{ opacity: 0, y: -10 }}
//                                             animate={{ opacity: 1, y: 0 }}
//                                             className="p-4 rounded-lg"
//                                             style={{
//                                                 backgroundColor:
//                                                     "var(--color-primary-50)",
//                                             }}
//                                         >
//                                             <div className="flex items-center justify-between">
//                                                 <span
//                                                     className="text-sm font-medium"
//                                                     style={{
//                                                         color: "var(--color-text-secondary)",
//                                                     }}
//                                                 >
//                                                     Total Kasbon:
//                                                 </span>
//                                                 <span
//                                                     className="text-2xl font-bold"
//                                                     style={{
//                                                         color: "var(--color-primary-600)",
//                                                     }}
//                                                 >
//                                                     {formatCurrency(
//                                                         Number(data.amount)
//                                                     )}
//                                                 </span>
//                                             </div>
//                                         </motion.div>
//                                     )}

//                                     {hasPayments && (
//                                         <motion.div
//                                             initial={{ opacity: 0, y: -10 }}
//                                             animate={{ opacity: 1, y: 0 }}
//                                             className="p-4 rounded-lg border"
//                                             style={{
//                                                 backgroundColor:
//                                                     "var(--color-info-50)",
//                                                 borderColor:
//                                                     "var(--color-info-200)",
//                                             }}
//                                         >
//                                             <div className="space-y-2">
//                                                 <div className="flex justify-between text-sm">
//                                                     <span
//                                                         style={{
//                                                             color: "var(--color-info-700)",
//                                                         }}
//                                                     >
//                                                         Total Pembayaran:
//                                                     </span>
//                                                     <span
//                                                         className="font-semibold"
//                                                         style={{
//                                                             color: "var(--color-info-800)",
//                                                         }}
//                                                     >
//                                                         {formatCurrency(
//                                                             loan.totalPaid || 0
//                                                         )}
//                                                     </span>
//                                                 </div>
//                                                 <div className="flex justify-between text-sm">
//                                                     <span
//                                                         style={{
//                                                             color: "var(--color-info-700)",
//                                                         }}
//                                                     >
//                                                         Sisa Hutang:
//                                                     </span>
//                                                     <span
//                                                         className="font-semibold"
//                                                         style={{
//                                                             color: "var(--color-info-800)",
//                                                         }}
//                                                     >
//                                                         {formatCurrency(
//                                                             loan.remainingBalance ||
//                                                                 0
//                                                         )}
//                                                     </span>
//                                                 </div>
//                                                 <div className="flex justify-between text-sm">
//                                                     <span
//                                                         style={{
//                                                             color: "var(--color-info-700)",
//                                                         }}
//                                                     >
//                                                         Status:
//                                                     </span>
//                                                     <span
//                                                         className="font-semibold px-2 py-1 rounded text-xs"
//                                                         style={{
//                                                             backgroundColor:
//                                                                 loan.status ===
//                                                                 "paid"
//                                                                     ? "var(--color-success-100)"
//                                                                     : "var(--color-warning-100)",
//                                                             color:
//                                                                 loan.status ===
//                                                                 "paid"
//                                                                     ? "var(--color-success-800)"
//                                                                     : "var(--color-warning-800)",
//                                                         }}
//                                                     >
//                                                         {loan.status === "paid"
//                                                             ? "Lunas"
//                                                             : loan.status ===
//                                                               "partial"
//                                                             ? "Sebagian"
//                                                             : "Belum Bayar"}
//                                                     </span>
//                                                 </div>
//                                             </div>
//                                         </motion.div>
//                                     )}
//                                 </div>

//                                 <div className="space-y-6">
//                                     <div
//                                         className="flex items-center gap-3 pb-4 border-b"
//                                         style={{
//                                             borderColor: "var(--color-border)",
//                                         }}
//                                     >
//                                         <div
//                                             className="p-3 rounded-lg"
//                                             style={{
//                                                 backgroundColor:
//                                                     "var(--color-primary-100)",
//                                             }}
//                                         >
//                                             <CreditCard
//                                                 className="w-6 h-6"
//                                                 style={{
//                                                     color: "var(--color-primary-600)",
//                                                 }}
//                                             />
//                                         </div>
//                                         <div>
//                                             <h2
//                                                 className="text-xl font-semibold"
//                                                 style={{
//                                                     color: "var(--color-text-primary)",
//                                                 }}
//                                             >
//                                                 Detail Pembayaran
//                                             </h2>
//                                             <p
//                                                 className="text-sm"
//                                                 style={{
//                                                     color: "var(--color-text-secondary)",
//                                                 }}
//                                             >
//                                                 Atur cara pembayaran kasbon
//                                             </p>
//                                         </div>
//                                     </div>

//                                     <SelectInput
//                                         label="Tipe Pembayaran"
//                                         value={data.repaymentType}
//                                         onChange={(e) =>
//                                             setData(
//                                                 "repaymentType",
//                                                 e.target.value as any
//                                             )
//                                         }
//                                         options={repaymentTypeOptions}
//                                         error={errors.repaymentType}
//                                         required
//                                         disabled={processing}
//                                         leftIcon={
//                                             <CreditCard className="w-5 h-5" />
//                                         }
//                                         hint="Pilih cara pembayaran kasbon"
//                                     />

//                                     {data.repaymentType === "installment" && (
//                                         <motion.div
//                                             initial={{ opacity: 0, height: 0 }}
//                                             animate={{
//                                                 opacity: 1,
//                                                 height: "auto",
//                                             }}
//                                             className="space-y-6"
//                                         >
//                                             <NumberInput
//                                                 label="Periode Cicilan (Bulan)"
//                                                 placeholder="Masukkan jumlah bulan"
//                                                 value={data.installmentPeriod}
//                                                 onValueChange={(value) =>
//                                                     setData(
//                                                         "installmentPeriod",
//                                                         value
//                                                     )
//                                                 }
//                                                 error={errors.installmentPeriod}
//                                                 required
//                                                 disabled={processing}
//                                                 leftIcon={
//                                                     <Calendar className="w-5 h-5" />
//                                                 }
//                                                 hint="Jumlah bulan untuk mencicil"
//                                                 min={1}
//                                                 max={120}
//                                                 step={1}
//                                                 precision={0}
//                                                 allowNegative={false}
//                                                 allowDecimal={false}
//                                                 suffix=" bulan"
//                                                 clampValueOnBlur={true}
//                                                 keepWithinRange={true}
//                                             />

//                                             <NumberInput
//                                                 label="Jumlah Cicilan per Bulan"
//                                                 placeholder={
//                                                     suggestedInstallment > 0
//                                                         ? `Saran: ${formatCurrency(
//                                                               suggestedInstallment
//                                                           )}`
//                                                         : "Masukkan jumlah cicilan"
//                                                 }
//                                                 value={data.installmentAmount}
//                                                 onValueChange={(value) =>
//                                                     setData(
//                                                         "installmentAmount",
//                                                         value
//                                                     )
//                                                 }
//                                                 error={errors.installmentAmount}
//                                                 required
//                                                 disabled={processing}
//                                                 leftIcon={
//                                                     <CreditCard className="w-5 h-5" />
//                                                 }
//                                                 hint={
//                                                     suggestedInstallment > 0
//                                                         ? `Saran cicilan: ${formatCurrency(
//                                                               suggestedInstallment
//                                                           )} per bulan`
//                                                         : "Jumlah pembayaran per bulan"
//                                                 }
//                                                 min={1}
//                                                 max={
//                                                     data.amount
//                                                         ? Number(data.amount)
//                                                         : 999999999.99
//                                                 }
//                                                 step={1000}
//                                                 precision={2}
//                                                 allowNegative={false}
//                                                 allowDecimal={true}
//                                                 thousandSeparator="."
//                                                 decimalSeparator=","
//                                                 prefix="Rp "
//                                                 clampValueOnBlur={true}
//                                                 keepWithinRange={true}
//                                             />

//                                             {data.installmentPeriod &&
//                                                 data.installmentAmount && (
//                                                     <motion.div
//                                                         initial={{
//                                                             opacity: 0,
//                                                             y: -10,
//                                                         }}
//                                                         animate={{
//                                                             opacity: 1,
//                                                             y: 0,
//                                                         }}
//                                                         className="p-4 rounded-lg border"
//                                                         style={{
//                                                             backgroundColor:
//                                                                 "var(--color-info-50)",
//                                                             borderColor:
//                                                                 "var(--color-info-200)",
//                                                         }}
//                                                     >
//                                                         <div className="space-y-2">
//                                                             <div className="flex justify-between text-sm">
//                                                                 <span
//                                                                     style={{
//                                                                         color: "var(--color-info-700)",
//                                                                     }}
//                                                                 >
//                                                                     Total
//                                                                     Cicilan:
//                                                                 </span>
//                                                                 <span
//                                                                     className="font-semibold"
//                                                                     style={{
//                                                                         color: "var(--color-info-800)",
//                                                                     }}
//                                                                 >
//                                                                     {formatCurrency(
//                                                                         Number(
//                                                                             data.installmentAmount
//                                                                         ) *
//                                                                             Number(
//                                                                                 data.installmentPeriod
//                                                                             )
//                                                                     )}
//                                                                 </span>
//                                                             </div>
//                                                             <div className="flex justify-between text-sm">
//                                                                 <span
//                                                                     style={{
//                                                                         color: "var(--color-info-700)",
//                                                                     }}
//                                                                 >
//                                                                     Per Bulan:
//                                                                 </span>
//                                                                 <span
//                                                                     className="font-semibold"
//                                                                     style={{
//                                                                         color: "var(--color-info-800)",
//                                                                     }}
//                                                                 >
//                                                                     {formatCurrency(
//                                                                         Number(
//                                                                             data.installmentAmount
//                                                                         )
//                                                                     )}{" "}
//                                                                     ×{" "}
//                                                                     {
//                                                                         data.installmentPeriod
//                                                                     }{" "}
//                                                                     bulan
//                                                                 </span>
//                                                             </div>
//                                                         </div>
//                                                     </motion.div>
//                                                 )}
//                                         </motion.div>
//                                     )}

//                                     <Input
//                                         type="date"
//                                         label="Mulai Pembayaran"
//                                         value={data.startRepayment}
//                                         onChange={(e) =>
//                                             setData(
//                                                 "startRepayment",
//                                                 e.target.value
//                                             )
//                                         }
//                                         error={errors.startRepayment}
//                                         required
//                                         disabled={processing}
//                                         leftIcon={
//                                             <TrendingUp className="w-5 h-5" />
//                                         }
//                                         hint="Tanggal mulai pembayaran kasbon"
//                                         min={
//                                             new Date()
//                                                 .toISOString()
//                                                 .split("T")[0]
//                                         }
//                                     />
//                                 </div>

//                                 <div className="space-y-6">
//                                     <div
//                                         className="flex items-center gap-3 pb-4 border-b"
//                                         style={{
//                                             borderColor: "var(--color-border)",
//                                         }}
//                                     >
//                                         <div
//                                             className="p-3 rounded-lg"
//                                             style={{
//                                                 backgroundColor:
//                                                     "var(--color-primary-100)",
//                                             }}
//                                         >
//                                             <FileText
//                                                 className="w-6 h-6"
//                                                 style={{
//                                                     color: "var(--color-primary-600)",
//                                                 }}
//                                             />
//                                         </div>
//                                         <div>
//                                             <h2
//                                                 className="text-xl font-semibold"
//                                                 style={{
//                                                     color: "var(--color-text-primary)",
//                                                 }}
//                                             >
//                                                 Catatan
//                                             </h2>
//                                             <p
//                                                 className="text-sm"
//                                                 style={{
//                                                     color: "var(--color-text-secondary)",
//                                                 }}
//                                             >
//                                                 Tambahkan catatan untuk kasbon
//                                                 ini (opsional)
//                                             </p>
//                                         </div>
//                                     </div>

//                                     <TextAreaInput
//                                         label="Catatan"
//                                         placeholder="Contoh: Kasbon untuk keperluan mendesak, cicilan akan dipotong dari gaji bulanan"
//                                         value={data.note}
//                                         onChange={(e) =>
//                                             setData("note", e.target.value)
//                                         }
//                                         error={errors.note}
//                                         disabled={processing}
//                                         hint="Catatan tambahan tentang kasbon ini"
//                                         rows={4}
//                                         showCharacterCount={true}
//                                         maxLength={1000}
//                                         autoResize={true}
//                                         minRows={4}
//                                         maxRows={8}
//                                     />
//                                 </div>

//                                 <div
//                                     className="p-4 rounded-lg border"
//                                     style={{
//                                         backgroundColor: "var(--color-info-50)",
//                                         borderColor: "var(--color-info-200)",
//                                     }}
//                                 >
//                                     <div className="flex items-start gap-3">
//                                         <div
//                                             className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
//                                             style={{
//                                                 backgroundColor:
//                                                     "var(--color-info-100)",
//                                             }}
//                                         >
//                                             <span
//                                                 className="text-xs font-bold"
//                                                 style={{
//                                                     color: "var(--color-info-600)",
//                                                 }}
//                                             >
//                                                 i
//                                             </span>
//                                         </div>
//                                         <div>
//                                             <h4
//                                                 className="text-sm font-medium mb-1"
//                                                 style={{
//                                                     color: "var(--color-info-700)",
//                                                 }}
//                                             >
//                                                 Informasi Perubahan Data Kasbon
//                                             </h4>
//                                             <ul
//                                                 className="text-xs space-y-1"
//                                                 style={{
//                                                     color: "var(--color-info-600)",
//                                                 }}
//                                             >
//                                                 {hasPayments ? (
//                                                     <>
//                                                         <li>
//                                                             • Kasbon ini sudah
//                                                             memiliki riwayat
//                                                             pembayaran
//                                                         </li>
//                                                         <li>
//                                                             • Data nominal,
//                                                             outlet, karyawan,
//                                                             dan sumber dana
//                                                             tidak dapat diubah
//                                                         </li>
//                                                         <li>
//                                                             • Anda hanya dapat
//                                                             mengubah tipe
//                                                             pembayaran, cicilan,
//                                                             dan catatan
//                                                         </li>
//                                                         <li>
//                                                             • Untuk revisi data
//                                                             yang dikunci, hapus
//                                                             pembayaran terlebih
//                                                             dahulu
//                                                         </li>
//                                                     </>
//                                                 ) : (
//                                                     <>
//                                                         <li>
//                                                             • Perubahan data
//                                                             kasbon akan
//                                                             mempengaruhi jurnal
//                                                             akuntansi
//                                                         </li>
//                                                         <li>
//                                                             • Sistem akan
//                                                             otomatis
//                                                             menyesuaikan jurnal
//                                                             jika ada perubahan
//                                                         </li>
//                                                         <li>
//                                                             • Pastikan semua
//                                                             data sudah benar
//                                                             sebelum menyimpan
//                                                         </li>
//                                                     </>
//                                                 )}
//                                             </ul>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {Object.keys(errors).length > 0 && (
//                                     <Alert
//                                         variant="error"
//                                         title="Terdapat kesalahan pada form"
//                                         description="Silakan periksa kembali semua field yang bertanda merah."
//                                         className="mt-6"
//                                     />
//                                 )}

//                                 <div
//                                     className="flex items-center justify-between pt-6 border-t"
//                                     style={{
//                                         borderColor: "var(--color-border)",
//                                     }}
//                                 >
//                                     <Button
//                                         type="button"
//                                         variant="outline"
//                                         onClick={() => window.history.back()}
//                                         disabled={processing}
//                                         leftIcon={
//                                             <ArrowLeft className="w-4 h-4" />
//                                         }
//                                     >
//                                         Batal
//                                     </Button>

//                                     <Button
//                                         type="submit"
//                                         variant="primary"
//                                         disabled={
//                                             processing ||
//                                             !data.outletId ||
//                                             !data.employeeId ||
//                                             !data.sourceAccountId ||
//                                             !data.amount ||
//                                             !data.repaymentType ||
//                                             !data.startRepayment
//                                         }
//                                         loading={processing}
//                                         size="lg"
//                                         leftIcon={<Save className="w-4 h-4" />}
//                                     >
//                                         Simpan Perubahan
//                                     </Button>
//                                 </div>
//                             </Form>
//                         </Card>
//                     </motion.div>
//                 </div>
//             </div>
//         </>
//     );
// };

// LoansEdit.layout = withAuthenticatedLayout({
//     title: "Edit Kasbon",
//     breadcrumbs: [
//         { label: "Kasbon", href: route("loans.index") },
//         { label: "Edit" },
//     ],
// });

// export default LoansEdit;
