# Firestore Rules Analysis

Collections used by the app:

- `students/{studentId}`: user profile with PII (`email`), role, XP, streak, status.
- `subjects/{subjectId}`: course catalog.
- `lessons/{lessonId}`: lesson catalog.
- `lessons/{lessonId}/discussions/{discussionId}`: lesson discussion messages.
- `quizzes/{questionId}`: question bank.
- `examTemplates/{examId}`: teacher/admin-authored tests.
- `quizAttempts/{attemptId}`: user-owned test results.
- `wrongQuestionStats/{userId_questionId}`: user-owned wrong-question cache.
- `tasks/{taskId}`: user-owned tasks.

Primary query patterns:

- AuthContext reads `students/{uid}` and creates it on first login.
- AppContext reads `subjects`, `lessons`, `quizzes`; admin/teacher may write them.
- AppContext reads all `students` only for admin/teacher after this MVP update.
- Attempts and wrong stats query by `userId == currentUser.id`.
- Exam templates are listed by students if `published`, and by teacher/admin for management.

Rules approach:

- Default deny.
- Allow authenticated reads for catalog data.
- Allow only teacher/admin catalog writes.
- Keep PII-bearing `students` owner-readable, with admin/teacher roster access.
- Allow client-created attempts and wrong stats only when `userId` matches `request.auth.uid`.
