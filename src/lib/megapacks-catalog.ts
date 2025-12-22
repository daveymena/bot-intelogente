/**
 * 📦 CATÁLOGO COMPLETO DE 85 MEGAPACKS
 * 
 * Todos los Megapacks con enlaces de Google Drive
 * Nombres exactos según carpetas de Google Drive
 */

export interface MegapackInfo {
  id: number;
  name: string;
  driveLink: string;
  description: string;
  category: string;
  price: number; // COP
  keywords: string[];
}

const DRIVE_LINKS = [
  "https://drive.google.com/drive/folders/11UWOG_OjzWAZyyoxl3vpu56_DxLkepqU?usp=drive_link",
  "https://drive.google.com/drive/folders/1HZi8eI8TO7N6x7ld6Z8x4nIlUs1o3tpQ?usp=drive_link",
  "https://drive.google.com/drive/folders/1_wuy7nghjwjf_pJg_IbFWf4fVjfdt_91?usp=drive_link",
  "https://drive.google.com/drive/folders/15A_20cdxgXwDCUEWddY6JMvFjxuwL-8c?usp=drive_link",
  "https://drive.google.com/drive/folders/1h5X8ksJXZGSqdXO6Gp4y6lD1O-Gux7tQ?usp=drive_link",
  "https://drive.google.com/drive/folders/1Mb04K4e0CfYZ5qkdpqQgbE-qsd5IPnVk?usp=drive_link",
  "https://drive.google.com/drive/folders/1XqIgPh-dnpmhed1qT59WVCsIvLcmrr6e?usp=drive_link",
  "https://drive.google.com/drive/folders/1Z-wlfVEa2QAdzVQ1K_ksdUpFSQePKQ9S?usp=drive_link",
  "https://drive.google.com/drive/folders/1wMqUIP3AQxh2mMn_6syfzbp-fHWNqO3e?usp=drive_link",
  "https://drive.google.com/drive/folders/1RFj8bTpKmpn35VH4sRhcT-ATwLE3bVwM?usp=drive_link",
  "https://drive.google.com/drive/folders/1G8ZP5Vg_3Vn1nRtVSkjxYwjXOLzw-XvU?usp=drive_link",
  "https://drive.google.com/drive/folders/1xz8l8aAiIdLDasBThWQ_puHG8ZalDg90?usp=drive_link",
  "https://drive.google.com/drive/folders/1kd7aqgo_cGbpfUs4Vwb7Lae5UiKaPVsU?usp=drive_link",
  "https://drive.google.com/drive/folders/1FZcxqQe9VF4DCZ0rIb3GGGZo1_NMojCn?usp=drive_link",
  "https://drive.google.com/drive/folders/1qbS_Lv1F7JX1xxkQ0tOMpbXV0v1w68VC?usp=drive_link",
  "https://drive.google.com/drive/folders/1THAdOVZlonWGlnrM_6rPL6jVi7WBniAk?usp=drive_link",
  "https://drive.google.com/drive/folders/1w_HG4r7vLkwIKjVZzzHIRp6FCxTUD6Iz?usp=drive_link",
  "https://drive.google.com/drive/folders/1xJh1wJav3yt8-sIJ-eYllP5M_cHmil97?usp=drive_link",
  "https://drive.google.com/drive/folders/1fHSoabb6hBQmQTSs_4NzvAhk11uvrBkX?usp=drive_link",
  "https://drive.google.com/drive/folders/1ZU6ofJ6e67Lwvt8CKnqCWwMvzUoYKncQ?usp=drive_link",
  "https://drive.google.com/drive/folders/1tarxNsTUxXLtSzifWe3P2RUhkpoemAxj?usp=drive_link",
  "https://drive.google.com/drive/folders/1q4y8bAH-NXlu7AvswF4P3VYymxVHQ9hq?usp=drive_link",
  "https://drive.google.com/drive/folders/1Ya5jGHKBPjxIxRZndLrb-iukOWbvkf21?usp=drive_link",
  "https://drive.google.com/drive/folders/1tKE4GiFq3N3odeGjTuU0nrQgOWZUhNgF?usp=drive_link",
  "https://drive.google.com/drive/folders/1qq6HGOrZRAJ4_lCdAlEIzH6LUq9tQBsw?usp=drive_link",
  "https://drive.google.com/drive/folders/15Fmu2UaqGv2GEXplj91M6FQouARkR8dV?usp=drive_link",
  "https://drive.google.com/drive/folders/1KEUL5j1HDT8J-J1MqmQ2jaGKyxlMDW_9?usp=drive_link",
  "https://drive.google.com/drive/folders/1uPiwtsCDryHF-LyHaHvXpv0Ebl1ck9a9?usp=drive_link",
  "https://drive.google.com/drive/folders/1xM6IylsuIHADmfVftmHYsAmRJfnwuNJo?usp=drive_link",
  "https://drive.google.com/drive/folders/1IliKLCntPplMNUCGs_5inAkCufOwXBis?usp=drive_link",
  "https://drive.google.com/drive/folders/1oXsN2hX8byp7n9czuCRaDUONILxYdlml?usp=drive_link",
  "https://drive.google.com/drive/folders/1gmsr943dcsgm5y1AcAoXOD_vGRRKhVr2?usp=drive_link",
  "https://drive.google.com/drive/folders/1lIYXk7__af6HRWzXx3V-mlTYHUJpE4fY?usp=drive_link",
  "https://drive.google.com/drive/folders/1rCmKvDqhSqAYLXDhow-QieKTd_1vYE-Z?usp=drive_link",
  "https://drive.google.com/drive/folders/1oha877iB_Z6Kmh7uC0jYuzCGzpvfDDp_?usp=drive_link",
  "https://drive.google.com/drive/folders/1OpQx43DWRLZsJ3nt9iYOniidr_nUAeL3?usp=drive_link",
  "https://drive.google.com/drive/folders/1VM5FV7rWMYhZiG5sNUNIkudqagm3Qedp?usp=drive_link",
  "https://drive.google.com/drive/folders/1GUzgDNtq43nkJQYPc_EnUAajansWw9mS?usp=drive_link",
  "https://drive.google.com/drive/folders/12cf-oPboTkEcNnQswHtulpiOd5mjp-rU?usp=drive_link",
  "https://drive.google.com/drive/folders/1IzcVPqeJFviIj1adOG5Wevv-A3ue3rce?usp=drive_link",
  "https://drive.google.com/drive/folders/1lwkmabZu6_tueSkTbD8tqjW_s5pQ-G9j?usp=drive_link",
  "https://drive.google.com/drive/folders/18bLJSGnUktHpQCkrhgxNbmdLoVQ3Uw8j?usp=drive_link",
  "https://drive.google.com/drive/folders/1c8WbPa5DUn60kOFQDnzYIJ4konRonYBb?usp=drive_link",
  "https://drive.google.com/drive/folders/1wKh-TGJG5Xns9AN2mUbfgWQ5VgM4gtpf?usp=drive_link",
  "https://drive.google.com/drive/folders/1mNtIyWf4OcJE6mBZYuWI3GJoKu5kjMGs?usp=drive_link",
  "https://drive.google.com/drive/folders/1FJRHM-F1DSQPCMUZ_XZVRNYdiUYYwvBd?usp=drive_link",
  "https://drive.google.com/drive/folders/1FlbQPrKD9Xnl-s12b_IwYfXbnH-lGITy?usp=drive_link",
  "https://drive.google.com/drive/folders/1_yU91jX7qhFoAZotKxFSQp97Df1yWJIq?usp=drive_link",
  "https://drive.google.com/drive/folders/11yNE6hP-O3plYkJ51uEnqqAUSDpeIHcR?usp=drive_link",
  "https://drive.google.com/drive/folders/1TYkP23mP2XwusI610eDzU-b6UkXdH039?usp=drive_link",
  "https://drive.google.com/drive/folders/17wfcNztBCJKH76KkyQ0Y3dTRo_1Yvv9m?usp=drive_link",
  "https://drive.google.com/drive/folders/1A7HNo0Udc8GDGRwL75illMjkhUXBlMsT?usp=drive_link",
  "https://drive.google.com/drive/folders/1cnkyxl_sy4xwxx6pxtRmcceYGHsRwQYO?usp=drive_link",
  "https://drive.google.com/drive/folders/1k8YJ1_VLfStY3VTAr5NXM5150EHDhB_Z?usp=drive_link",
  "https://drive.google.com/drive/folders/1L9ibzLVoC4ui05TPVHKSH1xwe2UnTwX3?usp=drive_link",
  "https://drive.google.com/drive/folders/1I6NboyUItOOcqiaNDgo44nwQqCkd9e_l?usp=drive_link",
  "https://drive.google.com/drive/folders/1uVXzzL_aJAcc9WfNwNvLztoHTX_Ebosd?usp=drive_link",
  "https://drive.google.com/drive/folders/1jyqiiV6lELw7wfPVe5Oaq2TliSwwhAGs?usp=drive_link",
  "https://drive.google.com/drive/folders/1gdyCA5It2qtpyMD4jF_sGfX63Do8bmKW?usp=drive_link",
  "https://drive.google.com/drive/folders/1G1LVh9ENN7UoROGm-zXla9YkYydHpNzh?usp=drive_link",
  "https://drive.google.com/drive/folders/1GlFylHZSijsVv7ibX0Qf6armpasr9oDj?usp=drive_link",
  "https://drive.google.com/drive/folders/1Rxc7dwMcUB54HLjsbzW7cQIW31nXrnzw?usp=drive_link",
  "https://drive.google.com/drive/folders/1f2fpt8pA535h5EDGBTA8Bxu0wmEIOHZy?usp=drive_link",
  "https://drive.google.com/drive/folders/1LmnN1URGfJgJ_c0yQ682y2rpfrznGriy?usp=drive_link",
  "https://drive.google.com/drive/folders/18BBOqD7rZzqLOtmkrTOWXtQCBVki9Fdy?usp=drive_link",
  "https://drive.google.com/drive/folders/1DHfAMFXd9u_F7AHmpMLeOYouHLNNTiMs?usp=drive_link",
  "https://drive.google.com/drive/folders/1KY5XUrO8VuIkvflY-yFqLudIxBjhglHS?usp=drive_link",
  "https://drive.google.com/drive/folders/196SMTqFc91IW0pxXhWj0fiYGxJYCzF8m?usp=drive_link",
  "https://drive.google.com/drive/folders/1fg_SpIlaJ59bH-jH91nT_pTjGfshuXop?usp=drive_link",
  "https://drive.google.com/drive/folders/1YFZ3IjUZjiBFYkgKyuADHVseSOQ7w0EF?usp=drive_link",
  "https://drive.google.com/drive/folders/1BwOD8G8DNRIFEOu97mBqdMtohyT8tNl5?usp=drive_link",
  "https://drive.google.com/drive/folders/1OfYcPn5UnlwBZ15GNGCyToVCv4xhaEUb?usp=drive_link",
  "https://drive.google.com/drive/folders/154AjtnTpPp8Xy7gqClutmEA5ByV3UELe?usp=drive_link",
  "https://drive.google.com/drive/folders/1-RIJyRowZR_Wvh7tmg6A7p4kI8bspqrJ?usp=drive_link",
  "https://drive.google.com/drive/folders/1udXRUHpa_pPPusFaF8zHpJTrcv_1iFF5?usp=drive_link",
  "https://drive.google.com/drive/folders/1zSaSxFPK2OVx8XlXc3Exw2LhNizdk5r3?usp=drive_link",
  "https://drive.google.com/drive/folders/1DhqmwTVl1pRgkz2fUBVassqi7TfCy2Ko?usp=drive_link",
  "https://drive.google.com/drive/folders/1YnIPCyHnYkSsqhihaeEC_tqXPm5YNxfE?usp=drive_link",
  "https://drive.google.com/drive/folders/1cC2KxNIKN0cNywfqKnmHvWVuyOI-F4k9?usp=drive_link",
  "https://drive.google.com/drive/folders/1QNbNa7FFOUjU2Wd8fmpAOBJi5XYsPgvJ?usp=drive_link",
  "https://drive.google.com/drive/folders/1OkiLvS4Jlfohj7f0F9914lnfSfkedM9p?usp=drive_link"
];

