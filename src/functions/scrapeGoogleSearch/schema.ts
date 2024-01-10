export default {
  type: "object",
  properties: {
    username: { type: 'string' },
    query: { type: 'string' }
  },
  required: ['username', 'query']
} as const;
