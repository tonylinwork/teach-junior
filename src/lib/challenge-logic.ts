import { useState, useCallback } from 'react';
import { Question, QuizData } from '../types';

/**
 * 闖關模式狀態介面
 */
export interface GameState {
    hp: number;
    score: number;
    combo: number;
    maxCombo: number;
    currentLevel: number;
    questionIndex: number; // Added questionIndex
    isGameOver: boolean;
    isFinished: boolean;
    startTime: number;
    xp: number;
    maxXp: number;
    history: {
        question: Question;
        userAnswer: string;
        isCorrect: boolean;
    }[];
}

/**
 * 題庫載入工具：使用 Vite 的 import.meta.glob 動態彙整資料夾內所有 JSON
 */
export const fetchAllQuestions = async (): Promise<Question[]> => {
    // 取得所有 data/*.json 檔案（排除 chapters.json 與 summaryData.json）
    const modules = import.meta.glob('../data/*.json');
    const allQuestions: Question[] = [];

    for (const path in modules) {
        if (path.includes('chapters.json') || path.includes('summaryData.json')) continue;

        try {
            const module = await modules[path]() as { default: QuizData };
            const quizData = module.default;

            if (quizData && quizData.sections) {
                quizData.sections.forEach(section => {
                    section.questions.forEach(q => {
                        // 為闖關模式注入來源資訊，方便追蹤
                        allQuestions.push({
                            ...q,
                            id: `${path.split('/').pop()?.replace('.json', '')}_${q.id}`,
                            type: section.type
                        });
                    });
                });
            }
        } catch (error) {
            console.error(`Failed to load questions from ${path}:`, error);
        }
    }

    // 洗牌演算法 (Fisher-Yates Shuffle)
    for (let i = allQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
    }

    return allQuestions;
};

/**
 * 闖關模式核心邏輯 Hook
 */
export const useChallengeGame = () => {
    const [gameState, setGameState] = useState<GameState>({
        hp: 3,
        score: 0,
        combo: 0,
        maxCombo: 0,
        currentLevel: 1,
        questionIndex: 0, // Initialized questionIndex
        isGameOver: false,
        isFinished: false,
        startTime: Date.now(),
        xp: 0,
        maxXp: 100,
        history: []
    });

    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const initGame = useCallback(async () => {
        setIsLoading(true);
        const allQuestions = await fetchAllQuestions();
        setQuestions(allQuestions);
        setGameState({
            hp: 3,
            score: 0,
            combo: 0,
            maxCombo: 0,
            currentLevel: 1,
            questionIndex: 0, // Initialized questionIndex
            isGameOver: false,
            isFinished: false,
            startTime: Date.now(),
            xp: 0,
            maxXp: 100,
            history: []
        });
        setIsLoading(false);
    }, []);

    const processAnswer = useCallback((isCorrect: boolean, userAnswer: string) => {
        setGameState(prev => {
            if (prev.isGameOver || prev.isFinished) return prev;

            const currentQuestion = questions[prev.currentLevel - 1];
            const newHistory = [...prev.history, { question: currentQuestion, userAnswer, isCorrect }];

            let newHp = prev.hp;
            let newScore = prev.score;
            let newCombo = prev.combo;
            let newMaxCombo = prev.maxCombo;
            let newLevel = prev.currentLevel;
            let newQuestionIndex = prev.questionIndex + 1;
            let newXp = prev.xp;
            let newMaxXp = prev.maxXp;
            let newIsGameOver = false;

            if (isCorrect) {
                newCombo += 1;
                newMaxCombo = Math.max(newMaxCombo, newCombo);
                // 基礎分 100 + 連擊加乘 (每 5 combo 多 20%)
                const multiplier = 1 + Math.floor(newCombo / 5) * 0.2;
                newScore += Math.round(100 * multiplier);

                // 經驗值逻辑：每題增加 25 ~ 40 隨機 XP (基礎獎勵)
                const gainedXp = 25 + Math.floor(Math.random() * 15);
                newXp += gainedXp;

                // 升級邏輯：XP 滿了才升級
                while (newXp >= newMaxXp) {
                    newXp -= newMaxXp;
                    newLevel += 1;
                    // 每級所需 XP 略微增加 (每次多 10%)
                    newMaxXp = Math.floor(newMaxXp * 1.1);
                }

                // 回半顆心，上限 5
                newHp = Math.min(5, newHp + 0.5);
            } else {
                newHp -= 1;
                newCombo = 0;
                if (newHp <= 0) {
                    newHp = 0; // 確保不會變負數
                    newIsGameOver = true;
                }
                // 答錯不升級，也不扣 XP
            }

            return {
                ...prev,
                hp: newHp,
                score: newScore,
                combo: newCombo,
                maxCombo: newMaxCombo,
                currentLevel: newLevel,
                questionIndex: newQuestionIndex,
                xp: newXp,
                maxXp: newMaxXp,
                isGameOver: newIsGameOver,
                history: newHistory
            };
        });
    }, [questions]);

    const finishGame = useCallback(() => {
        setGameState(prev => ({ ...prev, isGameOver: true }));
    }, []);

    return {
        gameState,
        questions,
        isLoading,
        initGame,
        processAnswer,
        finishGame
    };
};
