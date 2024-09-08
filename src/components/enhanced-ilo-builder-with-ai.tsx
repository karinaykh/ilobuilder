import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import { HelpCircle, RefreshCw, Copy, CheckCircle, Wand2, Lightbulb, Info } from 'lucide-react';

interface ILO {
  audience: string;
  behavior: {
    level: string;
    verb: string;
    task: string;
    verbAndTask: string;
  };
  condition: string;
  degree: string;
}

type VerbLevel = 'Remembering' | 'Understanding' | 'Applying' | 'Analyzing' | 'Evaluating' | 'Creating';

const EnhancedILOBuilderWithAI: React.FC = () => {
  const [step, setStep] = useState(0);
  const [ilo, setIlo] = useState<ILO>({
    audience: '',
    behavior: { level: '', verb: '', task: '', verbAndTask: '' },
    condition: '',
    degree: ''
  });
  const [showTips, setShowTips] = useState(false);
  const [copied, setCopied] = useState(false);
  const [enhancedILO, setEnhancedILO] = useState('');
  const iloRef = useRef<HTMLDivElement>(null);

  const steps = ['Audience', 'Behavior', 'Condition', 'Degree', 'Review'];
  const levels: VerbLevel[] = ['Remembering', 'Understanding', 'Applying', 'Analyzing', 'Evaluating', 'Creating'];
  const verbExamples: { [key in VerbLevel]: string } = {
    Remembering: 'Define, List, Recall, Identify, Name, Recognize',
    Understanding: 'Explain, Describe, Discuss, Interpret, Summarize, Classify',
    Applying: 'Apply, Demonstrate, Use, Solve, Implement, Execute',
    Analyzing: 'Analyze, Compare, Differentiate, Examine, Categorize, Contrast',
    Evaluating: 'Evaluate, Judge, Justify, Critique, Assess, Recommend',
    Creating: 'Create, Design, Develop, Formulate, Propose, Construct'
  };

  const guidingQuestions: { [key in VerbLevel]: string } = {
    Remembering: "Do students need to recall specific information or facts?",
    Understanding: "Should students demonstrate comprehension by explaining concepts in their own words?",
    Applying: "Will students use learned information to solve problems in new situations?",
    Analyzing: "Are students expected to break down information and explore relationships between concepts?",
    Evaluating: "Should students make judgments about the value or quality of ideas or materials?",
    Creating: "Will students synthesize information to produce original work or propose alternative solutions?"
  };

  const tips: { [key: string]: string | React.ReactNode } = {
    Audience: "Specify the course code and be clear about the students' level. For example, 'CHEM1010 students' clearly identifies first-year chemistry students.",
    Behavior: (
      <ol className="list-decimal list-inside">
        <li>Choose a cognitive level that matches your learning goals.</li>
        <li>Select an action verb that aligns with the chosen level.</li>
        <li>Specify the task or content students will engage with.</li>
        <li>Ensure the behavior is observable and measurable.</li>
      </ol>
    ),
    Condition: "Describe the specific circumstances or context in which the learning will be demonstrated. This often includes tools, resources, or settings.",
    Degree: "Specify clear, achievable criteria that define successful performance. This could include accuracy, speed, quality, or quantity metrics.",
    Review: "Ensure your ILO is SMART: Specific, Measurable, Achievable, Relevant, and Time-bound. Each component should contribute to a clear, actionable learning outcome."
  };

  const handleInputChange = (field: keyof ILO, value: string) => {
    setIlo(prev => ({ ...prev, [field]: value }));
  };

  const handleBehaviorChange = (field: keyof ILO['behavior'], value: string) => {
    setIlo(prev => ({
      ...prev,
      behavior: { 
        ...prev.behavior, 
        [field]: value,
        verbAndTask: field === 'verbAndTask' ? value : `${prev.behavior.verb} ${prev.behavior.task}`.trim()
      }
    }));
  };

  const renderILO = () => {
    return `${ilo.audience} will be able to ${ilo.behavior.verbAndTask} ${ilo.condition} ${ilo.degree}`.trim();
  };

  const renderPreview = () => {
    if (step < 4) { // Only show preview for the first 4 steps
      return (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h4 className="font-semibold mb-2">ILO Preview:</h4>
          <p>
            {ilo.audience} will be able to {ilo.behavior.verbAndTask} {ilo.condition} {ilo.degree}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderStepContent = () => {
    const commonClasses = "w-full p-2 border rounded mb-2 focus:border-blue-500 focus:ring focus:ring-blue-200";
    
    switch (step) {
      case 0:
        return (
          <div>
            <h3 className="text-lg font-semibold mb-2">Audience (A)</h3>
            <p className="mb-2">Specify the students you'll be teaching, including the course code.</p>
            <input
              type="text"
              value={ilo.audience}
              onChange={(e) => handleInputChange('audience', e.target.value)}
              placeholder="e.g. CHEM1010 students"
              className={commonClasses}
              aria-label="Audience description"
            />
          </div>
        );
      case 1:
        return (
          <div>
            <h3 className="text-lg font-semibold mb-2">Behavior (B)</h3>
            <div className="mb-4">
              <label className="block mb-2 font-bold">Step 1: Select the Cognitive Level</label>
              <p className="text-sm text-gray-600 mb-2">Choose the level of cognitive complexity you expect from your students:</p>
              <select 
                value={ilo.behavior.level} 
                onChange={(e) => handleBehaviorChange('level', e.target.value)}
                className={commonClasses}
              >
                <option value="">Select a level</option>
                {levels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
              {ilo.behavior.level && (
                <div className="mt-2 p-3 bg-yellow-50 rounded">
                  <p className="text-sm font-semibold flex items-center">
                    <Info size={16} className="mr-2" />
                    Guiding Question for {ilo.behavior.level}:
                  </p>
                  <p className="text-sm italic">{guidingQuestions[ilo.behavior.level as VerbLevel]}</p>
                </div>
              )}
            </div>

            {ilo.behavior.level && (
              <div className="mb-4">
                <label className="block mb-2 font-bold">Step 2: Choose an Action Verb and Specify the Task</label>
                <p className="text-sm text-gray-600 mb-2">Select a verb that aligns with the {ilo.behavior.level} level and describe the specific task or content:</p>
                <p className="text-sm font-italic mb-2">Example verbs for {ilo.behavior.level}: {verbExamples[ilo.behavior.level as VerbLevel]}</p>
                <input
                  type="text"
                  value={ilo.behavior.verbAndTask}
                  onChange={(e) => handleBehaviorChange('verbAndTask', e.target.value)}
                  placeholder="e.g., analyze the environmental impact of renewable energy sources"
                  className={commonClasses}
                />
              </div>
            )}
          </div>
        );
      case 2:
        return (
          <div>
            <h3 className="text-lg font-semibold mb-2">Condition (C)</h3>
            <p className="mb-2">Describe the conditions under which the behavior should be performed.</p>
            <input
              type="text"
              value={ilo.condition}
              onChange={(e) => handleInputChange('condition', e.target.value)}
              placeholder="e.g. Using common software tools"
              className={commonClasses}
              aria-label="Condition description"
            />
          </div>
        );
      case 3:
        return (
          <div>
            <h3 className="text-lg font-semibold mb-2">Degree (D)</h3>
            <p className="mb-2">Specify the criteria for acceptable performance.</p>
            <input
              type="text"
              value={ilo.degree}
              onChange={(e) => handleInputChange('degree', e.target.value)}
              placeholder="e.g. with at least 90% accuracy"
              className={commonClasses}
              aria-label="Degree of performance"
            />
          </div>
        );
      case 4:
        return (
          <div>
            <h3 className="text-lg font-semibold mb-2">Review Your ILO</h3>
            <p className="mb-4">Here's your complete Intended Learning Outcome:</p>
            <div className="p-4 bg-gray-100 rounded mb-4" ref={iloRef}>
              {renderILO()}
            </div>
            <div className="flex space-x-2 mb-4">
              <button 
                onClick={copyToClipboard} 
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {copied ? <CheckCircle size={18} className="mr-2" /> : <Copy size={18} className="mr-2" />}
                {copied ? 'Copied!' : 'Copy ILO'}
              </button>
              <button 
                onClick={enhanceWithAI} 
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                <Wand2 size={18} className="mr-2" />
                Enhance with AI
              </button>
            </div>
            {enhancedILO && (
              <div>
                <h4 className="font-semibold mb-2">AI-Enhanced ILO:</h4>
                <p className="p-4 bg-green-50 rounded">{enhancedILO}</p>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const copyToClipboard = () => {
    if (iloRef.current) {
      navigator.clipboard.writeText(iloRef.current.innerText || '').then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const enhanceWithAI = () => {
    // Placeholder for AI enhancement - replace with actual API call
    const currentILO = renderILO();
    setEnhancedILO(`Enhanced version: ${currentILO} (This would be replaced with actual AI-generated content)`);
  };

  const restart = () => {
    setStep(0);
    setIlo({
      audience: '',
      behavior: { level: '', verb: '', task: '', verbAndTask: '' },
      condition: '',
      degree: ''
    });
    setEnhancedILO('');
  };

  const renderNavigationButtons = () => {
    if (step === steps.length - 1) {
      // On the Review step
      return (
        <div className="flex justify-center mt-6">
          <button
            onClick={restart}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <RefreshCw size={18} className="inline mr-2" />
            Start Over
          </button>
        </div>
      );
    }

    return (
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setStep(prev => Math.max(0, prev - 1))}
          disabled={step === 0}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => setStep(prev => Math.min(steps.length - 1, prev + 1))}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {step === steps.length - 2 ? 'Finish' : 'Next'}
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Tutorial ILO Builder (ABCD Model)</h2>
        <button 
          onClick={() => setShowTips(!showTips)} 
          className="text-yellow-500 hover:text-yellow-600"
          aria-label="Show tips"
        >
          <Lightbulb size={24} />
        </button>
      </div>
      
      <p className="mb-4 text-gray-600">
        Create clear and effective Intended Learning Outcomes (ILOs) for your undergraduate tutorials using the ABCD model: 
        Audience, Behavior, Condition, and Degree. This tool is based on Bloom's Taxonomy to help you craft precise and measurable learning outcomes.
      </p>

      {showTips && (
        <div className="mb-4 p-4 bg-blue-50 rounded">
          <h3 className="font-bold mb-2">Tips for this step:</h3>
          {tips[steps[step]]}
        </div>
      )}

      <div className="mb-6">
        <div className="flex justify-between mb-2">
          {steps.map((s, i) => (
            <button
              key={s}
              onClick={() => setStep(i)}
              className={`text-center px-3 py-1 rounded ${i === step ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="h-2 bg-gray-200 rounded">
          <div
            className="h-full bg-blue-600 rounded transition-all duration-300 ease-in-out"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          ></div>
        </div>
      </div>
      {renderStepContent()}
      {renderPreview()}
      {renderNavigationButtons()}

      <div className="mt-4 flex items-center text-sm text-gray-600">
        <span>Need more help? Click the lightbulb icon for step-specific tips and best practices.</span>
      </div>
    </div>
  );
};

export default EnhancedILOBuilderWithAI;
