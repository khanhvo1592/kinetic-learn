# Thiet ke lai MVP: Trac nghiem, kiem tra, ket qua va on cau sai

## 1. Hien trang ung dung

Ung dung hien la React/Vite + Firebase, co san cac man hinh hoc bai, lam quiz, lam bai kiem tra tong hop, xem ket qua, xem loi giai va quan tri noi dung.

Nhung phan da co nen giu lai:

- Ngan hang cau hoi `quizzes` voi cau hoi, 4 lua chon, dap an dung va giai thich.
- Trang quan tri co tao cau hoi tung cau va import hang loat.
- Luong hoc bai -> lam quiz theo bai hoc tai `/lesson/:id` -> `/quiz/:lessonId` -> `/result` -> `/solutions`.
- Luong lam bai tong hop tai `/exam`.
- XP, streak va bang xep hang.

Khoang trong chinh cua MVP:

- Chua co entity "de kiem tra" rieng. `/exam` dang lay ngau nhien 10 cau tu toan bo `quizzes`.
- Chua luu lich su ket qua. `ResultPage` chi nhan state tu router, refresh la mat du lieu.
- Chua luu tung cau sai de on lai.
- `ExamPage` ghi ro diem khong duoc luu, trai voi muc tieu san pham.
- `SolutionsPage` chi xem duoc dap an neu di tu man ket qua, khong xem lai tu lich su.
- Diem, XP va streak cap nhat tu client nen de bi thao tung neu dua vao san pham that.
- Firestore rules hien cho moi user dang nhap doc/ghi tat ca collection, chua phu hop voi diem so va ngan hang de.

## 2. MVP nen tap trung vao dieu gi

MVP de xuat: "Giao vien tao de tu ngan hang cau hoi; hoc sinh lam bai; he thong luu ket qua, cau sai, va cho on lai."

Pham vi can co:

1. Giao vien/admin quan ly ngan hang cau hoi.
2. Giao vien/admin tao de kiem tra tu ngan hang cau hoi.
3. Hoc sinh lam bai theo de hoac bai hoc.
4. He thong luu attempt sau khi nop bai.
5. Hoc sinh xem lich su ket qua.
6. Hoc sinh xem lai loi giai theo attempt.
7. Hoc sinh on tap cau sai va lam lai rieng cac cau sai.

Tam thoi nen bo khoi MVP:

- AI tutor nang cao cho tung cau sai.
- Phan tich nang luc chi tiet theo chuan kien thuc.
- Cham tu luan.
- Anti-cheat phuc tap.
- Lich thi, phong thi, khoa de theo thoi gian thuc.

## 3. Mo hinh du lieu de xuat

### `quizzes/{questionId}`

Tiep tuc dung nhu hien tai, nhung nen bo sung metadata:

```ts
type QuizQuestion = {
  id: string;
  subjectId: string;
  lessonId?: string;
  question: string;
  options: { key: 'A' | 'B' | 'C' | 'D'; text: string }[];
  correctKey: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
};
```

### `examTemplates/{examId}`

Dung de luu de kiem tra do giao vien/admin tao.

```ts
type ExamTemplate = {
  id: string;
  title: string;
  subjectId?: string;
  lessonIds?: string[];
  questionIds: string[];
  durationSeconds: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  status: 'draft' | 'published' | 'archived';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};
```

### `quizAttempts/{attemptId}`

Nguon su that cho lich su ket qua.

```ts
type QuizAttempt = {
  id: string;
  userId: string;
  mode: 'lesson_quiz' | 'exam' | 'wrong_review';
  lessonId?: string;
  examId?: string;
  subjectId?: string;
  questionIds: string[];
  answers: Record<string, string>;
  correctQuestionIds: string[];
  wrongQuestionIds: string[];
  unansweredQuestionIds: string[];
  score: number;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  startedAt: string;
  submittedAt: string;
  durationSeconds: number;
};
```

### `wrongQuestionStats/{userId_questionId}`

Cache nhe de lay danh sach cau sai nhanh.

```ts
type WrongQuestionStat = {
  id: string;
  userId: string;
  questionId: string;
  subjectId?: string;
  lessonId?: string;
  wrongCount: number;
  lastWrongAt: string;
  lastAttemptId: string;
  mastered: boolean;
  masteredAt?: string;
};
```

## 4. Luong man hinh MVP

### Hoc sinh

1. Trang chu
   - CTA chinh: "Lam bai kiem tra".
   - Them block "Can on lai": so cau sai chua thanh thao.
   - Them block "Ket qua gan day": 3 attempt moi nhat.

