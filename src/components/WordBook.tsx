import React, { useState, useEffect } from 'react';
import { wordManager, type Day } from '@/lib/wordManager';
import type { StudyMode } from '@/lib/wordManager';
import { Button } from '@/components/ui/button';
import { Download, BookOpen, Settings } from 'lucide-react';
import { StudyModeSelector } from './StudyModeSelector';
import { StudySessionComponent } from './StudySession';

export const WordBook: React.FC = () => {
    const [days, setDays] = useState<Day[]>([]);
    const [selectedDay, setSelectedDay] = useState<number>(1);
    const [isLoading, setIsLoading] = useState(true);
    const [showStudyMode, setShowStudyMode] = useState(false);
    const [studyConfig, setStudyConfig] = useState<{
        mode: StudyMode;
        startDay: number;
        endDay: number;
    } | null>(null);

    useEffect(() => {
        initializeWords();
    }, []);

    const initializeWords = async () => {
        setIsLoading(true);
        try {
            // 항상 words 폴더에서 최신 파일을 불러옴
            await wordManager.loadDefaultWords();
            const currentData = wordManager.getCurrentData();
            if (currentData) {
                setDays(currentData.days);
                // 첫 번째 Day를 기본 선택으로 설정
                if (currentData.days.length > 0) {
                    setSelectedDay(currentData.days[0].day);
                }
            }
        } catch (error) {
            console.error('단어장 초기화 실패:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStudyModeSelect = (mode: StudyMode, startDay: number, endDay: number) => {
        setStudyConfig({ mode, startDay, endDay });
        setShowStudyMode(true);
    };

    const handleExport = () => {
        wordManager.exportToFile();
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">단어장을 불러오는 중...</p>
                </div>
            </div>
        );
    }

    if (showStudyMode && studyConfig) {
        return (
            <StudySessionComponent
                mode={studyConfig.mode}
                startDay={studyConfig.startDay}
                endDay={studyConfig.endDay}
                onBack={() => {
                    setShowStudyMode(false);
                    setStudyConfig(null);
                }}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="max-w-6xl mx-auto p-6">
                {/* 헤더 */}
                <div className="flex justify-between items-center mb-8">
                    <div className="flex gap-3">
                        <Button
                            onClick={() => setShowStudyMode(true)}
                            className="bg-blue-500 hover:bg-blue-600 flex items-center gap-2 px-6 py-3"
                        >
                            <BookOpen size={20} />
                            학습하기
                        </Button>
                        <Button
                            onClick={handleExport}
                            variant="outline"
                            className="flex items-center gap-2 px-6 py-3 border-gray-300 hover:bg-gray-50"
                        >
                            <Download size={20} />
                            JSON 다운로드
                        </Button>
                    </div>
                </div>

                {showStudyMode ? (
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-800 mb-4">학습 모드 선택</h2>
                            <p className="text-gray-600 mb-6">
                                학습할 모드를 선택하면 범위를 지정할 수 있습니다.
                            </p>
                        </div>

                        <StudyModeSelector onModeSelect={handleStudyModeSelect} selectedDay={selectedDay} />

                        <div className="text-center mt-8">
                            <Button
                                onClick={() => setShowStudyMode(false)}
                                variant="ghost"
                                className="text-gray-600 hover:text-gray-800"
                            >
                                돌아가기
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Day 선택 탭 */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Day 선택</h2>
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {days.map(dayData => (
                                    <Button
                                        key={dayData.day}
                                        onClick={() => setSelectedDay(dayData.day)}
                                        variant={selectedDay === dayData.day ? "default" : "outline"}
                                        className={`min-w-[80px] h-12 font-medium ${selectedDay === dayData.day
                                            ? 'bg-blue-500 hover:bg-blue-600'
                                            : 'border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        Day {dayData.day}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* 선택된 Day의 단어들 */}
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">Day {selectedDay}</h2>
                                <div className="text-sm text-gray-500">
                                    {days.find(d => d.day === selectedDay)?.words.length || 0}개 단어
                                </div>
                            </div>

                            <div className="grid gap-4">
                                {days
                                    .find(d => d.day === selectedDay)?.words.map((word, index) => (
                                        <div
                                            key={index}
                                            className="flex justify-between items-center p-6 border-2 border-gray-100 rounded-xl hover:border-gray-200 transition-colors bg-gray-50 hover:bg-gray-100"
                                        >
                                            <div className="flex-1">
                                                <div className="text-2xl font-bold text-gray-800 mb-2">{word.english}</div>
                                                <div className="text-lg text-gray-600">{word.korean}</div>
                                            </div>
                                            <div className="text-sm text-gray-400 ml-4">
                                                #{index + 1}
                                            </div>
                                        </div>
                                    )) || []}
                            </div>

                            {!days.find(d => d.day === selectedDay)?.words.length && (
                                <div className="text-center py-16">
                                    <div className="text-gray-400 mb-4">
                                        <Settings size={48} className="mx-auto" />
                                    </div>
                                    <p className="text-gray-500 text-lg mb-2">Day {selectedDay}에 단어가 없습니다.</p>
                                    <p className="text-gray-400">다른 Day를 선택하거나 JSON 파일을 업로드해보세요.</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}; 