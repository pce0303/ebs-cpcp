import express from "express";
import cors from "cors";
import db from "../db.js"; // DB 연결 모듈

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.use(cors());

// 날짜별 계획 보기
router.get('/', (req, res) => {
    const user = req.session.user.email; // 로그인한 사용자 email
    const { date } = req.query;
    const query = `SELECT * FROM plans WHERE date = ? AND user = ?`;

    db.query(query, [date, user], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 계획 등록
router.post('/', (req, res) => {
    const { courses_ids, planned_date } = req.body;
    const userEmail = req.session.user.email;

    if (!userEmail) {
        return res.status(401).json({ error: '로그인 필요' });
    }

    if (!planned_date) {
        return res.status(400).json({ error: '계획 날짜가 필요합니다' });
    }

    const userQuery = `SELECT id FROM users WHERE email = ?`;
    db.query(userQuery, [userEmail], (err, users) => {
        if (err) return res.status(500).json({ error: err.message });
        if (users.length === 0) return res.status(404).json({ error: '사용자 없음' });

        const userId = users[0].id;
        const values = courses_ids.map(courseId => [userId, courseId, planned_date]);

        const insertQuery = `INSERT INTO todo (user_id, course_id, planned_date) VALUES ?`;
        db.query(insertQuery, [values], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: '계획 등록 완료', inserted: result.affectedRows });
        });
    });
});


// 계획 수정
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { date, subject, subSubject, type } = req.body;
    const query = `UPDATE plans SET date = ?, subject = ?, sub_subject = ?, type = ? WHERE id = ?`;

    db.query(query, [date, subject, subSubject, type, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: parseInt(id), date, subject, subSubject, type });
    });
});

// 계획 삭제
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const query = `DELETE FROM plans WHERE id = ?`;

    db.query(query, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(204).end();
    });
});

// 강의 추천
router.get('/course', (req, res) => {
    const { subject, category, difficulty } = req.query;

    const query = `
        SELECT * FROM course 
        WHERE subject = ? AND sub_subject = ? AND type = ?
    `;
    db.query(query, [subject, category, difficulty], (err, courses) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(courses);
    });
});

export default router;
