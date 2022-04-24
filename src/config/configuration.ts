export default (): any => ({
  port: parseInt(process.env.PORT, 10) || 4000,
  database: {
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT, 10) || 5432,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    migration: process.env.MYSQL_MIGRATION,
    schema: process.env.MYSQL_DROP_SCHEMA,
  },
  jwt: {
    jwtSecret: process.env.JWT_SECRET,
    saltRound: process.env.BCRYPT_SALT,
  },
  cloudinary: {
    cloudName: process.env.CLD_CLOUD_NAME,
    apiKey: process.env.CLD_API_KEY,
    apiSecret: process.env.CLD_API_SECRET
  }
});
