# 🚛 Navitel TMS

<div align="center">

![Navitel TMS](https://img.shields.io/badge/Navitel-TMS-00c9ff?style=for-the-badge&logo=truck&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16.1.5-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.3-61dafb?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=for-the-badge&logo=tailwindcss)

**Sistema de Gestión de Transporte (Transportation Management System)**

[Demo](#demo) • [Instalación](#-instalación) • [Documentación](#-documentación-de-componentes) • [Arquitectura](#-arquitectura)

</div>

---

## 📋 Descripción

**Navitel TMS** es un sistema moderno de gestión de transporte construido con las últimas tecnologías web. Permite a las empresas de logística gestionar su flota de vehículos, rastrear envíos en tiempo real, y optimizar sus operaciones de transporte.

### ✨ Características Principales

- 🗺️ **Mapa interactivo** - Visualización de flota en tiempo real con Leaflet
- 🚚 **Gestión de flota** - Seguimiento de vehículos, conductores y entregas
- 📊 **Dashboard KPIs** - Métricas clave del negocio
- 🌙 **Modo oscuro/claro** - Tema adaptable con next-themes
- 🌍 **Internacionalización** - Soporte para Español e Inglés
- 📱 **Responsive** - Diseño adaptativo para todos los dispositivos
- ⚡ **Rendimiento** - Optimizado con React 19 y Turbopack

---

## 🛠️ Stack Tecnológico

| Categoría | Tecnología | Versión |
|-----------|------------|---------|
| **Framework** | Next.js (App Router) | 16.1.5 |
| **UI Library** | React | 19.2.3 |
| **Lenguaje** | TypeScript | 5.x |
| **Estilos** | Tailwind CSS | 4.x |
| **Componentes** | Radix UI | Latest |
| **Mapas** | Leaflet | 1.9.4 |
| **Iconos** | Lucide React | 0.563.0 |
| **Temas** | next-themes | 0.4.6 |

---

## 📁 Estructura del Proyecto

```
navitel/
├── src/
│   ├── app/                    # App Router (páginas)
│   │   ├── (auth)/            # Grupo de rutas de autenticación
│   │   │   ├── login/         # Página de login
│   │   │   └── register/      # Página de registro
│   │   ├── (dashboard)/       # Grupo de rutas del dashboard
│   │   │   ├── fleet/         # Módulo de flota
│   │   │   └── page.tsx       # Dashboard principal
│   │   ├── globals.css        # Estilos globales + Tailwind
│   │   └── layout.tsx         # Layout raíz
│   │
│   ├── components/            # Componentes React
│   │   ├── brand/             # Logo y branding
│   │   ├── fleet/             # Componentes del módulo flota
│   │   │   ├── fleet-map.tsx  # Mapa interactivo
│   │   │   ├── vehicle-card.tsx
│   │   │   └── vehicle-list.tsx
│   │   ├── layout/            # Componentes de layout
│   │   │   ├── navbar.tsx     # Barra de navegación
│   │   │   └── sidebar.tsx    # Barra lateral
│   │   ├── skeletons/         # Loading states
│   │   ├── ui/                # Componentes UI base (shadcn)
│   │   ├── kpi-card.tsx       # Tarjetas de métricas
│   │   ├── language-toggle.tsx # Selector de idioma
│   │   ├── page-wrapper.tsx   # Wrapper de páginas
│   │   ├── theme-provider.tsx # Proveedor de temas
│   │   └── theme-toggle.tsx   # Selector de tema
│   │
│   ├── config/                # Configuración
│   │   ├── i18n.ts           # Config internacionalización
│   │   └── navigation.ts     # Config de navegación
│   │
│   ├── contexts/              # Contextos React
│   │   ├── auth-context.tsx  # Autenticación
│   │   └── locale-context.tsx # Internacionalización
│   │
│   ├── hooks/                 # Custom Hooks
│   │   └── use-navigation.ts # Hook de navegación
│   │
│   ├── lib/                   # Utilidades
│   │   └── utils.ts          # Funciones helper (cn)
│   │
│   ├── locales/               # Traducciones
│   │   └── translations.ts   # ES/EN
│   │
│   ├── styles/                # Estilos adicionales
│   │   └── leaflet-custom.css # Estilos del mapa
│   │
│   └── types/                 # Tipos TypeScript
│       ├── fleet.ts          # Tipos de flota
│       └── navigation.ts     # Tipos de navegación
│
├── public/                    # Assets estáticos
├── .vscode/                   # Config VS Code
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚀 Instalación

### Prerrequisitos

- Node.js 18.17 o superior
- npm, yarn, pnpm o bun

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/navitel-tms.git
cd navitel-tms

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo
npm run dev

# 4. Abrir en el navegador
# http://localhost:3000
```

### Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia servidor de desarrollo con Turbopack |
| `npm run build` | Compila para producción |
| `npm run start` | Inicia servidor de producción |
| `npm run lint` | Ejecuta ESLint |

---

## 📖 Documentación de Componentes

### Contextos

#### `AuthProvider`
Maneja la autenticación y protección de rutas.

```tsx
import { AuthProvider, useAuth } from "@/contexts/auth-context";

// Uso
const { user, login, logout, isAuthenticated } = useAuth();
```

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `user` | `User \| null` | Usuario autenticado |
| `isLoading` | `boolean` | Estado de carga inicial |
| `isAuthenticated` | `boolean` | Si hay sesión activa |
| `login(user)` | `function` | Inicia sesión |
| `logout()` | `function` | Cierra sesión |

#### `LocaleProvider`
Maneja internacionalización (i18n) con soporte para ES/EN.

```tsx
import { LocaleProvider, useLocale } from "@/contexts/locale-context";

// Uso
const { locale, setLocale, t } = useLocale();
t("auth.login.title"); // "Iniciar Sesión" o "Sign In"
```

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `locale` | `"es" \| "en"` | Idioma actual |
| `setLocale(locale)` | `function` | Cambia el idioma |
| `t(key, params?)` | `function` | Traduce una clave |

### Componentes de UI

#### `PageWrapper`
Envuelve páginas con animaciones y estructura consistente.

```tsx
<PageWrapper 
  title="Dashboard" 
  description="Vista general del sistema"
  actions={<Button>Exportar</Button>}
>
  {/* Contenido */}
</PageWrapper>
```

#### `KPICard`
Muestra métricas clave con iconos y tendencias.

```tsx
<KPICard
  title="Entregas Hoy"
  value={156}
  change={{ value: "+12%", trend: "up" }}
  icon={Package}
  variant="default" // default | warning | danger | info
/>
```

#### `ThemeToggle`
Selector de tema (claro/oscuro/sistema).

```tsx
<ThemeToggle />
```

#### `LanguageToggle`
Selector de idioma.

```tsx
<LanguageToggle />
// o con etiqueta visible
<LanguageToggleWithLabel />
```

### Componentes de Flota

#### `FleetMap`
Mapa interactivo con marcadores de vehículos.

```tsx
<FleetMap
  vehicles={vehicles}
  selectedVehicle={selected}
  onSelectVehicle={handleSelect}
  className="h-150"
/>
```

#### `VehicleList`
Lista scrolleable de vehículos con cards expandibles.

```tsx
<VehicleList
  vehicles={vehicles}
  selectedVehicle={selected}
  onSelectVehicle={handleSelect}
/>
```

#### `VehicleCard`
Tarjeta de vehículo con timeline de tracking.

```tsx
<VehicleCard
  vehicle={vehicle}
  isSelected={true}
  isExpanded={true}
  onSelect={() => {}}
  onToggleExpand={() => {}}
/>
```

---

## 🏗️ Arquitectura

### Principios de Diseño

El proyecto sigue los principios **SOLID**:

- **S**ingle Responsibility: Cada componente tiene una única responsabilidad
- **O**pen/Closed: Componentes extensibles via props/variantes
- **L**iskov Substitution: Interfaces consistentes
- **I**nterface Segregation: Props específicas por componente
- **D**ependency Inversion: Contextos para dependencias globales

### Patrones Utilizados

| Patrón | Uso |
|--------|-----|
| **Provider Pattern** | AuthProvider, LocaleProvider, ThemeProvider |
| **Compound Components** | Componentes UI de Radix |
| **Custom Hooks** | useLocale, useAuth, useNavigation |
| **Render Props** | PageWrapper con children |
| **Factory Pattern** | Variantes en KPICard |

### Flujo de Datos

```
┌─────────────────────────────────────────────────────────────┐
│                        App Layout                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    Providers                         │   │
│  │  ┌─────────────┐ ┌──────────────┐ ┌─────────────┐  │   │
│  │  │ThemeProvider│ │LocaleProvider│ │ AuthProvider│  │   │
│  │  └─────────────┘ └──────────────┘ └─────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
│                            │                                │
│                            ▼                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   Dashboard Layout                   │   │
│  │  ┌──────────┐  ┌────────────────────────────────┐  │   │
│  │  │ Sidebar  │  │         Main Content           │  │   │
│  │  │          │  │  ┌──────────────────────────┐  │  │   │
│  │  │ NavGroup │  │  │      PageWrapper         │  │  │   │
│  │  │ NavLink  │  │  │  ┌────────────────────┐  │  │  │   │
│  │  │          │  │  │  │   Page Content     │  │  │  │   │
│  │  └──────────┘  │  │  └────────────────────┘  │  │  │   │
│  │                │  └──────────────────────────┘  │  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 Temas y Estilos

### Colores Principales

| Variable | Valor | Uso |
|----------|-------|-----|
| `--primary` | `#00c9ff` | Color principal (cyan) |
| `--background` | Adaptativo | Fondo de página |
| `--foreground` | Adaptativo | Texto principal |
| `--muted` | Adaptativo | Elementos secundarios |

### Animaciones Disponibles

```css
/* Clases de animación */
.animate-fade-in      /* Fade con slide up */
.animate-slide-up     /* Slide desde abajo */
.animate-slide-in-left
.animate-slide-in-right
.animate-scale-in     /* Scale desde 95% */
.hover-lift          /* Elevación al hover */
.stagger-animation   /* Animación escalonada */
```

---

## 🌍 Internacionalización

### Idiomas Soportados

| Código | Idioma | Bandera |
|--------|--------|---------|
| `es` | Español (default) | 🇪🇸 |
| `en` | English | 🇺🇸 |

### Agregar Traducciones

```typescript
// src/locales/translations.ts
export const translations = {
  es: {
    auth: {
      login: {
        title: "Iniciar Sesión",
        // ...
      }
    }
  },
  en: {
    auth: {
      login: {
        title: "Sign In",
        // ...
      }
    }
  }
};
```

### Uso en Componentes

```tsx
const { t } = useLocale();

// Simple
<h1>{t("auth.login.title")}</h1>

// Con parámetros
<p>{t("welcome.message", { name: "Juan" })}</p>
// translations: "Hola, {{name}}" → "Hola, Juan"
```

---

## 📦 Tipos TypeScript

### Vehicle

```typescript
interface Vehicle {
  id: string;
  code: string;
  location: { lat: number; lng: number };
  address: string;
  city: string;
  country: string;
  progress: number;
  driver: string;
  status: "en-ruta" | "entregando" | "completado" | "esperando";
  tracking: TrackingEvent[];
}
```

### User

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "driver" | "dispatcher" | "viewer";
  avatar?: string;
}
```

---

## 🔧 Configuración VS Code

El proyecto incluye configuración recomendada en `.vscode/settings.json`:

```json
{
  "css.lint.unknownAtRules": "ignore",
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

---

## 📄 Licencia

Este proyecto es privado y propietario de Navitel TMS.

---

## 👥 Equipo

Desarrollado con ❤️ por el equipo de Navitel

---

<div align="center">

**[⬆ Volver arriba](#-navitel-tms)**

</div>
