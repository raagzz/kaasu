// Indian-inspired category color palette
const PALETTE = [
    "#ff6b35", // Saffron
    "#0d9488", // Teal / Peacock
    "#d4a574", // Gold
    "#6366f1", // Indigo
    "#10b981", // Henna green
    "#f59e0b", // Turmeric
    "#ec4899", // Magenta
    "#3b82f6", // Neel blue
    "#a855f7", // Purple
    "#f97316", // Deep orange
];

export function getCategoryColor(name: string, index?: number): string {
    if (index !== undefined) return PALETTE[index % PALETTE.length];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return PALETTE[Math.abs(hash) % PALETTE.length];
}

export function formatINR(amount: number | string): string {
    return Number(amount).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}
