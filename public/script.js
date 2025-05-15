document.addEventListener('DOMContentLoaded', () => {
    const yearInput = document.getElementById('year');
    const monthInput = document.getElementById('month');
    const searchBtn = document.getElementById('search-btn');
    const downloadBtn = document.getElementById('download-btn');
    const resultContainer = document.getElementById('result-container');
    const resultPreview = document.getElementById('result-preview');
    const loadingElement = document.getElementById('loading');
    const errorContainer = document.getElementById('error-container');
    const errorMessage = document.getElementById('error-message');

    // 현재 연도와 월로 기본값 설정
    const now = new Date();
    yearInput.value = now.getFullYear();
    monthInput.value = now.getMonth() + 1;

    let mealData = null;

    // 데이터 조회 함수
    async function fetchMealData() {
        const year = yearInput.value.trim();
        const month = monthInput.value.trim().padStart(2, '0');

        if (!year || !month) {
            showError('연도와 월을 입력해주세요.');
            return;
        }

        try {
            showLoading();
            hideError();

            const response = await fetch(`/api/meal?year=${year}&month=${month}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || '데이터를 불러오는데 실패했습니다.');
            }

            mealData = await response.json();

            // 데이터 가공 (키 이름 변경)
            processMealData();

            // 결과 표시
            resultPreview.textContent = JSON.stringify(mealData, null, 2);
            resultContainer.classList.remove('hidden');

        } catch (error) {
            showError(error.message);
            resultContainer.classList.add('hidden');
        } finally {
            hideLoading();
        }
    }

    // 데이터 가공 함수 (필요한 문자열 치환 등)
    function processMealData() {
        if (!mealData || !mealData.mealServiceDietInfo) return;

        // 응답 구조 복제 및 변환
        const processedData = {
            "급식식단정보": []
        };

        // 헤더 정보 처리 (첫 번째 배열 요소)
        if (mealData.mealServiceDietInfo[0]) {
            const header = mealData.mealServiceDietInfo[0];
            const processedHeader = {};

            // 헤더 키 복사 (변환 없이)
            for (const key in header) {
                processedHeader[key] = header[key];
            }

            processedData["급식식단정보"].push(processedHeader);
        }

        // 데이터 행 처리 (두 번째 배열 요소)
        if (mealData.mealServiceDietInfo[1]) {
            const rowContainer = mealData.mealServiceDietInfo[1];
            const processedRowContainer = {};

            // 행 컨테이너의 메타데이터 복사 (row 제외)
            for (const key in rowContainer) {
                if (key !== 'row') {
                    processedRowContainer[key] = rowContainer[key];
                }
            }

            // 행 데이터 변환
            if (rowContainer.row) {
                processedRowContainer.row = rowContainer.row.map(row => {
                    return {
                        "학교명": row.SCHUL_NM,
                        "식사코드": row.MMEAL_SC_CODE,
                        "식사명": row.MMEAL_SC_NM,
                        "급식일자": row.MLSV_YMD,
                        "급식인원수": row.MLSV_FGR,
                        "요리명": row.DDISH_NM,
                        "원산지정보": row.ORPLC_INFO,
                        "칼로리정보": row.CAL_INFO,
                        "영양정보": row.NTR_INFO
                    };
                });
            }

            processedData["급식식단정보"].push(processedRowContainer);
        }

        // 변환된 데이터로 원본 데이터 대체
        mealData = processedData;
    }

    // JSON 파일 다운로드 함수
    function downloadJSON() {
        if (!mealData) return;

        const year = yearInput.value.trim();
        const month = monthInput.value.trim().padStart(2, '0');
        const fileName = `meal_data_${year}_${month}.json`;

        const dataStr = JSON.stringify(mealData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(dataBlob);
        downloadLink.download = fileName;
        downloadLink.click();
    }

    // 로딩 표시 함수
    function showLoading() {
        loadingElement.classList.remove('hidden');
    }

    function hideLoading() {
        loadingElement.classList.add('hidden');
    }

    // 에러 표시 함수
    function showError(message) {
        errorMessage.textContent = message;
        errorContainer.classList.remove('hidden');
    }

    function hideError() {
        errorContainer.classList.add('hidden');
    }

    // 이벤트 리스너 등록
    searchBtn.addEventListener('click', fetchMealData);
    downloadBtn.addEventListener('click', downloadJSON);

    // Enter 키 입력 시 검색 실행
    yearInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') fetchMealData();
    });

    monthInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') fetchMealData();
    });
});