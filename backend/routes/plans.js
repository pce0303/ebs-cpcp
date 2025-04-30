// import express from "express";
// import cors from "cors";
// import db from "../db.js";

// const router = express.Router();

// router.use(express.json());
// router.use(express.urlencoded({ extended: true }));
// router.use(cors());

// // 날짜별 계획 보기
// router.get('/', (req, res) => {
//     const user = req.session.user.email; // 로그인한 사용자 email
//     const { date } = req.query;
//     const query = `SELECT * FROM plans WHERE date = ? AND user = ?`;

//     db.query(query, [date, user], (err, rows) => {
//         if (err) throw err;
//         res.json(rows);
//     });
// });

// // 계획 등록
// router.post('/', (req, res) => {
//     const { date, subject, subSubject, type, email } = req.body;
//     const query = `INSERT INTO plans (date, subject, sub_subject, type, user) VALUES (?, ?, ?, ?, ?)`;

//     db.query(query, [date, subject, subSubject, type, email], (err, result) => {
//         if (err) throw err;
//         res.status(201).json({ id: result.insertId, ...req.body });
//     });
// });


// // 계획 수정
// router.put('/:id', (req, res) => {
//     const { id } = req.params;
//     const { date, subject, subSubject, type, email } = req.body;
//     const query = `UPDATE plans SET date = ?, subject = ?, sub_subject = ?, type = ? WHERE id = ?`;

//     db.query(query, [date, subject, subSubject, type, id], (err, result) => {
//         if (err) throw err;
//         res.json({ id, ...req.body });
//     });
// });

// // 계획 삭제
// router.delete('/:id', (req, res) => {
//     const { email } = req.query;
//     const query = `DELETE FROM plans WHERE id = ?`;

//     db.query(query, [id], (err, result) => {
//         if (err) throw err;
//         res.status(204).end();
//     });
// });

// // 강의 추천
// router.get('/course', (req, res) => {
//     const { userPlanId } = req.query;
//     const userEmail = req.session.user.email;

//     const planQuery = `SELECT subject, sub_subject, type FROM plans WHERE id = ?`;
//     db.query(planQuery, [userPlanId], (err, plans) => {
//         if (err) throw err;
//         if (plans.length === 0) {
//             return res.status(404).json({ message: "Plan not found" });
//         }

//         const { subject, sub_subject, type } = plans[0];

//         const courseQuery = `SELECT * FROM courses WHERE subject = ? OR sub_subject = ? OR type = ?`;
//         db.query(courseQuery, [subject, sub_subject, type], (err, courses) => {
//             if (err) throw err;

//             const recommendedCourses = courses.map(course => {
//                 let matchCount = 0;
//                 if (course.subject === subject) matchCount+=3;
//                 if (course.sub_subject === sub_subject) matchCount+=2;
//                 if (course.type === type) matchCount+=1;
//                 return { ...course, matchCount };
//             });

//             recommendedCourses.sort((a, b) => b.matchCount - a.matchCount);
//             res.json(recommendedCourses);
//         });
//     });
// });

// export default router;

import express from "express";
import cors from "cors";

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.use(cors());

// 임시 데이터 저장소
let plans = [
    {
        id: 1,
        date: "2025-04-30",
        subject: "Math",
        subSubject: "Algebra",
        type: "Study",
        user: "test@example.com",
    },
];

let courses = [
    {
        id: 1,
        subject: "Math",
        sub_subject: "Algebra",
        type: "Study",
        title: "Algebra Basics",
    },
    {
        id: 2,
        subject: "Science",
        sub_subject: "Biology",
        type: "Study",
        title: "Intro to Biology",
    },
];

// 날짜별 계획 보기
router.get('/', (req, res) => {
    const user = "test@example.com"; // 임시 사용자
    const { date } = req.query;

    const filtered = plans.filter(p => p.date === date && p.user === user);
    res.json(filtered);
});

// 계획 등록
router.post('/', (req, res) => {
    const { date, subject, subSubject, type, email } = req.body;
    const newPlan = {
        id: plans.length + 1,
        date,
        subject,
        subSubject,
        type,
        user: email,
    };
    plans.push(newPlan);
    res.status(201).json(newPlan);
});

// 계획 수정
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { date, subject, subSubject, type, email } = req.body;

    const planIndex = plans.findIndex(p => p.id === parseInt(id));
    if (planIndex === -1) return res.status(404).json({ message: "Plan not found" });

    plans[planIndex] = { id: parseInt(id), date, subject, subSubject, type, user: email };
    res.json(plans[planIndex]);
});

// 계획 삭제
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    plans = plans.filter(p => p.id !== parseInt(id));
    res.status(204).end();
});

// 강의 추천
router.get('/course', (req, res) => {
    const { userPlanId } = req.query;
    const user = "test@example.com"; // 임시 사용자

    const plan = plans.find(p => p.id === parseInt(userPlanId));
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    const { subject, subSubject, type } = plan;

    const recommendedCourses = courses.map(course => {
        let matchCount = 0;
        if (course.subject === subject) matchCount += 3;
        if (course.sub_subject === subSubject) matchCount += 2;
        if (course.type === type) matchCount += 1;
        return { ...course, matchCount };
    });

    recommendedCourses.sort((a, b) => b.matchCount - a.matchCount);
    res.json(recommendedCourses);
});

export default router;
