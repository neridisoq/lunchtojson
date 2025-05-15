const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API 엔드포인트
app.get('/api/meal', async (req, res) => {
    try {
        const { year, month } = req.query;

        if (!year || !month) {
            return res.status(400).json({ error: '연도와 월을 입력해주세요.' });
        }

        // 해당 월의 시작일과 종료일 계산
        const fromDate = `${year}${month.padStart(2, '0')}01`;

        // 월의 마지막 날짜 계산
        const lastDay = new Date(year, month, 0).getDate();
        const toDate = `${year}${month.padStart(2, '0')}${lastDay}`;

        const apiUrl = `https://open.neis.go.kr/hub/mealServiceDietInfo?ATPT_OFCDC_SC_CODE=B10&SD_SCHUL_CODE=7010209&Type=json&KEY=1bd529acc7a54078972b1e4dc99556b3&MLSV_FROM_YMD=${fromDate}&MLSV_TO_YMD=${toDate}`;

        const response = await axios.get(apiUrl);

        res.json(response.data);
    } catch (error) {
        console.error('API 호출 중 오류 발생:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});