2. Danh sach de kiem tra `/exams`
   - De dang mo.
   - Loc theo mon/bai.
   - Hien so cau, thoi gian, lan lam gan nhat.

3. Lam bai `/exam/:examId`
   - Dung chung engine voi lesson quiz.
   - Co cau truoc/cau sau, navigator so cau, dong ho, nop bai.
   - Khi nop: tao `quizAttempts`, cap nhat `wrongQuestionStats`, roi moi chuyen sang ket qua.

4. Ket qua `/attempts/:attemptId`
   - Doc tu Firestore, khong phu thuoc router state.
   - Hien diem, so cau dung/sai/bo trong, thoi gian.
   - Nut "Xem loi giai" va "On lai cau sai".

5. Loi giai `/attempts/:attemptId/solutions`
   - Hien dung theo snapshot attempt: cau nao chon gi, dap an dung, giai thich.

6. On cau sai `/review/wrong`
   - Lay `wrongQuestionStats` cua user, uu tien cau sai gan day hoac sai nhieu.
   - Cho lam lai 5-10 cau.
   - Neu tra loi dung 2 lan lien tiep hoac dat nguong, danh dau `mastered`.

### Giao vien/admin

1. Quan ly ngan hang cau hoi
   - Giu form hien co.
   - Them loc theo mon/bai/do kho/tag.

2. Tao de kiem tra
   - Nhap title, mon, thoi gian.
   - Chon cau hoi thu cong hoac lay ngau nhien theo mon/bai.
   - Luu nhap, xuat ban, an de.

3. Xem ket qua hoc sinh
   - Danh sach attempts theo de.
   - Diem trung binh, cau sai nhieu nhat.

## 5. Thay doi ky thuat uu tien

### P0 - Lam MVP chay dung

- Tao type `ExamTemplate`, `QuizAttempt`, `WrongQuestionStat`.
- Tao hooks:
  - `useExamTemplates`
  - `useQuizAttempts`
  - `useWrongQuestionStats`
- Gop logic lam bai trong `QuizPage` va `ExamPage` ve mot quiz engine dung chung.
- Sau khi nop bai, ghi `quizAttempts`.
- Result/Solutions doc theo `attemptId`.
- Them trang lich su ket qua trong Profile hoac route rieng `/history`.
- Them route on cau sai `/review/wrong`.

### P1 - Lam san pham dang tin cay

- Chuyen viec tinh XP/streak sang quy tac ro rang, toi thieu khong cho client tu sua tuy tien.
- Cap nhat Firestore rules:
  - Student chi doc/ghi attempt cua minh.
  - Student chi doc ngan hang cau hoi/de da publish.
  - Student khong duoc ghi `quizzes`, `examTemplates`, `students.xp`, `students.role`.
  - Teacher/admin moi duoc tao cau hoi/de.
- Luu `createdAt`, `submittedAt` bang server timestamp neu co the.

### P2 - Cai thien trai nghiem

- Them question navigator de hoc sinh quay lai cau chua tra loi.
- Loc cau sai theo mon/bai.
- Hien xu huong diem gan day trong Profile.
- Bao cao cau hoi co ti le sai cao cho giao vien.

## 6. Rui ro can sua truoc khi demo that

- `ResultPage` hien dat `total = 10` co dinh, se sai neu de co so cau khac.
- `wrongCount` trong `useQuizSession` chi dem cau da tra loi sai, khong tinh cau bo trong.
- `QuizPage` chi cho di tiep sau khi tra loi, khong phu hop voi bai thi co the bo qua cau.
- `ExamPage` va `QuizPage` tinh diem khac nhau: mot ben diem `/10`, mot ben dem so cau dung.
- Refresh trang result/solutions se mat ket qua vi khong co `attemptId`.
- Firestore rules hien qua rong so voi `security_spec.md`.

## 7. Ket luan san pham

Nen dinh vi lai app trong MVP la "he thong luyen tap va kiem tra trac nghiem co vong lap on sai". Bai hoc, AI tutor, nhiem vu, leaderboard la phan phu tro. Gia tri cot loi can lam that chac la:

- Tao duoc cau hoi va de.
- Lam duoc bai on/de kiem tra.
- Luu duoc ket qua.
- Xem lai duoc loi giai.
- On lai duoc cau sai.

Khi 5 viec nay tron tru, app se co vong lap hoc tap khep kin: hoc -> lam -> sai -> hieu vi sao sai -> on lai -> tien bo.
