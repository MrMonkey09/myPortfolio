import type { SeoSection } from "../../types";

export const SEO_BASE_URL = "https://skills.avdev.cl";

export const SEO_SECTIONS: readonly SeoSection[] = [
  {
    appId: "001",
    nombre: "Sobre mí",
    path: "/",
    aliases: ["/", "/index.html", "/sobre-mi", "/sobre-mi/", "/sobre-mi.html"],
    title: "Sobre mí | Mr Monkey · Desarrollador Full Stack en Antofagasta",
    description:
      "Conocé a Mr Monkey, desarrollador Full Stack en Antofagasta, Chile. Experiencia en Python, JavaScript, desarrollo web, sistemas y automatización.",
    keywords:
      "desarrollador full stack antofagasta, programador web chile, python javascript antofagasta, portafolio mr monkey",
  },
  {
    appId: "002",
    nombre: "Educación",
    path: "/educacion",
    aliases: ["/educacion", "/educacion/", "/educacion.html"],
    title: "Educación y formación | Mr Monkey · Desarrollador en Chile",
    description:
      "Revisá la formación y trayectoria académica de Mr Monkey en desarrollo de software, con foco en tecnologías modernas y aprendizaje continuo.",
    keywords:
      "educacion desarrollador chile, trayectoria academica programador, formacion full stack antofagasta",
  },
  {
    appId: "003",
    nombre: "Habilidades",
    path: "/habilidades",
    aliases: ["/habilidades", "/habilidades/", "/habilidades.html"],
    title: "Habilidades técnicas | Mr Monkey · Backend y Frontend",
    description:
      "Explorá las habilidades técnicas de Mr Monkey: backend, frontend, herramientas modernas y stack para construir productos digitales escalables.",
    keywords:
      "habilidades frontend backend, stack desarrollador full stack, tecnologias web chile, programador antofagasta",
  },
  {
    appId: "004",
    nombre: "Contacto",
    path: "/contacto",
    aliases: ["/contacto", "/contacto/", "/contacto.html"],
    title: "Contacto | Mr Monkey · Desarrollo web en Antofagasta, Chile",
    description:
      "Contactá a Mr Monkey para cotizar desarrollo web, SEO, soporte y soluciones digitales desde Antofagasta para todo Chile y LatAm.",
    keywords:
      "contacto desarrollador antofagasta, cotizar pagina web chile, servicios web chile, consultoria software",
  },
  {
    appId: "005",
    nombre: "Servicios",
    path: "/servicios",
    aliases: ["/servicios", "/servicios/", "/servicios.html"],
    title: "Servicios digitales y SEO | Mr Monkey · Antofagasta, Chile",
    description:
      "Descubrí los servicios de Mr Monkey: desarrollo web, mantenimiento, SEO local y nacional, marketing digital y consultoría especializada.",
    keywords:
      "servicios desarrollo web antofagasta, seo local chile, mantenimiento web pymes, consultoria digital",
  },
];

function normalizePath(pathname: string): string {
  if (!pathname) return "/";
  const sanitized = pathname.toLowerCase();
  if (sanitized.length > 1 && sanitized.endsWith("/")) {
    return sanitized.slice(0, -1);
  }
  return sanitized;
}

function setMetaByName(name: string, content: string): void {
  const meta = document.querySelector(`meta[name="${name}"]`);
  if (meta) {
    meta.setAttribute("content", content);
    return;
  }

  const created = document.createElement("meta");
  created.setAttribute("name", name);
  created.setAttribute("content", content);
  document.head.appendChild(created);
}

function setMetaByProperty(property: string, content: string): void {
  const meta = document.querySelector(`meta[property="${property}"]`);
  if (meta) {
    meta.setAttribute("content", content);
    return;
  }

  const created = document.createElement("meta");
  created.setAttribute("property", property);
  created.setAttribute("content", content);
  document.head.appendChild(created);
}

function setCanonical(url: string): void {
  const canonical = document.querySelector("link[rel='canonical']");
  if (canonical) {
    canonical.setAttribute("href", url);
    return;
  }

  const created = document.createElement("link");
  created.setAttribute("rel", "canonical");
  created.setAttribute("href", url);
  document.head.appendChild(created);
}

function buildStructuredData(section: SeoSection, absoluteUrl: string): string {
  return JSON.stringify(
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Person",
          name: "Alfredo Andrés Guerra Estay",
          alternateName: "Mr Monkey",
          jobTitle: "Desarrollador Full Stack",
          url: SEO_BASE_URL,
          address: {
            "@type": "PostalAddress",
            addressLocality: "Antofagasta",
            addressRegion: "Antofagasta",
            addressCountry: "CL",
          },
          sameAs: [
            "https://github.com/MrMonkey09",
            "https://www.linkedin.com/in/alfredo-guerra-estay/",
            "https://www.instagram.com/mr0monkey/",
          ],
        },
        {
          "@type": "WebSite",
          name: "Mr Monkey Portfolio",
          url: SEO_BASE_URL,
          inLanguage: "es-CL",
        },
        {
          "@type": "WebPage",
          name: section.nombre,
          url: absoluteUrl,
          description: section.description,
          inLanguage: "es-CL",
          about: {
            "@type": "Thing",
            name: section.nombre,
          },
        },
      ],
    },
    null,
    0
  );
}

function setStructuredData(section: SeoSection, absoluteUrl: string): void {
  const id = "structured-data-jsonld";
  const existing = document.getElementById(id);
  const payload = buildStructuredData(section, absoluteUrl);

  if (existing) {
    existing.textContent = payload;
    return;
  }

  const script = document.createElement("script");
  script.id = id;
  script.type = "application/ld+json";
  script.textContent = payload;
  document.head.appendChild(script);
}

export function getSeoSectionByPath(pathname: string): SeoSection | undefined {
  const normalizedPath = normalizePath(pathname);
  return SEO_SECTIONS.find((section) =>
    section.aliases.some((alias) => normalizePath(alias) === normalizedPath)
  );
}

export function getSeoSectionByAppId(appId: string): SeoSection | undefined {
  return SEO_SECTIONS.find((section) => section.appId === appId);
}

export function applySeoForSection(section: SeoSection): void {
  const absoluteUrl = new URL(section.path, SEO_BASE_URL).toString();

  document.title = section.title;
  document.documentElement.lang = "es-CL";

  setMetaByName("description", section.description);
  setMetaByName("keywords", section.keywords);
  setMetaByName("robots", "index, follow");
  setMetaByName("geo.region", "CL-AN");
  setMetaByName("geo.placename", "Antofagasta");
  setMetaByName("twitter:card", "summary_large_image");
  setMetaByName("twitter:title", section.title);
  setMetaByName("twitter:description", section.description);
  setMetaByName("twitter:image", `${SEO_BASE_URL}/assets/images/iconos/M.png`);

  setMetaByProperty("og:title", section.title);
  setMetaByProperty("og:description", section.description);
  setMetaByProperty("og:type", "website");
  setMetaByProperty("og:url", absoluteUrl);
  setMetaByProperty("og:locale", "es_CL");
  setMetaByProperty("og:image", `${SEO_BASE_URL}/assets/images/iconos/M.png`);

  setCanonical(absoluteUrl);
  setStructuredData(section, absoluteUrl);
}