export const MEGAPACKS: MegapackInfo[] = [
  // 1-20: Ya definidos anteriormente
  {
    id: 1,
    name: "CURSOS DISEÑO GRÁFICO",
    driveLink: DRIVE_LINKS[0],
    description: "Cursos completos de diseño gráfico profesional. Photoshop, Illustrator, InDesign y más.",
    category: "Diseño",
    price: 20000,
    keywords: ["diseño", "gráfico", "photoshop", "illustrator", "creatividad"]
  },
  {
    id: 2,
    name: "OFFICE",
    driveLink: DRIVE_LINKS[1],
    description: "Microsoft Office completo. Word, Excel, PowerPoint, Outlook.",
    category: "Ofimática",
    price: 20000,
    keywords: ["office", "word", "excel", "powerpoint", "microsoft"]
  },
  {
    id: 3,
    name: "INGLES",
    driveLink: DRIVE_LINKS[2],
    description: "Cursos de inglés desde básico hasta avanzado",
    category: "Idiomas",
    price: 20000,
    keywords: ["inglés", "idiomas", "english", "conversación"]
  },
  {
    id: 4,
    name: "EXCEL",
    driveLink: DRIVE_LINKS[3],
    description: "Excel desde básico hasta experto. Fórmulas, macros, tablas dinámicas.",
    category: "Ofimática",
    price: 20000,
    keywords: ["excel", "fórmulas", "macros", "datos"]
  },
  {
    id: 5,
    name: "CURSO HACKING ÉTICO",
    driveLink: DRIVE_LINKS[4],
    description: "Seguridad informática y hacking ético profesional",
    category: "Tecnología",
    price: 20000,
    keywords: ["hacking", "seguridad", "ciberseguridad", "ético"]
  },
  {
    id: 6,
    name: "INFOGRAFÍAS",
    driveLink: DRIVE_LINKS[5],
    description: "Plantillas y cursos de infografías profesionales",
    category: "Diseño",
    price: 20000,
    keywords: ["infografías", "diseño", "plantillas", "visual"]
  },
  {
    id: 7,
    name: "DISEÑO GRÁFICO",
    driveLink: DRIVE_LINKS[6],
    description: "Recursos y cursos avanzados de diseño gráfico",
    category: "Diseño",
    price: 20000,
    keywords: ["diseño", "gráfico", "recursos", "profesional"]
  },
  {
    id: 8,
    name: "CURSO FOTOGRAFÍA PROFESIONAL",
    driveLink: DRIVE_LINKS[7],
    description: "Fotografía profesional desde cero. Composición, iluminación, edición.",
    category: "Fotografía",
    price: 20000,
    keywords: ["fotografía", "foto", "cámara", "profesional"]
  },
  {
    id: 9,
    name: "CURSO PRODUCCIÓN Y EDICIÓN DE VIDEO CON CÁMARA",
    driveLink: DRIVE_LINKS[8],
    description: "Producción y edición de video profesional con cámara",
    category: "Video",
    price: 20000,
    keywords: ["video", "edición", "producción", "cámara"]
  },
  {
    id: 10,
    name: "KID IMPRIMIBLE",
    driveLink: DRIVE_LINKS[9],
    description: "Plantillas imprimibles para niños. Educativas y divertidas.",
    category: "Plantillas",
    price: 20000,
    keywords: ["imprimibles", "niños", "plantillas", "kid", "educativo"]
  },
  {
    id: 11,
    name: "CUADROS BOTÁNICOS",
    driveLink: DRIVE_LINKS[10],
    description: "Cuadros y diseños botánicos para decoración",
    category: "Diseño",
    price: 20000,
    keywords: ["cuadros", "botánico", "plantas", "decoración"]
  },
  {
    id: 12,
    name: "PORTADAS ESTABLES",
    driveLink: DRIVE_LINKS[11],
    description: "Plantillas de portadas profesionales y estables",
    category: "Diseño",
    price: 20000,
    keywords: ["portadas", "plantillas", "diseño", "profesional"]
  },
  {
    id: 13,
    name: "LIBROS MARKETING",
    driveLink: DRIVE_LINKS[12],
    description: "Libros y cursos de marketing digital y tradicional",
    category: "Marketing",
    price: 20000,
    keywords: ["marketing", "libros", "ventas", "digital"]
  },
  {
    id: 14,
    name: "GASTRONOMÍA",
    driveLink: DRIVE_LINKS[13],
    description: "Cursos de cocina y gastronomía profesional",
    category: "Cocina",
    price: 20000,
    keywords: ["cocina", "gastronomía", "chef", "recetas"]
  },
  {
    id: 15,
    name: "SUPER MEMORIA",
    driveLink: DRIVE_LINKS[14],
    description: "Técnicas para mejorar la memoria y aprendizaje",
    category: "Desarrollo Personal",
    price: 20000,
    keywords: ["memoria", "técnicas", "aprendizaje", "mental"]
  },
  {
    id: 16,
    name: "SUBLIMADOS",
    driveLink: DRIVE_LINKS[15],
    description: "Diseños para sublimación y estampados",
    category: "Diseño",
    price: 20000,
    keywords: ["sublimación", "diseños", "estampados", "impresión"]
  },
  {
    id: 17,
    name: "FX PREMIERE",
    driveLink: DRIVE_LINKS[16],
    description: "Efectos y plugins para Adobe Premiere Pro",
    category: "Video",
    price: 20000,
    keywords: ["premiere", "efectos", "fx", "video", "plugins"]
  },
  {
    id: 18,
    name: "FX PREMIERE",
    driveLink: DRIVE_LINKS[17],
    description: "Efectos y plugins para Adobe Premiere Pro (Colección 2)",
    category: "Video",
    price: 20000,
    keywords: ["premiere", "efectos", "fx", "video", "plugins"]
  },
  {
    id: 19,
    name: "CURSO CREA Y GESTIONA UNA MARCA",
    driveLink: DRIVE_LINKS[18],
    description: "Crea y gestiona tu marca profesional desde cero",
    category: "Negocios",
    price: 20000,
    keywords: ["marca", "branding", "negocio", "gestión"]
  },
  {
    id: 20,
    name: "DISEÑO DE LOGOTIPOS CON RETÍCULAS",
    driveLink: DRIVE_LINKS[19],
    description: "Diseño de logotipos profesionales con retículas",
    category: "Diseño",
    price: 20000,
    keywords: ["logotipos", "logos", "diseño", "retículas"]
  },

  // 21-40: Continuación basada en imágenes
  {
    id: 21,
    name: "PACK MARKETING DIGITAL",
    driveLink: DRIVE_LINKS[20],
    description: "Pack completo de marketing digital. SEO, SEM, redes sociales.",
    category: "Marketing",
    price: 20000,
    keywords: ["marketing", "digital", "seo", "sem", "redes"]
  },
  {
    id: 22,
    name: "PACK SEO MARKETING DESDE CERO",
    driveLink: DRIVE_LINKS[21],
    description: "SEO y marketing digital desde cero hasta experto",
    category: "Marketing",
    price: 20000,
    keywords: ["seo", "marketing", "posicionamiento", "google"]
  },
  {
    id: 23,
    name: "CURSO CINEMA 4D",
    driveLink: DRIVE_LINKS[22],
    description: "Cinema 4D profesional. Modelado, animación, render.",
    category: "3D",
    price: 20000,
    keywords: ["cinema4d", "3d", "modelado", "animación"]
  },
  {
    id: 24,
    name: "PACK YOGA A TU RITMO",
    driveLink: DRIVE_LINKS[23],
    description: "Cursos de yoga para todos los niveles",
    category: "Salud",
    price: 20000,
    keywords: ["yoga", "salud", "ejercicio", "bienestar"]
  },
  {
    id: 25,
    name: "PACK FILMORA",
    driveLink: DRIVE_LINKS[24],
    description: "Cursos y recursos para Filmora. Edición de video fácil.",
    category: "Video",
    price: 20000,
    keywords: ["filmora", "video", "edición", "tutorial"]
  },
  {
    id: 26,
    name: "ENSAMBLE DE COMPUTADORAS",
    driveLink: DRIVE_LINKS[25],
    description: "Aprende a ensamblar computadoras desde cero",
    category: "Tecnología",
    price: 20000,
    keywords: ["computadoras", "ensamble", "hardware", "pc"]
  },
  {
    id: 27,
    name: "CURSO FITNESS EL CAMINO DEL GUERRERO",
    driveLink: DRIVE_LINKS[26],
    description: "Curso completo de fitness y entrenamiento físico",
    category: "Salud",
    price: 20000,
    keywords: ["fitness", "ejercicio", "entrenamiento", "salud"]
  },
  {
    id: 28,
    name: "CURSO INGLÉS OXFORD",
    driveLink: DRIVE_LINKS[27],
    description: "Curso de inglés Oxford. Método profesional.",
    category: "Idiomas",
    price: 20000,
    keywords: ["inglés", "oxford", "idiomas", "aprendizaje"]
  },
  {
    id: 29,
    name: "CURSO FUERZA FIT",
    driveLink: DRIVE_LINKS[28],
    description: "Entrenamiento de fuerza y fitness profesional",
    category: "Salud",
    price: 20000,
    keywords: ["fuerza", "fitness", "entrenamiento", "gym"]
  },
  {
    id: 30,
    name: "PACK DRYWALL DESDE CERO",
    driveLink: DRIVE_LINKS[29],
    description: "Aprende instalación de drywall desde cero",
    category: "Construcción",
    price: 20000,
    keywords: ["drywall", "construcción", "instalación", "obra"]
  },
  {
    id: 31,
    name: "CURSO MECÁNICA DE MOTOS",
    driveLink: DRIVE_LINKS[30],
    description: "Mecánica de motocicletas profesional",
    category: "Mecánica",
    price: 20000,
    keywords: ["mecánica", "motos", "motocicletas", "reparación"]
  },
  {
    id: 32,
    name: "COLECCIÓN ÁLBUMES",
    driveLink: DRIVE_LINKS[31],
    description: "Plantillas de álbumes fotográficos profesionales",
    category: "Fotografía",
    price: 20000,
    keywords: ["álbumes", "fotografía", "plantillas", "diseño"]
  },
  {
    id: 33,
    name: "PACK CANVA",
    driveLink: DRIVE_LINKS[32],
    description: "Plantillas y cursos de Canva profesional",
    category: "Diseño",
    price: 20000,
    keywords: ["canva", "diseño", "plantillas", "gráfico"]
  },
  {
    id: 34,
    name: "PACK TERAPIA LENGUAJE Y AUTISMO",
    driveLink: DRIVE_LINKS[33],
    description: "Recursos para terapia de lenguaje y autismo",
    category: "Salud",
    price: 20000,
    keywords: ["terapia", "lenguaje", "autismo", "educación"]
  },
  {
    id: 35,
    name: "PACK CONTABILIDAD",
    driveLink: DRIVE_LINKS[34],
    description: "Cursos de contabilidad desde básico hasta avanzado",
    category: "Negocios",
    price: 20000,
    keywords: ["contabilidad", "finanzas", "contable", "empresas"]
  },
  {
    id: 36,
    name: "EXPEDIENTES TÉCNICOS VIVIENDAS",
    driveLink: DRIVE_LINKS[35],
    description: "Expedientes técnicos para construcción de viviendas",
    category: "Construcción",
    price: 20000,
    keywords: ["expedientes", "construcción", "viviendas", "técnico"]
  },
  {
    id: 37,
    name: "CURSO METAMASK LECTURA DE PLANOS",
    driveLink: DRIVE_LINKS[36],
    description: "Lectura e interpretación de planos de construcción",
    category: "Construcción",
    price: 20000,
    keywords: ["planos", "construcción", "lectura", "arquitectura"]
  },
  {
    id: 38,
    name: "EXPEDIENTES OBRAS RESIDENTE DE OBRA",
    driveLink: DRIVE_LINKS[37],
    description: "Expedientes para residentes de obra profesionales",
    category: "Construcción",
    price: 20000,
    keywords: ["obras", "residente", "construcción", "expedientes"]
  },
  {
    id: 39,
    name: "EXPEDIENTES OBRAS RESIDENTE DE OBRA",
    driveLink: DRIVE_LINKS[38],
    description: "Expedientes para residentes de obra (Colección 2)",
    category: "Construcción",
    price: 20000,
    keywords: ["obras", "residente", "construcción", "expedientes"]
  },
  {
    id: 40,
    name: "PSICOLOGÍA PROFESIONAL",
    driveLink: DRIVE_LINKS[39],
    description: "Cursos de psicología profesional y terapias",
    category: "Salud",
    price: 20000,
    keywords: ["psicología", "terapia", "mental", "profesional"]
  },

  // 41-60: Continuación
  {
    id: 41,
    name: "AULA VIRTUAL",
    driveLink: DRIVE_LINKS[40],
    description: "Recursos para crear y gestionar aulas virtuales",
    category: "Educación",
    price: 20000,
    keywords: ["aula", "virtual", "educación", "online"]
  },
  {
    id: 42,
    name: "FOTOGRAFÍA PROFESIONAL",
    driveLink: DRIVE_LINKS[41],
    description: "Curso avanzado de fotografía profesional",
    category: "Fotografía",
    price: 20000,
    keywords: ["fotografía", "profesional", "cámara", "técnicas"]
  },
  {
    id: 43,
    name: "PREUNIVERSITARIO",
    driveLink: DRIVE_LINKS[42],
    description: "Cursos preuniversitarios completos",
    category: "Educación",
    price: 20000,
    keywords: ["preuniversitario", "educación", "examen", "universidad"]
  },
  {
    id: 44,
    name: "GUITARRA ACÚSTICA",
    driveLink: DRIVE_LINKS[43],
    description: "Aprende guitarra acústica desde cero",
    category: "Música",
    price: 20000,
    keywords: ["guitarra", "música", "acústica", "instrumento"]
  },
  {
    id: 45,
    name: "ARMADO DE COMPUTADORA",
    driveLink: DRIVE_LINKS[44],
    description: "Curso completo de armado de computadoras",
    category: "Tecnología",
    price: 20000,
    keywords: ["computadora", "armado", "hardware", "pc"]
  },
  {
    id: 46,
    name: "INGENIERÍA",
    driveLink: DRIVE_LINKS[45],
    description: "Cursos de ingeniería en diversas especialidades",
    category: "Ingeniería",
    price: 20000,
    keywords: ["ingeniería", "técnico", "profesional", "carrera"]
  },
  {
    id: 47,
    name: "PACK DE LIBROS",
    driveLink: DRIVE_LINKS[46],
    description: "Colección de libros digitales variados",
    category: "Educación",
    price: 20000,
    keywords: ["libros", "lectura", "digital", "ebooks"]
  },
  {
    id: 48,
    name: "DESARROLLO WEB",
    driveLink: DRIVE_LINKS[47],
    description: "Desarrollo web completo. HTML, CSS, JavaScript, frameworks.",
    category: "Programación",
    price: 20000,
    keywords: ["web", "desarrollo", "programación", "html", "css"]
  },
  {
    id: 49,
    name: "CONSOLA EN MÓVIL - REPARACIÓN",
    driveLink: DRIVE_LINKS[48],
    description: "Reparación de consolas y dispositivos móviles",
    category: "Tecnología",
    price: 20000,
    keywords: ["reparación", "consola", "móvil", "celular"]
  },
  {
    id: 50,
    name: "ARQUITECTURA",
    driveLink: DRIVE_LINKS[49],
    description: "Cursos de arquitectura y diseño arquitectónico",
    category: "Arquitectura",
    price: 20000,
    keywords: ["arquitectura", "diseño", "construcción", "planos"]
  },
  {
    id: 51,
    name: "PROYECTOS",
    driveLink: DRIVE_LINKS[50],
    description: "Gestión de proyectos profesional",
    category: "Negocios",
    price: 20000,
    keywords: ["proyectos", "gestión", "administración", "pmp"]
  },
  {
    id: 52,
    name: "DJ PRODUCCIÓN MUSICAL",
    driveLink: DRIVE_LINKS[51],
    description: "Producción musical y DJ profesional",
    category: "Música",
    price: 20000,
    keywords: ["dj", "música", "producción", "mezcla"]
  },
  {
    id: 53,
    name: "FX PREMIERE",
    driveLink: DRIVE_LINKS[52],
    description: "Efectos para Adobe Premiere (Colección 3)",
    category: "Video",
    price: 20000,
    keywords: ["premiere", "efectos", "fx", "video"]
  },
  {
    id: 54,
    name: "SUBLIMADOS",
    driveLink: DRIVE_LINKS[53],
    description: "Diseños para sublimación (Colección 2)",
    category: "Diseño",
    price: 20000,
    keywords: ["sublimación", "diseños", "estampados"]
  },
  {
    id: 55,
    name: "SUPER MEMORIA",
    driveLink: DRIVE_LINKS[54],
    description: "Técnicas de memoria (Colección 2)",
    category: "Desarrollo Personal",
    price: 20000,
    keywords: ["memoria", "técnicas", "aprendizaje"]
  },
  {
    id: 56,
    name: "GASTRONOMÍA",
    driveLink: DRIVE_LINKS[55],
    description: "Cursos de gastronomía (Colección 2)",
    category: "Cocina",
    price: 20000,
    keywords: ["gastronomía", "cocina", "chef"]
  },
  {
    id: 57,
    name: "LIBROS MARKETING",
    driveLink: DRIVE_LINKS[56],
    description: "Libros de marketing (Colección 2)",
    category: "Marketing",
    price: 20000,
    keywords: ["marketing", "libros", "ventas"]
  },
  {
    id: 58,
    name: "PORTADAS ESTABLES",
    driveLink: DRIVE_LINKS[57],
    description: "Portadas profesionales (Colección 2)",
    category: "Diseño",
    price: 20000,
    keywords: ["portadas", "diseño", "plantillas"]
  },
  {
    id: 59,
    name: "CUADROS BOTÁNICOS",
    driveLink: DRIVE_LINKS[58],
    description: "Cuadros botánicos (Colección 2)",
    category: "Diseño",
    price: 20000,
    keywords: ["cuadros", "botánico", "decoración"]
  },
  {
    id: 60,
    name: "KID IMPRIMIBLE",
    driveLink: DRIVE_LINKS[59],
    description: "Imprimibles para niños (Colección 2)",
    category: "Plantillas",
    price: 20000,
    keywords: ["imprimibles", "niños", "educativo"]
  },

  // 61-85: Finalización
  {
    id: 61,
    name: "CURSO PRODUCCIÓN Y EDICIÓN DE VIDEO",
    driveLink: DRIVE_LINKS[60],
    description: "Producción de video (Colección 2)",
    category: "Video",
    price: 20000,
    keywords: ["video", "producción", "edición"]
  },
  {
    id: 62,
    name: "CURSO FOTOGRAFÍA PROFESIONAL",
    driveLink: DRIVE_LINKS[61],
    description: "Fotografía profesional (Colección 2)",
    category: "Fotografía",
    price: 20000,
    keywords: ["fotografía", "profesional", "cámara"]
  },
  {
    id: 63,
    name: "DISEÑO GRÁFICO",
    driveLink: DRIVE_LINKS[62],
    description: "Diseño gráfico (Colección 2)",
    category: "Diseño",
    price: 20000,
    keywords: ["diseño", "gráfico", "profesional"]
  },
  {
    id: 64,
    name: "INFOGRAFÍAS",
    driveLink: DRIVE_LINKS[63],
    description: "Infografías (Colección 2)",
    category: "Diseño",
    price: 20000,
    keywords: ["infografías", "diseño", "visual"]
  },
  {
    id: 65,
    name: "CURSO HACKING ÉTICO",
    driveLink: DRIVE_LINKS[64],
    description: "Hacking ético (Colección 2)",
    category: "Tecnología",
    price: 20000,
    keywords: ["hacking", "seguridad", "ético"]
  },
  {
    id: 66,
    name: "EXCEL",
    driveLink: DRIVE_LINKS[65],
    description: "Excel avanzado (Colección 2)",
    category: "Ofimática",
    price: 20000,
    keywords: ["excel", "ofimática", "datos"]
  },
  {
    id: 67,
    name: "INGLÉS",
    driveLink: DRIVE_LINKS[66],
    description: "Inglés (Colección 2)",
    category: "Idiomas",
    price: 20000,
    keywords: ["inglés", "idiomas", "aprendizaje"]
  },
  {
    id: 68,
    name: "OFFICE",
    driveLink: DRIVE_LINKS[67],
    description: "Microsoft Office (Colección 2)",
    category: "Ofimática",
    price: 20000,
    keywords: ["office", "microsoft", "ofimática"]
  },
  {
    id: 69,
    name: "CURSOS DISEÑO GRÁFICO",
    driveLink: DRIVE_LINKS[68],
    description: "Diseño gráfico completo (Colección 2)",
    category: "Diseño",
    price: 20000,
    keywords: ["diseño", "gráfico", "cursos"]
  },
  {
    id: 70,
    name: "PACK COMICS CANGREJITO",
    driveLink: DRIVE_LINKS[69],
    description: "Colección de comics Cangrejito",
    category: "Entretenimiento",
    price: 20000,
    keywords: ["comics", "cangrejito", "entretenimiento"]
  },
  {
    id: 71,
    name: "PACK GOMAS",
    driveLink: DRIVE_LINKS[70],
    description: "Pack de recursos gomas",
    category: "Recursos",
    price: 20000,
    keywords: ["gomas", "recursos", "diseño"]
  },
  {
    id: 72,
    name: "CURSO LETTERING DESDE CERO",
    driveLink: DRIVE_LINKS[71],
    description: "Lettering profesional desde cero",
    category: "Diseño",
    price: 20000,
    keywords: ["lettering", "caligrafía", "diseño"]
  },
  {
    id: 73,
    name: "CURSO FOTOMONTAJE PUBLICITARIO",
    driveLink: DRIVE_LINKS[72],
    description: "Fotomontaje publicitario profesional",
    category: "Diseño",
    price: 20000,
    keywords: ["fotomontaje", "publicidad", "photoshop"]
  },
  {
    id: 74,
    name: "DISEÑO EDITORIAL DESDE CERO",
    driveLink: DRIVE_LINKS[73],
    description: "Diseño editorial profesional",
    category: "Diseño",
    price: 20000,
    keywords: ["editorial", "diseño", "publicación"]
  },
  {
    id: 75,
    name: "DISEÑO DE LOGOTIPOS CON RETÍCULAS",
    driveLink: DRIVE_LINKS[74],
    description: "Logotipos con retículas (Colección 2)",
    category: "Diseño",
    price: 20000,
    keywords: ["logotipos", "retículas", "diseño"]
  },
  {
    id: 76,
    name: "CURSO CREA Y GESTIONA UNA MARCA",
    driveLink: DRIVE_LINKS[75],
    description: "Branding profesional (Colección 2)",
    category: "Negocios",
    price: 20000,
    keywords: ["marca", "branding", "gestión"]
  },
  {
    id: 77,
    name: "CURSO ADOBE INDESIGN DESDE CERO",
    driveLink: DRIVE_LINKS[76],
    description: "Adobe InDesign desde cero",
    category: "Diseño",
    price: 20000,
    keywords: ["indesign", "adobe", "editorial"]
  },
  {
    id: 78,
    name: "CURSO ANIMACIÓN EXPRESS PARA REDES SOCIALES",
    driveLink: DRIVE_LINKS[77],
    description: "Animación para redes sociales",
    category: "Diseño",
    price: 20000,
    keywords: ["animación", "redes", "social media"]
  },
  {
    id: 79,
    name: "CURSO DISEÑO DE APLICACIÓN MÓVIL",
    driveLink: DRIVE_LINKS[78],
    description: "Diseño de apps móviles profesional",
    category: "Diseño",
    price: 20000,
    keywords: ["app", "móvil", "diseño", "ui/ux"]
  },
  {
    id: 80,
    name: "CURSO DIBUJO E ILUSTRACIÓN DIGITAL",
    driveLink: DRIVE_LINKS[79],
    description: "Dibujo e ilustración digital profesional",
    category: "Diseño",
    price: 20000,
    keywords: ["dibujo", "ilustración", "digital"]
  },
  {
    id: 81,
    name: "CURSO DISEÑO VISUAL DE MARCAS",
    driveLink: DRIVE_LINKS[80],
    description: "Diseño visual de marcas profesional",
    category: "Diseño",
    price: 20000,
    keywords: ["marcas", "visual", "branding"]
  },
  {
    id: 82,
    name: "CURSO CREACIÓN DE VIDEOJUEGOS",
    driveLink: DRIVE_LINKS[81],
    description: "Creación de videojuegos desde cero",
    category: "Programación",
    price: 20000,
    keywords: ["videojuegos", "game dev", "programación"]
  },
  {
    id: 83,
    name: "CURSO MASTER EN ANIMACIÓN 3D",
    driveLink: DRIVE_LINKS[82],
    description: "Animación 3D profesional master",
    category: "3D",
    price: 20000,
    keywords: ["3d", "animación", "master"]
  },
  {
    id: 84,
    name: "CURSO PHOTOSHOP PARA DISEÑO WEB",
    driveLink: DRIVE_LINKS[83],
    description: "Photoshop para diseño web profesional",
    category: "Diseño",
    price: 20000,
    keywords: ["photoshop", "web", "diseño"]
  },
  {
    id: 85,
    name: "CURSO MASTER EN WORDPRESS",
    driveLink: DRIVE_LINKS[84],
    description: "WordPress master profesional",
    category: "Web",
    price: 20000,
    keywords: ["wordpress", "web", "cms"]
  }
];

