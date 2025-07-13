import type { Word } from './wordManager';
import { wordManager } from './wordManager';

export interface StudySession {
    mode: 'multiple-choice' | 'input' | 'flashcard';
    startDay: number;
    endDay: number;
    wordQueue: Word[]; // 큐 방식으로 단어 관리
    originalWords: Word[]; // 원본 단어 목록
    score: number;
    totalQuestions: number;
    completedQuestions: number; // 완료한 문제 수
}

class StudyManager {
    private session: StudySession | null = null;

    // 학습 세션 시작
    startSession(mode: StudySession['mode'], startDay: number, endDay: number): StudySession {
        const words = wordManager.getWordsByRange(startDay, endDay);

        this.session = {
            mode,
            startDay,
            endDay,
            wordQueue: [...words],
            originalWords: [...words],
            score: 0,
            totalQuestions: words.length,
            completedQuestions: 0
        };

        // 단어 순서 섞기
        this.shuffleQueue();

        return this.session;
    }

    // 큐 섞기
    private shuffleQueue() {
        if (!this.session) return;

        for (let i = this.session.wordQueue.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.session.wordQueue[i], this.session.wordQueue[j]] =
                [this.session.wordQueue[j], this.session.wordQueue[i]];
        }
    }

    // 현재 단어 가져오기
    getCurrentWord(): Word | null {
        if (!this.session) return null;
        return this.session.wordQueue.length > 0 ? this.session.wordQueue[0] : null;
    }

    // 객관식 선택지 생성
    getMultipleChoiceOptions(): string[] {
        if (!this.session) return [];

        const currentWord = this.getCurrentWord();
        if (!currentWord) return [];

        const allWords = wordManager.getAllWords();
        const otherWords = allWords.filter(w => w.korean !== currentWord.korean);

        // 3개의 잘못된 선택지 랜덤 선택
        const wrongOptions = this.shuffleArray(otherWords)
            .slice(0, 3)
            .map(w => w.korean);

        // 정답과 잘못된 선택지 섞기
        const options = [...wrongOptions, currentWord.korean];
        return this.shuffleArray(options);
    }

    // 배열 섞기 유틸리티
    private shuffleArray<T>(array: T[]): T[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // 단어 처리 (맞으면 제거, 틀리면 뒤로 보내기)
    private processWord(isCorrect: boolean) {
        if (!this.session) return;

        const currentWord = this.getCurrentWord();
        if (!currentWord) return;

        if (isCorrect) {
            // 맞으면 점수 증가하고 큐에서 제거
            this.session.score++;
            this.session.wordQueue.shift();
            this.session.completedQuestions++;
        } else {
            // 틀리면 큐에서 제거하고 뒤로 보내기
            this.session.wordQueue.shift();
            this.session.wordQueue.push(currentWord);
        }
    }

    // 답변 체크 (객관식)
    checkMultipleChoice(answer: string): boolean {
        if (!this.session) return false;

        const currentWord = this.getCurrentWord();
        if (!currentWord) return false;

        const isCorrect = answer === currentWord.korean;
        this.processWord(isCorrect);

        return isCorrect;
    }

    // 답변 체크 (주관식)
    checkInput(answer: string): boolean {
        if (!this.session) return false;

        const currentWord = this.getCurrentWord();
        if (!currentWord) return false;

        // 정답과 사용자 답변을 정규화 (띄어쓰기 제거, 소문자 변환)
        const normalizeAnswer = (text: string) => {
            return text.trim().toLowerCase().replace(/\s+/g, '');
        };

        const normalizedUserAnswer = normalizeAnswer(answer);
        const normalizedCorrectAnswer = normalizeAnswer(currentWord.korean);

        // 콤마로 구분된 정답들 처리
        const correctAnswers = currentWord.korean.split(',').map(ans => normalizeAnswer(ans.trim()));

        // 사용자 답변이 정답 중 하나와 일치하는지 확인
        const isCorrect = correctAnswers.some(correctAns =>
            normalizedUserAnswer === correctAns ||
            normalizedUserAnswer === normalizedCorrectAnswer
        );

        this.processWord(isCorrect);
        return isCorrect;
    }

    // 다음 단어로 이동 (플래시카드용)
    nextWord() {
        if (!this.session) return;

        // 플래시카드에서는 단어를 제거하지 않고 그냥 넘어감
        if (this.session.wordQueue.length > 0) {
            const currentWord = this.session.wordQueue[0];
            this.session.wordQueue.shift();
            this.session.wordQueue.push(currentWord);
            this.session.completedQuestions++;
        }
    }

    // 학습 세션 완료 여부
    isSessionComplete(): boolean {
        if (!this.session) return true;
        return this.session.wordQueue.length === 0;
    }

    // 현재 세션 가져오기
    getCurrentSession(): StudySession | null {
        return this.session;
    }

    // 학습 세션 종료
    endSession() {
        this.session = null;
    }

    // 진행률 계산
    getProgress(): { current: number; total: number; percentage: number } {
        if (!this.session) return { current: 0, total: 0, percentage: 0 };

        const total = this.session.totalQuestions;
        const current = this.session.completedQuestions;
        const percentage = Math.round((current / total) * 100);

        return { current, total, percentage };
    }

    // 큐 상태 정보
    getQueueInfo(): {
        queueLength: number;
    } {
        if (!this.session) return {
            queueLength: 0
        };

        return {
            queueLength: this.session.wordQueue.length
        };
    }
}

export const studyManager = new StudyManager(); 