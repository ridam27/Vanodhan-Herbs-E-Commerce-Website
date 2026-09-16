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

// Helper for Indian Currency Formatting
function formatAmount(amt) {
    const val = Number(amt) || 0;
    return `Rs. ${val.toLocaleString("en-IN")}`;
}

export async function GET(request, { params }) {
    try {
        const { orderId } = await params;
        const searchParams = new URL(request.url).searchParams;
        const queryToken = searchParams.get("token");
        const isPreview = searchParams.get("preview") === "true" || searchParams.get("inline") === "true";

        // 1. Authenticate user from Authorization Bearer header or token query param
        const authHeader = request.headers.get("authorization");
        const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : queryToken;

        if (!token) {
            return NextResponse.json(
                { error: "Unauthorized access. Bearer token missing." },
                { status: 401 }
            );
        }

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
        const page = pdfDoc.addPage([595.28, 841.89]); // A4 Size (595.28 x 841.89 pt)

        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

        // Alignment & Centering Helpers
        const drawRightText = (text, rightX, yPos, size, font, color) => {
            const width = font.widthOfTextAtSize(text, size);
            page.drawText(text, { x: rightX - width, y: yPos, size, font, color });
        };

        const drawCenterText = (text, centerX, yPos, size, font, color) => {
            const width = font.widthOfTextAtSize(text, size);
            page.drawText(text, { x: centerX - (width / 2), y: yPos, size, font, color });
        };

        // Calculates exact baseline Y to visually center text of size `fontSize` inside a box of height `boxH` at `boxY`
        const getCenteredTextY = (boxY, boxH, fontSize) => {
            return boxY + (boxH - fontSize) / 2 + 1.5;
        };

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

        // Professional Color Palette
        const primaryGreen = rgb(0.086, 0.396, 0.16); // #166534 / Deep Vanodhan Green
        const darkText = rgb(0.12, 0.16, 0.21);      // #1f2937 / Slate Dark
        const secondaryText = rgb(0.38, 0.45, 0.54); // #64748b / Slate Muted
        const lightBg = rgb(0.94, 0.96, 0.98);       // #f1f5f9 / Table Header Gray
        const altRowBg = rgb(0.98, 0.99, 0.99);      // #f8fafc / Subtle Row Accent
        const bannerBg = rgb(0.93, 0.97, 0.93);      // #edf7ee / Paid Green Banner
        const borderGray = rgb(0.85, 0.88, 0.91);    // #e2e8f0 / Border Gray

        // --- 1. BRANDING HEADER ---
        const pageHeight = 841.89;
        const pageHeaderMargin = 22; // Strictly equal spacing above and below logo

        let headerHeight = 30; // Default height fallback
        let logoDims = null;

        if (logoImage) {
            logoDims = logoImage.scale(0.11); // Smaller, elegant logo
            headerHeight = logoDims.height;
        }

        const logoTopY = pageHeight - pageHeaderMargin;
        const logoY = logoTopY - headerHeight;
        const headerBottomLineY = logoY - pageHeaderMargin; // Equal space below logo to divider line!

        if (logoImage) {
            page.drawImage(logoImage, {
                x: 40,
                y: logoY,
                width: logoDims.width,
                height: logoDims.height,
            });
        } else {
            page.drawText("VANODHAN HERBS", {
                x: 40,
                y: logoY + 4,
                size: 18,
                font: fontBold,
                color: primaryGreen,
            });
        }

        // Right side header: INVOICE title and Copy Badge (Vertically aligned with header)
        const headerCenterY = (logoTopY + logoY) / 2;
        drawRightText("INVOICE", 555, headerCenterY + 2, 20, fontBold, primaryGreen);
        drawRightText("Original for Recipient", 555, headerCenterY - 11, 8, fontRegular, secondaryText);

        // Header Divider Line (Equal distance from logo bottom as top edge!)
        page.drawLine({
            start: { x: 40, y: headerBottomLineY },
            end: { x: 555, y: headerBottomLineY },
            thickness: 1.5,
            color: primaryGreen,
        });

        // --- 2. METADATA SECTION (SOLD BY | BILLED TO | INVOICE DETAILS) ---
        let y = headerBottomLineY - 20;

        const address = order.addresses || {};
        const orderDate = new Date(order.created_at).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });

        const col1X = 40;
        const col2X = 205;
        const col3X = 375;

        // Column Titles
        page.drawText("SOLD BY:", { x: col1X, y, size: 8.5, font: fontBold, color: primaryGreen });
        page.drawText("BILLED & SHIPPED TO:", { x: col2X, y, size: 8.5, font: fontBold, color: primaryGreen });
        page.drawText("INVOICE DETAILS:", { x: col3X, y, size: 8.5, font: fontBold, color: primaryGreen });

        y -= 14;
        // Row 1
        page.drawText("Vanodhan Herbs", { x: col1X, y, size: 9, font: fontBold, color: darkText });
        page.drawText((address.full_name || "Customer").slice(0, 26), { x: col2X, y, size: 9, font: fontBold, color: darkText });
        
        const invoiceId = `INV-VH-${order.id.slice(0, 8).toUpperCase()}`;
        page.drawText("Invoice ID:", { x: col3X, y, size: 8.5, font: fontBold, color: darkText });
        page.drawText(invoiceId, { x: col3X + 54, y, size: 8.5, font: fontBold, color: darkText });

        y -= 13;
        // Row 2
        page.drawText("760, Uttam Town, Inzapur,", { x: col1X, y, size: 8, font: fontRegular, color: darkText });
        const addrLine1 = address.address_line_1 || "";
        const addrLine2 = address.address_line_2 ? `, ${address.address_line_2}` : "";
        page.drawText(`${addrLine1}${addrLine2}`.slice(0, 30), { x: col2X, y, size: 8.5, font: fontRegular, color: darkText });

        page.drawText("Order Date:", { x: col3X, y, size: 8.5, font: fontRegular, color: secondaryText });
        page.drawText(orderDate, { x: col3X + 54, y, size: 8.5, font: fontRegular, color: darkText });

        y -= 13;
        // Row 3
        page.drawText("Dist. Wardha - 442001", { x: col1X, y, size: 8, font: fontRegular, color: darkText });
        const cityState = `${address.city || ""}, ${address.state || ""} - ${address.pincode || ""}`;
        page.drawText(cityState.slice(0, 30), { x: col2X, y, size: 8.5, font: fontRegular, color: darkText });

        page.drawText("Payment Status:", { x: col3X, y, size: 8.5, font: fontRegular, color: secondaryText });
        page.drawText("PAID", { x: col3X + 72, y, size: 8.5, font: fontBold, color: primaryGreen });

        y -= 13;
        // Row 4
        page.drawText("Maharashtra, India", { x: col1X, y, size: 8, font: fontRegular, color: secondaryText });
        page.drawText(`Phone: ${address.phone || "N/A"}`, { x: col2X, y, size: 8.5, font: fontRegular, color: darkText });

        page.drawText("Order ID:", { x: col3X, y, size: 8.5, font: fontRegular, color: secondaryText });
        page.drawText(order.id, { x: col3X, y: y - 10, size: 7.5, font: fontRegular, color: darkText });

        y -= 13;
        // Row 5
        page.drawText("PAN: N/A  |  GSTIN: N/A", { x: col1X, y, size: 8, font: fontRegular, color: secondaryText });

        y -= 25; // Clean margin before items table

        // --- 3. ITEMS TABLE ---
        const tableHeaderBoxY = y - 22;
        const tableHeaderBoxH = 22;

        // Table Header Banner Rectangle
        page.drawRectangle({
            x: 40,
            y: tableHeaderBoxY,
            width: 515,
            height: tableHeaderBoxH,
            color: lightBg,
            borderColor: borderGray,
            borderWidth: 1,
        });

        // Vertically Centered Text Y inside Table Header
        const headerTextY = getCenteredTextY(tableHeaderBoxY, tableHeaderBoxH, 8.5);

        // Header Labels
        page.drawText("S.No", { x: 48, y: headerTextY, size: 8.5, font: fontBold, color: darkText });
        page.drawText("Item Description", { x: 88, y: headerTextY, size: 8.5, font: fontBold, color: darkText });
        drawRightText("Qty", 350, headerTextY, 8.5, fontBold, darkText);
        drawRightText("Price", 440, headerTextY, 8.5, fontBold, darkText);
        drawRightText("Total", 545, headerTextY, 8.5, fontBold, darkText);

        y = tableHeaderBoxY; // Top of row area starts at bottom of header box

        // Table Rows
        const items = order.order_items || [];
        items.forEach((item, index) => {
            const rowBoxY = y - 20;
            const rowBoxH = 20;
            const rowTextY = getCenteredTextY(rowBoxY, rowBoxH, 8.5);

            const isAlt = index % 2 === 1;
            if (isAlt) {
                page.drawRectangle({
                    x: 40,
                    y: rowBoxY,
                    width: 515,
                    height: rowBoxH,
                    color: altRowBg,
                });
            }

            // Top Row Divider
            page.drawLine({
                start: { x: 40, y: y },
                end: { x: 555, y: y },
                thickness: 0.5,
                color: borderGray,
            });

            page.drawText(`${index + 1}`, { x: 52, y: rowTextY, size: 8.5, font: fontRegular, color: darkText });
            page.drawText((item.product_name || "Item").slice(0, 42), {
                x: 88,
                y: rowTextY,
                size: 8.5,
                font: fontRegular,
                color: darkText,
            });
            
            drawRightText(`${item.quantity}`, 350, rowTextY, 8.5, fontRegular, darkText);
            drawRightText(formatAmount(item.price_at_purchase), 440, rowTextY, 8.5, fontRegular, darkText);
            drawRightText(formatAmount(item.line_total), 545, rowTextY, 8.5, fontBold, darkText);

            y = rowBoxY;
        });

        // Table Bottom Border Line
        page.drawLine({
            start: { x: 40, y },
            end: { x: 555, y },
            thickness: 1,
            color: primaryGreen,
        });

        // --- 4. FINANCIAL BREAKDOWN SUMMARY & AMOUNT IN WORDS (SIDE-BY-SIDE) ---
        y -= 18;

        const summaryTopY = y;
        let rightRowY = summaryTopY;

        const drawSummaryRow = (label, valStr, isBold = false, isGreen = false) => {
            const font = isBold ? fontBold : fontRegular;
            const color = isGreen ? primaryGreen : darkText;
            const size = isBold ? 9.5 : 8.5;

            page.drawText(label, {
                x: 320,
                y: rightRowY,
                size: isBold ? 9 : 8.5,
                font: isBold ? fontBold : fontRegular,
                color,
            });

            drawRightText(valStr, 545, rightRowY, size, font, color);
        };

        // Subtotal
        drawSummaryRow("Subtotal:", formatAmount(order.subtotal));

        // Delivery Charge
        rightRowY -= 15;
        const deliveryTxt = order.delivery_charge === 0 ? "FREE" : formatAmount(order.delivery_charge);
        drawSummaryRow("Delivery Charge:", deliveryTxt);

        // Savings / Coupon Discount
        if (order.coupon_discount > 0) {
            rightRowY -= 15;
            const savingsLabel = `Total Savings (${order.coupon_code || "Coupon"}):`;
            drawSummaryRow(savingsLabel, `- ${formatAmount(order.coupon_discount)}`, true, true);
        }

        // Banner Box for AMOUNT PAID (Right Side)
        // Set top edge 12pt below the last summary row baseline to prevent overlap
        const paidBoxTop = rightRowY - 12;
        const paidBoxH = 24;
        const paidBoxY = paidBoxTop - paidBoxH;

        page.drawRectangle({
            x: 310,
            y: paidBoxY,
            width: 245,
            height: paidBoxH,
            color: bannerBg,
            borderColor: primaryGreen,
            borderWidth: 1,
        });

        const paidTextY = getCenteredTextY(paidBoxY, paidBoxH, 9.5);

        page.drawText("AMOUNT PAID:", {
            x: 320,
            y: paidTextY,
            size: 9.5,
            font: fontBold,
            color: primaryGreen,
        });

        drawRightText(formatAmount(order.total), 545, paidTextY, 10.5, fontBold, primaryGreen);

        // --- 5. AMOUNT IN WORDS CARD (LEFT SIDE OF SUMMARY) ---
        // Spans from top of summary block down to paidBoxY
        const wordsBoxTopY = summaryTopY + 10;
        const wordsBoxY = paidBoxY;
        const wordsBoxH = wordsBoxTopY - wordsBoxY;

        page.drawRectangle({
            x: 40,
            y: wordsBoxY,
            width: 255,
            height: wordsBoxH,
            color: altRowBg,
            borderColor: borderGray,
            borderWidth: 1,
        });

        // Vertically center the 2-line Amount in Words block inside left card
        const wordsBoxCenterY = wordsBoxY + (wordsBoxH / 2);
        const wordsTitleY = wordsBoxCenterY + 6;
        const wordsValY = wordsBoxCenterY - 8;

        page.drawText("Amount in Words:", {
            x: 50,
            y: wordsTitleY,
            size: 8,
            font: fontBold,
            color: secondaryText,
        });

        const wordsText = numberToWords(order.total);
        page.drawText(wordsText.slice(0, 42), {
            x: 50,
            y: wordsValY,
            size: 8.5,
            font: fontBold,
            color: primaryGreen,
        });

        y = paidBoxY; // Update vertical cursor to bottom of summary block

        // --- 6. PAYMENT & TRANSACTION DETAILS TABLE ---
        y -= 30; // Spacing before section title

        page.drawText("PAYMENT & TRANSACTION DETAILS", {
            x: 40,
            y,
            size: 9,
            font: fontBold,
            color: primaryGreen,
        });

        // Set top edge 12pt below section title baseline to prevent border touching
        const payHeaderBoxTop = y - 12;
        const payHeaderBoxH = 22;
        const payHeaderBoxY = payHeaderBoxTop - payHeaderBoxH;

        // Payment Table Header Banner
        page.drawRectangle({
            x: 40,
            y: payHeaderBoxY,
            width: 515,
            height: payHeaderBoxH,
            color: lightBg,
            borderColor: borderGray,
            borderWidth: 1,
        });

        const payHeaderTextY = getCenteredTextY(payHeaderBoxY, payHeaderBoxH, 8.5);

        page.drawText("Payment Method", { x: 48, y: payHeaderTextY, size: 8.5, font: fontBold, color: darkText });
        page.drawText("Transaction ID", { x: 175, y: payHeaderTextY, size: 8.5, font: fontBold, color: darkText });
        page.drawText("Payment Date & Time", { x: 310, y: payHeaderTextY, size: 8.5, font: fontBold, color: darkText });
        page.drawText("UTR / Ref No", { x: 430, y: payHeaderTextY, size: 8.5, font: fontBold, color: darkText });
        drawRightText("Status", 545, payHeaderTextY, 8.5, fontBold, darkText);

        y = payHeaderBoxY;

        // Extract Payment Transaction Details
        const gwResp = order.gateway_response || order.payment_response || {};
        const pDetails = Array.isArray(gwResp.paymentDetails) ? gwResp.paymentDetails[0] : (gwResp.paymentDetails || gwResp);
        const splitInstrument = Array.isArray(pDetails?.splitInstruments) ? pDetails.splitInstruments[0] : null;

        const transactionId = order.gateway_transaction_id || pDetails?.transactionId || gwResp.transactionId || order.payment_id || null;
        const utrNo = splitInstrument?.rail?.utr || splitInstrument?.rail?.upiTransactionId || order.utr_number || null;

        const rawMethod = (order.payment_method || "").toLowerCase();
        const isCodOrder = rawMethod === "cod";
        const hasDoorstepUpiDetails = isCodOrder && (transactionId || utrNo || order.doorstep_upi || (order.payment_status === "paid" && (gwResp.transactionId || order.gateway_transaction_id)));

        let paymentMethodDisplay = "PhonePe Payment Gateway";
        if (isCodOrder) {
            paymentMethodDisplay = hasDoorstepUpiDetails ? "COD (UPI Payment)" : "COD (Cash Payment)";
        } else if (rawMethod === "online" || rawMethod === "phonepe") {
            paymentMethodDisplay = "PhonePe Payment Gateway";
        }

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

        const payRowBoxY = y - 20;
        const payRowBoxH = 20;
        const payRowTextY = getCenteredTextY(payRowBoxY, payRowBoxH, 8);

        // Table Row Divider
        page.drawLine({
            start: { x: 40, y },
            end: { x: 555, y },
            thickness: 0.5,
            color: borderGray,
        });

        // Row Values Vertically Centered
        page.drawText(paymentMethodDisplay, { x: 48, y: payRowTextY, size: 8, font: fontBold, color: primaryGreen });
        page.drawText((transactionId || "-").slice(0, 24), { x: 175, y: payRowTextY, size: 8, font: fontRegular, color: darkText });
        page.drawText((formattedPaymentDate || "-").slice(0, 22), { x: 310, y: payRowTextY, size: 8, font: fontRegular, color: darkText });
        page.drawText((utrNo || "-").slice(0, 16), { x: 430, y: payRowTextY, size: 8, font: fontRegular, color: darkText });
        drawRightText("PAID", 545, payRowTextY, 8, fontBold, primaryGreen);

        // Table Bottom Line
        y = payRowBoxY;
        page.drawLine({
            start: { x: 40, y },
            end: { x: 555, y },
            thickness: 1,
            color: primaryGreen,
        });

        // --- 7. FOOTER WITH SUPPORT INFO ---
        y = 60;
        page.drawLine({
            start: { x: 40, y: y + 15 },
            end: { x: 555, y: y + 15 },
            thickness: 0.5,
            color: borderGray,
        });

        drawCenterText("Thank you for shopping with Vanodhan Herbs!", 297.64, y, 9, fontBold, primaryGreen);

        y -= 14;
        drawCenterText(
            "Customer Support: vanodhanherbs@gmail.com  |  Phone: +91 99752 26220  |  760, Uttam Town, Inzapur, Wardha - 442001",
            297.64,
            y,
            7.5,
            fontRegular,
            darkText
        );

        y -= 12;
        drawCenterText(
            "This is an official computer-generated invoice and does not require a physical signature.",
            297.64,
            y,
            7.2,
            fontRegular,
            secondaryText
        );

        // Serialize PDF to Uint8Array buffer
        const pdfBytes = await pdfDoc.save();

        const disposition = isPreview
            ? "inline"
            : `attachment; filename="Invoice-VH-${order.id.slice(0, 8).toUpperCase()}.pdf"`;

        return new NextResponse(pdfBytes, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": disposition,
            },
        });
    } catch (err) {
        console.error("Invoice generation error:", err);
        return NextResponse.json(
            { error: "Failed to generate invoice PDF." },
            { status: 500 }
        );
    }
}


