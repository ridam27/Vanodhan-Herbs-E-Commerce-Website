import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Helper function to convert numbers to Indian currency words
function numberToWords(num) {
    if (!num || num === 0) return "Zero Rupees Only";
    const a = [
        "", "One ", "Two ", "Three ", "Four ", "Five ", "Six ", "Seven ", "Eight ", "Nine ", "Ten ",
        "Eleven ", "Twelve ", "Thirteen ", "Fourteen ", "Fifteen ", "Sixteen ", "Seventeen ", "Eighteen ", "Nineteen "
    ];
    const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    function inWords(n) {
        if ((n = n.toString()).length > 9) return "";
        let n_array = ("000000000" + n).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
        if (!n_array) return "";
        let str = "";
        str += n_array[1] != 0 ? (a[Number(n_array[1])] || b[n_array[1][0]] + " " + a[n_array[1][1]]) + "Crore " : "";
        str += n_array[2] != 0 ? (a[Number(n_array[2])] || b[n_array[2][0]] + " " + a[n_array[2][1]]) + "Lakh " : "";
        str += n_array[3] != 0 ? (a[Number(n_array[3])] || b[n_array[3][0]] + " " + a[n_array[3][1]]) + "Thousand " : "";
        str += n_array[4] != 0 ? (a[Number(n_array[4])] || b[n_array[4][0]] + " " + a[n_array[4][1]]) + "Hundred " : "";
        str += n_array[5] != 0 ? ((str != "") ? "and " : "") + (a[Number(n_array[5])] || b[n_array[5][0]] + " " + a[n_array[5][1]]) : "";
        return str;
    }

    const integerPart = Math.floor(Number(num) || 0);
    const words = inWords(integerPart).trim();
    return `${words} Rupees Only`;
}

