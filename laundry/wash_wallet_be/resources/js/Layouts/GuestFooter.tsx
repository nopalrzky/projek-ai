import React from "react";
import {
    Footer,
    FooterBrand,
    FooterLinks,
    FooterSocials,
    FooterCopyright,
} from "@/Components/Footer";
import {
    Facebook,
    Instagram,
    Twitter,
    Linkedin,
    Youtube,
    Mail,
    Phone,
    MapPin,
} from "lucide-react";

const footerLinks = {
    company: [
        { label: "Tentang Kami", href: route("about") },
        { label: "Fitur", href: "/fitur" },
        { label: "Harga", href: "/harga" },
        { label: "Blog", href: "/blog" },
    ],
    product: [
        {
            label: "Manajemen Operasional",
            href: route("features.operational-management"),
        },
        {
            label: "Membership & Loyalty",
            href: route("features.membership"),
        },
        {
            label: "Keuangan & Akuntansi",
            href: route("features.financial-accounting"),
        },
        { label: "HR & Payroll", href: route("features.hr-payroll") },
        {
            label: "Program Afiliasi",
            href: route("features.affiliate-program"),
        },
    ],
    support: [
        { label: "Help Center", href: "/help" },
        { label: "Dokumentasi", href: "/docs" },
        { label: "FAQ", href: route("faq") },
    ],
    legal: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Cookie Policy", href: "/cookies" },
    ],
};

const socialLinks = [
    {
        name: "Facebook",
        href: "https://facebook.com/washwallet",
        icon: <Facebook className="w-5 h-5" />,
    },
    {
        name: "Instagram",
        href: "https://instagram.com/washwallet",
        icon: <Instagram className="w-5 h-5" />,
    },
    {
        name: "Twitter",
        href: "https://twitter.com/washwallet",
        icon: <Twitter className="w-5 h-5" />,
    },
    {
        name: "LinkedIn",
        href: "https://linkedin.com/company/washwallet",
        icon: <Linkedin className="w-5 h-5" />,
    },
    {
        name: "YouTube",
        href: "https://youtube.com/@washwallet",
        icon: <Youtube className="w-5 h-5" />,
    },
];

const GuestFooter: React.FC = () => (
    <Footer variant="default" isGlass={false}>
        <FooterBrand
            href="/"
            title="WashWallet"
            description="Solusi lengkap untuk manajemen laundry modern dengan sistem koin, afiliasi, dan akuntansi terintegrasi."
            logo={
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-600 blur-lg opacity-50 rounded-full" />
                    <svg
                        className="h-10 w-10 relative text-primary-500"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path d="M12 2L2 7v10c0 5.55 3.84 10 9 11 5.16-1 9-5.45 9-11V7l-10-5z" />
                    </svg>
                </div>
            }
        >
            <div className="space-y-3 mt-4">
                <a
                    href="mailto:info@washwallet.com"
                    className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary-600 dark:hover:text-primary-400 transition-colors group"
                >
                    <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>info@washwallet.com</span>
                </a>
                <a
                    href="tel:+6281234567890"
                    className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary-600 dark:hover:text-primary-400 transition-colors group"
                >
                    <Phone className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>+62 812-3456-7890</span>
                </a>
                <div className="flex items-start gap-2 text-sm text-text-secondary">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Jakarta, Indonesia</span>
                </div>
            </div>
        </FooterBrand>

        <FooterLinks title="Perusahaan" links={footerLinks.company} />

        <FooterLinks title="Produk" links={footerLinks.product} />

        <div className="space-y-8">
            <FooterLinks title="Bantuan" links={footerLinks.support} />
            <FooterSocials title="Ikuti Kami" socials={socialLinks} />
        </div>

        <FooterCopyright
            companyName="WashWallet"
            year={new Date().getFullYear()}
            showMadeWith={true}
        />
    </Footer>
);

export default GuestFooter;