/**
 * Buscar Megapack por nombre o keywords
 */
export function searchMegapack(query: string): MegapackInfo[] {
  const lowerQuery = query.toLowerCase();
  
  return MEGAPACKS.filter(pack => 
    pack.name.toLowerCase().includes(lowerQuery) ||
    pack.description.toLowerCase().includes(lowerQuery) ||
    pack.keywords.some(kw => kw.includes(lowerQuery)) ||
    pack.category.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Obtener Megapack por ID
 */
export function getMegapackById(id: number): MegapackInfo | undefined {
  return MEGAPACKS.find(pack => pack.id === id);
}

/**
 * Obtener todos los Megapacks por categoría
 */
export function getMegapacksByCategory(category: string): MegapackInfo[] {
  return MEGAPACKS.filter(pack => 
    pack.category.toLowerCase() === category.toLowerCase()
  );
}

/**
 * Obtener todas las categorías disponibles
 */
export function getAllCategories(): string[] {
  const categories = new Set(MEGAPACKS.map(pack => pack.category));
  return Array.from(categories).sort();
}

/**
 * Obtener estadísticas del catálogo
 */
export function getCatalogStats() {
  return {
    total: MEGAPACKS.length,
    categories: getAllCategories().length,
    totalValue: MEGAPACKS.reduce((sum, pack) => sum + pack.price, 0),
    byCategory: getAllCategories().map(cat => ({
      category: cat,
      count: getMegapacksByCategory(cat).length
    }))
  };
}
