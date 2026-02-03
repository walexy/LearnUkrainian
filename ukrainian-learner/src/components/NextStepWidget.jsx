import { Link } from 'react-router-dom'
import useProgressStore from '../stores/useProgressStore'

const stepConfigs = {
  'choose-path': {
    title: 'Welcome! Choose Your Path',
    description: 'Both paths lead to fluency. Pick what feels right today.',
    options: [
      {
        label: 'Start with Listening',
        sublabel: 'Jump straight into comprehensible input',
        path: '/listening',
        icon: '🎧',
        preferredPath: 'listening-first',
      },
      {
        label: 'Learn Letters First',
        sublabel: 'Master the Cyrillic alphabet',
        path: '/cyrillic',
        icon: '🔤',
        preferredPath: 'alphabet-first',
      },
    ],
  },
  'continue-alphabet': {
    title: 'Continue Your Alphabet Journey',
    icon: '🔤',
    path: '/cyrillic',
    buttonLabel: 'Practice Letters',
  },
  'try-listening': {
    title: 'Ready to Apply Your Knowledge',
    description: 'You know some letters - time to hear them in context!',
    icon: '🎧',
    path: '/listening',
    buttonLabel: 'Explore Content',
  },
  'continue-listening': {
    title: 'Keep Building Input',
    icon: '🎧',
    path: '/listening',
    buttonLabel: 'Listen More',
  },
  'add-alphabet': {
    title: 'Enhance Your Listening',
    description: 'Learning letters helps you connect sounds to written forms.',
    icon: '🔤',
    path: '/cyrillic',
    buttonLabel: 'Learn Letters',
  },
  'balance-practice': {
    title: 'Balance Your Practice',
    icon: '⚖️',
    path: '/cyrillic',
    buttonLabel: 'Practice Letters',
  },
  'balance-listening': {
    title: 'Balance Your Practice',
    icon: '⚖️',
    path: '/listening',
    buttonLabel: 'Add Listening Time',
  },
  'advance-tier': {
    title: 'Ready for Harder Content',
    description: 'Your comprehension is strong - try more challenging material!',
    icon: '🚀',
    path: '/listening',
    buttonLabel: 'Level Up',
  },
  'keep-going': {
    title: 'You\'re Doing Great!',
    description: 'Keep up the consistent practice.',
    icon: '✨',
    path: '/dashboard',
    buttonLabel: 'View Progress',
  },
}

function NextStepWidget({ compact = false }) {
  const { getNextStep, completeWelcome, onboarding } = useProgressStore()

  const step = getNextStep()
  const config = stepConfigs[step.action] || stepConfigs['keep-going']

  // For the choose-path step, render special UI with two options
  if (step.action === 'choose-path') {
    const handleChoosePath = (preferredPath, path) => {
      completeWelcome(preferredPath)
      // Navigation will happen via Link
    }

    return (
      <div className={`card ${compact ? 'p-4' : ''}`}>
        <h2 className={`font-bold ${compact ? 'text-lg' : 'text-xl'} mb-2`}>
          {config.title}
        </h2>
        <p className="text-sm text-gray-600 mb-4">{config.description}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {config.options.map((option) => (
            <Link
              key={option.path}
              to={option.path}
              onClick={() => handleChoosePath(option.preferredPath, option.path)}
              className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-ukrainian-blue/10 rounded-xl border-2 border-transparent hover:border-ukrainian-blue/30 transition-all group"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">
                {option.icon}
              </span>
              <div>
                <div className="font-medium text-gray-900">{option.label}</div>
                <div className="text-sm text-gray-500">{option.sublabel}</div>
              </div>
            </Link>
          ))}
        </div>

        <p className="text-xs text-gray-400 text-center mt-4">
          Don't worry - you can switch anytime. Both skills reinforce each other!
        </p>
      </div>
    )
  }

  // Regular step with single action
  return (
    <div className={`card ${compact ? 'p-4' : ''}`}>
      <div className="flex items-start gap-4">
        <span className="text-3xl">{config.icon}</span>
        <div className="flex-1">
          <h2 className={`font-bold ${compact ? 'text-lg' : 'text-xl'}`}>
            {config.title}
          </h2>
          {step.detail && (
            <p className="text-sm text-gray-600 mt-1">{step.detail}</p>
          )}
          {config.description && !step.detail && (
            <p className="text-sm text-gray-600 mt-1">{config.description}</p>
          )}

          <Link
            to={config.path}
            className="btn btn-primary inline-block mt-3"
          >
            {config.buttonLabel}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NextStepWidget
