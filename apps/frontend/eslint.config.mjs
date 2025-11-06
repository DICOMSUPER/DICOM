import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
    rules: {
      rules: {
        '@typescript-eslint/no-explicit-any': 'off', // Tắt cảnh báo any
        '@typescript-eslint/no-unused-vars': 'warn', // Chỉ warning thay vì error
        '@typescript-eslint/ban-ts-comment': 'off', // Cho phép @ts-ignore
        '@next/next/no-img-element': 'off', // Cho phép dùng <img>
      }
    },
  },
];

export default eslintConfig;