export async function GET(request, { params }) {
    try {
        const { orderId } = await params;

        // 1. Authenticate user from Authorization Bearer header
        const authHeader = request.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json(
                { error: "Unauthorized access. Bearer token missing." },
                { status: 401 }
            );
        }

        const token = authHeader.split(" ")[1];
        const {
            data: { user },
            error: authError,
        } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json(
                { error: "Invalid or expired session." },
                { status: 401 }
            );
        }

        // 2. Fetch order record with items and address
        const { data: order, error: orderError } = await supabaseAdmin
            .from("orders")
            .select(`
                *,
                addresses (*),
                order_items (*)
            `)
            .eq("id", orderId)
            .single();

        if (orderError || !order) {
            return NextResponse.json(
                { error: "Order not found." },
                { status: 404 }
            );
        }

        // 3. Ownership verification
        if (order.user_id !== user.id) {
            return NextResponse.json(
                { error: "Access denied. Order does not belong to you." },
                { status: 403 }
            );
        }

        // 4. Strict Business Rules Verification:
        // Invoice ONLY available when status is delivered AND payment_status is paid
        const isDelivered = order.status === "delivered";
        const isPaid = order.payment_status === "paid";

        if (!isDelivered || !isPaid) {
            let reason = "Invoice is unavailable.";
            if (!isDelivered && !isPaid) {
                reason = "Invoice will be available after order delivery and payment completion.";
            } else if (!isDelivered) {
                reason = "Invoice will be available after order delivery.";
            } else if (!isPaid) {
                reason = "Invoice will be available after payment completion.";
            }

            return NextResponse.json({ error: reason }, { status: 403 });
        }

        // 5. Generate Invoice PDF using pdf-lib
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([595.28, 841.89]); // A4 Size in points (Width: 595.28, Height: 841.89)

        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

        // Try embedding logo-light.png from public folder
        let logoImage = null;
        try {
            const logoPath = path.join(process.cwd(), "public", "logo-light.png");
            if (fs.existsSync(logoPath)) {
                const logoBytes = fs.readFileSync(logoPath);
                logoImage = await pdfDoc.embedPng(logoBytes);
            }
        } catch (logoErr) {
            console.error("Logo load error:", logoErr);
        }

        const primaryGreen = rgb(0.18, 0.49, 0.2); // Vanodhan Green (#2E7D32)
        const darkText = rgb(0.13, 0.15, 0.18);
        const secondaryText = rgb(0.4, 0.45, 0.5);
        const borderGray = rgb(0.85, 0.88, 0.9);
        const tableBg = rgb(0.94, 0.97, 0.94);

        let y = 785;

        // --- COMPANY BRANDING HEADER ---
        if (logoImage) {
            const logoDims = logoImage.scale(0.18); // Height ~35px
            page.drawImage(logoImage, {
                x: 40,
                y: y - 8,
                width: logoDims.width,
                height: logoDims.height,
            });
        } else {
            page.drawText("VANODHAN HERBS", {
                x: 40,
                y,
                size: 20,
                font: fontBold,
                color: primaryGreen,
            });

            y -= 16;
            page.drawText("100% Pure & Authentic Herbal Care", {
                x: 40,
                y,
                size: 9,
                font: fontRegular,
                color: secondaryText,
            });
            y += 16;
        }

        page.drawText("INVOICE", {
            x: 470,
            y,
            size: 18,
            font: fontBold,
            color: primaryGreen,
        });

        page.drawText("Original Copy", {
            x: 470,
            y: y - 16,
            size: 9,
            font: fontRegular,
            color: secondaryText,
        });

        y -= 30;
        // Header Divider Line
        page.drawLine({
            start: { x: 40, y },
            end: { x: 555, y },
            thickness: 1.5,
            color: primaryGreen,
        });

        // --- META INFO SECTION: SOLD BY | BILLED TO | INVOICE DETAILS ---
        y -= 25;

        const address = order.addresses || {};
        const orderDate = new Date(order.created_at).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });

        // Column 1: SOLD BY (x: 40)
        page.drawText("SOLD BY:", {
            x: 40,
            y,
            size: 9,
            font: fontBold,
            color: primaryGreen,
        });

        // Column 2: BILLED & SHIPPED TO (x: 200)
        page.drawText("BILLED & SHIPPED TO:", {
            x: 200,
            y,
            size: 9,
            font: fontBold,
            color: primaryGreen,
        });

        // Column 3: INVOICE DETAILS (x: 375)
        page.drawText("INVOICE DETAILS:", {
            x: 375,
            y,
            size: 9,
            font: fontBold,
            color: primaryGreen,
        });

        y -= 16;
        // Sold By details
        page.drawText("Vanodhan Herbs", {
            x: 40,
            y,
            size: 9,
            font: fontBold,
            color: darkText,
        });

        // Billed To Name
        page.drawText((address.full_name || "Customer").slice(0, 26), {
            x: 200,
            y,
            size: 9,
            font: fontBold,
            color: darkText,
        });

        // Invoice ID
        const invoiceId = `INV-VH-${order.id.slice(0, 8).toUpperCase()}`;
        page.drawText(`Invoice ID: ${invoiceId}`, {
            x: 375,
            y,
            size: 8.5,
            font: fontBold,
            color: darkText,
        });

        y -= 14;
        // Sold By Address 1
        page.drawText("760, Uttam Town, Inzapur,", {
            x: 40,
            y,
            size: 8,
            font: fontRegular,
            color: darkText,
        });

        // Address Line 1 & 2
        const addrLine1 = address.address_line_1 || "";
        const addrLine2 = address.address_line_2 ? `, ${address.address_line_2}` : "";
        page.drawText(`${addrLine1}${addrLine2}`.slice(0, 30), {
            x: 200,
            y,
            size: 8.5,
            font: fontRegular,
            color: darkText,
        });

        // Order Date
        page.drawText(`Order Date: ${orderDate}`, {
            x: 375,
            y,
            size: 8.5,
            font: fontRegular,
            color: darkText,
        });

        y -= 14;
        // Sold By City / District
        page.drawText("Dist. Wardha - 442001", {
            x: 40,
            y,
            size: 8,
            font: fontRegular,
            color: darkText,
        });

        // City & State
        const cityState = `${address.city || ""}, ${address.state || ""} - ${address.pincode || ""}`;
        page.drawText(cityState.slice(0, 30), {
            x: 200,
            y,
            size: 8.5,
            font: fontRegular,
            color: darkText,
        });

        // Payment Status
        page.drawText(`Payment Status: PAID`, {
            x: 375,
            y,
            size: 8.5,
            font: fontBold,
            color: primaryGreen,
        });

        y -= 14;
        // Sold By PAN No (Blank)
        page.drawText("PAN No: _________________", {
            x: 40,
            y,
            size: 8,
            font: fontRegular,
            color: secondaryText,
        });

        // Customer Phone
        page.drawText(`Phone: ${address.phone || "N/A"}`, {
            x: 200,
            y,
            size: 8.5,
            font: fontRegular,
            color: darkText,
        });

        // Complete Order ID Label
        page.drawText("Order ID:", {
            x: 375,
            y,
            size: 8.5,
            font: fontBold,
            color: darkText,
        });

        y -= 14;
        // Sold By GSTIN (Blank)
        page.drawText("GSTIN: __________________", {
            x: 40,
            y,
            size: 8,
            font: fontRegular,
            color: secondaryText,
        });

        // Full Complete Order ID String (e.g. Full UUID)
        page.drawText(order.id, {
            x: 375,
            y,
            size: 7.5,
            font: fontRegular,
            color: darkText,
        });

        // --- ITEMS TABLE ---
        y -= 30;

        // Table Header Rectangle
        page.drawRectangle({
            x: 40,
            y: y - 5,
            width: 515,
            height: 22,
            color: tableBg,
            borderColor: borderGray,
            borderWidth: 1,
        });

        page.drawText("S.No", { x: 50, y, size: 9, font: fontBold, color: darkText });
        page.drawText("Item Description", { x: 90, y, size: 9, font: fontBold, color: darkText });
        page.drawText("Qty", { x: 330, y, size: 9, font: fontBold, color: darkText });
        page.drawText("Price (Rs.)", { x: 390, y, size: 9, font: fontBold, color: darkText });
        page.drawText("Total (Rs.)", { x: 480, y, size: 9, font: fontBold, color: darkText });

        y -= 25;

        // Table Rows
        const items = order.order_items || [];
        items.forEach((item, index) => {
            page.drawLine({
                start: { x: 40, y: y + 14 },
                end: { x: 555, y: y + 14 },
                thickness: 0.5,
                color: borderGray,
            });

            page.drawText(`${index + 1}`, { x: 50, y, size: 9, font: fontRegular, color: darkText });
            page.drawText((item.product_name || "Item").slice(0, 38), {
                x: 90,
                y,
                size: 9,
                font: fontRegular,
                color: darkText,
            });
            page.drawText(`${item.quantity}`, { x: 330, y, size: 9, font: fontRegular, color: darkText });
            page.drawText(`${item.price_at_purchase}`, {
                x: 390,
                y,
                size: 9,
                font: fontRegular,
                color: darkText,
            });
            page.drawText(`${item.line_total}`, {
                x: 480,
                y,
                size: 9,
                font: fontBold,
                color: darkText,
            });

            y -= 20;
        });

        // Table Bottom Line
        page.drawLine({
            start: { x: 40, y: y + 14 },
            end: { x: 555, y: y + 14 },
            thickness: 1,
            color: primaryGreen,
        });

        // --- SUMMARY & PAYMENT TRANSACTION DETAILS SECTION ---
        y -= 15;

        // Extract Payment Transaction Metadata
        const gwResp = order.gateway_response || order.payment_response || {};
        const pDetails = Array.isArray(gwResp.paymentDetails) ? gwResp.paymentDetails[0] : (gwResp.paymentDetails || gwResp);
        const splitInstrument = Array.isArray(pDetails?.splitInstruments) ? pDetails.splitInstruments[0] : null;

        // Transaction ID & UTR Number
        const transactionId = order.gateway_transaction_id || pDetails?.transactionId || gwResp.transactionId || order.payment_id || null;
        const utrNo = splitInstrument?.rail?.utr || splitInstrument?.rail?.upiTransactionId || order.utr_number || null;

        // Payment Method Display Logic
        const rawMethod = (order.payment_method || "").toLowerCase();
        const isCodOrder = rawMethod === "cod";
        const hasDoorstepUpiDetails = isCodOrder && (transactionId || utrNo || order.doorstep_upi || (order.payment_status === "paid" && (gwResp.transactionId || order.gateway_transaction_id)));

        let paymentMethodDisplay = "PhonePe Payment Gateway";
        if (isCodOrder) {
            paymentMethodDisplay = hasDoorstepUpiDetails ? "COD (UPI Payment)" : "COD (Cash Payment)";
        } else if (rawMethod === "online" || rawMethod === "phonepe") {
            paymentMethodDisplay = "PhonePe Payment Gateway";
        }

        // Payment Timestamp
        const paymentTs = pDetails?.timestamp || gwResp.timestamp || null;
        let formattedPaymentDate = "-";

        if (!isCodOrder || hasDoorstepUpiDetails) {
            if (paymentTs) {
                formattedPaymentDate = new Date(Number(paymentTs)).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                });
            } else if (order.payment_status === "paid") {
                formattedPaymentDate = new Date(order.updated_at || order.created_at).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                });
            }
        }

        // --- FINANCIAL BREAKDOWN SUMMARY ---
        const drawSummaryRow = (label, valStr, isBold = false, isGreen = false) => {
            const font = isBold ? fontBold : fontRegular;
            const color = isGreen ? primaryGreen : darkText;
            const size = isBold ? 11 : 9;

            // Draw Label starting at x: 320
            page.drawText(label, {
                x: 320,
                y,
                size: isBold ? 10 : 9,
                font: isBold ? fontBold : fontRegular,
                color,
            });

            // Draw Value right-aligned at x: 550
            const valWidth = font.widthOfTextAtSize(valStr, size);
            page.drawText(valStr, {
                x: 550 - valWidth,
                y,
                size,
                font,
                color,
            });
        };

        // Subtotal
        drawSummaryRow("Subtotal:", `Rs. ${order.subtotal}`);

        // Delivery Charge
        y -= 16;
        const deliveryTxt = order.delivery_charge === 0 ? "FREE" : `Rs. ${order.delivery_charge}`;
        drawSummaryRow("Delivery Charge:", deliveryTxt);

        // Savings / Coupon Discount
        if (order.coupon_discount > 0) {
            y -= 16;
            const savingsLabel = `Total Savings (${order.coupon_code || "Coupon"}):`;
            drawSummaryRow(savingsLabel, `- Rs. ${order.coupon_discount}`, true, true);
        }

        y -= 18;
        // Clean Divider Line above Amount Paid
        page.drawLine({
            start: { x: 320, y: y + 10 },
            end: { x: 550, y: y + 10 },
            thickness: 1,
            color: primaryGreen,
        });

        // Amount Paid
        drawSummaryRow("AMOUNT PAID:", `Rs. ${order.total}`, true, true);

        // --- AMOUNT IN WORDS (ABOVE PAYMENT DETAILS TABLE) ---
        y -= 25;
        page.drawText("Amount in Words:", { x: 40, y, size: 8.5, font: fontBold, color: darkText });
        const wordsText = numberToWords(order.total);
        page.drawText(wordsText, {
            x: 135,
            y,
            size: 8.5,
            font: fontBold,
            color: primaryGreen,
        });

        // --- FULL-WIDTH PAYMENT & TRANSACTION DETAILS TABLE ---
        y -= 25;

        page.drawText("PAYMENT & TRANSACTION DETAILS", {
            x: 40,
            y,
            size: 9.5,
            font: fontBold,
            color: primaryGreen,
        });

        y -= 18;

        // Payment Table Header Rectangle (Full Width 515pt)
        page.drawRectangle({
            x: 40,
            y: y - 5,
            width: 515,
            height: 22,
            color: tableBg,
            borderColor: borderGray,
            borderWidth: 1,
        });

        page.drawText("Payment Method", { x: 48, y, size: 8.5, font: fontBold, color: darkText });
        page.drawText("Transaction ID", { x: 175, y, size: 8.5, font: fontBold, color: darkText });
        page.drawText("Payment Date & Time", { x: 310, y, size: 8.5, font: fontBold, color: darkText });
        page.drawText("UTR / Ref No", { x: 430, y, size: 8.5, font: fontBold, color: darkText });
        page.drawText("Status", { x: 510, y, size: 8.5, font: fontBold, color: darkText });

        y -= 22;

        // Table Row Divider
        page.drawLine({
            start: { x: 40, y: y + 14 },
            end: { x: 555, y: y + 14 },
            thickness: 0.5,
            color: borderGray,
        });

        // Row Values
        page.drawText(paymentMethodDisplay, { x: 48, y, size: 8, font: fontBold, color: primaryGreen });
        page.drawText((transactionId || "-").slice(0, 24), { x: 175, y, size: 8, font: fontRegular, color: darkText });
        page.drawText((formattedPaymentDate || "-").slice(0, 22), { x: 310, y, size: 8, font: fontRegular, color: darkText });
        page.drawText((utrNo || "-").slice(0, 16), { x: 430, y, size: 8, font: fontRegular, color: darkText });
        page.drawText("PAID", { x: 510, y, size: 8, font: fontBold, color: primaryGreen });

        // Table Bottom Divider Line
        y -= 6;
        page.drawLine({
            start: { x: 40, y },
            end: { x: 555, y },
            thickness: 1,
            color: primaryGreen,
        });

        // --- FOOTER WITH SUPPORT INFO ---
        y = 70;
        page.drawLine({
            start: { x: 40, y: y + 15 },
            end: { x: 555, y: y + 15 },
            thickness: 0.5,
            color: borderGray,
        });

        page.drawText("Thank you for shopping with Vanodhan Herbs!", {
            x: 40,
            y,
            size: 9,
            font: fontBold,
            color: primaryGreen,
        });

        y -= 14;
        page.drawText(
            "Customer Support: vanodhanherbs@gmail.com  |  Phone: +91 99752 26220  |  760, Uttam Town, Inzapur, Wardha - 442001",
            {
                x: 40,
                y,
                size: 7.5,
                font: fontRegular,
                color: darkText,
            }
        );

        y -= 12;
        page.drawText(
            "This is an official computer-generated invoice and does not require a physical signature.",
            {
                x: 40,
                y,
                size: 7.5,
                font: fontRegular,
                color: secondaryText,
            }
        );

        // Serialize PDF to Uint8Array buffer
        const pdfBytes = await pdfDoc.save();

        return new NextResponse(pdfBytes, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="Invoice-VH-${order.id.slice(0, 8).toUpperCase()}.pdf"`,
            },
        });
    } catch (err) {
        console.error("Invoice generation error:", err);
        return NextResponse.json(
            { error: "Failed to generate tax invoice PDF." },
            { status: 500 }
        );
    }
}


