import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // react-hook-form's watch() cannot be memoized, so the React Compiler rule
    // flags every form component. It is a known incompatibility, not a bug.
    rules: {
      "react-hooks/incompatible-library": "off",
    },
  },
  {
    // These render inside html2canvas-generated PDFs and admin-only previews,
    // where next/image does not work. Plain <img> is correct here.
    files: [
      "src/components/admin/InvoiceTemplate.tsx",
      "src/components/admin/QuotePDFPreview.tsx",
      "src/components/admin/PhotoGallery.tsx",
      "src/components/admin/CompanySettingsForm.tsx",
    ],
    rules: {
      "@next/next/no-img-element": "off",
    },
  },
]);

export default eslintConfig;
