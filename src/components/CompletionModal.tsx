import React from 'react';
import { Button } from '@/components/ui/button';
import { Trophy, CheckCircle } from 'lucide-react';

interface CompletionModalProps {
    score: number;
    totalQuestions: number;
    onClose: () => void;
}

export const CompletionModal: React.FC<CompletionModalProps> = ({ score, totalQuestions, onClose }) => {
    const accuracy = Math.round((score / totalQuestions) * 100);

    const getMessage = () => {
        if (accuracy === 100) return "완벽합니다! 🎉";
        if (accuracy >= 80) return "훌륭합니다! 👏";
        if (accuracy >= 60) return "잘 했습니다! 👍";
        return "더 노력해보세요! 💪";
    };

    const getColor = () => {
        if (accuracy === 100) return "text-green-600";
        if (accuracy >= 80) return "text-blue-600";
        if (accuracy >= 60) return "text-yellow-600";
        return "text-red-600";
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
                <div className="text-center">
                    {/* 아이콘 */}
                    <div className="mb-6">
                        {accuracy === 100 ? (
                            <Trophy size={64} className="text-yellow-500 mx-auto" />
                        ) : (
                            <CheckCircle size={64} className={`${getColor()} mx-auto`} />
                        )}
                    </div>

                    {/* 제목 */}
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">
                        학습 완료!
                    </h2>

                    {/* 메시지 */}
                    <p className="text-lg text-gray-600 mb-6">
                        {getMessage()}
                    </p>

                    {/* 결과 */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl mb-6">
                        <div className="text-2xl font-bold text-gray-800 mb-2">
                            정답률: {accuracy}%
                        </div>
                        <div className="text-gray-600">
                            {score} / {totalQuestions} 문제 정답
                        </div>
                    </div>

                    {/* 버튼 */}
                    <Button
                        onClick={onClose}
                        className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-lg font-semibold"
                    >
                        확인
                    </Button>
                </div>
            </div>
        </div>
    );
}; 