export type WhatsAppOrderLine = {
  name: string;
  qty: number;
  unitPrice: number;
};

/** Rakamlar ve ülke kodu (ör. 905551234567). */
export function normalizeWhatsAppPhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) return null;
  if (digits.startsWith("0")) return `9${digits}`;
  if (digits.length === 10) return `90${digits}`;
  return digits;
}

export function buildWhatsAppOrderUrl(
  phone: string,
  params: { restaurantName: string; lines: WhatsAppOrderLine[] }
): string | null {
  const normalized = normalizeWhatsAppPhone(phone);
  if (!normalized || params.lines.length === 0) return null;

  const fmt = (n: number) =>
    new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(n);

  const total = params.lines.reduce((sum, l) => sum + l.qty * l.unitPrice, 0);

  let text = "Merhaba, sipariş vermek istiyorum.\n\n";
  if (params.restaurantName.trim()) {
    text += `*${params.restaurantName.trim()}*\n\n`;
  }
  for (const line of params.lines) {
    text += `• ${line.name} x${line.qty} — ${fmt(line.qty * line.unitPrice)} TL\n`;
  }
  text += `\n*Toplam: ${fmt(total)} TL*`;

  return `https://wa.me/${normalized}?text=${encodeURIComponent(text)}`;
}
