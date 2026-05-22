import {
  Demographics,
  SessionRecord,
  SessionResult,
  StudentAttemptSummary,
} from "@/features/gamified-test/lib/types";
import fs from "fs";
import path from "path";

type SessionEventInput = {
  eventType: "click" | "hit" | "miss";
  questionId: string;
  optionId?: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "results.json");

function ensureDirectoryExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

const sessionsById = new Map<string, SessionRecord>();

function loadSessionsFromDisk() {
  try {
    ensureDirectoryExists();
    if (fs.existsSync(FILE_PATH)) {
      const content = fs.readFileSync(FILE_PATH, "utf-8");
      if (content.trim()) {
        const sessions: Record<string, SessionRecord> = JSON.parse(content);
        for (const [id, session] of Object.entries(sessions)) {
          sessionsById.set(id, session);
        }
      }
    }
  } catch (err) {
    console.error("Failed to load sessions from disk:", err);
  }
}

// Load existing results on startup
loadSessionsFromDisk();

function saveSessionToDisk(session: SessionRecord) {
  try {
    ensureDirectoryExists();
    let sessions: Record<string, SessionRecord> = {};
    if (fs.existsSync(FILE_PATH)) {
      const content = fs.readFileSync(FILE_PATH, "utf-8");
      if (content.trim()) {
        sessions = JSON.parse(content);
      }
    }
    sessions[session.id] = session;
    fs.writeFileSync(FILE_PATH, JSON.stringify(sessions, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save session to disk:", err);
  }
}

function createId() {
  return globalThis.crypto.randomUUID();
}

export function createSessionForStudent(
  demographics: Demographics,
  studentId?: string,
): SessionRecord {
  const session: SessionRecord = {
    id: createId(),
    startedAt: new Date().toISOString(),
    demographics,
    studentId,
    events: [],
  };

  sessionsById.set(session.id, session);
  return session;
}

export function getSession(id: string): SessionRecord | undefined {
  return sessionsById.get(id);
}

export function addSessionEvent(
  id: string,
  event: SessionEventInput,
): SessionRecord | undefined {
  const session = sessionsById.get(id);
  if (!session) {
    return undefined;
  }

  session.events.push({
    ...event,
    createdAt: new Date().toISOString(),
  });

  return session;
}

export function completeSession(
  id: string,
  result: SessionResult,
): SessionRecord | undefined {
  const session = sessionsById.get(id);
  if (!session) {
    return undefined;
  }

  session.completedAt = new Date().toISOString();
  session.result = result;
  saveSessionToDisk(session);
  return session;
}

export function listAttemptSummariesForStudent(
  studentId: string,
): StudentAttemptSummary[] {
  return Array.from(sessionsById.values())
    .filter((session) => session.studentId === studentId)
    .map((session) => ({
      sessionId: session.id,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
      probability: session.result?.probability,
      riskLevel: session.result?.riskLevel,
      riskDetected: session.result?.riskDetected,
    }))
    .sort((left, right) => right.startedAt.localeCompare(left.startedAt));
}
