import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, AlertCircle, Crown, Send, ThumbsUp, ThumbsDown, Trash2, Award } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const Questions = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [questionText, setQuestionText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [questionsToday, setQuestionsToday] = useState(0);
    const [answers, setAnswers] = useState({}); // {questionId: [answers]}
    const [answerTexts, setAnswerTexts] = useState({}); // {questionId: text}
    const [expandedQuestions, setExpandedQuestions] = useState(new Set());

    // Daily limits based on subscription
    const limits = {
        FREE: 1,
        BRONZE: 5,
        SILVER: 10,
        GOLD: Infinity
    };

    const currentPlan = user?.subscription?.plan || 'FREE';
    const dailyLimit = limits[currentPlan];
    const canAsk = questionsToday < dailyLimit;

    useEffect(() => {
        fetchQuestions();
        fetchTodayCount();
    }, []);

    const fetchQuestions = async () => {
        try {
            const res = await api.get('/questions');
            setQuestions(res.data);
        } catch (err) {
            console.error('Failed to fetch questions:', err);
        }
    };

    const fetchAnswers = async (questionId) => {
        try {
            const res = await api.get(`/answers/${questionId}`);
            setAnswers(prev => ({ ...prev, [questionId]: res.data }));
        } catch (err) {
            console.error('Failed to fetch answers:', err);
        }
    };

    const toggleAnswers = (questionId) => {
        const newExpanded = new Set(expandedQuestions);
        if (newExpanded.has(questionId)) {
            newExpanded.delete(questionId);
        } else {
            newExpanded.add(questionId);
            if (!answers[questionId]) {
                fetchAnswers(questionId);
            }
        }
        setExpandedQuestions(newExpanded);
    };

    const fetchTodayCount = async () => {
        try {
            const res = await api.get('/questions/my-count');
            setQuestionsToday(res.data.count || 0);
        } catch (err) {
            console.error('Failed to fetch question count:', err);
        }
    };

    const handleAskQuestion = async (e) => {
        e.preventDefault();

        if (!canAsk) {
            if (window.confirm("You've reached your daily question limit. Upgrade to ask more?")) {
                navigate('/subscription');
            }
            return;
        }

        if (!questionText.trim() || questionText.length < 10) {
            setError('Question must be at least 10 characters long.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await api.post('/posts/ask', { text: questionText });
            setQuestionText('');
            setQuestionsToday(prev => prev + 1);
            fetchQuestions();
            alert('Question posted successfully!');
        } catch (err) {
            if (err.response?.status === 429) {
                setError(`Daily limit reached! Upgrade your plan to ask more questions.`);
            } else {
                setError(err.response?.data?.message || 'Failed to post question');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitAnswer = async (questionId) => {
        const answerText = answerTexts[questionId];
        if (!answerText?.trim()) return;

        try {
            await api.post(`/answers/${questionId}/answer`, { text: answerText });
            setAnswerTexts(prev => ({ ...prev, [questionId]: '' }));
            fetchAnswers(questionId);
            alert('Answer submitted! You earned 5 points! 🎉');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to submit answer');
        }
    };

    const handleUpvote = async (answerId, questionId) => {
        try {
            await api.put(`/answers/${answerId}/upvote`);
            fetchAnswers(questionId);
        } catch (err) {
            console.error('Failed to upvote:', err);
        }
    };

    const handleDownvote = async (answerId, questionId) => {
        try {
            await api.put(`/answers/${answerId}/downvote`);
            fetchAnswers(questionId);
        } catch (err) {
            console.error('Failed to downvote:', err);
        }
    };

    const handleDeleteAnswer = async (answerId, questionId) => {
        if (!window.confirm('Delete this answer? You will lose 5 points.')) return;

        try {
            await api.delete(`/answers/${answerId}`);
            fetchAnswers(questionId);
            alert('Answer deleted. 5 points deducted.');
        } catch (err) {
            alert('Failed to delete answer');
        }
    };

    const getPlanColor = (plan) => {
        const colors = {
            FREE: '#94a3b8',
            BRONZE: '#cd7f32',
            SILVER: '#c0c0c0',
            GOLD: '#ffd700'
        };
        return colors[plan] || '#94a3b8';
    };

    return (
        <div className="container">
            <div className="sidebar-layout">
                <main style={{ minWidth: 0 }}>
                    <h1 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <MessageSquare size={32} />
                        Community Questions
                    </h1>

                    {/* Ask Question Form */}
                    <div className="card" style={{ marginBottom: '2rem', padding: '1rem' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Ask a Question</h3>

                        <form onSubmit={handleAskQuestion}>
                            <textarea
                                className="input-field"
                                placeholder="What would you like to know? (minimum 10 characters)"
                                rows="4"
                                value={questionText}
                                onChange={(e) => setQuestionText(e.target.value)}
                                disabled={!canAsk || loading}
                                style={{ resize: 'vertical', marginBottom: '1rem' }}
                            />

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                                    {questionText.length}/500 characters
                                </span>

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loading || (!canAsk && false)} // Keep enabled to allow click for redirect
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    <Send size={18} />
                                    {loading ? 'Posting...' : 'Ask Question'}
                                </button>
                            </div>

                            {error && (
                                <div style={{
                                    marginTop: '1rem',
                                    padding: '1rem',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid #ef4444',
                                    borderRadius: '0.5rem',
                                    color: '#fca5a5',
                                    display: 'flex',
                                    gap: '0.5rem'
                                }}>
                                    <AlertCircle size={20} />
                                    <span>{error}</span>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Questions Feed */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {questions.length === 0 ? (
                            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                                <MessageSquare size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                                <p style={{ color: '#94a3b8' }}>No questions yet. Be the first to ask!</p>
                            </div>
                        ) : (
                            questions.map(q => (
                                <div key={q._id} className="card">
                                    {/* Question Header */}
                                    <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 'bold'
                                        }}>
                                            {q.user?.name?.[0] || 'U'}
                                        </div>
                                        <div>
                                            <h4 style={{ margin: 0 }}>{q.user?.name || 'Anonymous'}</h4>
                                            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                                {new Date(q.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Question Text */}
                                    <div style={{ padding: '0 16px' }}>
                                        <p style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '1rem' }}>
                                            {q.text}
                                        </p>
                                    </div>

                                    {/* Answer Toggle */}
                                    <div className="card-footer">
                                        <button
                                            onClick={() => toggleAnswers(q._id)}
                                            className="btn btn-outline"
                                            style={{ width: '100%' }}
                                        >
                                            {expandedQuestions.has(q._id) ? 'Hide Answers' : 'View Answers'}
                                        </button>
                                    </div>

                                    {/* Answers Section */}
                                    {expandedQuestions.has(q._id) && (
                                        <div style={{ borderTop: '1px solid #262626', paddingTop: '1rem', marginTop: '0', padding: '16px' }}>
                                            {/* Answer Input */}
                                            <div style={{ marginBottom: '1.5rem' }}>
                                                <textarea
                                                    className="input-field"
                                                    placeholder="Write your answer..."
                                                    rows="3"
                                                    value={answerTexts[q._id] || ''}
                                                    onChange={(e) => setAnswerTexts(prev => ({ ...prev, [q._id]: e.target.value }))}
                                                    style={{ marginBottom: '0.5rem' }}
                                                />
                                                <button
                                                    onClick={() => handleSubmitAnswer(q._id)}
                                                    className="btn btn-primary"
                                                    disabled={!answerTexts[q._id]?.trim()}
                                                    style={{ width: '100%' }}
                                                >
                                                    Submit Answer (+5 points)
                                                </button>
                                            </div>

                                            {/* Answers List */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                {answers[q._id]?.length === 0 && (
                                                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center' }}>
                                                        No answers yet. Be the first to answer!
                                                    </p>
                                                )}
                                                {answers[q._id]?.map(answer => (
                                                    <div key={answer._id} style={{
                                                        background: '#262626',
                                                        padding: '1rem',
                                                        borderRadius: '0.5rem',
                                                        border: '1px solid #404040'
                                                    }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                <span style={{ fontWeight: 'bold', color: '#e2e8f0' }}>
                                                                    {answer.user?.name || 'Anonymous'}
                                                                </span>
                                                                {answer.bonusAwarded && (
                                                                    <Award size={16} style={{ color: '#fbbf24' }} title="Earned 5 bonus points!" />
                                                                )}
                                                            </div>
                                                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                                                {new Date(answer.createdAt).toLocaleString()}
                                                            </span>
                                                        </div>

                                                        <p style={{ margin: '0.5rem 0', color: '#cbd5e1' }}>
                                                            {answer.text}
                                                        </p>

                                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.75rem' }}>
                                                            <button
                                                                onClick={() => handleUpvote(answer._id, q._id)}
                                                                style={{
                                                                    background: answer.upvotes?.includes(user?.id) ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                                                                    border: '1px solid #10b981',
                                                                    color: '#10b981',
                                                                    padding: '0.25rem 0.5rem',
                                                                    borderRadius: '0.25rem',
                                                                    cursor: 'pointer',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '0.25rem',
                                                                    fontSize: '0.85rem'
                                                                }}
                                                            >
                                                                <ThumbsUp size={14} />
                                                                {answer.upvotes?.length || 0}
                                                            </button>

                                                            <button
                                                                onClick={() => handleDownvote(answer._id, q._id)}
                                                                style={{
                                                                    background: answer.downvotes?.includes(user?.id) ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                                                                    border: '1px solid #ef4444',
                                                                    color: '#ef4444',
                                                                    padding: '0.25rem 0.5rem',
                                                                    borderRadius: '0.25rem',
                                                                    cursor: 'pointer',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '0.25rem',
                                                                    fontSize: '0.85rem'
                                                                }}
                                                            >
                                                                <ThumbsDown size={14} />
                                                                {answer.downvotes?.length || 0}
                                                            </button>

                                                            {answer.user?._id === user?.id && (
                                                                <button
                                                                    onClick={() => handleDeleteAnswer(answer._id, q._id)}
                                                                    style={{
                                                                        background: 'transparent',
                                                                        border: '1px solid #f87171',
                                                                        color: '#f87171',
                                                                        padding: '0.25rem 0.5rem',
                                                                        borderRadius: '0.25rem',
                                                                        cursor: 'pointer',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '0.25rem',
                                                                        fontSize: '0.85rem',
                                                                        marginLeft: 'auto'
                                                                    }}
                                                                >
                                                                    <Trash2 size={14} />
                                                                    Delete
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </main>

                <aside>
                    {/* Subscription Status */}
                    <div className="card" style={{ position: 'sticky', top: '100px', padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <Crown size={20} style={{ color: getPlanColor(currentPlan) }} />
                            <h3>Your Plan</h3>
                        </div>

                        <div style={{
                            background: '#262626',
                            padding: '1rem',
                            borderRadius: '0.5rem',
                            marginBottom: '1rem'
                        }}>
                            <div style={{
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                color: getPlanColor(currentPlan),
                                marginBottom: '0.5rem'
                            }}>
                                {currentPlan}
                            </div>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8' }}>
                                {dailyLimit === Infinity ? 'Unlimited' : `${dailyLimit} questions/day`}
                            </p>
                        </div>

                        {/* Daily Usage */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Today's Usage</span>
                                <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                                    {questionsToday}/{dailyLimit === Infinity ? '∞' : dailyLimit}
                                </span>
                            </div>
                            <div style={{
                                width: '100%',
                                height: '8px',
                                background: '#262626',
                                borderRadius: '4px',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    width: dailyLimit === Infinity ? '100%' : `${(questionsToday / dailyLimit) * 100}%`,
                                    height: '100%',
                                    background: canAsk ? 'linear-gradient(90deg, #8b5cf6, #ec4899)' : '#ef4444',
                                    transition: 'width 0.3s ease'
                                }} />
                            </div>
                        </div>

                        {!canAsk && currentPlan !== 'GOLD' && (
                            <Link to="/subscription" className="btn btn-primary" style={{ width: '100%', textAlign: 'center' }}>
                                Upgrade Plan
                            </Link>
                        )}

                        {currentPlan === 'FREE' && (
                            <div style={{
                                marginTop: '1rem',
                                padding: '1rem',
                                background: '#262626',
                                border: '1px solid #fbbf24',
                                borderRadius: '0.5rem',
                                fontSize: '0.85rem'
                            }}>
                                <p style={{ margin: 0, color: '#fcd34d' }}>
                                    💡 Upgrade to ask more questions daily!
                                </p>
                            </div>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default Questions;
