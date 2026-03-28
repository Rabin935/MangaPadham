function readEnvValue(names: string[]) {
  for (const name of names) {
    const value = process.env[name]?.trim();

    if (value) {
      return value;
    }
  }

  return null;
}

function formatEnvNames(names: string[]) {
  return names.join(" or ");
}

export function getRequiredEnv(name: string | string[]) {
  const names = Array.isArray(name) ? name : [name];
  const value = readEnvValue(names);

  if (!value) {
    throw new Error(
      `Please define ${formatEnvNames(names)} in your environment configuration.`
    );
  }

  return value;
}

export function getDatabaseUri() {
  return getRequiredEnv(["MONGO_URI", "MOGO_URI", "MONGODB_URI"]);
}

export function getJwtSecret() {
  return getRequiredEnv("JWT_SECRET");
}

export function getMailConfig() {
  return {
    user: getRequiredEnv("EMAIL_USER"),
    pass: getRequiredEnv("EMAIL_PASS"),
  };
}

export function getCloudinaryConfig() {
  return {
    cloudName: getRequiredEnv("CLOUDINARY_CLOUD_NAME"),
    apiKey: getRequiredEnv("CLOUDINARY_API_KEY"),
    apiSecret: getRequiredEnv("CLOUDINARY_API_SECRET"),
    folder: process.env.CLOUDINARY_FOLDER?.trim() || undefined,
  };
}
