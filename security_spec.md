# Security Specification: Kinetic Academy Zero-Trust Firestore Security

This document catalogs the application’s absolute data invariants and establishes security tests for Firestore.

## 1. Data Invariants

1.  **Immutability of Role Promotions**: Ordinary students must not be able to elevate their role to `admin`.
2.  **PII Preservation**: The user's `email` (PII) in the `students` profile must only be readable by the owner or an admin, or securely masked.
3.  **Owner-Only Task Manipulation**: Students can only `create`, `update`, or `delete` their own `tasks`. No cross-user task modification is allowed.
4.  **Static Subject & Lesson Catalogs**: The catalog datasets (`subjects`, `lessons`, `quizzes`) must be read-only for students, and strictly modified only by authenticated `admins`.
5.  **Audit Logs Integrity**: Fields like `createdAt` are immutable after creation and cannot be updated.

---

## 2. The "Dirty Dozen" Rogue Payloads

These are malicious JSON payloads designed to violate state, identity, or resource constraints. Our security rules must reject them all.

### P1: Privilege Escalation (Self-Admin Role Injection)
```json
// Collection: students/attackerId
// Operation: create
{
  "id": "attackerId",
  "name": "Attacker",
  "email": "attacker@gmail.com",
  "role": "admin",
  "xp": 999999,
  "status": "active"
}
```
*Expected Result:* `PERMISSION_DENIED` - students must not assign their own roles.

### P2: Role Theft on Update
```json
// Collection: students/studentId
// Operation: update (affectedKey: [role])
{
  "role": "admin"
}
```
*Expected Result:* `PERMISSION_DENIED` - users cannot overwrite their security roles.

### P3: Hijacking Another Student's Task
```json
// Collection: tasks/hackedTaskId
// Operation: create
{
  "id": "hackedTaskId",
  "userId": "otherUserId",
  "title": "Malicious task",
  "completed": false,
  "xpReward": 50
}
```
*Expected Result:* `PERMISSION_DENIED` - cannot write tasks for another user.

### P4: Ghost Fields Attack (Shadow Fields Injection)
```json
// Collection: tasks/myTaskId
// Operation: create
{
  "id": "myTaskId",
  "title": "Clean room",
  "completed": false,
  "xpReward": 20,
  "extraCreditHack": 1000000
}
```
*Expected Result:* `PERMISSION_DENIED` - schema strict checks block undefined attributes.

### P5: Unauthorized Lesson Content Modification
```json
// Collection: lessons/lessonId
// Operation: update
{
  "title": "Phản ứng hạt nhân siêu cấp",
  "summary": "Malicious script injection"
}
```
*Expected Result:* `PERMISSION_DENIED` - lessons are read-only for students.

### P6: Deny-of-Wallet Path ID Poisoning
```json
// Collection: tasks/...infinite-junk-string...
// Operation: create
{
  "id": "infinite-junk-string",
  "title": "Spam"
}
```
*Expected Result:* `PERMISSION_DENIED` - IDs must strictly conform to regex matches and size limits.

### P7: Corrupting Quiz Explanations
```json
// Collection: quizzes/quizId
// Operation: update
{
  "correctKey": "A",
  "explanation": "No explanation"
}
```
*Expected Result:* `PERMISSION_DENIED` - students cannot update quiz keys.

### P8: Email Spoofing via Unverified Token
```json
// Credentials: request.auth.token.email_verified = false
// Collection: students/studentId
// Operation: write
```
*Expected Result:* `PERMISSION_DENIED` - verified emails are required.

### P9: Subject Insertion Bypass
```json
// Collection: subjects/newSubjectId
// Operation: create
{
  "id": "newSubjectId",
  "name": "Hack Subject",
  "lessonsCount": 0
}
```
*Expected Result:* `PERMISSION_DENIED` - only admins can publish subjects.

### P10: Deleting Other Students' Accounts
```json
// Collection: students/otherStudentId
// Operation: delete
```
*Expected Result:* `PERMISSION_DENIED` - users cannot delete other accounts.

### P11: Timestamp Forgery (Client-Sent Past Time)
```json
// Collection: students/myStudentId
// Operation: update
{
  "createdAt": "1999-12-31T23:59:59Z"
}
```
*Expected Result:* `PERMISSION_DENIED` - timestamps must align with server time or remain immutable.

### P12: Massive XP Inflation
```json
// Collection: students/myStudentId
// Operation: update
{
  "xp": 99999999
}
```
*Expected Result:* `PERMISSION_DENIED` - XP increases must follow verified achievements, or are restricted.

---

## 3. Test Suite Outline

A thorough automatic test suite using `@firebase/rules-unit-testing` verifies all blocking rules.
The rule engine guarantees:
1. **Reads on `students`**: Allowed for authenticated users (required for Leaderboard) but sensitive PII like mail remains safe or is only readable by the owner.
2. **Writes on `students`**: Limited to self-updates on specified keys.
3. **Writes on static catalogs**: Rejected unless the request author's uid matches an registered admin.
