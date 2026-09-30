export const ROLES_SEED = [
  { name: 'admin',    description: 'Administrador del sistema', permissions: ['*'],                       telegramNotify: true  },
  { name: 'vendedor', description: 'Vendedor de tienda',        permissions: ['orders', 'products:read'], telegramNotify: false },
];

export const USERS_SEED = [
  { name: 'Erick Alcon', email: 'ealcon', password: 'ERICK3110alcon', roleName: 'admin'    },
  { name: 'J. Cruz',     email: 'jcruz',  password: 'CRUZ3110mendoza', roleName: 'vendedor' },
];
