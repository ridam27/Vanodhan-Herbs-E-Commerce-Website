const PHONEPE_BASE_URL =
    process.env.PHONEPE_ENV === "production"
        ? "https://api.phonepe.com/apis/pg"
        : "https://api-preprod.phonepe.com/apis/pg-sandbox";

const PHONEPE_AUTH_URL =
    process.env.PHONEPE_ENV === "production"
        ? "https://api.phonepe.com/apis/identity-manager/v1/oauth/token"
        : "https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token";

function assertPhonePeEnv() {
    if (!process.env.PHONEPE_CLIENT_ID) throw new Error("PHONEPE_CLIENT_ID missing.");
    if (!process.env.PHONEPE_CLIENT_SECRET) throw new Error("PHONEPE_CLIENT_SECRET missing.");
    if (!process.env.PHONEPE_CLIENT_VERSION) throw new Error("PHONEPE_CLIENT_VERSION missing.");
}

export async function getPhonePeAccessToken() {
    assertPhonePeEnv();

    const body = new URLSearchParams();
    body.append("client_id", process.env.PHONEPE_CLIENT_ID);
    body.append("client_secret", process.env.PHONEPE_CLIENT_SECRET);
    body.append("client_version", process.env.PHONEPE_CLIENT_VERSION);
    body.append("grant_type", "client_credentials");

    const response = await fetch(PHONEPE_AUTH_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
        cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok || !data.access_token) {
        console.error("PhonePe auth failed:", data);
        throw new Error("PhonePe authentication failed.");
    }

    return data.access_token;
}

export async function createPhonePePayment({
    merchantOrderId,
    amount,
    redirectUrl,
}) {
    if (!merchantOrderId || typeof merchantOrderId !== "string") {
        throw new Error("Invalid merchant order ID.");
    }

    if (!Number.isInteger(amount) || amount <= 0) {
        throw new Error("Invalid payment amount.");
    }

    if (!redirectUrl || typeof redirectUrl !== "string") {
        throw new Error("Invalid redirect URL.");
    }

    const accessToken = await getPhonePeAccessToken();

    const response = await fetch(`${PHONEPE_BASE_URL}/checkout/v2/pay`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `O-Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            merchantOrderId,
            amount: amount * 100,
            expireAfter: 1200,
            metaInfo: {
                udf1: "Vanodhan Herbs",
            },
            paymentFlow: {
                type: "PG_CHECKOUT",
                message: "Payment for Vanodhan Herbs order",
                merchantUrls: {
                    redirectUrl,
                },
            },
        }),
        cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
        console.error("PhonePe create payment failed:", data);
        throw new Error("Unable to create PhonePe payment.");
    }

    return data;
}

export async function checkPhonePeOrderStatus(merchantOrderId) {
    if (!merchantOrderId || typeof merchantOrderId !== "string") {
        throw new Error("Invalid merchant order ID.");
    }

    const accessToken = await getPhonePeAccessToken();

    const response = await fetch(
        `${PHONEPE_BASE_URL}/checkout/v2/order/${merchantOrderId}/status`,
        {
            method: "GET",
            headers: {
                Authorization: `O-Bearer ${accessToken}`,
            },
            cache: "no-store",
        }
    );

    const data = await response.json();

    if (!response.ok) {
        console.error("PhonePe status failed:", data);
        throw new Error("Unable to verify PhonePe payment.");
    }

    return data;
}