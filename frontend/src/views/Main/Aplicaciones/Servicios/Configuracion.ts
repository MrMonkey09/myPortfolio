interface Plan {
  nombre: string;
  precio: string;
  caracteristicas: string[];
  destacado?: boolean;
  etiqueta?: string;
}

interface ServicioCategoria {
  id: number;
  titulo: string;
  subtitulo: string;
  icono: string;
  planes: Plan[];
}

interface Encabezado {
  saludo: string;
  nombre01: string;
  nombre02: string;
  datos: {
    ciudad: string;
    correo: string;
    github: string;
  };
}

interface ConfiguracionType {
  icono: string;
  contenido: {
    encabezado: Encabezado;
    servicios: ServicioCategoria[];
  };
}

const Configuracion: ConfiguracionType = {
  icono: "",
  contenido: {
    encabezado: {
      saludo: "Descubre",
      nombre01: "Mis",
      nombre02: "Servicios",
      datos: {
        ciudad: "Antofagasta, Chile",
        correo: "alfredo.gestay@avdevchile.cl",
        github: "MrMonkey09",
      },
    },
    servicios: [
      {
        id: 1,
        titulo: "Soluciones Web a Medida",
        subtitulo: "Desarrollos de pago único diseñados para convertir.",
        icono: "🌐",
        planes: [
          {
            nombre: "Landing Page",
            precio: "$300k – $900k",
            caracteristicas: [
              "Enfocada en un objetivo único (Venta/Registro)",
              "Optimización de carga",
              "Diseño persuasivo",
            ],
          },
          {
            nombre: "Web Corporativa",
            precio: "$800k – $2.5M",
            destacado: true,
            etiqueta: "Popular",
            caracteristicas: [
              "Autoadministrable (CMS)",
              "Hasta 10 páginas",
              "SEO inicial incluido",
              "Capacitación incluida",
            ],
          },
          {
            nombre: "Catálogo Digital",
            precio: "$1.2M – $3.0M",
            caracteristicas: [
              "Exhibición de productos sin venta directa",
              "Filtros avanzados",
              "Botón de cotización WhatsApp",
            ],
          },
          {
            nombre: "E-commerce",
            precio: "$1.5M – $4.5M+",
            caracteristicas: [
              "Tienda completa con carrito",
              "Integración Webpay / MercadoPago",
              "Gestión de inventario y pedidos",
            ],
          },
        ],
      },
      {
        id: 2,
        titulo: "Planes de Mantenimiento",
        subtitulo:
          "Soporte técnico y seguridad garantizada para tu negocio online.",
        icono: "🛡️",
        planes: [
          {
            nombre: "Esencial",
            precio: "$85.000/mes",
            caracteristicas: [
              "Ideal para sitios básicos",
              "Soporte Email 72h",
              "Actualizaciones mensuales",
              "Escaneo de seguridad básico",
            ],
          },
          {
            nombre: "Profesional",
            precio: "$150.000/mes",
            destacado: true,
            etiqueta: "Recomendado",
            caracteristicas: [
              "Ideal para PYMES / Tiendas",
              "Soporte prioritario 24h",
              "Optimización de Base de Datos",
              "Monitorización de seguridad",
            ],
          },
          {
            nombre: "Enterprise",
            precio: "$280.000/mes",
            caracteristicas: [
              "E-commerce crítico",
              "Emergencias + Soporte 8h",
              "Actualizaciones + Optimización BD",
              "Asesoría de seguridad proactiva",
            ],
          },
        ],
      },
      {
        id: 3,
        titulo: "Marketing Digital & Redes Sociales",
        subtitulo:
          "Estrategias para crecer tu comunidad y posicionar tu marca.",
        icono: "📣",
        planes: [
          {
            nombre: "Plan Emprendedor",
            precio: "$350.000/mes",
            caracteristicas: [
              "Gestión de 1–2 redes sociales",
              "8–10 publicaciones (Diseño + Copy)",
              "Gestión básica de comunidad",
            ],
          },
          {
            nombre: "Plan Crecimiento",
            precio: "$600.000/mes",
            destacado: true,
            etiqueta: "Más vendido",
            caracteristicas: [
              "Hasta 3 redes sociales",
              "15–20 publicaciones + Reels/Shorts",
              "Campañas Ads básicas*",
              "Informe de rendimiento mensual",
            ],
          },
        ],
      },
      {
        id: 4,
        titulo: "Posicionamiento SEO",
        subtitulo: "Posiciona tu negocio en los primeros resultados de Google.",
        icono: "🔍",
        planes: [
          {
            nombre: "SEO Local",
            precio: "$100.000/mes",
            caracteristicas: [
              "Ideal para tiendas, restaurantes y consultas",
              "Google Business Profile",
              "Keywords locales y SEO On-Page básico",
            ],
          },
          {
            nombre: "SEO Nacional",
            precio: "Desde $500.000/mes",
            destacado: true,
            etiqueta: "Empresas",
            caracteristicas: [
              "Para empresas competitivas",
              "Auditoría completa y Link building",
              "Estrategia de contenidos",
              "SEO Técnico avanzado",
            ],
          },
        ],
      },
      {
        id: 5,
        titulo: "Digitalización Industrial",
        subtitulo:
          "Solución High-Ticket exclusiva para digitalizar y automatizar procesos completos.",
        icono: "🏭",
        planes: [
          {
            nombre: "Solución Integral",
            precio: "Cotización personalizada",
            destacado: true,
            etiqueta: "Enterprise",
            caracteristicas: [
              "Plataforma Central Web Corporativa",
              "Infraestructura de Hardware e Integraciones",
              "Apps multiplataforma y Control masivo",
              "Seguridad Avanzada y Documentación",
              "Capacitación continua para el equipo",
            ],
          },
        ],
      },
      {
        id: 6,
        titulo: "Consultoría y Diseño Especializado",
        subtitulo: "Sesiones especializadas para impulsar tu proyecto.",
        icono: "💡",
        planes: [
          {
            nombre: "Prototipo UX/UI",
            precio: "Cotización por proyecto",
            caracteristicas: [
              "Wireframes y diseño de alta fidelidad",
              "Figma / XD",
              "Listos para fase de desarrollo",
            ],
          },
          {
            nombre: "Auditoría SEO",
            precio: "Cotización por proyecto",
            caracteristicas: [
              "Análisis técnico profundo",
              "Detección de errores críticos",
              "Plan de acción priorizado",
            ],
          },
          {
            nombre: "Consultoría Estratégica",
            precio: "Por hora",
            caracteristicas: [
              "Sesiones 1 a 1",
              "Resolver dudas técnicas",
              "Planificar lanzamientos",
              "Optimizar procesos",
            ],
          },
        ],
      },
    ],
  },
};

export default Configuracion;
