export interface Word {
    english: string;
    korean: string;
}

export interface Day {
    day: number;
    words: Word[];
}

export interface WordData {
    days: Day[];
}

export type StudyMode = 'multiple-choice' | 'input' | 'flashcard';

class WordManager {
    private data: WordData | null = null;
    private maxDays = 15; // 최대 Day 수

    // 기본 JSON 파일들 로드 (분할된 파일들)
    async loadDefaultWords(): Promise<WordData> {
        try {
            const days: Day[] = [];

            // 각 Day별 파일을 순차적으로 로드
            for (let day = 1; day <= this.maxDays; day++) {
                try {
                    const response = await fetch(`/words/day${day}.json`);
                    if (response.ok) {
                        const dayData: Day = await response.json();
                        days.push(dayData);
                    } else {
                        // 파일이 없으면 해당 Day는 건너뛰기
                        console.log(`Day ${day} 파일이 없습니다.`);
                        break;
                    }
                } catch (error) {
                    // 파일 로드 실패 시 해당 Day에서 중단
                    console.log(`Day ${day} 로드 실패:`, error);
                    break;
                }
            }

            this.data = { days };
            this.saveToLocal();
            return this.data;
        } catch (error) {
            console.error('기본 단어장 로드 실패:', error);
            return this.getEmptyData();
        }
    }

    // 로컬에서 로드
    loadFromLocal(): WordData {
        const data = localStorage.getItem('wordData');
        this.data = data ? JSON.parse(data) : this.getEmptyData();
        return this.data!;
    }

    // 로컬에 저장
    saveToLocal() {
        if (this.data) {
            localStorage.setItem('wordData', JSON.stringify(this.data));
        }
    }

    // 특정 범위의 단어들 가져오기
    getWordsByRange(startDay: number, endDay: number): Word[] {
        if (!this.data) return [];

        const words: Word[] = [];
        for (let day = startDay; day <= endDay; day++) {
            const dayData = this.data.days.find(d => d.day === day);
            if (dayData) {
                words.push(...dayData.words);
            }
        }
        return words;
    }

    // 모든 단어들 가져오기 (다른 선택지용)
    getAllWords(): Word[] {
        if (!this.data) return [];
        return this.data.days.flatMap(day => day.words);
    }

    // 모든 Day 목록 가져오기
    getAllDays(): Day[] {
        return this.data?.days || [];
    }

    // Day에 단어 추가
    addWordToDay(day: number, word: Word): boolean {
        if (!this.data) {
            this.data = this.getEmptyData();
        }

        let dayData = this.data.days.find(d => d.day === day);
        if (!dayData) {
            dayData = { day, words: [] };
            this.data.days.push(dayData);
        }

        dayData.words.push(word);
        this.saveToLocal();
        return true;
    }

    // Day에서 단어 삭제
    removeWordFromDay(day: number, english: string): boolean {
        if (!this.data) return false;

        const dayData = this.data.days.find(d => d.day === day);
        if (!dayData) return false;

        const index = dayData.words.findIndex(w => w.english === english);
        if (index === -1) return false;

        dayData.words.splice(index, 1);
        this.saveToLocal();
        return true;
    }

    // JSON 파일로 내보내기 (분할된 형태로)
    exportToFile(): void {
        if (!this.data) return;

        // 각 Day별로 개별 파일 다운로드
        this.data.days.forEach(dayData => {
            const exportData = {
                ...dayData,
                exportDate: new Date().toISOString(),
                totalWords: dayData.words.length
            };

            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });

            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `day${dayData.day}.json`;
            link.click();
        });
    }

    // 빈 데이터 구조
    private getEmptyData(): WordData {
        return {
            days: []
        };
    }

    // 현재 데이터 가져오기
    getCurrentData(): WordData | null {
        return this.data;
    }

    // 특정 Day 파일만 로드
    async loadDayFile(day: number): Promise<Day | null> {
        try {
            const response = await fetch(`/words/day${day}.json`);
            if (response.ok) {
                return await response.json();
            }
            return null;
        } catch (error) {
            console.error(`Day ${day} 파일 로드 실패:`, error);
            return null;
        }
    }
}

export const wordManager = new WordManager(); 