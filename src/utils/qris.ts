import QRCode from "qrcode";

export interface QrisConfig {
  merchantName: string;
  merchantCity: string;
  nmid: string;
  amount: number;
}

export function generateQrisPayload(config: QrisConfig): string {
  // Standard EMVCo / QRIS string structure template
  const amountStr = config.amount > 0 ? config.amount.toString() : "0";
  const amountTag = amountStr !== "0" 
    ? `54${amountStr.length.toString().padStart(2, "0")}${amountStr}5802ID`
    : "5802ID";

  const raw = `00020101021226590014ID.GO.QRIS.WWW011893600914${config.nmid}02150000000000000010303UME51440014ID.GO.QRIS.WWW0215ID10200238000000303UME520458125303360${amountTag}59${config.merchantName.length.toString().padStart(2, "0")}${config.merchantName}60${config.merchantCity.length.toString().padStart(2, "0")}${config.merchantCity}62210717AEGIS-DEV-DONATION6304`;
  
  // Calculate CRC16-CCITT for standard EMVCo checksum
  const crc = computeCrc16(raw);
  return raw + crc;
}

function computeCrc16(str: string): string {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    crc ^= (code << 8);
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export async function renderQrisDataUrl(payload: string): Promise<string> {
  return await QRCode.toDataURL(payload, {
    errorCorrectionLevel: "M",
    margin: 2,
    color: {
      dark: "#0F172A",
      light: "#FFFFFF"
    },
    width: 320
  });
}
