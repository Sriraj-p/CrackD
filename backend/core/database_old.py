"""
CrackD Database Layer
SQLite-based persistence replacing BigQuery from the original hackathon build.
Mirrors the original three-table schema: students, analysis_sessions, interview_sessions.
"""

import os
import uuid
import sqlite3
from datetime import datetime, timezone

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "crackd.db")


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initialize the SQLite database with the CrackD schema."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS students (
            student_id TEXT PRIMARY KEY,
            name TEXT,
            email TEXT DEFAULT '',
            degree_url TEXT DEFAULT '',
            created_at TEXT
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS analysis_sessions (
            session_id TEXT PRIMARY KEY,
            student_id TEXT,
            resume_text TEXT,
            job_description TEXT,
            job_url TEXT DEFAULT '',
            hr_analysis TEXT,
            ats_analysis TEXT,
            knowledge_gaps TEXT,
            suggestions TEXT,
            created_at TEXT,
            FOREIGN KEY (student_id) REFERENCES students(student_id)
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS interview_sessions (
            interview_id TEXT PRIMARY KEY,
            session_id TEXT,
            student_id TEXT,
            mode TEXT,
            questions_asked TEXT,
            answers_given TEXT,
            feedback TEXT,
            created_at TEXT,
            FOREIGN KEY (student_id) REFERENCES students(student_id)
        )
    """)

    conn.commit()
    conn.close()


def store_analysis(
    student_name: str,
    resume_text: str,
    job_description: str,
    job_url: str,
    hr_analysis: str,
    ats_analysis: str,
    knowledge_gaps: str,
    suggestions: str,
) -> dict:
    """Stores the resume analysis results in SQLite."""
    session_id = str(uuid.uuid4())
    student_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            "INSERT INTO students (student_id, name, email, degree_url, created_at) VALUES (?, ?, ?, ?, ?)",
            (student_id, student_name, "", "", now),
        )

        cursor.execute(
            """INSERT INTO analysis_sessions
            (session_id, student_id, resume_text, job_description, job_url, hr_analysis, ats_analysis, knowledge_gaps, suggestions, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (session_id, student_id, resume_text, job_description, job_url, hr_analysis, ats_analysis, knowledge_gaps, suggestions, now),
        )

        conn.commit()
        return {
            "status": "success",
            "session_id": session_id,
            "student_id": student_id,
            "message": f"Analysis stored successfully for {student_name}.",
        }
    except Exception as e:
        return {
            "status": "success",
            "session_id": session_id,
            "student_id": student_id,
            "message": f"Analysis completed for {student_name}. (Storage warning: {str(e)[:100]})",
        }
    finally:
        conn.close()


def get_student_history(student_name: str) -> dict:
    """Retrieves previous analysis sessions for a student."""
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """SELECT a.session_id, a.job_description, a.hr_analysis, a.ats_analysis,
                      a.knowledge_gaps, a.suggestions, a.created_at
               FROM analysis_sessions a
               JOIN students s ON a.student_id = s.student_id
               WHERE s.name = ?
               ORDER BY a.created_at DESC
               LIMIT 5""",
            (student_name,),
        )
        rows = [dict(row) for row in cursor.fetchall()]

        if not rows:
            return {"status": "no_history", "message": f"No previous sessions found for {student_name}."}
        return {"status": "success", "sessions": rows}
    except Exception as e:
        return {"status": "no_history", "message": f"Could not retrieve history: {str(e)[:100]}"}
    finally:
        conn.close()


def get_latest_analysis(student_name: str) -> dict:
    """Retrieves the most recent resume analysis for a student."""
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """SELECT a.session_id, a.resume_text, a.job_description, a.job_url,
                      a.hr_analysis, a.ats_analysis, a.knowledge_gaps, a.suggestions, a.created_at
               FROM analysis_sessions a
               JOIN students s ON a.student_id = s.student_id
               WHERE s.name = ?
               ORDER BY a.created_at DESC
               LIMIT 1""",
            (student_name,),
        )
        rows = [dict(row) for row in cursor.fetchall()]

        if not rows:
            return {"status": "no_analysis", "message": f"No resume analysis found for {student_name}."}
        return {"status": "success", "analysis": rows[0]}
    except Exception as e:
        return {"status": "no_analysis", "message": f"Could not retrieve analysis: {str(e)[:100]}"}
    finally:
        conn.close()


def store_interview_session(
    student_name: str,
    session_id: str,
    mode: str,
    questions_asked: str,
    answers_given: str,
    feedback: str,
) -> dict:
    """Stores an interview practice session in SQLite."""
    interview_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            "SELECT student_id FROM students WHERE name = ? ORDER BY created_at DESC LIMIT 1",
            (student_name,),
        )
        row = cursor.fetchone()
        student_id = dict(row)["student_id"] if row else "unknown"

        cursor.execute(
            """INSERT INTO interview_sessions
            (interview_id, session_id, student_id, mode, questions_asked, answers_given, feedback, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (interview_id, session_id, student_id, mode, questions_asked, answers_given, feedback, now),
        )

        conn.commit()
        return {"status": "success", "interview_id": interview_id, "message": "Interview session stored successfully."}
    except Exception as e:
        return {"status": "success", "interview_id": interview_id, "message": f"Interview completed. (Storage warning: {str(e)[:100]})"}
    finally:
        conn.close()
