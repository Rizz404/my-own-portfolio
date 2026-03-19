@import 'tailwindcss';

@custom-variant dark (&:where(.dark, .dark \*));

@theme {
--color-\*: initial;

/_ ==========================
60% - NEUTRAL (Dominant)
Background utama website & surface
========================== _/
--color-background: oklch(1 0 0);
--color-surface: oklch(0.97 0 0);
--color-surface-raised: oklch(0.93 0 0);

/_ ==========================
30% - SECONDARY (Supporting)
Cards, panels, chips, tags
========================== _/
--color-secondary: oklch(0.9 0 0);
--color-secondary-hover: oklch(0.85 0 0);
--color-secondary-fg: oklch(0.15 0 0);

/_ ==========================
10% - PRIMARY (Accent)
Tombol CTA, link, highlight
========================== _/
--color-primary: oklch(0.55 0.18 250);
--color-primary-hover: oklch(0.46 0.17 250);
--color-primary-muted: oklch(0.93 0.03 250);
--color-primary-fg: oklch(1 0 0);

/_ ==========================
CONTENT - Typography
========================== _/
--color-content: oklch(0.15 0 0);
--color-content-secondary: oklch(0.4 0 0);
--color-content-muted: oklch(0.62 0 0);

/_ ==========================
BORDER
========================== _/
--color-border: oklch(0.88 0 0);
--color-border-subtle: oklch(0.93 0 0);

/_ ==========================
STATUS
========================== _/
--color-success: oklch(0.62 0.17 150);
--color-success-fg: oklch(1 0 0);
--color-warning: oklch(0.75 0.17 75);
--color-warning-fg: oklch(0.15 0 0);
--color-danger: oklch(0.6 0.22 25);
--color-danger-fg: oklch(1 0 0);
--color-info: oklch(0.62 0.16 230);
--color-info-fg: oklch(1 0 0);

/_ ==========================
SPACING & RADIUS
========================== _/
--spacing-18: 4.5rem;
--spacing-22: 5.5rem;
--spacing-88: 22rem;
--spacing-128: 32rem;
--radius-card: 0.75rem;

/_ ==========================
TYPOGRAPHY
========================== _/
--font-sans: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif;
--font-mono: 'JetBrains Mono', ui-monospace, monospace;
}

/_ ============================================
DARK MODE TOKEN OVERRIDES
Otomatis mengikuti settingan device kamu!
============================================ _/
@media (prefers-color-scheme: dark) {
:root {
--color-background: oklch(0.1 0.01 250);
--color-surface: oklch(0.13 0.01 250);
--color-surface-raised: oklch(0.17 0.01 250);

    --color-secondary: oklch(0.21 0.01 250);
    --color-secondary-hover: oklch(0.26 0.01 250);
    --color-secondary-fg: oklch(0.93 0 0);

    --color-primary: oklch(0.64 0.15 250);
    --color-primary-hover: oklch(0.55 0.18 250);
    --color-primary-muted: oklch(0.17 0.04 250);

    --color-content: oklch(0.95 0 0);
    --color-content-secondary: oklch(0.72 0 0);
    --color-content-muted: oklch(0.52 0 0);

    --color-border: oklch(0.28 0.01 250);
    --color-border-subtle: oklch(0.22 0.01 250);

}
}

/_ Fallback untuk manual toggle via class .dark di HTML _/
:root.dark {
--color-background: oklch(0.1 0.01 250);
--color-surface: oklch(0.13 0.01 250);
--color-surface-raised: oklch(0.17 0.01 250);

--color-secondary: oklch(0.21 0.01 250);
--color-secondary-hover: oklch(0.26 0.01 250);
--color-secondary-fg: oklch(0.93 0 0);

--color-primary: oklch(0.64 0.15 250);
--color-primary-hover: oklch(0.55 0.18 250);
--color-primary-muted: oklch(0.17 0.04 250);

--color-content: oklch(0.95 0 0);
--color-content-secondary: oklch(0.72 0 0);
--color-content-muted: oklch(0.52 0 0);

--color-border: oklch(0.28 0.01 250);
--color-border-subtle: oklch(0.22 0.01 250);
}

/_ ============================================
BASE STYLES & BEST PRACTICES
============================================ _/
:root {
/_ Bikin scrollbar bawaan browser ikut berubah warna sesuai tema _/
color-scheme: light dark;
}

html {
/_ Bikin animasi scroll saat klik link anchor jadi mulus _/
scroll-behavior: smooth;
}

body {
background-color: var(--color-background);
color: var(--color-content);
font-family: var(--font-sans);

/_ Bikin teks kelihatan tajam dan pro banget _/
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
text-rendering: optimizeLegibility;

/_ Transisi halus saat pindah dari light ke dark mode _/
transition: background-color 0.3s ease, color 0.3s ease;
}

/_ ============================================
AUTOMATIC FONT ASSIGNMENTS
============================================ _/
/_ Semua teks biasa otomatis pakai font Sans _/
h1, h2, h3, h4, h5, h6, p, span, a, li, button, input, textarea {
font-family: var(--font-sans);
}

/_ Tag khusus kode otomatis pakai font Mono _/
code, pre, kbd, samp {
font-family: var(--font-mono);
font-size: 0.9em;
}
