// Simple encryption for sensitive data (basic obfuscation in production)
const isProduction = process.env.NODE_ENV === "production"

export function encryptSensitiveData(data: any): string {
  if (!isProduction) {
    return JSON.stringify(data)
  }

  try {
    // Convert to JSON and then to base64 for basic obfuscation in production
    const jsonString = JSON.stringify(data)
    return Buffer.from(jsonString).toString("base64")
  } catch (error) {
    return "[ENCRYPTED]"
  }
}

export function logTransaction(data: any) {
  if (isProduction) {
    console.log("[TRANSACTION]", encryptSensitiveData(data))
  } else {
    console.log("[TRANSACTION]", data)
  }
}
