export default () => ({
  frontend: {
    url: process.env.FRONTEND_HOST_URL,
  },
  auth: {
    jwt: {
      secret: process.env.JWT_SECRET,
      accessToken: {
        expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN,
      },
      refreshToken: {
        expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN,
      },
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackUrl: process.env.GOOGLE_CLIENT_CALLBACK_URL,
    },
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  database: {
    url: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_USE_SSL,
  },
});
