import React from "react";
import {
    Navbar,
    NavbarBrand,
    NavbarMenu,
    NavbarItem,
    NavbarToggle,
    NavbarDropdown,
    DropdownItem,
} from "@/Components/Navbar";
import {
    Briefcase,
    Users,
    DollarSign,
    UserCog,
    CreditCard,
} from "lucide-react";
import { usePage } from "@inertiajs/react";
import { PageProps } from "@/types";

const GuestNavbar: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const { auth } = usePage<PageProps>().props;

    return (
        <Navbar sticky>
            <NavbarBrand href={route("home")} />

            <NavbarMenu isOpen={isMenuOpen}>
                <NavbarItem
                    href="/"
                    active={window.location.pathname === "/"}
                >
                    Home
                </NavbarItem>

                <NavbarDropdown trigger="Fitur">
                    <DropdownItem
                        href={route("features.operational-management")}
                        icon={<Briefcase size={18} />}
                        description="Kelola operasional laundry Anda"
                    >
                        Manajemen Operasional
                    </DropdownItem>
                    <DropdownItem
                        href={route("features.membership")}
                        icon={<CreditCard size={18} />}
                        description="Sistem keanggotaan & benefit"
                    >
                        Membership & Loyalty
                    </DropdownItem>
                    <DropdownItem
                        href={route("features.affiliate-program")}
                        icon={<Users size={18} />}
                        description="Program referral & komisi"
                    >
                        Program Afiliasi
                    </DropdownItem>
                    <DropdownItem
                        href={route("features.financial-accounting")}
                        icon={<DollarSign size={18} />}
                        description="Akuntansi & laporan keuangan"
                    >
                        Keuangan & Akuntansi
                    </DropdownItem>
                    <DropdownItem
                        href={route("features.hr-payroll")}
                        icon={<UserCog size={18} />}
                        description="HR, absensi & penggajian"
                    >
                        HR & Payroll
                    </DropdownItem>
                </NavbarDropdown>

                <NavbarItem
                    href={route("about")}
                    active={window.location.pathname === "/about"}
                >
                    Tentang
                </NavbarItem>

                <NavbarItem
                    href={route("faq")}
                    active={window.location.pathname === "/faq"}
                >
                    FAQ
                </NavbarItem>

                <div className="flex items-center gap-4 lg:ml-6 mt-4 lg:mt-0">
                    {auth?.user ? (
                        <a
                            href={route("dashboard")}
                            className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold rounded-lg bg-primary-500 text-white transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
                        >
                            Dashboard
                        </a>
                    ) : (
                        <>
                            <NavbarItem href="/login">Login</NavbarItem>
                            <a
                                href="/register"
                                className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold rounded-lg bg-primary-500 text-white transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
                            >
                                Daftar Gratis
                            </a>
                        </>
                    )}
                </div>
            </NavbarMenu>

            <NavbarToggle
                isOpen={isMenuOpen}
                onToggle={() => setIsMenuOpen(!isMenuOpen)}
            />
        </Navbar>
    );
};

export default GuestNavbar;
