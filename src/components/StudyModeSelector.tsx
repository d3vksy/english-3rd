import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { StudyMode } from '@/lib/wordManager';
import { BookOpen, Edit3, CreditCard } from 'lucide-react';
import { RangeSelector } from './RangeSelector';

interface StudyModeSelectorProps {
    onModeSelect: (mode: StudyMode, startDay: number, endDay: number) => void;
    selectedDay: number;
}
//@ts-ignore
export const StudyModeSelector: React.FC<StudyModeSelectorProps> = ({ onModeSelect, selectedDay }) => {
    const [showRangeSelector, setShowRangeSelector] = useState(false);
    const [selectedMode, setSelectedMode] = useState<StudyMode | null>(null);

    const handleModeSelect = (mode: StudyMode) => {
        setSelectedMode(mode);
        setShowRangeSelector(true);
    };

    const handleRangeSelect = (startDay: number, endDay: number) => {
        if (selectedMode) {
            onModeSelect(selectedMode, startDay, endDay);
        }
    };

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <Button
                    onClick={() => handleModeSelect('multiple-choice')}
                    className="h-32 flex flex-col items-center justify-center gap-4 text-lg bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-2 border-blue-200 hover:border-blue-300 transition-all duration-200"
                    variant="outline"
                >
                    <div className="p-3 bg-blue-500 rounded-full">
                        <BookOpen size={32} className="text-white" />
                    </div>
                    <div className="text-center">
                        <div className="font-semibold text-blue-800">객관식 퀴즈</div>
                        <div className="text-sm text-blue-600">4개 선택지 중 정답 선택</div>
                    </div>
                </Button>

                <Button
                    onClick={() => handleModeSelect('input')}
                    className="h-32 flex flex-col items-center justify-center gap-4 text-lg bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border-2 border-green-200 hover:border-green-300 transition-all duration-200"
                    variant="outline"
                >
                    <div className="p-3 bg-green-500 rounded-full">
                        <Edit3 size={32} className="text-white" />
                    </div>
                    <div className="text-center">
                        <div className="font-semibold text-green-800">주관식 퀴즈</div>
                        <div className="text-sm text-green-600">한글 뜻을 직접 입력</div>
                    </div>
                </Button>

                <Button
                    onClick={() => handleModeSelect('flashcard')}
                    className="h-32 flex flex-col items-center justify-center gap-4 text-lg bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border-2 border-purple-200 hover:border-purple-300 transition-all duration-200"
                    variant="outline"
                >
                    <div className="p-3 bg-purple-500 rounded-full">
                        <CreditCard size={32} className="text-white" />
                    </div>
                    <div className="text-center">
                        <div className="font-semibold text-purple-800">플래시카드</div>
                        <div className="text-sm text-purple-600">카드 클릭으로 학습</div>
                    </div>
                </Button>
            </div>

            {showRangeSelector && (
                <RangeSelector
                    onRangeSelect={handleRangeSelect}
                    onClose={() => setShowRangeSelector(false)}
                />
            )}
        </>
    );
}; 