if (!process.env.JWT_SECRET) {
  throw new Error(
    'Falta la variable de entorno JWT_SECRET. Definila en el archivo .env antes de iniciar el servidor (nunca uses un valor por defecto para firmar sesiones).'
  );
}

export const JWT_SECRET = process.env.JWT_SECRET;
