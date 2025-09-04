import { Course } from "@/types";

const mdSumas = `# Sumas y Restas

Aprende a sumar y restar con ejemplos sencillos.

## Ejemplo

3 + 2 = 5  
7 − 4 = 3

## Practica
- ¿Cuánto es 5 + 4?
- ¿Y 9 − 6?
`;

const mdFracciones = `# Fracciones básicas

Una fracción tiene numerador y denominador: 1/2, 3/4...

## Ejemplo
Si tienes 1 pizza y la partes en 4, una porción es 1/4.
`;

const mdUnidades = `# Unidades de medida

- Longitud: metro (m), centímetro (cm)
- Masa: kilogramo (kg), gramo (g)
- Tiempo: segundo (s), minuto (min)
`;

export const mockCourses: Course[] = [1,2,3,4,5,6].map((g) => ({
  grade: g as Course["grade"],
  name: `${g}º de Primaria`,
  topics: [
    {
      id: `t-${g}-sumas`,
      slug: "sumas-y-restas",
      title: "Sumas y Restas",
      markdown: mdSumas,
      questions: [
        { id: `q-${g}-1`, text: "¿Cuánto es 8 + 5?" },
        { id: `q-${g}-2`, text: "Calcula 12 − 7" },
      ],
    },
    {
      id: `t-${g}-fracciones`,
      slug: "fracciones",
      title: "Fracciones",
      markdown: mdFracciones,
      questions: [
        { id: `q-${g}-3`, text: "¿Qué es mayor, 1/2 o 1/3?" },
      ],
    },
    {
      id: `t-${g}-unidades`,
      slug: "unidades-de-medida",
      title: "Unidades de medida",
      markdown: mdUnidades,
      questions: [
        { id: `q-${g}-4`, text: "Convierte 200 cm a metros" },
      ],
    },
  ],
}));
