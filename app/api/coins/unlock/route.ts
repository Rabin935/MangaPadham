import { withAuth } from "@/lib/auth";
import { handleChapterUnlock } from "@/lib/chapter-unlock";

export const POST = withAuth((request) => handleChapterUnlock(request));
