import React, { useEffect } from "react";
import { useForm } from "@inertiajs/react";
import { KeyRound, User } from "lucide-react";
import { Modal } from "@/Components/Modal";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { Badge } from "@/Components/Badge";
import { Input } from "@/Components/Input";
import { resolveStorageUrl } from "@/lib/utils";
import {
    ChangeEmployeePasswordFormData,
    ChangeEmployeePasswordModalProps,
} from "../types";

const ChangeEmployeePasswordModal: React.FC<
    ChangeEmployeePasswordModalProps
> = ({ isOpen, employee, onClose }) => {
    const { data, setData, put, processing, errors, clearErrors, reset } =
        useForm<ChangeEmployeePasswordFormData>({
            password: "",
            passwordConfirmation: "",
        });

    useEffect(() => {
        if (!isOpen) {
            reset("password", "passwordConfirmation");
            clearErrors();
        }
    }, [isOpen, reset, clearErrors]);

    if (!employee) return null;

    const avatarUrl = resolveStorageUrl(employee.avatar);

    const handleClose = () => {
        if (!processing) {
            reset("password", "passwordConfirmation");
            clearErrors();
            onClose();
        }
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        put(route("employees.password.update", employee.id), {
            preserveScroll: true,
            onSuccess: () => {
                reset("password", "passwordConfirmation");
                clearErrors();
                onClose();
            },
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Ganti Password Karyawan"
            size="md"
            variant="default"
            loading={processing}
            preventClose={processing}
            closeOnOverlayClick={!processing}
            closeOnEscape={!processing}
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                <Alert
                    variant="info"
                    title="Password lama tidak diperlukan"
                    description="Password baru akan langsung menggantikan password karyawan. Sesi login karyawan yang aktif akan dicabut."
                    icon={<KeyRound className="w-5 h-5" />}
                />

                <div
                    className="p-4 rounded-lg border"
                    style={{
                        backgroundColor: "var(--color-surface-secondary)",
                        borderColor: "var(--color-border)",
                    }}
                >
                    <div className="flex items-center gap-3">
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt={employee.name}
                                className="w-12 h-12 rounded-full object-cover border-2"
                                style={{ borderColor: "var(--color-border)" }}
                            />
                        ) : (
                            <div
                                className="w-12 h-12 rounded-full flex items-center justify-center border-2"
                                style={{
                                    backgroundColor:
                                        "var(--color-primary-100)",
                                    borderColor: "var(--color-border)",
                                }}
                            >
                                <User
                                    className="w-6 h-6"
                                    style={{
                                        color: "var(--color-primary-600)",
                                    }}
                                />
                            </div>
                        )}

                        <div className="flex-1 min-w-0">
                            <h4
                                className="font-medium truncate"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {employee.name}
                            </h4>
                            <p
                                className="text-sm truncate"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                @{employee.username}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                <Badge
                                    variant={
                                        employee.isActive
                                            ? "success"
                                            : "secondary"
                                    }
                                    className="text-xs"
                                >
                                    {employee.isActive ? "Aktif" : "Nonaktif"}
                                </Badge>
                                {employee.outlet && (
                                    <Badge
                                        variant="secondary"
                                        className="text-xs"
                                    >
                                        {employee.outlet.name}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <Input
                        label="Password Baru"
                        type="password"
                        value={data.password}
                        onChange={(event) =>
                            setData("password", event.target.value)
                        }
                        error={errors.password}
                        required
                        disabled={processing}
                        leftIcon={<KeyRound className="w-5 h-5" />}
                        hint="Minimal 8 karakter, mengandung huruf besar dan huruf kecil"
                        autoFocus
                    />

                    <Input
                        label="Konfirmasi Password Baru"
                        type="password"
                        value={data.passwordConfirmation}
                        onChange={(event) =>
                            setData(
                                "passwordConfirmation",
                                event.target.value,
                            )
                        }
                        error={errors.passwordConfirmation}
                        required
                        disabled={processing}
                        leftIcon={<KeyRound className="w-5 h-5" />}
                    />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={processing}
                    >
                        Batal
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        leftIcon={<KeyRound className="w-4 h-4" />}
                        loading={processing}
                        disabled={processing || !employee.isActive}
                    >
                        Ganti Password
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default ChangeEmployeePasswordModal;
