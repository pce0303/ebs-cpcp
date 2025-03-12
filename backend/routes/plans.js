import express from "express";
import cors from "cors";
import db from "../db";

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.use(cors());

// 날짜별 계획 보기
router.get('/plans', (req, res) => {
    const { date } = req.query;
    const query = `SELECT * FROM plans WHERE date = ?`;

    db.query(query, [date], (err, rows) => {
        if (err) throw err;
        res.json(rows);
    });
});

// 계획 등록
router.post('/', (req, res) => {
    const { date, subject, subSubject, type } = req.body;
    const query = `INSERT INTO plans (date, subject, sub_subject, type) VALUES (?, ?, ?, ?)`;

    db.query(query, [date, subject, subSubject, type], (err, result) => {
        if (err) throw err;
        res.status(201).json({ id: result.insertId, ...req.body });
    });
});

// 계획 수정
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { date, subject, subSubject, type } = req.body;
    const query = `UPDATE plans SET date = ?, subject = ?, sub_subject = ?, type = ? WHERE id = ?`;

    db.query(query, [date, subject, subSubject, type, id], (err, result) => {
        if (err) throw err;
        res.json({ id, ...req.body });
    });
});

// 계획 삭제
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const query = `DELETE FROM plans WHERE id = ?`;

    db.query(query, [id], (err, result) => {
        if (err) throw err;
        res.status(204).end();
    });
});

// 강의 추천
router.get('/course', (req, res) => {
    const { userPlanId } = req.query;

    const planQuery = `SELECT subject, sub_subject, type FROM plans WHERE id = ?`;
    db.query(planQuery, [userPlanId], (err, plans) => {
        if (err) throw err;
        if (plans.length === 0) {
            return res.status(404).json({ message: "Plan not found" });
        }

        const { subject, sub_subject, type } = plans[0];

        const courseQuery = `SELECT * FROM courses WHERE subject = ? OR sub_subject = ? OR type = ?`;
        db.query(courseQuery, [subject, sub_subject, type], (err, courses) => {
            if (err) throw err;

            const recommendedCourses = courses.map(course => {
                let matchCount = 0;
                if (course.subject === subject) matchCount++;
                if (course.sub_subject === sub_subject) matchCount++;
                if (course.type === type) matchCount++;
                return { ...course, matchCount };
            });

            recommendedCourses.sort((a, b) => b.matchCount - a.matchCount);
            res.json(recommendedCourses);
        });
    });
});

export default router;
