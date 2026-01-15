import { defineConfig } from 'orval'

export default defineConfig({
  api: {
    input: '../../backend/api/openapi.yaml',
    output: {
      mode: 'split',
      target: 'src/api/generated',
      schemas: 'src/api/generated/schemas',
      client: 'react-query',
      override: {
        mutator: {
          path: 'src/api/mutator.ts',
          name: 'customInstance',
        },
        query: {
          useQuery: true,
          useInfinite: false,
          useInfiniteQueryParam: 'page',
        },
      },
    },
    hooks: {
      afterAllFilesWrite: [
        'pnpm eslint --fix src/api/generated',
        'pnpm prettier --write src/api/generated',
      ],
    },
  },
  adminApi: {
    input: '../../backend/api/openapi.yaml',
    output: {
      mode: 'split',
      target: 'src/api/generated/admin',
      schemas: 'src/api/generated/schemas',
      client: 'react-query',
      override: {
        mutator: {
          path: 'src/api/adminMutator.ts',
          name: 'adminInstance',
        },
        query: {
          useQuery: true,
          useInfinite: false,
          useInfiniteQueryParam: 'page',
        },
      },
    },
    hooks: {
      afterAllFilesWrite: [
        'pnpm eslint --fix src/api/generated',
        'pnpm prettier --write src/api/generated',
      ],
    },
  },
})
