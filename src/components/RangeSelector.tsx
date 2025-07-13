import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { wordManager } from '@/lib/wordManager';

interface RangeSelectorProps {
    onRangeSelect: (startDay: number, endDay: number) => void;
    onClose: () => void;
}

export const RangeSelector: React.FC<RangeSelectorProps> = ({ onRangeSelect, onClose }) => {
    // 실제 로드된 Day들 가져오기
    const availableDays = wordManager.getAllDays().map(day => day.day);

    const [startDay, setStartDay] = useState(availableDays.length > 0 ? availableDays[0] : 1);
    const [endDay, setEndDay] = useState(availableDays.length > 0 ? availableDays[availableDays.length - 1] : 3);


    const handleConfirm = () => {
        if (startDay <= endDay) {
            onRangeSelect(startDay, endDay);
            onClose();
        }
    };

    const handleCancel = () => {
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    학습 범위 선택
                </h3>

                <div className="space-y-6">
                    {/* 시작 Day 선택 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            시작 Day
                        </label>
                        <div className="relative">
                            <select
                                value={startDay}
                                onChange={(e) => setStartDay(Number(e.target.value))}
                                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none appearance-none bg-white"
                            >
                                {availableDays.map(day => (
                                    <option key={day} value={day}>
                                        Day {day}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                <ChevronDown size={20} className="text-gray-400" />
                            </div>
                        </div>
                    </div>

                    {/* 끝 Day 선택 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            끝 Day
                        </label>
                        <div className="relative">
                            <select
                                value={endDay}
                                onChange={(e) => setEndDay(Number(e.target.value))}
                                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none appearance-none bg-white"
                            >
                                {availableDays.map(day => (
                                    <option key={day} value={day}>
                                        Day {day}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                <ChevronDown size={20} className="text-gray-400" />
                            </div>
                        </div>
                    </div>

                    {/* 선택된 범위 표시 */}
                    <div className="bg-blue-50 p-4 rounded-xl">
                        <div className="text-center">
                            <div className="text-sm text-blue-600 mb-1">선택된 범위</div>
                            <div className="text-lg font-semibold text-blue-800">
                                Day {startDay} - Day {endDay}
                            </div>
                            {startDay > endDay && (
                                <div className="text-red-500 text-sm mt-1">
                                    시작 Day가 끝 Day보다 클 수 없습니다
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 버튼 */}
                    <div className="flex gap-3">
                        <Button
                            onClick={handleCancel}
                            variant="outline"
                            className="flex-1 h-12 border-gray-300 hover:bg-gray-50"
                        >
                            취소
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            disabled={startDay > endDay}
                            className="flex-1 h-12 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300"
                        >
                            확인
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}; 