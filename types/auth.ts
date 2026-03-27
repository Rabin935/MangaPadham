export type ContinueReading = {
  mangaId: string;
  mangaTitle: string;
  chapterId: string;
  chapterNumber: string;
  chapterTitle: string;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  coins: number;
  readChapters: string[];
  unlockedChapters: string[];
  continueReading: ContinueReading | null;
  createdAt: string;
};

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";
