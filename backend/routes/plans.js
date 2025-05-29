import express from "express";
import cors from "cors";
import db from "../db.js"; // DB 연결 모듈

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.use(cors());

// 날짜별 계획 보기
router.get('/', (req, res) => {
    const userEmail = req.session.user?.email;
    const { date } = req.query;
    console.log('[GET /plans] userEmail:', userEmail, 'date:', date);

    if (!userEmail) {
        console.log('[GET /plans] 로그인 필요');
        return res.status(401).json({ error: '로그인 필요' });
    }

    const query = `
        SELECT c.id, c.name AS title, c.logo, c.link
        FROM plans p
        JOIN course c ON p.course_id = c.id
        WHERE p.planned_date = ? AND p.user = ?
    `;
    const formattedDate = date.replace(/-/g, '.');
    db.query(query, [formattedDate, userEmail], (err, results) => {
        if (err) {
            console.error('[GET /plans] DB 에러:', err.message);
            return res.status(500).json({ error: err.message });
        }
        console.log('[GET /plans] 쿼리 결과 개수:', results.length);
        res.json(results);
    });
});

// 계획 등록
router.post('/', (req, res) => {
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

    const userQuery = `SELECT id FROM user WHERE email = ?`;
    db.query(userQuery, [userEmail], (err, users) => {
        if (err) {
            console.error('[POST /plans] 사용자 조회 DB 에러:', err.message);
            return res.status(500).json({ error: err.message });
        }
        if (users.length === 0) {
            console.log('[POST /plans] 사용자 없음');
            return res.status(404).json({ error: '사용자 없음' });
        }
        console.log('[POST /plans] 사용자 조회 성공:', users[0]);

        const courseQuery = `SELECT id, name, teacher, link FROM course WHERE id IN (?)`;
        db.query(courseQuery, [courses_ids], async (err, courses) => {
            if (err) {
                console.error('[POST /plans] 강의 조회 DB 에러:', err.message);
                return res.status(500).json({ error: err.message });
            }
            if (courses.length === 0) {
                console.log('[POST /plans] 강의 없음');
                return res.status(404).json({ error: '강의 없음' });
            }
            console.log('[POST /plans] 강의 조회 성공, 개수:', courses.length);

            // 이미 저장된 강의 필터링
            const existingQuery = `
                SELECT course_name FROM plans
                WHERE planned_date = ? AND user = ?
            `;

            db.query(existingQuery, [planned_date, userEmail], (err, existingPlans) => {
                if (err) {
                    console.error('[POST /plans] 기존 계획 조회 DB 에러:', err.message);
                    return res.status(500).json({ error: err.message });
                }

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

                db.query(insertQuery, [insertValues], (err, result) => {
                    if (err) {
                        console.error('[POST /plans] 계획 추가 DB 에러:', err.message);
                        return res.status(500).json({ error: err.message });
                    }
                    console.log('[POST /plans] 새 강의 추가 완료, 삽입된 행 수:', result.affectedRows);
                    res.status(201).json({ message: '새 강의 추가 완료', inserted: result.affectedRows });
                });
            });
        });
    });
});

// 강의 추천
router.get('/course', (req, res) => {
    const { subject, category, difficulty } = req.query;
    console.log('[GET /plans/course] 쿼리 파라미터:', { subject, category, difficulty });

    const query = `
        SELECT * FROM course 
        WHERE subject = ? AND category = ? AND difficulty = ?
    `;
    db.query(query, [subject, category, difficulty], (err, courses) => {
        if (err) {
            console.error('[GET /plans/course] DB 에러:', err.message);
            return res.status(500).json({ error: err.message });
        }
        console.log('[GET /plans/course] 강의 조회 성공, 개수:', courses.length);
        res.json(courses);
    });
});

export default router;
