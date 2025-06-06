import express from "express";
import cors from "cors";
import db from "../db.js";

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.use(cors());

// 콜백 기반 db.query를 Promise로 감싸는 헬퍼
const queryAsync = (sql, params) => {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
};

// 날짜별 계획 보기
router.get('/', async (req, res) => {
    const userEmail = req.session.user?.email;
    const { date } = req.query;
    console.log('[GET /plans] userEmail:', userEmail, 'date:', date);

    if (!userEmail) {
        console.log('[GET /plans] 로그인 필요');
        return res.status(401).json({ error: '로그인 필요' });
    }
    if (!date) {
        console.log('[GET /plans] 날짜 필요');
        return res.status(400).json({ error: '날짜 필요' });
    }

    const formattedDate = date.replace(/-/g, '.');
    const query = `
        SELECT c.id, c.name AS title, c.logo, c.link
        FROM plans p
        JOIN course c ON p.course_id = c.id
        WHERE p.planned_date = ? AND p.user = ?
    `;

    try {
        const results = await queryAsync(query, [formattedDate, userEmail]);
        console.log('[GET /plans] 쿼리 결과 개수:', results.length);
        res.json(results);
    } catch (err) {
        console.error('[GET /plans] DB 에러:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// 계획 등록
router.post('/', async (req, res) => {
    const { courses_ids, planned_date } = req.body;
    const userEmail = req.session.user?.email;

    console.log('[POST /plans] 요청 바디:', req.body);
    console.log('[POST /plans] userEmail:', userEmail);

    if (!userEmail) {
        console.log('[POST /plans] 로그인 필요');
        return res.status(401).json({ error: '로그인 필요' });
    }
    if (!planned_date || !Array.isArray(courses_ids) || courses_ids.length === 0) {
        console.log('[POST /plans] 잘못된 요청 - 날짜 또는 강의목록 없음');
        return res.status(400).json({ error: '잘못된 요청' });
    }

    try {
        // 사용자 존재 확인
        const users = await queryAsync(`SELECT id FROM user WHERE email = ?`, [userEmail]);
        if (users.length === 0) {
            console.log('[POST /plans] 사용자 없음');
            return res.status(404).json({ error: '사용자 없음' });
        }
        console.log('[POST /plans] 사용자 조회 성공:', users[0]);

    // 강의 조회
        const courses = await queryAsync(`SELECT id, name, teacher, link FROM course WHERE id IN (?)`, [courses_ids]);
            if (courses.length === 0) {
                console.log('[POST /plans] 강의 없음');
                return res.status(404).json({ error: '강의 없음' });
            }
        console.log('[POST /plans] 강의 조회 성공, 개수:', courses.length);

        // 이미 저장된 계획 조회
        const existingPlans = await queryAsync(
            `SELECT course_name FROM plans WHERE planned_date = ? AND user = ?`,
            [planned_date, userEmail]
        );
        console.log('[POST /plans] 기존 계획 수:', existingPlans.length);

        const existingCourseNames = new Set(existingPlans.map(p => p.course_name));
        const newPlans = courses.filter(course => !existingCourseNames.has(course.name));
        console.log('[POST /plans] 새로 추가할 계획 수:', newPlans.length);

        if (newPlans.length === 0) {
            console.log('[POST /plans] 모든 강의가 이미 추가되어 있음');
            return res.status(200).json({ message: '이미 모든 강의가 추가되어 있음' });
        }

        const insertValues = newPlans.map(course => [
            course.name,
            course.teacher,
            course.link,
            planned_date,
            userEmail,
            course.id
        ]);

        const insertQuery = `
            INSERT INTO plans (course_name, teacher, link, planned_date, user, course_id)
            VALUES ?
        `;

        const insertResult = await queryAsync(insertQuery, [insertValues]);
        console.log('[POST /plans] 새 강의 추가 완료, 삽입된 행 수:', insertResult.affectedRows);
        res.status(201).json({ message: '새 강의 추가 완료', inserted: insertResult.affectedRows });

    } catch (err) {
        console.error('[POST /plans] 처리 실패:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// 계획에서 강좌 삭제
router.delete('/', async (req, res) => {
    const { courseId, date } = req.body;
    const userEmail = req.session.user?.email;

    console.log('[DELETE /plans] 요청 바디:', req.body);
    console.log('[DELETE /plans] userEmail:', userEmail);

    if (!userEmail) {
        return res.status(401).json({ error: '로그인 필요' });
    }

    if (!courseId || !date) {
        return res.status(400).json({ error: 'courseId와 date 필요' });
    }

    const formattedDate = date.replace(/-/g, '.');

    try {
        const result = await queryAsync(
            `DELETE FROM plans WHERE user = ? AND course_id = ? AND planned_date = ?`,
            [userEmail, courseId, formattedDate]
        );
        console.log('[DELETE /plans] 삭제 완료, 삭제된 행 수:', result.affectedRows);
        res.json({ message: '삭제 완료', deleted: result.affectedRows });
    } catch (err) {
        console.error('[DELETE /plans] DB 에러:', err.message);
        res.status(500).json({ error: err.message });
    }
});


// 강의 추천
router.get('/course', async (req, res) => {
    const { subject, category, difficulty } = req.query;
    console.log('[GET /plans/course] 쿼리 파라미터:', { subject, category, difficulty });

    if (!subject || !category || !difficulty) {
        return res.status(400).json({ error: '필수 쿼리 파라미터 누락' });
    }

    const query = `
        SELECT * FROM course 
        WHERE subject = ? AND category = ? AND difficulty = ?
    `;

    try {
        const courses = await queryAsync(query, [subject, category, difficulty]);
        console.log('[GET /plans/course] 강의 조회 성공, 개수:', courses.length);
        res.json(courses);
    } catch (err) {
        console.error('[GET /plans/course] DB 에러:', err.message);
        res.status(500).json({ error: err.message });
    }
});

export default router;