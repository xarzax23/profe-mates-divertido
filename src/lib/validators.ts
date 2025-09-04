export function validateGrade(n: number): n is 1|2|3|4|5|6 {
  return Number.isInteger(n) && n >= 1 && n <= 6;
}

export function detectAndSanitizePII(input: string) {
  // Muy básico: nombres con dos palabras con mayúscula inicial o direcciones con calle/nº
  const fullNameRegex = /\b[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+\b/;
  const addressRegex = /(calle|av\.|avenida|c\.|nº|numero|núm\.)/i;
  const hasPII = fullNameRegex.test(input) || addressRegex.test(input);
  const sanitized = input.replace(fullNameRegex, "[nombre oculto]").replace(addressRegex, "[dirección ocultada]");
  return { hasPII, sanitized };
}
