
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { psychometricTestSections, optionalRatingQuestions, type Section, type Question, type SliderQuestion, type ChoiceQuestion, type ScenarioQuestion, type RatingQuestion } from './questions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ClipboardList, Lightbulb, ArrowRight, ArrowLeft, CheckCircle, HelpCircle } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase/config';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';


const TOTAL_SECTIONS = psychometricTestSections.length;

export default function PsychometricTestPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionInSectionIndex, setCurrentQuestionInSectionIndex] = useState(0);
  
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [optionalAnswers, setOptionalAnswers] = useState<Record<string, number>>({});
  
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<{ name: string, email: string, country: string, language: string } | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  const [showOptionalIntro, setShowOptionalIntro] = useState(false);
  const [currentOptionalQuestionIndex, setCurrentOptionalQuestionIndex] = useState(0);
  const [takingOptionalTest, setTakingOptionalTest] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
            setCurrentUser(user);
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                const userData = userDoc.data();
                setUserInfo({
                    name: userData.name || 'User',
                    email: user.email || '',
                    country: userData.country || '',
                    language: userData.language || 'English',
                });
            } else {
                 router.replace('/signup');
                 return;
            }
        } else {
            // Guest flow
            const guestInfo = JSON.parse(localStorage.getItem('margdarshak_user_info_guest') || '{}');
            setUserInfo({
                name: guestInfo.name || 'Guest',
                email: '',
                country: guestInfo.country || 'Not specified',
                language: guestInfo.language || 'English',
            });
        }
         const birthDetailsExist = currentUser ? true : !!localStorage.getItem('margdarshak_birth_details_guest');
         if (!birthDetailsExist) {
            toast({ title: 'Birth details not found', description: 'Please provide your birth details first.', variant: 'destructive' });
            router.replace('/birth-details');
            return;
         }

        setPageLoading(false);
    });

    return () => unsubscribe();
  }, [router, toast, currentUser]);

  const currentSection: Section | undefined = psychometricTestSections[currentSectionIndex];
  const currentQuestion: Question | undefined = currentSection?.questions[currentQuestionInSectionIndex];
  const currentOptionalQuestion: RatingQuestion | undefined = optionalRatingQuestions[currentOptionalQuestionIndex];

  const progress = currentSection ? ((currentSectionIndex + (currentQuestionInSectionIndex / currentSection.questions.length)) / TOTAL_SECTIONS) * 100 : 0;
  const optionalProgress = takingOptionalTest ? ((currentOptionalQuestionIndex + 1) / optionalRatingQuestions.length) * 100 : 0;

  const handleAnswerChange = (questionId: string, value: string | number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };
  
  const handleOptionalAnswerChange = (questionId: string, value: number) => {
    setOptionalAnswers((prev) => ({...prev, [questionId]: value }));
  }

  const handleSliderChange = (questionId: string, value: number[]) => {
    handleAnswerChange(questionId, value[0]);
  };

  const isCurrentQuestionAnswered = () => {
    if (!currentQuestion) return false;
    return answers[currentQuestion.id] !== undefined;
  };
  
  const isCurrentOptionalQuestionAnswered = () => {
    if (!currentOptionalQuestion) return false;
    return optionalAnswers[currentOptionalQuestion.id] !== undefined;
  }

  const handleNext = () => {
    if (!currentSection || !currentQuestion || !isCurrentQuestionAnswered()) {
      toast({ title: 'Please select an answer', variant: 'destructive' });
      return;
    }

    if (currentQuestionInSectionIndex < currentSection.questions.length - 1) {
      setCurrentQuestionInSectionIndex(currentQuestionInSectionIndex + 1);
    } else if (currentSectionIndex < TOTAL_SECTIONS - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      setCurrentQuestionInSectionIndex(0);
    } else {
      // Last question of last main section
      setShowOptionalIntro(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionInSectionIndex > 0) {
      setCurrentQuestionInSectionIndex(currentQuestionInSectionIndex - 1);
    } else if (currentSectionIndex > 0) {
      const prevSection = psychometricTestSections[currentSectionIndex -1];
      setCurrentSectionIndex(currentSectionIndex - 1);
      setCurrentQuestionInSectionIndex(prevSection.questions.length -1);
    }
  };
  
  const handleNextOptional = () => {
    if (!currentOptionalQuestion || !isCurrentOptionalQuestionAnswered()) {
        toast({ title: 'Please select an answer', variant: 'destructive'});
        return;
    }
    if (currentOptionalQuestionIndex < optionalRatingQuestions.length - 1) {
        setCurrentOptionalQuestionIndex(prev => prev + 1);
    } else {
        handleSubmitTest(); // All optional questions answered
    }
  };

  const handlePreviousOptional = () => {
    if (currentOptionalQuestionIndex > 0) {
        setCurrentOptionalQuestionIndex(prev => prev -1);
    }
  };

  const startOptionalTest = () => {
    setTakingOptionalTest(true);
    setShowOptionalIntro(false);
  };

  const compileTraitsToString = (): string => {
    let traitSummary = "";

    psychometricTestSections.forEach(section => {
      traitSummary += `[Section: ${section.title}]\n`;
      section.questions.forEach(q => {
        const answer = answers[q.id];
        if (answer !== undefined) {
          let answerText = `Answer: ${answer}`;
          if (q.type === 'slider') {
            answerText = `Value: ${answer} (Poles: ${q.poles[0].label} to ${q.poles[1].label})`;
          } else if (q.type === 'choice' || q.type === 'scenario') {
            const chosenOption = q.options.find(opt => opt.id === answer);
            answerText = `Selected: "${chosenOption?.text || answer}"`;
          }
          traitSummary += `  [Q: ${q.text || (q as ScenarioQuestion).scenario + ' - ' + (q as ScenarioQuestion).questionText}] ${answerText}\n`;
        }
      });
    });

    if (Object.keys(optionalAnswers).length > 0) {
        traitSummary += "\n[Optional Questions Insights]\n";
        optionalRatingQuestions.forEach(oq => {
            const answer = optionalAnswers[oq.id];
            if (answer !== undefined) {
                traitSummary += `  [Q: ${oq.text}] Rating: ${answer}/5\n`;
            }
        });
    }
    return traitSummary.trim();
  };

  const handleSubmitTest = async (skipOptional = false) => {
    if (!skipOptional && takingOptionalTest && Object.keys(optionalAnswers).length !== optionalRatingQuestions.length && currentOptionalQuestionIndex !== optionalRatingQuestions.length -1) {
         if (!isCurrentOptionalQuestionAnswered()){
            toast({ title: 'Please answer the current optional question, or skip.', variant: 'destructive' });
            return;
         }
    }


    setIsLoading(true);
    const userTraits = compileTraitsToString();

    try {
        const clearAndSave = () => {
            // Clear subsequent journey data
            localStorage.removeItem('margdarshak_personalized_answers');
            localStorage.removeItem('margdarshak_personalized_answers_guest');
            localStorage.removeItem('margdarshak_all_career_suggestions');
            localStorage.removeItem('margdarshak_selected_careers_list');
            localStorage.removeItem('margdarshak_payment_successful');
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('margdarshak_roadmap_')) {
                    localStorage.removeItem(key);
                }
            });
            // Save current step data
            localStorage.setItem('margdarshak_user_traits', userTraits);
        };
      
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await setDoc(userDocRef, { userTraits }, { merge: true });
        clearAndSave(); // Also clear local storage for logged-in users to ensure clean slate
      } else {
        clearAndSave(); // Clear and save for guest
      }

      toast({ title: 'Test Submitted!', description: 'Proceeding to personalized questions...' });
      router.push('/personalized-questions');
    } catch (error) {
      console.error('Error saving traits:', error);
      toast({ title: 'Error', description: 'Could not save test results. Please try again.', variant: 'destructive' });
      setIsLoading(false);
    }
  };


  if (pageLoading || !userInfo) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]"><LoadingSpinner /></div>;
  }

  if (showOptionalIntro) {
    return (
        <div className="flex justify-center items-start py-8">
            <Card className="w-full max-w-2xl shadow-xl">
                <CardHeader className="text-center">
                    <HelpCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                    <CardTitle className="text-2xl">Optional Questions</CardTitle>
                    <CardDescription>
                        You've completed the main part! Answer {optionalRatingQuestions.length} more optional questions for potentially higher prediction accuracy, or proceed with current results.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                     <p className="text-sm text-muted-foreground">These questions are rated on a scale of 1 (Strongly Disagree) to 5 (Strongly Agree).</p>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                    <Button onClick={startOptionalTest} className="w-full sm:w-auto">Start Optional Questions</Button>
                    <Button onClick={() => handleSubmitTest(true)} variant="outline" className="w-full sm:w-auto">Skip & Submit Now</Button>
                </CardFooter>
            </Card>
        </div>
    );
  }

  if (takingOptionalTest && currentOptionalQuestion) {
    return (
        <div className="flex justify-center items-start py-8">
            <Card className="w-full max-w-2xl shadow-xl">
                <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                            <CheckCircle className="h-8 w-8 text-primary" />
                            <CardTitle className="text-2xl">Optional Questions</CardTitle>
                        </div>
                        <span className="text-sm text-muted-foreground">Question {currentOptionalQuestionIndex + 1} of {optionalRatingQuestions.length}</span>
                    </div>
                    <CardDescription>Rate the following statement from 1 (Strongly Disagree) to 5 (Strongly Agree).</CardDescription>
                    <Progress value={optionalProgress} className="w-full mt-2 h-3" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-lg font-semibold">{currentOptionalQuestion.text}</p>
                    <RadioGroup
                        value={optionalAnswers[currentOptionalQuestion.id]?.toString() || ''}
                        onValueChange={(value) => handleOptionalAnswerChange(currentOptionalQuestion.id, parseInt(value))}
                        className="grid grid-cols-1 sm:grid-cols-5 gap-2"
                    >
                        {[1, 2, 3, 4, 5].map((value) => (
                            <div key={value} className="flex flex-col items-center space-y-1">
                                <RadioGroupItem value={value.toString()} id={`${currentOptionalQuestion.id}-val-${value}`} className="h-6 w-6"/>
                                <Label htmlFor={`${currentOptionalQuestion.id}-val-${value}`} className="text-sm cursor-pointer">
                                    {value === 1 && 'Strongly Disagree'}
                                    {value === 2 && 'Disagree'}
                                    {value === 3 && 'Neutral'}
                                    {value === 4 && 'Agree'}
                                    {value === 5 && 'Strongly Agree'}
                                    {!([1,2,3,4,5].includes(value)) && value.toString()}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                </CardContent>
                <CardFooter className="flex justify-between space-x-3">
                     <Button onClick={handlePreviousOptional} variant="outline" disabled={currentOptionalQuestionIndex === 0}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                    </Button>
                    {isLoading ? <LoadingSpinner /> : (
                        currentOptionalQuestionIndex < optionalRatingQuestions.length - 1 ? (
                            <Button onClick={handleNextOptional} className="px-6 py-3" disabled={!isCurrentOptionalQuestionAnswered()}>Next Optional</Button>
                        ) : (
                            <Button onClick={() => handleSubmitTest(false)} className="px-6 py-3 bg-green-500 hover:bg-green-600" disabled={!isCurrentOptionalQuestionAnswered()}>
                                Submit All Answers <CheckCircle className="ml-2 h-5 w-5" />
                            </Button>
                        )
                    )}
                </CardFooter>
            </Card>
        </div>
    );
  }


  if (!currentSection || !currentQuestion) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">Loading questions...</div>;
  }
  
  const questionKey = `${currentSection.id}-${currentQuestion.id}`;


  return (
    <div className="flex justify-center items-start py-8">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <ClipboardList className="h-8 w-8 text-primary" />
              <CardTitle className="text-2xl">{currentSection.title}</CardTitle>
            </div>
            <span className="text-sm text-muted-foreground">Section {currentSectionIndex + 1} of {TOTAL_SECTIONS} - Question {currentQuestionInSectionIndex + 1} of {currentSection.questions.length}</span>
          </div>
          <CardDescription>{currentSection.focusArea} ({currentSection.questionTypeDescription})</CardDescription>
          <Progress value={progress} className="w-full mt-2 h-3" />
        </CardHeader>
        <CardContent className="space-y-6 min-h-[200px]">
          {currentQuestion.type === 'slider' && (
            <>
              <p className="text-lg font-semibold text-center mb-4">{currentQuestion.text}</p>
              <div className="flex justify-between text-sm text-muted-foreground px-2">
                <span>{currentQuestion.poles[0].emoji} {currentQuestion.poles[0].label}</span>
                <span>{currentQuestion.poles[1].emoji} {currentQuestion.poles[1].label}</span>
              </div>
              <Slider
                key={questionKey} // Add key to force re-render if question changes
                defaultValue={[answers[currentQuestion.id] !== undefined ? Number(answers[currentQuestion.id]) : 3]}
                min={1} max={5} step={1}
                onValueChange={(value) => handleSliderChange(currentQuestion.id, value)}
                className="w-[90%] mx-auto"
              />
               <p className="text-center text-xs text-muted-foreground mt-1">Selected: {answers[currentQuestion.id] || 'Neutral (3)'}</p>
            </>
          )}
          {(currentQuestion.type === 'choice' || currentQuestion.type === 'scenario') && (
            <>
              {currentQuestion.type === 'scenario' && <p className="text-md italic text-muted-foreground mb-3">{currentQuestion.scenario}</p>}
              <p className="text-lg font-semibold">{currentQuestion.type === 'choice' ? currentQuestion.text : currentQuestion.questionText}</p>
              {currentQuestion.visualHint && <p className="text-sm text-muted-foreground italic mb-2">{currentQuestion.visualHint}</p>}
              <RadioGroup
                key={questionKey}
                value={answers[currentQuestion.id]?.toString() || ''}
                onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                className="space-y-2"
              >
                {(currentQuestion as ChoiceQuestion | ScenarioQuestion).options.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent/50 transition-colors">
                    <RadioGroupItem value={option.id} id={`${currentQuestion.id}-${option.id}`} />
                    <Label htmlFor={`${currentQuestion.id}-${option.id}`} className="text-base flex-1 cursor-pointer">{option.text}</Label>
                  </div>
                ))}
              </RadioGroup>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-between space-x-3">
          <Button onClick={handlePrevious} variant="outline" disabled={currentSectionIndex === 0 && currentQuestionInSectionIndex === 0}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          {isLoading ? (
            <LoadingSpinner />
          ) : currentSectionIndex < TOTAL_SECTIONS - 1 || currentQuestionInSectionIndex < currentSection.questions.length - 1 ? (
            <Button onClick={handleNext} className="text-lg px-6 py-3" disabled={!isCurrentQuestionAnswered()}>Next <ArrowRight className="ml-2 h-4 w-4" /></Button>
          ) : (
            <Button onClick={handleNext} className="text-lg px-6 py-3 bg-green-500 hover:bg-green-600" disabled={!isCurrentQuestionAnswered()}>
              Finish Main Questions <CheckCircle className="ml-2 h-5 w-5" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
