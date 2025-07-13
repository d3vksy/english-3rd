import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, X, ChevronRight } from 'lucide-react';
import { studyManager } from '@/lib/studyManager';
import type { StudySession } from '@/lib/studyManager';
import type { Word } from '@/lib/wordManager';
import { CompletionModal } from './CompletionModal';

interface StudySessionComponentProps {
    mode: StudySession['mode'];
    startDay: number;
    endDay: number;
    onBack: () => void;
}

export const StudySessionComponent: React.FC<StudySessionComponentProps> = ({ mode, startDay, endDay, onBack }) => {

    //@ts-ignore
    const [session, setSession] = useState<StudySession | null>(null);
    const [currentWord, setCurrentWord] = useState<Word | null>(null);
    const [options, setOptions] = useState<string[]>([]);
    const [inputAnswer, setInputAnswer] = useState('');
    const [showAnswer, setShowAnswer] = useState(false);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [progress, setProgress] = useState({ current: 0, total: 0, percentage: 0 });
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [completionData, setCompletionData] = useState({ score: 0, totalQuestions: 0 });
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const newSession = studyManager.startSession(mode, startDay, endDay);
        setSession(newSession);
        updateCurrentWord();
    }, [mode, startDay, endDay]);

    const updateCurrentWord = () => {
        const word = studyManager.getCurrentWord();
        setCurrentWord(word);

        if (mode === 'multiple-choice' && word) {
            setOptions(studyManager.getMultipleChoiceOptions());
        }

        setInputAnswer('');
        setShowAnswer(false);
        setIsCorrect(null);
        setProgress(studyManager.getProgress());

        // 주관식 모드일 때 input에 포커스
        if (mode === 'input' && inputRef.current) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    };

    const handleMultipleChoice = (answer: string) => {
        const correct = studyManager.checkMultipleChoice(answer);
        setIsCorrect(correct);

        setTimeout(() => {
            if (studyManager.isSessionComplete()) {
                // 학습 완료
                const finalSession = studyManager.getCurrentSession();
                if (finalSession) {
                    setCompletionData({
                        score: finalSession.score,
                        totalQuestions: finalSession.totalQuestions
                    });
                    setShowCompletionModal(true);
                }
            } else {
                updateCurrentWord();
            }
        }, 1500);
    };

    const handleInputSubmit = () => {
        if (!inputAnswer.trim()) return;

        const correct = studyManager.checkInput(inputAnswer);
        setIsCorrect(correct);

        setTimeout(() => {
            if (studyManager.isSessionComplete()) {
                // 학습 완료
                const finalSession = studyManager.getCurrentSession();
                if (finalSession) {
                    setCompletionData({
                        score: finalSession.score,
                        totalQuestions: finalSession.totalQuestions
                    });
                    setShowCompletionModal(true);
                }
            } else {
                updateCurrentWord();
            }
        }, 1500);
    };

    const handleFlashcardClick = () => {
        setShowAnswer(!showAnswer);
    };

    const handleFlashcardNext = () => {
        studyManager.nextWord();
        if (studyManager.isSessionComplete()) {
            const finalSession = studyManager.getCurrentSession();
            if (finalSession) {
                setCompletionData({
                    score: finalSession.totalQuestions, // 플래시카드는 모든 카드를 보면 완료
                    totalQuestions: finalSession.totalQuestions
                });
                setShowCompletionModal(true);
            }
        } else {
            updateCurrentWord();
        }
    };

    if (!currentWord) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
                    <p className="text-gray-600 mb-4">선택한 범위에 단어가 없습니다.</p>
                    <Button onClick={onBack} className="bg-blue-500 hover:bg-blue-600">
                        돌아가기
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="max-w-4xl mx-auto p-6">
                {/* 헤더 */}
                <div className="flex items-center justify-between mb-8">
                    <Button
                        onClick={onBack}
                        variant="ghost"
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                    >
                        <ArrowLeft size={20} />
                        돌아가기
                    </Button>

                    <div className="text-center">
                        <div className="text-sm text-gray-500 mb-1">
                            Day {startDay} - Day {endDay}
                        </div>
                        <div className="text-lg font-semibold text-gray-700">
                            진행률: {progress.current}/{progress.total} ({progress.percentage}%)
                        </div>
                    </div>

                    <div className="w-24"></div> {/* 균형을 위한 빈 공간 */}
                </div>

                {/* 진행률 바 */}
                <div className="mb-8">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${progress.percentage}%` }}
                        ></div>
                    </div>
                </div>

                {/* 메인 콘텐츠 */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                    {/* 영어 단어 표시 */}
                    <div className="text-center mb-8">
                        <h2 className="text-5xl font-bold text-gray-800 mb-4">{currentWord.english}</h2>
                        {mode === 'flashcard' && showAnswer && (
                            <div className="text-3xl text-blue-600 font-semibold mt-6 p-4 bg-blue-50 rounded-xl">
                                {currentWord.korean}
                            </div>
                        )}
                    </div>

                    {/* 모드별 UI */}
                    {mode === 'multiple-choice' && (
                        <div className="space-y-4">
                            {options.map((option, index) => (
                                <Button
                                    key={index}
                                    onClick={() => handleMultipleChoice(option)}
                                    disabled={isCorrect !== null}
                                    className={`w-full h-16 text-lg font-medium transition-all duration-200 ${isCorrect !== null && option === currentWord.korean
                                        ? 'bg-green-500 text-white shadow-lg scale-105'
                                        : isCorrect === false && option === inputAnswer
                                            ? 'bg-red-500 text-white shadow-lg scale-105'
                                            : 'bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 hover:border-gray-300'
                                        }`}
                                    variant="outline"
                                >
                                    {option}
                                </Button>
                            ))}

                            {isCorrect !== null && (
                                <div className={`text-center p-4 rounded-xl mt-4 ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                    <div className="flex items-center justify-center gap-2">
                                        {isCorrect ? <Check size={20} /> : <X size={20} />}
                                        <span className="font-semibold">
                                            {isCorrect ? '정답입니다!' : ` ${currentWord.korean}`}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {mode === 'input' && (
                        <div className="space-y-6">
                            <div className="relative">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputAnswer}
                                    onChange={(e) => setInputAnswer(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleInputSubmit()}
                                    placeholder="한글 뜻을 입력하세요"
                                    className="w-full p-4 text-xl border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                                    disabled={isCorrect !== null}
                                />
                            </div>

                            <Button
                                onClick={handleInputSubmit}
                                disabled={!inputAnswer.trim() || isCorrect !== null}
                                className="w-full h-14 text-lg font-semibold bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300"
                            >
                                확인
                            </Button>

                            {isCorrect !== null && (
                                <div className={`text-center p-4 rounded-xl ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                    <div className="flex items-center justify-center gap-2">
                                        {isCorrect ? <Check size={20} /> : <X size={20} />}
                                        <span className="font-semibold">
                                            {isCorrect ? '정답입니다!' : `${currentWord.korean}`}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {mode === 'flashcard' && (
                        <div className="text-center space-y-6">
                            <Button
                                onClick={handleFlashcardClick}
                                className="w-full h-48 text-2xl font-semibold bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border-2 border-purple-200 hover:border-purple-300 transition-all duration-200"
                                variant="outline"
                            >
                                {showAnswer ? '영어 단어 보기' : '한글 뜻 보기'}
                            </Button>

                            {showAnswer && (
                                <Button
                                    onClick={handleFlashcardNext}
                                    className="w-full h-14 text-lg font-semibold bg-purple-500 hover:bg-purple-600 flex items-center justify-center gap-2"
                                >
                                    다음 카드
                                    <ChevronRight size={20} />
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* 완료 모달 */}
            {showCompletionModal && (
                <CompletionModal
                    score={completionData.score}
                    totalQuestions={completionData.totalQuestions}
                    onClose={() => {
                        setShowCompletionModal(false);
                        onBack();
                    }}
                />
            )}
        </div>
    );
}; 