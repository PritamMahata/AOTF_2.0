import next from 'eslint-config-next'

const eslintConfig = [
  ...next,
  {
    ignores: [
      "**/next-env.d.ts",
      "*/.next/*",
      "*/node_modules/*",
      "*/dist/*",
      "*/build/*",
    ],
  },
]

export default eslintConfig