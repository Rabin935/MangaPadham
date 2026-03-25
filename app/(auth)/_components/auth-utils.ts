export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ApiFeedback = {
  success?: boolean;
  message?: string;
};

export async function readApiFeedback(response: Response): Promise<ApiFeedback> {
  try {
    return (await response.json()) as ApiFeedback;
  } catch {
    return {};
  }
}
