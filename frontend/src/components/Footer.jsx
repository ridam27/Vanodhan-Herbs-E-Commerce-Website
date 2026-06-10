import {
    FiMail,
    FiPhone,
    FiMapPin,
    FiInstagram,
    FiFacebook,
    FiArrowRight,
} from "react-icons/fi";

export default function Footer() {

    const quickLinks = ["Home", "Shop", "About", "Contact"];

    const shopLinks = [
        "Herbal Powders",
        "Churna",
        "Herbal Oils",
        "Wellness Products",
    ];

    const legalLinks = [
        "Privacy Policy",
        "Terms & Conditions",
        "Shipping Policy",
        "Refund Policy",
    ];

    return (
        <footer
            className="mt-20 w-full border-t border-[var(--border)]"
            style={{
                backgroundColor: "var(--footer-bg)",
            }}
        >
            <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
                <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">

                    {/* Brand */}
                    <div>
                        <img
                            src="/logo-light.png"
                            alt="Vanodhan Herbs"
                            className="mb-6 h-16 w-auto"
                        />

                        <p className="max-w-md text-sm leading-7 text-[var(--text-secondary)]">
                            Vanodhan Herbs brings authentic Herbal wellness products
                            crafted from nature to support healthy and balanced living.
                        </p>

                        <div className="mt-6 flex gap-3">
                            <SocialButton Icon={FiInstagram} />
                            <SocialButton Icon={FiFacebook} />
                        </div>
                    </div>

                    {/* Quick Links */}
                    <FooterColumn title="Quick Links" links={quickLinks} />

                    {/* Shop */}
                    <FooterColumn title="Shop" links={shopLinks} />

                    {/* Legal */}
                    <FooterColumn title="Legal" links={legalLinks} />
                </div>

                {/* Contact Strip */}
                <div className="mt-14 grid gap-4 border-t border-[var(--border)] pt-8 md:grid-cols-3">

                    <ContactItem
                        icon={FiMail}
                        text="vanodhanherbs@gmail.com"
                        href="mailto:vanodhanherbs@gmail.com"
                    />

                    <ContactItem
                        icon={FiPhone}
                        text="+91 99752 26220"
                        href="tel:+919975226220"
                    />

                    <ContactItem
                        icon={FiMapPin}
                        text="760, Uttam Town, Inzapur, Dist. Wardha - 442001"
                        // href="maps.app.goo.gl/KFVRXwwjCvU18DAV6"
                        href="#"
                    />
                </div>

                {/* Bottom Bar */}
                <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-[var(--border)] pt-6 text-sm text-[var(--text-secondary)] md:flex-row">
                    <p>
                        © 2026 Vanodhan Herbs. All rights reserved.
                    </p>

                    <p>
                        Rooted in Nature, Committed to Wellness.
                    </p>

                    <a
                        href="https://instagram.com/ridam_27"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-colors duration-300 hover:text-pink-500"
                    >
                        Made with ❤️ by Ridam Satkar
                    </a>
                </div>
            </div>
        </footer>
    );
}

function FooterColumn({ title, links }) {
    return (
        <div>
            <h3 className="mb-5 text-lg font-bold text-[var(--text)]">
                {title}
            </h3>

            <div className="flex flex-col gap-3">
                {links.map((link) => (
                    <button
                        key={link}
                        className="group flex items-center gap-2 text-left text-sm text-[var(--text-secondary)] transition-all duration-300 hover:text-[var(--primary)]"
                    >
                        <FiArrowRight
                            className="
                opacity-0
                transition-all
                duration-300
                group-hover:translate-x-1
                group-hover:opacity-100
              "
                        />

                        {link}
                    </button>
                ))}
            </div>
        </div>
    );
}

function SocialButton({ Icon }) {
    return (
        <button
            className="
        flex h-11 w-11 items-center justify-center
        rounded-full
        border border-[var(--border)]
        bg-[var(--surface)]
        text-[var(--text)]
        transition-all duration-300
        hover:-translate-y-1
        hover:bg-[var(--primary)]
        hover:text-white
      "
        >
            <Icon size={18} />
        </button>
    );
}

function ContactItem({ icon: Icon, text, href }) {
    return (
        <a
            href={href}
            className="
        group
        flex items-center gap-4
        rounded-2xl
        p-4
        transition-all duration-300
        hover:-translate-y-1
      "
            style={{
                backgroundColor: "var(--foot-btn-bg)",
                border: "1px solid var(--border)",
                boxShadow: "0 4px 15px var(--shadow)",
            }}
        >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-white">
                <Icon size={18} />
            </div>

            <span
                className="text-sm font-medium transition-colors duration-300"
                style={{
                    color: "var(--text)",
                }}
            >
                {text}
            </span>
        </a>
    );
}

