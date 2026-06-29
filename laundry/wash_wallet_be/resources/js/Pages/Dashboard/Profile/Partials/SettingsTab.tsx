import React from "react";
import { Card } from "@/Components/Card";
import Button from "@/Components/Button/Button";
import { Edit, Key, User, Lock, ArrowRight } from "lucide-react";
import type { ProfileUser } from "../types";

interface SettingsTabProps {
    user: ProfileUser;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ user }) => {
    return (
        <div className="space-y-6">
            <Card>
                <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                            <div
                                className="p-3 rounded-lg bg-primary-50 dark:bg-primary-950/20"
                            >
                                <User
                                    className="w-6 h-6 text-primary-600 dark:text-primary-400"
                                />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-primary mb-1">
                                    Edit Profile
                                </h3>
                                <p className="text-sm text-secondary mb-3">
                                    Perbarui informasi profil Anda seperti nama,
                                    nomor telepon, dan alamat
                                </p>
                                <div className="space-y-2 text-sm text-tertiary">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">
                                            Nama:
                                        </span>
                                        <span>{user.name}</span>
                                    </div>
                                    {user.phone && (
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">
                                                Telepon:
                                            </span>
                                            <span>{user.phone}</span>
                                        </div>
                                    )}
                                    {user.address && (
                                        <div className="flex items-start gap-2">
                                            <span className="font-medium">
                                                Alamat:
                                            </span>
                                            <span className="line-clamp-2">
                                                {user.address}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="primary"
                            size="md"
                            href={route("profile.edit")}
                            leftIcon={<Edit className="w-4 h-4" />}
                            rightIcon={<ArrowRight className="w-4 h-4" />}
                        >
                            Edit Profile
                        </Button>
                    </div>
                </div>
            </Card>

            <Card>
                <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                            <div
                                className="p-3 rounded-lg bg-warning-50 dark:bg-warning-950/20"
                            >
                                <Lock
                                    className="w-6 h-6 text-warning-600 dark:text-warning-400"
                                />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-primary mb-1">
                                    Change Password
                                </h3>
                                <p className="text-sm text-secondary mb-3">
                                    Perbarui password akun Anda untuk keamanan
                                    yang lebih baik
                                </p>
                                <div className="space-y-2 text-sm text-tertiary">
                                    <div className="flex items-start gap-2">
                                        <span className="font-medium">
                                            Tips Keamanan:
                                        </span>
                                    </div>
                                    <ul className="list-disc list-inside space-y-1 ml-2">
                                        <li>
                                            Gunakan kombinasi huruf besar,
                                            kecil, angka
                                        </li>
                                        <li>Minimal 8 karakter</li>
                                        <li>
                                            Hindari password yang mudah ditebak
                                        </li>
                                        <li>Ubah password secara berkala</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="warning"
                            size="md"
                            href={route("profile.change-password")}
                            leftIcon={<Key className="w-4 h-4" />}
                            rightIcon={<ArrowRight className="w-4 h-4" />}
                        >
                            Change Password
                        </Button>
                    </div>
                </div>
            </Card>

        </div>
    );
};

export default SettingsTab;
