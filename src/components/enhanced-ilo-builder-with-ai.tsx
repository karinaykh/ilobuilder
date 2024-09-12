import ReactMarkdown from 'react-markdown';
import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, RefreshCw, Copy, CheckCircle, Wand2, Lightbulb,ChevronDown, ChevronUp } from 'lucide-react';

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

interface ILOSection {
  title: string;
  content: string | string[];
}

const EnhancedILOBuilderWithAI: React.FC = () => {
  const [step, setStep] = useState<number>(0);
  const [ilo, setIlo] = useState<ILO>({
    audience: '',
    behavior: { level: '', verb: '', task: '', verbAndTask: '' },
    condition: '',
    degree: ''
  });
  const [showTips, setShowTips] = useState(false);
  const [copied, setCopied] = useState(false);
  const [enhancedILO, setEnhancedILO] = useState<ILOSection[]>([]);
  const iloRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasEnhanced, setHasEnhanced] = useState(false);

  const steps = ['Audience', 'Behavior', 'Condition', 'Degree', 'Review'];
  const levels: VerbLevel[] = ['Remembering', 'Understanding', 'Applying', 'Analyzing', 'Evaluating', 'Creating'];
  const verbExamples: { [key in VerbLevel]: string } = {
    Remembering: 'Define, List, Recall, Identify, Name, Recognize',
    Understanding: 'Explain, Describe, Discuss, Interpret, Summarize, Classify',
    Applying: 'Apply, Implement, Solve, Demonstrate, Calculate, Modify',
    Analyzing: 'Analyze, Differentiate, Compare, Contrast, Examine, Categorize',
    Evaluating: 'Evaluate, Assess, Critique, Judge, Justify, Recommend',
    Creating: 'Design, Construct, Develop, Formulate, Propose, Synthesize'
  };

  const guidingQuestions: { [key in VerbLevel]: React.ReactNode } = {
    Remembering: (
      <div className="flex items-start text-sm text-gray-600">
        <Lightbulb size={16} className="mr-2 mt-1 flex-shrink-0 text-yellow-500" />
        <div className="text-left">
          <p>Do students need to recall or recognize specific information?</p>
          <p className="mt-1">Example: <span className="italic">define key terms related to cellular respiration</span></p>
        </div>
      </div>
    ),
    Understanding: (
      <div className="flex items-start text-sm text-gray-600">
        <Lightbulb size={16} className="mr-2 mt-1 flex-shrink-0 text-yellow-500" />
        <div className="text-left">
          <p>Should students demonstrate comprehension by explaining or interpreting concepts?</p>
          <p className="mt-1">Example: <span className="italic">explain the process of photosynthesis in their own words</span></p>
        </div>
      </div>
    ),
    Applying: (
      <div className="flex items-start text-sm text-gray-600">
        <Lightbulb size={16} className="mr-2 mt-1 flex-shrink-0 text-yellow-500" />
        <div className="text-left">
          <p>How will students use concepts or skills to address new situations or problems?</p>
          <p className="mt-1">Example: <span className="italic">apply thermodynamic principles to solve real-world engineering problems</span></p>
        </div>
      </div>
    ),
    Analyzing: (
      <div className="flex items-start text-sm text-gray-600">
        <Lightbulb size={16} className="mr-2 mt-1 flex-shrink-0 text-yellow-500" />
        <div className="text-left">
          <p>How will students break down information and explore relationships between concepts?</p>
          <p className="mt-1">Example: <span className="italic">analyze the factors influencing gene expression in eukaryotic cells</span></p>
        </div>
      </div>
    ),
    Evaluating: (
      <div className="flex items-start text-sm text-gray-600">
        <Lightbulb size={16} className="mr-2 mt-1 flex-shrink-0 text-yellow-500" />
        <div className="text-left">
          <p>How will students make judgments or assessments based on criteria and standards?</p>
          <p className="mt-1">Example: <span className="italic">evaluate the effectiveness of different statistical methods for analyzing experimental data</span></p>
        </div>
      </div>
    ),
    Creating: (
      <div className="flex items-start text-sm text-gray-600">
        <Lightbulb size={16} className="mr-2 mt-1 flex-shrink-0 text-yellow-500" />
        <div className="text-left">
          <p>How will students combine elements to create a novel product or perspective?</p>
          <p className="mt-1">Example: <span className="italic">design an experimental protocol to test a given hypothesis about enzyme kinetics</span></p>
        </div>
      </div>
    )
  };

  const tips: { [key: string]: string | React.ReactNode } = {
    Audience: (
      <>
        <p className="text-left">Specify your undergraduate students, including the course code. Be precise about who will achieve this outcome.</p>
        <p className="text-left mt-2">Example: <span className="italic">"MATH1012 students"</span></p>
      </>
    ),
    Behavior: (
      <>
        <p className="text-left">To define the behavior:</p>
        <ol className="list-decimal list-inside mb-4 text-left">
          <li>Select the cognitive level that best aligns with your tutorial objectives.</li>
          <li>Choose an appropriate verb from that level.</li>
          <li>Clearly describe the specific task, content, or skill students will engage with.</li>
        </ol>
        <p className="text-left">Example: <span className="italic">compute limits of complex functions</span></p>
      </>
    ),
    Condition: (
      <>
        <p className="text-left">Describe the context or circumstances under which students will demonstrate the behavior. Consider the resources or constraints typical in a tutorial setting.</p>
        <p className="text-left mt-2">Example: <span className="italic">"given a set of practice problems and a formula sheet"</span></p>
      </>
    ),
    Degree: (
      <>
        <p className="text-left">Define the criteria for acceptable performance. This should be measurable and achievable within a single tutorial session.</p>
        <p className="text-left mt-2">Example: <span className="italic">"with at least 80% accuracy in their solutions"</span></p>
      </>
    ),
    Review: (
      <>
        <p className="text-left mb-2">
          As a graduate teaching assistant, your goal is to create an ILO that guides a focused, achievable learning experience within a single undergraduate tutorial session. Use our SMART criteria to evaluate and refine your ILO:
        </p>
        <ul className="list-disc list-inside text-left mb-4">
          <li><strong>S</strong>pecific to your tutorial content and student-centered</li>
          <li><strong>M</strong>easurable within the tutorial setting</li>
          <li><strong>A</strong>ctive, encouraging student engagement</li>
          <li><strong>R</strong>elevant to course goals and real-world applications</li>
          <li><strong>T</strong>ime-bound, achievable in a single session</li>
        </ul>
        <p className="text-left mb-2">Example of a Well-Crafted Tutorial ILO:</p>
        <p className="text-left italic">
          "By the end of this tutorial session, MATH1012 students will be able to compute limits of complex functions, given a set of practice problems and a formula sheet, with at least 80% accuracy in their solutions."
        </p>
      </>
    )
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
    return `By the end of this tutorial, ${ilo.audience} will be able to ${ilo.behavior.verbAndTask} ${ilo.condition} ${ilo.degree}`.trim();
  };

  const renderPreview = () => {
    if (step < 4) { // Only show preview for the first 4 steps
      return (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h4 className="font-semibold mb-2">ILO Preview:</h4>
          <p>
            By the end of this tutorial, {ilo.audience} will be able to {ilo.behavior.verbAndTask} {ilo.condition} {ilo.degree}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderStepContent = (): JSX.Element | null => {
    const commonClasses = "w-full p-2 border rounded mb-2 focus:border-blue-500 focus:ring focus:ring-blue-200";
    
    switch (step) {
      case 0:
        return (
          <div>
            <h3 className="text-lg font-semibold mb-2">Audience (A)</h3>
            <p className="mb-2">Identify the specific group of students for your tutorial session.</p>
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
            </div>

            {ilo.behavior.level && (
              <div className="mb-4">
                <label className="block mb-2 font-bold">Step 2: Choose an Action Verb and Specify the Task</label>
                <p className="text-sm text-gray-600 mb-2">Select a verb that aligns with the {ilo.behavior.level} level and describe the specific task or content:</p>
                
                <p className="text-sm font-italic mb-2">Example verbs for {ilo.behavior.level}: {verbExamples[ilo.behavior.level as VerbLevel]}</p>
                
                <div className="mt-2 p-3 bg-yellow-50 rounded mb-4 text-left">
                  {guidingQuestions[ilo.behavior.level as VerbLevel]}
                </div>
                
                <input
                  type="text"
                  value={ilo.behavior.verbAndTask}
                  onChange={(e) => handleBehaviorChange('verbAndTask', e.target.value)}
                  placeholder="e.g., apply chemical principles to solve environmental problems"
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
            <p className="mb-2">Specify any tools, resources, or situations relevant to your tutorial task.</p>
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
                disabled={isLoading || hasEnhanced}
                className={`bg-green-500 text-white px-4 py-2 rounded flex items-center ${
                  (isLoading || hasEnhanced) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600'
                }`}
              >
                <Wand2 size={18} className="mr-2" />
                {hasEnhanced ? 'Enhanced' : 'Enhance with AI'}
              </button>
            </div>
            {hasEnhanced && enhancedILO.length > 0 && (
              <div className="mt-6 bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-lg mb-4 text-center">AI-Enhanced ILO:</h4>
                <div className="text-left">
                  {enhancedILO.map((section: ILOSection, index: number) => (
                    <div key={index} className="mb-4">
                      <h5 className="font-semibold text-base">{section.title.replace(/^###\s*/, '')}</h5>
                      <ReactMarkdown className="prose prose-sm max-w-none">
                        {renderContent(section.content)}
                      </ReactMarkdown>
                    </div>
                  ))}
                </div>
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

  const loadingPhrases = [
    "Brewing some AI magic...",
    "Channeling the wisdom of a thousand educators...",
    "Decoding the secrets of perfect learning objectives...",
    "Consulting with virtual pedagogical experts...",
    "Analyzing countless successful ILOs...",
    "Optimizing your learning objectives...",
    "Enhancing your ILO with cutting-edge AI...",
    "Crafting the perfect blend of words...",
  ];

  const LoadingOverlay: React.FC = () => {
    const [phrase, setPhrase] = useState(loadingPhrases[0]);

    useEffect(() => {
      const interval = setInterval(() => {
                setPhrase(loadingPhrases[Math.floor(Math.random() * loadingPhrases.length)]);
      }, 3000);

      return () => clearInterval(interval);
    }, []);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-800">{phrase}</p>
        </div>
      </div>
    );
  };

  const enhanceWithAI = async () => {
    if (hasEnhanced) return;
    setIsLoading(true);
    try {
      const currentILO = renderILO();
      const response = await fetch('/enhance-ilo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ilo: currentILO }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to enhance ILO');
      }
      const data = await response.json();
      const sections = data.enhancedILO.split(/\n(?=###)/).map((section: string) => {
        const [title, ...content] = section.split('\n');
        return { title: title.trim(), content: content.join('\n').trim() };
      });
      setEnhancedILO(sections);
      setHasEnhanced(true);
    } catch (error) {
      console.error('Error enhancing ILO with AI:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = (content: string | string[]) => {
    if (Array.isArray(content)) {
      return content.join('\n');
    }
    return content;
  };

  const restart = () => {
    setStep(0);
    setIlo({
      audience: '',
      behavior: { level: '', verb: '', task: '', verbAndTask: '' },
      condition: '',
      degree: ''
    });
    setEnhancedILO([]);
    setHasEnhanced(false);
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
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg relative fixed inset-0 overflow-y-auto">
      <div className="grid grid-cols-3 items-center mb-4">
        <div></div> {/* Empty column for spacing */}
        <h2 className="text-center text-2xl font-bold">Smart ILO Builder</h2>
        <div className="justify-self-end">
          <button 
            onClick={() => setShowTips(!showTips)} 
            className="text-yellow-500 hover:text-yellow-600"
            aria-label="Show tips"
          >
            <Lightbulb size={24} />
          </button>
        </div>
      </div>
      
      <p className="mb-4 text-gray-600 text-left">
        Craft precise, actionable Intended Learning Outcomes (ILOs) for your undergraduate tutorials using the ABCD method: Audience, Behavior, Condition, and Degree. This tool blends Bloom's Taxonomy with AI assistance to help you create clear, measurable outcomes aligned with your tutorial goals. Follow the steps to design an ILO that guides learning and enables effective assessment. Once complete, use our AI feature to refine and enhance your ILO, ensuring it meets best educational practices.
      </p>

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

      {showTips && (
        <div className="mb-4 p-4 bg-yellow-50 rounded">
          <h3 className="text-left font-bold mb-2 flex items-center">
            <Lightbulb size={20} className="mr-2 text-yellow-500" />
            Tips for this step:
          </h3>
          {tips[steps[step]]}
        </div>
      )}

      {renderStepContent()}
      {renderPreview()}
      {renderNavigationButtons()}

      <div className="mt-4 flex items-center text-sm text-gray-600">
        <span>Need more help? Click the lightbulb icon for step-specific tips and best practices.</span>
      </div>
      {isLoading && <LoadingOverlay />}
    </div>
  );
};

export default EnhancedILOBuilderWithAI;
