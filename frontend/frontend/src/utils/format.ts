export const formatPrice = (price: number | string, currency: string = "NGN"): string => {
    const amount = typeof price === "string" ? parseFloat(price) : price;
    if (isNaN(amount)) return "N/A";

    const symbol = currency === "NGN" ? "₦" : "$";
    
    // Nigerian formatting: ₦ 1,250,000.00
    return `${symbol}${amount.toLocaleString("en-NG", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
};
