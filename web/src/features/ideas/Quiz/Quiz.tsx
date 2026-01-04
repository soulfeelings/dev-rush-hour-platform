import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../../ui/Button'
import styles from './Quiz.module.scss'

const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
)

export default function Quiz() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [quizStep, setQuizStep] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState({
    purpose: '',
    budget: '',
    bedrooms: '',
    propertyType: '',
    status: '',
  })

  const quizQuestions = [
    {
      id: 'purpose',
      question: t('home.quiz.questions.purpose.question'),
      options: [
        {
          value: 'investment',
          label: t('home.quiz.questions.purpose.investment'),
          image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop',
        },
        {
          value: 'living',
          label: t('home.quiz.questions.purpose.living'),
          image:
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
        },
      ],
    },
    {
      id: 'budget',
      question: t('home.quiz.questions.budget.question'),
      options: [
        {
          value: '0-1m',
          label: t('home.quiz.questions.budget.under1m'),
          image:
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop',
        },
        {
          value: '1-2m',
          label: t('home.quiz.questions.budget.1to2m'),
          image:
            'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
        },
        {
          value: '2-5m',
          label: t('home.quiz.questions.budget.2to5m'),
          image:
            'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800&h=600&fit=crop',
        },
        {
          value: '5m+',
          label: t('home.quiz.questions.budget.5mPlus'),
          image:
            'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop',
        },
      ],
    },
    {
      id: 'bedrooms',
      question: t('home.quiz.questions.bedrooms.question'),
      options: [
        {
          value: 'studio',
          label: t('home.quiz.questions.bedrooms.studio'),
          image:
            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
        },
        {
          value: '1',
          label: t('home.quiz.questions.bedrooms.one'),
          image:
            'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
        },
        {
          value: '2',
          label: t('home.quiz.questions.bedrooms.two'),
          image:
            'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=600&fit=crop',
        },
        {
          value: '3',
          label: t('home.quiz.questions.bedrooms.three'),
          image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
        },
        {
          value: '4+',
          label: t('home.quiz.questions.bedrooms.fourPlus'),
          image:
            'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop',
        },
      ],
    },
    {
      id: 'propertyType',
      question: t('home.quiz.questions.propertyType.question'),
      options: [
        {
          value: 'primary',
          label: t('home.quiz.questions.propertyType.primary'),
          image:
            'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop',
        },
        {
          value: 'secondary',
          label: t('home.quiz.questions.propertyType.secondary'),
          image:
            'https://images.unsplash.com/photo-1600585154084-4e5f7b98b5a3?w=800&h=600&fit=crop',
        },
      ],
    },
    {
      id: 'status',
      question: t('home.quiz.questions.status.question'),
      options: [
        {
          value: 'ready',
          label: t('home.quiz.questions.status.ready'),
          image:
            'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
        },
        {
          value: 'construction',
          label: t('home.quiz.questions.status.construction'),
          image:
            'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=600&fit=crop',
        },
        {
          value: 'planning',
          label: t('home.quiz.questions.status.planning'),
          image:
            'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop',
        },
      ],
    },
  ]

  const handleQuizAnswer = (questionId: string, value: string) => {
    setQuizAnswers(prev => ({ ...prev, [questionId]: value }))
    if (quizStep < quizQuestions.length - 1) {
      setTimeout(() => setQuizStep(prev => prev + 1), 300)
    }
  }

  const handleQuizComplete = () => {
    const params = new URLSearchParams()
    if (quizAnswers.budget) params.set('price', quizAnswers.budget)
    if (quizAnswers.bedrooms) params.set('bedrooms', quizAnswers.bedrooms)
    if (quizAnswers.propertyType) params.set('type', quizAnswers.propertyType)
    if (quizAnswers.status) params.set('status', quizAnswers.status)
    if (quizAnswers.purpose) params.set('purpose', quizAnswers.purpose)

    navigate(`/catalog?${params.toString()}`)
  }

  const currentQuestion = quizQuestions[quizStep]
  const progress = ((quizStep + 1) / quizQuestions.length) * 100
  const isLastStep = quizStep === quizQuestions.length - 1
  const canProceed = quizAnswers[currentQuestion.id as keyof typeof quizAnswers] !== ''

  return (
    <section className={styles.search}>
      <div className={styles.quizCard}>
        <h2 className={styles.quizTitle}>{t('home.quiz.title')}</h2>
        <p className={styles.quizSubtitle}>{t('home.quiz.subtitle')}</p>

        {/* Progress Bar */}
        <div className={styles.quizProgress}>
          <div className={styles.quizProgressBar} style={{ width: `${progress}%` }} />
        </div>
        <div className={styles.quizProgressText}>
          {t('home.quiz.question')} {quizStep + 1} {t('home.quiz.of')} {quizQuestions.length}
        </div>

        {/* Question */}
        <div className={styles.quizQuestion}>
          <h3 className={styles.quizQuestionTitle}>{currentQuestion.question}</h3>
          <div className={styles.quizOptions}>
            {currentQuestion.options.map(option => {
              const isSelected =
                quizAnswers[currentQuestion.id as keyof typeof quizAnswers] === option.value
              return (
                <div
                  key={option.value}
                  role="button"
                  tabIndex={0}
                  className={`${styles.quizOption} ${isSelected ? styles.quizOptionSelected : ''}`}
                  onClick={() => handleQuizAnswer(currentQuestion.id, option.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleQuizAnswer(currentQuestion.id, option.value)
                    }
                  }}
                  style={{
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${option.image})`,
                  }}
                >
                  <span className={styles.quizOptionText}>{option.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className={styles.quizNavigation}>
          {quizStep > 0 && (
            <Button variant="ghost" onClick={() => setQuizStep(prev => prev - 1)}>
              {t('home.quiz.back')}
            </Button>
          )}
          {isLastStep && canProceed && (
            <Button onClick={handleQuizComplete}>
              {t('home.quiz.findProperties')} <IconSearch />
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}
