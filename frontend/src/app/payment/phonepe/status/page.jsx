import { Suspense } from "react";
import PhonePeStatusClient from "./PhonePeStatusClient";

export default function PhonePeStatusPage() {
    return (
        <Suspense fallback={<PaymentStatusFallback />}>
            <PhonePeStatusClient />
        </Suspense>
    );
}

function PaymentStatusFallback() {
    return (
        <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
            <section className="flex min-h-screen items-center justify-center px-5 pt-32 pb-16">
                <div className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow-[0_8px_25px_var(--shadow)]">
                    <p className="text-sm text-[var(--text-secondary)]">
                        Loading payment status...
                    </p>
                </div>
            </section>
        </main>
    );
}