import React from "react";
import { Head, useForm } from "@inertiajs/react";
import { motion } from "framer-motion";
import {
    Save,
    ArrowLeft,
    Mail,
    Phone,
    MapPin,
    User,
    Heart,
    UserCog,
} from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { Form } from "@/Components/Form";
import { Input, TextAreaInput, SelectInput } from "@/Components/Input";
import { Button } from "@/Components/Button";
import { Card } from "@/Components/Card";
import { OutletCustomerFormData } from "@/types";
import { CustomerEditProps } from "./types";
import PageHeader from "@/Components/Page/PageHeader";
import outletService from "@/Services/outlet.service";

const OutletCustomerEdit = ({ outlet, customer }: CustomerEditProps) => {
    const { data, setData, put, processing, errors, clearErrors } =
        useForm<OutletCustomerFormData>({
            name: customer.name || "",
            email: customer.email || "",
            phone: customer.phone || "",
            gender: customer.gender || "",
            address: customer.address || "",
        });

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        console.log("Submitting form with data:", data);
        put(route("outlets.customers.update", [outlet.id, customer.id]), {
            preserveScroll: true,
            onError: (errors) => {
                console.error("Validation errors:", errors);
                window.scrollTo({ top: 0, behavior: "smooth" });
            },
        });
    };

    const handleDataChange = (
        key: keyof OutletCustomerFormData,
        value: any,
    ) => {
        setData(key as string, value);

        if (errors[key]) {
            clearErrors(key as string);
        }
    };

    const handleGenderChange = (
        event: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        handleDataChange("gender", event.target.value);
    };

    const genderOptions = [
        { value: "", label: "Pilih Jenis Kelamin" },
        { value: "male", label: "Pria" },
        { value: "female", label: "Wanita" },
    ];

    return (
        <>
            <Head title={`Edit Pelanggan - ${customer.name}`} />

            <div
                className="min-h-screen p-6"
                style={{ backgroundColor: "var(--color-background)" }}
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title={`Edit Pelanggan - ${customer.name}`}
                        subtitle={`Perbarui informasi pelanggan di outlet ${outlet.name} (${outlet.code})`}
                        icon={UserCog}
                        variant="default"
                        actions={
                            <Button
                                onClick={() =>
                                    outletService.goToView(outlet.id)
                                }
                                variant="outline"
                                leftIcon={<ArrowLeft className="w-4 h-4" />}
                            >
                                Kembali
                            </Button>
                        }
                    />

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                    >
                        <Card className="p-8">
                            <Form onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-6">
                                    <div
                                        className="flex items-center gap-3 pb-4 border-b"
                                        style={{
                                            borderColor: "var(--color-border)",
                                        }}
                                    >
                                        <div
                                            className="p-3 rounded-lg"
                                            style={{
                                                backgroundColor:
                                                    "var(--color-primary-100)",
                                            }}
                                        >
                                            <User
                                                className="w-6 h-6"
                                                style={{
                                                    color: "var(--color-primary-600)",
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <h2
                                                className="text-xl font-semibold"
                                                style={{
                                                    color: "var(--color-text-primary)",
                                                }}
                                            >
                                                Informasi Dasar
                                            </h2>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Data identitas pelanggan
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input
                                            label="Nama Lengkap"
                                            placeholder="Masukkan nama lengkap pelanggan"
                                            value={data.name}
                                            onChange={(e) =>
                                                handleDataChange(
                                                    "name",
                                                    e.target.value,
                                                )
                                            }
                                            error={errors.name}
                                            required
                                            disabled={processing}
                                            leftIcon={
                                                <User className="w-5 h-5" />
                                            }
                                            hint="Nama lengkap pelanggan"
                                            autoFocus
                                        />
                                        <Input
                                            label="Email"
                                            type="email"
                                            placeholder="contoh@email.com"
                                            value={data.email}
                                            onChange={(e) =>
                                                handleDataChange(
                                                    "email",
                                                    e.target.value,
                                                )
                                            }
                                            error={errors.email}
                                            disabled={processing}
                                            leftIcon={
                                                <Mail className="w-5 h-5" />
                                            }
                                            hint="Email pelanggan (opsional)"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input
                                            label="Nomor Telepon"
                                            type="tel"
                                            placeholder="08xxxxxxxxxx"
                                            value={data.phone}
                                            onChange={(e) =>
                                                handleDataChange(
                                                    "phone",
                                                    e.target.value,
                                                )
                                            }
                                            error={errors.phone}
                                            disabled={processing}
                                            leftIcon={
                                                <Phone className="w-5 h-5" />
                                            }
                                            hint="Nomor telepon pelanggan"
                                        />
                                        <SelectInput
                                            label="Jenis Kelamin"
                                            value={data.gender}
                                            onChange={handleGenderChange}
                                            options={genderOptions}
                                            error={errors.gender}
                                            disabled={processing}
                                            leftIcon={
                                                <Heart className="w-5 h-5" />
                                            }
                                            hint="Jenis kelamin pelanggan"
                                            multiple={false}
                                            clearable={true}
                                            placeholder="Pilih jenis kelamin..."
                                        />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div
                                        className="flex items-center gap-3 pb-4 border-b"
                                        style={{
                                            borderColor: "var(--color-border)",
                                        }}
                                    >
                                        <div
                                            className="p-3 rounded-lg"
                                            style={{
                                                backgroundColor:
                                                    "var(--color-info-100)",
                                            }}
                                        >
                                            <MapPin
                                                className="w-6 h-6"
                                                style={{
                                                    color: "var(--color-info-600)",
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <h2
                                                className="text-xl font-semibold"
                                                style={{
                                                    color: "var(--color-text-primary)",
                                                }}
                                            >
                                                Informasi Alamat
                                            </h2>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Alamat tempat tinggal pelanggan
                                                (opsional)
                                            </p>
                                        </div>
                                    </div>

                                    <TextAreaInput
                                        label="Alamat Jalan"
                                        placeholder="Jalan, nomor rumah, RT/RW, komplek, dll"
                                        value={data.address}
                                        onChange={(e) =>
                                            handleDataChange(
                                                "address",
                                                e.target.value,
                                            )
                                        }
                                        error={errors.address}
                                        disabled={processing}
                                        hint="Alamat lengkap jalan dan nomor rumah"
                                        rows={3}
                                        maxLength={500}
                                        showCharacterCount={true}
                                        autoResize={true}
                                        minRows={3}
                                        maxRows={5}
                                        leftIcon={
                                            <MapPin className="w-5 h-5" />
                                        }
                                    />
                                </div>

                                <div
                                    className="flex items-center justify-between pt-6 border-t"
                                    style={{
                                        borderColor: "var(--color-border)",
                                    }}
                                >
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => window.history.back()}
                                        disabled={processing}
                                        leftIcon={
                                            <ArrowLeft className="w-4 h-4" />
                                        }
                                    >
                                        Batal
                                    </Button>

                                    <Button
                                        type="submit"
                                        variant="primary"
                                        disabled={
                                            processing || !data.name.trim()
                                        }
                                        loading={processing}
                                        size="lg"
                                        leftIcon={<Save className="w-4 h-4" />}
                                    >
                                        Simpan Perubahan
                                    </Button>
                                </div>
                            </Form>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </>
    );
};

OutletCustomerEdit.layout = (page: any) =>
    withAuthenticatedLayout({
        title: "Edit Pelanggan",
        breadcrumbs: [
            { label: "Outlets", href: route("outlets.index") },
            {
                label: "Detail",
                href: route("outlets.show", page.props.outlet.id),
            },
            { label: "Edit Pelanggan" },
        ],
    })(page);

export default OutletCustomerEdit;
