'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, Heart, Flame, Droplets, Moon, Trophy, Sparkles, Send, 
  Brain, Upload, Dumbbell, User, Award, ArrowRight, Check, Compass, 
  Star, TrendingUp, Clock, Plus, Zap, RefreshCw, LogOut, Sun, 
  Moon as MoonIcon, Eye, Image as ImageIcon, ChevronRight, Target, 
  AlertTriangle, ShieldCheck, ChevronLeft, Shield, Users, Calendar, 
  Info, Database, CheckSquare, PlusCircle
} from 'lucide-react';

// --- TYPES ---
interface UserProfile {
  age: number;
  gender: string;
  height: number; // in cm
  weight: number; // in kg
  activityLevel: string; // 'sedentary' | 'light' | 'moderate' | 'active'
  sleepHours: number;
  waterIntake: number; // in L
  conditions: string[];
  fitnessGoal: string; // 'weight-loss' | 'muscle-gain' | 'stamina' | 'preventive'
  targetGoal: string;
  targetDate: string;
}

interface AssessmentResults {
  bmi: number;
  bmiCategory: string;
  bodyType: string;
  fitnessLevel: string;
  lifestyleScore: number;
  recoveryScore: number;
  hydrationScore: number;
  overallHealth: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  badge: string;
  unlocked: boolean;
  xpReward: number;
}

interface HabitLog {
  date: string;
  sleep: number;
  water: number;
  workouts: number; // minutes
  calories: number;
  completed: boolean;
}

interface Challenge {
  id: string;
  title: string;
  target: string;
  progress: number;
  max: number;
  unit: string;
  xpReward: number;
  completed: boolean;
}

export default function FitSnapApp() {
  // --- STATE ---
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [currentView, setCurrentView] = useState<'landing' | 'auth' | 'onboarding' | 'dna-reveal' | 'dashboard'>('landing');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  
  // Auth Form State
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);

  // Onboarding Wizard State
  const [wizardStep, setWizardStep] = useState(1);
  const [profileForm, setProfileForm] = useState<UserProfile>({
    age: 28,
    gender: 'female',
    height: 172,
    weight: 68,
    activityLevel: 'moderate',
    sleepHours: 7,
    waterIntake: 2.2,
    conditions: [],
    fitnessGoal: 'preventive',
    targetGoal: '72 Overall Health Score',
    targetDate: '2026-09-01'
  });

  // Temporary state for onboarding inputs to avoid pre-filled values
  const [onboardingForm, setOnboardingForm] = useState({
    age: '',
    gender: 'female',
    height: '',
    weight: '',
    activityLevel: 'moderate',
    sleepHours: '',
    waterIntake: '',
    conditions: [] as string[],
    fitnessGoal: 'preventive',
    targetGoal: '',
    targetDate: '2026-09-01'
  });

  // Generated Scores State
  const [scores, setScores] = useState<AssessmentResults>({
    bmi: 23.0,
    bmiCategory: 'Normal Weight',
    bodyType: 'Mesomorph',
    fitnessLevel: 'Intermediate',
    lifestyleScore: 78,
    recoveryScore: 75,
    hydrationScore: 73,
    overallHealth: 76
  });

  // Active Dashboard Navigation Tab
  const [dashboardTab, setDashboardTab] = useState<'overview' | 'blueprint' | 'twin' | 'coach' | 'analyzer' | 'habits' | 'achievements' | 'timeline' | 'leaderboard' | 'backend'>('overview');

  // Gamification & Progress State
  const [xp, setXp] = useState(340);
  const [userLevel, setUserLevel] = useState(2);
  const [claimedRewards, setClaimedRewards] = useState<string[]>([]);
  
  // Habits Log State (initialized with past week of mock data)
  const [habitHistory, setHabitHistory] = useState<HabitLog[]>([
    { date: 'Jun 01', sleep: 7.2, water: 2.5, workouts: 45, calories: 1950, completed: true },
    { date: 'Jun 02', sleep: 6.5, water: 1.8, workouts: 0, calories: 2200, completed: false },
    { date: 'Jun 03', sleep: 8.0, water: 3.0, workouts: 60, calories: 1850, completed: true },
    { date: 'Jun 04', sleep: 7.0, water: 2.2, workouts: 30, calories: 2050, completed: true },
    { date: 'Jun 05', sleep: 5.8, water: 1.5, workouts: 0, calories: 2400, completed: false },
    { date: 'Jun 06', sleep: 7.5, water: 2.8, workouts: 50, calories: 1900, completed: true }
  ]);

  // Today's inputs
  const [todaySleep, setTodaySleep] = useState<number>(7.5);
  const [todayWater, setTodayWater] = useState<number>(2.5);
  const [todayWorkout, setTodayWorkout] = useState<number>(45);
  const [todayCalories, setTodayCalories] = useState<number>(2000);
  const [todayProtein, setTodayProtein] = useState<number>(110);
  const [loggedToday, setLoggedToday] = useState(false);

  // Twin Simulator State (projected updates based on sliders)
  const [twinSleep, setTwinSleep] = useState<number>(8.0);
  const [twinWater, setTwinWater] = useState<number>(3.0);
  const [twinWorkout, setTwinWorkout] = useState<number>(60);
  const [twinNutrition, setTwinNutrition] = useState<number>(85); // out of 100
  const [twinActivity, setTwinActivity] = useState<string>('active'); // sedentary | light | moderate | active

  // AI Chatbot State
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'ai'; text: string; time: string }[]>([
    { sender: 'ai', text: 'Hello! I am your AI Health Coach. I have analyzed your FitDNA Profile and lifestyle baseline. What fitness, nutrition, or preventive healthcare question can I help you with today?', time: '19:30' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Food Analyzer State
  const [scanningImage, setScanningImage] = useState(false);
  const [selectedMealPreset, setSelectedMealPreset] = useState<string | null>(null);
  const [analyzedMeal, setAnalyzedMeal] = useState<{
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    rating: string;
    ratingColor: string;
    alternatives: string[];
    analysisText: string;
  } | null>(null);

  // Backend Sync Configurations
  const [backendIp, setBackendIp] = useState('http://localhost:8000');
  const [backendConnected, setBackendConnected] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Never');

  // Community & Leaderboard State
  const leaderboardUsers = [
    { rank: 1, name: 'NovaHealth_Alpha', hp: 980, completionRate: '98%', healthScore: 92, activeBadge: '🏆 Health Guardian Elite' },
    { rank: 2, name: 'PulsePioneer', hp: 890, completionRate: '92%', healthScore: 88, activeBadge: '🔥 Consistency Master' },
    { rank: 3, name: 'FitSnap_User_01' + (currentUser ? ' (You)' : ''), hp: 840, completionRate: '88%', healthScore: 82, activeBadge: '💧 Hydration Hero' },
    { rank: 4, name: 'AuraBiometrics', hp: 790, completionRate: '85%', healthScore: 78, activeBadge: '💤 Sleep Champion' },
    { rank: 5, name: 'VigorVibe', hp: 720, completionRate: '80%', healthScore: 76, activeBadge: '🏃 Fitness Starter' },
    { rank: 6, name: 'ZenithFlow', hp: 680, completionRate: '75%', healthScore: 75, activeBadge: '🍎 Healthy Choice' }
  ];

  // Weekly Challenges State
  const [challenges, setChallenges] = useState<Challenge[]>([
    { id: 'chal-1', title: 'Hydration Catalyst', target: 'Drink 3L of water daily', progress: 5, max: 7, unit: 'days', xpReward: 150, completed: false },
    { id: 'chal-2', title: 'Cardio Engine', target: 'Accumulate 180 workout minutes', progress: 125, max: 180, unit: 'minutes', xpReward: 200, completed: false },
    { id: 'chal-3', title: 'Sleep Synchronization', target: 'Sleep 8+ hours', progress: 4, max: 5, unit: 'days', xpReward: 180, completed: false }
  ]);

  // Achievements State
  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: 'ach-1', title: 'Hydration Hero', description: 'Log meeting your water target 5 days in a row.', badge: '💧', unlocked: true, xpReward: 100 },
    { id: 'ach-2', title: 'Sleep Champion', description: 'Log 8 hours of restorative sleep 3 days in a row.', badge: '💤', unlocked: false, xpReward: 120 },
    { id: 'ach-3', title: 'Fitness Starter', description: 'Complete your first wellness assessment.', badge: '🏃', unlocked: true, xpReward: 50 },
    { id: 'ach-4', title: 'Healthy Choice', description: 'Use the Food Analyzer to optimize a meal choice.', badge: '🍎', unlocked: false, xpReward: 80 },
    { id: 'ach-5', title: 'Consistency Master', description: 'Unlock a streak of 7 consecutive habit logging days.', badge: '🔥', unlocked: false, xpReward: 250 },
    { id: 'ach-6', title: 'Health Guardian Elite', description: 'Achieve an Overall Health Score above 85.', badge: '🛡️', unlocked: false, xpReward: 500 }
  ]);

  // Preset Foods for Simulator
  const foodPresets = [
    { name: 'Mediterranean Salmon Salad', image: '🥗', calories: 380, protein: 32, carbs: 12, fat: 22, rating: 'A+', ratingColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10', analysisText: 'Excellent high-protein, nutrient-dense choice. Abundant in heart-healthy Omega-3 fatty acids and low-glycemic vegetables.', alternatives: ['Substitute commercial dressing with extra virgin olive oil and fresh lemon juices.'] },
    { name: 'Double Pepperoni Pizza Slice', image: '🍕', calories: 680, protein: 24, carbs: 75, fat: 30, rating: 'C-', ratingColor: 'text-rose-400 border-rose-500/30 bg-rose-500/10', analysisText: 'High simple carbohydrates and saturated fats. Will trigger a fast blood glucose spike followed by an insulin crash.', alternatives: ['Swap for a thin whole-wheat crust pizza with grilled chicken and spinach.', 'Pair with a fresh green side salad to slow carbohydrate absorption.'] },
    { name: 'Avocado Toast with Poached Egg', image: '🥑', calories: 310, protein: 14, carbs: 24, fat: 18, rating: 'S', ratingColor: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10', analysisText: 'Superb balance of complex carbohydrates, healthy monounsaturated fats, and clean protein. Supports long-lasting cognitive and physical energy.', alternatives: ['Use sprouted grain sourdough bread to lower glycemic impact further.'] }
  ];

  // --- THEME & MOUNT EFFECT ---
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme]);

  // --- ACTIONS & HANDLERS ---
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'login') {
      setCurrentUser({
        name: authEmail.split('@')[0] || 'User',
        email: authEmail
      });
      setCurrentView('dashboard');
    } else {
      setCurrentUser({
        name: authName,
        email: authEmail
      });
      setOnboardingForm({
        age: '',
        gender: 'female',
        height: '',
        weight: '',
        activityLevel: 'moderate',
        sleepHours: '',
        waterIntake: '',
        conditions: [],
        fitnessGoal: 'preventive',
        targetGoal: '',
        targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // default to 90 days out
      });
      setCurrentView('onboarding');
      setWizardStep(1);
    }
  };

  const handleOnboardingNext = () => {
    if (wizardStep < 3) {
      setWizardStep(prev => prev + 1);
    } else {
      // Parse numbers with sensible defaults if left empty
      const ageNum = parseInt(onboardingForm.age) || 28;
      const heightNum = parseFloat(onboardingForm.height) || 172;
      const weightNum = parseFloat(onboardingForm.weight) || 68;
      const sleepNum = parseFloat(onboardingForm.sleepHours) || 7.0;
      const waterNum = parseFloat(onboardingForm.waterIntake) || 2.2;
      const targetGoalVal = onboardingForm.targetGoal || '72 Overall Health Score';

      const finalizedProfile: UserProfile = {
        age: ageNum,
        gender: onboardingForm.gender,
        height: heightNum,
        weight: weightNum,
        activityLevel: onboardingForm.activityLevel,
        sleepHours: sleepNum,
        waterIntake: waterNum,
        conditions: onboardingForm.conditions,
        fitnessGoal: onboardingForm.fitnessGoal,
        targetGoal: targetGoalVal,
        targetDate: onboardingForm.targetDate || '2026-09-01'
      };

      setProfileForm(finalizedProfile);

      // Calculate scores
      const bmiValue = parseFloat((weightNum / Math.pow(heightNum / 100, 2)).toFixed(1));
      let bmiCat = 'Normal Weight';
      if (bmiValue < 18.5) bmiCat = 'Underweight';
      else if (bmiValue >= 25 && bmiValue < 30) bmiCat = 'Overweight';
      else if (bmiValue >= 30) bmiCat = 'Obese';

      // Estimate scores
      const waterScore = Math.min(100, Math.round((waterNum / 3.0) * 100));
      const sleepScore = Math.min(100, Math.round((sleepNum / 8.0) * 100));
      
      let baseActivityScore = 60;
      if (onboardingForm.activityLevel === 'light') baseActivityScore = 70;
      else if (onboardingForm.activityLevel === 'moderate') baseActivityScore = 82;
      else if (onboardingForm.activityLevel === 'active') baseActivityScore = 95;

      const wellness = Math.round((waterScore + sleepScore + baseActivityScore) / 3);

      setScores({
        bmi: bmiValue,
        bmiCategory: bmiCat,
        bodyType: onboardingForm.gender === 'male' ? 'Mesomorph' : 'Endomorph',
        fitnessLevel: onboardingForm.activityLevel === 'active' ? 'Advanced' : 'Intermediate',
        lifestyleScore: Math.round((sleepScore + waterScore) / 2),
        recoveryScore: Math.round(sleepScore * 0.9),
        hydrationScore: waterScore,
        overallHealth: wellness
      });

      // Synchronize Twin Sliders with original values
      setTwinSleep(sleepNum);
      setTwinWater(waterNum);
      setTwinWorkout(onboardingForm.activityLevel === 'sedentary' ? 10 : onboardingForm.activityLevel === 'light' ? 30 : 60);
      setTwinNutrition(75);
      setTwinActivity(onboardingForm.activityLevel);

      setCurrentView('dna-reveal');
    }
  };

  const logTodayMetrics = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: HabitLog = {
      date: 'Today',
      sleep: todaySleep,
      water: todayWater,
      workouts: todayWorkout,
      calories: todayCalories,
      completed: todayWater >= 2.5 && todaySleep >= 7 && todayWorkout >= 30
    };
    
    // Add to logs and increase XP
    setHabitHistory(prev => [...prev.filter(l => l.date !== 'Today'), newLog]);
    setLoggedToday(true);
    addXp(100);

    // Update challenges progress
    setChallenges(prev => prev.map(ch => {
      if (ch.id === 'chal-1') {
        const newProgress = Math.min(ch.max, ch.progress + (todayWater >= 3.0 ? 1 : 0));
        return { ...ch, progress: newProgress, completed: newProgress >= ch.max };
      }
      if (ch.id === 'chal-2') {
        const newProgress = Math.min(ch.max, ch.progress + todayWorkout);
        return { ...ch, progress: newProgress, completed: newProgress >= ch.max };
      }
      if (ch.id === 'chal-3') {
        const newProgress = Math.min(ch.max, ch.progress + (todaySleep >= 8.0 ? 1 : 0));
        return { ...ch, progress: newProgress, completed: newProgress >= ch.max };
      }
      return ch;
    }));
  };

  const addXp = (amount: number) => {
    setXp(prev => {
      const newXp = prev + amount;
      const nextLevelThreshold = userLevel * 500;
      if (newXp >= nextLevelThreshold) {
        setUserLevel(l => l + 1);
        return newXp - nextLevelThreshold;
      }
      return newXp;
    });
  };

  const claimChallenge = (id: string, reward: number) => {
    if (claimedRewards.includes(id)) return;
    setClaimedRewards(prev => [...prev, id]);
    addXp(reward);
  };

  // --- TWIN SIMULATOR LOGIC (Dynamic Computations) ---
  const calculateTwinProjections = () => {
    // Current state values
    const baselineHealth = scores.overallHealth;
    
    // Adjust projection scores dynamically based on the input sliders
    const sleepFactor = (twinSleep - profileForm.sleepHours) * 4;
    const waterFactor = (twinWater - profileForm.waterIntake) * 5;
    const workoutFactor = ((twinWorkout - (profileForm.activityLevel === 'sedentary' ? 10 : 45)) / 15) * 3;
    
    let nutritionFactor = (twinNutrition - 75) * 0.35;
    let activityVal = 0;
    if (twinActivity === 'sedentary') activityVal = -8;
    else if (twinActivity === 'light') activityVal = -2;
    else if (twinActivity === 'moderate') activityVal = 4;
    else if (twinActivity === 'active') activityVal = 10;
    
    const projectedHealthScore = Math.min(99, Math.max(45, Math.round(baselineHealth + sleepFactor + waterFactor + workoutFactor + nutritionFactor + activityVal)));
    
    // Fitness age projection
    const ageDiff = (projectedHealthScore - baselineHealth) * 0.15;
    const projectedFitnessAge = Math.max(18, parseFloat((profileForm.age - ageDiff).toFixed(1)));
    
    // Weight projection (estimate fat loss/gain based on workout/diet changes over 12 weeks)
    const exerciseCalorieDeficit = (twinWorkout - 30) * 8; // calories per session
    const nutritionCalorieDelta = (80 - twinNutrition) * 15; // diet quality deficit/excess
    const totalWeeklyDeficit = (exerciseCalorieDeficit - nutritionCalorieDelta) * 5;
    const projectedWeight = parseFloat((profileForm.weight - (totalWeeklyDeficit * 12) / 7700).toFixed(1));

    // Risk predictions (0 = low, 1 = moderate, 2 = high)
    const getRiskStatus = (baseRiskScore: number) => {
      if (baseRiskScore > 70) return { percent: baseRiskScore, label: 'High', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
      if (baseRiskScore > 35) return { percent: baseRiskScore, label: 'Moderate', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
      return { percent: baseRiskScore, label: 'Low', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
    };

    // Predict risks based on indicators
    let diabBase = profileForm.conditions.includes('Diabetes') ? 80 : 38;
    diabBase -= sleepFactor * 0.5 + waterFactor * 0.5 + nutritionFactor * 0.6;
    const diabRisk = getRiskStatus(Math.min(95, Math.max(5, Math.round(diabBase))));

    let heartBase = profileForm.conditions.includes('Heart Disease') ? 85 : 42;
    heartBase -= workoutFactor * 0.8 + sleepFactor * 0.4 + nutritionFactor * 0.5;
    const heartRisk = getRiskStatus(Math.min(95, Math.max(5, Math.round(heartBase))));

    let obesityBase = scores.bmi > 29.9 ? 88 : scores.bmi > 24.9 ? 55 : 20;
    obesityBase -= workoutFactor * 0.7 + nutritionFactor * 0.8;
    const obesityRisk = getRiskStatus(Math.min(95, Math.max(5, Math.round(obesityBase))));

    return {
      healthScore: projectedHealthScore,
      fitnessAge: projectedFitnessAge,
      weight: projectedWeight,
      diabRisk,
      heartRisk,
      obesityRisk
    };
  };

  const projections = calculateTwinProjections();

  // --- AI HEALTH COACH CONVERSATION LOGIC ---
  const handleChatSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg, time: timeStr }]);
    setChatInput('');
    setIsTyping(true);

    // Simulate smart coaching replies based on keyword analysis
    setTimeout(() => {
      let reply = 'I have logged that statement. To customize your program further, make sure your biometrics like water intake and daily steps are up to date.';
      const msg = userMsg.toLowerCase();

      if (msg.includes('workout') || msg.includes('exercise') || msg.includes('gym')) {
        reply = `Based on your goal of ${profileForm.fitnessGoal === 'preventive' ? 'preventive wellness' : profileForm.fitnessGoal === 'weight-loss' ? 'fat loss' : 'lean muscle gain'}, I recommend focusing on a weekly routine of 3 strength training sessions and 2 aerobic cardio intervals. In your Fitness Blueprint, check out the weekly schedule details. Always prioritize 48 hours of recovery between major muscle groups.`;
      } else if (msg.includes('protein') || msg.includes('nutrition') || msg.includes('calorie') || msg.includes('diet')) {
        reply = `Your estimated Daily Calorie Target is ${Math.round(profileForm.weight * 30)} kcal, with a Protein Target of ${Math.round(profileForm.weight * 1.6)}g. Ensure you are getting high-quality protein from sources like wild salmon, eggs, and organic tofu. I recommend eating complex carbohydrates such as quinoa or sweet potato in your post-workout window to restore glycogen.`;
      } else if (msg.includes('diabetes') || msg.includes('insulin') || msg.includes('sugar')) {
        reply = `To manage and prevent diabetes risk, maintain high muscle insulin sensitivity by performing light bodyweight squats or taking a brisk 10-minute walk immediately following meals. Focus on high-fiber diets (target 35g+ daily) to slow down gastric emptying and eliminate blood glucose spikes.`;
      } else if (msg.includes('heart') || msg.includes('blood pressure') || msg.includes('hypertension')) {
        reply = `To support cardiovascular longevity, prioritize Zone 2 endurance cardio training (like steady-state cycling or power walking where you can hold a conversation). Maintain a high potassium-to-sodium ratio by consuming avocados, leafy greens, and bananas, and sleeping 7-8 hours to allow overnight heart rate dipping.`;
      } else if (msg.includes('water') || msg.includes('hydrate') || msg.includes('dehydrat')) {
        reply = `Your personal water intake goal is ${profileForm.waterIntake}L per day. Dehydration reduces strength output by up to 10% and elevates cortisol levels. Try adding a pinch of Celtic sea salt to your first glass of water in the morning to supply essential trace minerals and cellular electrolytes.`;
      } else if (msg.includes('sleep') || msg.includes('rest') || msg.includes('insomnia')) {
        reply = `Your baseline sleep is ${profileForm.sleepHours} hours. Restorative deep and REM sleep is the cornerstone of physical recovery. Try maintaining a strict sleep schedule, blocking blue light exposure after 8:30 PM, and cooling your bedroom to 18°C (65°F) to accelerate melatonin synthesis.`;
      } else if (msg.includes('summary') || msg.includes('doctor') || msg.includes('physician')) {
        reply = `**CLINICAL PROFILE SUMMARY FOR ATTENDING PHYSICIAN**\n\n**Patient Baseline Details:**\n* **Age/Gender:** ${profileForm.age} / ${profileForm.gender.toUpperCase()}\n* **Biometrics:** ${profileForm.height}cm, ${profileForm.weight}kg (BMI: ${scores.bmi} - ${scores.bmiCategory})\n* **Clinical Risk Factors:** ${profileForm.conditions.length > 0 ? profileForm.conditions.join(', ') : 'None Reported'}\n\n**Average Lifestyle Adherence (Past 7 Days):**\n* **Hydration:** ${(habitHistory.reduce((a, b) => a + b.water, 0) / habitHistory.length).toFixed(1)}L Daily Target\n* **Sleep:** ${(habitHistory.reduce((a, b) => a + b.sleep, 0) / habitHistory.length).toFixed(1)} Hours\n* **Workouts:** ${(habitHistory.reduce((a, b) => a + b.workouts, 0) / habitHistory.length).toFixed(1)} mins/session\n\n**Preventive Health Score:** ${scores.overallHealth}/100\n\n*This data reflects continuous digital diary inputs and is prepared for clinical consultation support.*`;
      }

      setChatMessages(prev => [...prev, { sender: 'ai', text: reply, time: timeStr }]);
      setIsTyping(false);
      addXp(30);
    }, 1200);
  };

  const handlePromptClick = (promptText: string) => {
    setChatInput(promptText);
  };

  // --- FOOD SCAN SIMULATOR ---
  const simulateScan = (mealName: string) => {
    setScanningImage(true);
    setSelectedMealPreset(mealName);
    const selectedPreset = foodPresets.find(f => f.name === mealName);
    
    setTimeout(() => {
      if (selectedPreset) {
        setAnalyzedMeal({
          name: selectedPreset.name,
          calories: selectedPreset.calories,
          protein: selectedPreset.protein,
          carbs: selectedPreset.carbs,
          fat: selectedPreset.fat,
          rating: selectedPreset.rating,
          ratingColor: selectedPreset.ratingColor,
          alternatives: selectedPreset.alternatives,
          analysisText: selectedPreset.analysisText
        });
        // Update today's calories if logged
        setTodayCalories(prev => prev + selectedPreset.calories);
        setTodayProtein(prev => prev + selectedPreset.protein);
      }
      setScanningImage(false);
      addXp(80);
      
      // Check if food analyzer achievement unlocks
      setAchievements(prev => prev.map(ach => {
        if (ach.id === 'ach-4') {
          return { ...ach, unlocked: true };
        }
        return ach;
      }));
    }, 1500);
  };

  // --- BACKEND CONNECTION SYNC TEST ---
  const testBackendConnection = async () => {
    setScanningImage(true);
    try {
      const response = await fetch(`${backendIp}/health`, { method: 'GET', mode: 'cors' });
      if (response.ok) {
        setBackendConnected(true);
        setLastSyncTime(new Date().toLocaleTimeString());
      } else {
        setBackendConnected(false);
      }
    } catch (e) {
      setBackendConnected(false);
      console.warn("FastAPI offline or blocked by container sandbox. Local mock data active.");
    } finally {
      setScanningImage(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-tech-grid text-slate-100 flex flex-col transition-colors duration-300">
      {/* Glow Effects */}
      <div className="glow-blob bg-cyan-500/10 w-[600px] h-[600px] top-0 left-1/4" />
      <div className="glow-blob bg-violet-500/10 w-[500px] h-[500px] bottom-10 right-1/4" />

      {/* --- HEADER --- */}
      <header className="relative z-10 border-b border-white/5 bg-slate-950/70 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentView('landing')}>
          <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400 animate-pulse-ring">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
              FitSnapI
            </h1>
            <p className="text-[10px] text-cyan-400/80 font-semibold tracking-widest uppercase">Preventive AI DNA Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {currentUser && (
            <div className="hidden md:flex items-center gap-3 px-3 py-1.5 bg-white/5 border border-white/5 rounded-xl text-xs font-semibold">
              <span className="text-slate-400">Level {userLevel}</span>
              <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-400 to-violet-500 transition-all duration-300"
                  style={{ width: `${(xp / (userLevel * 500)) * 100}%` }}
                />
              </div>
              <span className="text-cyan-400">{xp} / {userLevel * 500} XP</span>
            </div>
          )}

          {/* Theme Toggle */}
          <button 
            onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
            className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-xl transition-all"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <MoonIcon className="w-4 h-4 text-violet-400" />}
          </button>

          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-violet-500 flex items-center justify-center font-bold text-xs shadow-lg shadow-cyan-500/20">
                {currentUser.name[0]?.toUpperCase()}
              </div>
              <button 
                onClick={() => {
                  setCurrentUser(null);
                  setCurrentView('landing');
                }}
                className="hidden sm:flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/5 hover:bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/10 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <button 
              onClick={() => {
                setAuthMode('login');
                setCurrentView('auth');
              }}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              Access Engine Portal
            </button>
          )}
        </div>
      </header>

      {/* --- CONTENT CONTROLLER --- */}
      <main className="flex-1 flex flex-col relative z-10">
        
        {/* ========================================================
            1. LANDING PAGE
            ======================================================== */}
        {currentView === 'landing' && (
          <div className="flex-1 flex flex-col justify-center max-w-7xl mx-auto w-full px-6 py-12 lg:py-24 gap-16">
            
            {/* Hero Section */}
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 flex flex-col gap-6 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-xs font-semibold text-cyan-400 w-fit">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Version 2.4 - Advanced Preventive Health Diagnostics</span>
                </div>
                <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.15] bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
                  Decode Your Health.<br />
                  <span className="bg-gradient-to-r from-cyan-400 via-teal-400 to-violet-400 bg-clip-text text-transparent">
                    Design Your Future.
                  </span>
                </h1>
                <p className="text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
                  Welcome to FitSnapI, a futuristic health-tech startup. FitSnapI uses advanced predictive analytics, a DNA metabolic simulator, and real-time habit tracking to prevent illnesses before they start.
                </p>
                <div className="flex flex-wrap gap-4 mt-4">
                  <button 
                    onClick={() => {
                      setAuthMode('signup');
                      setCurrentView('auth');
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/25 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <span>Generate DNA Profile</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => {
                      setAuthMode('login');
                      setCurrentView('auth');
                    }}
                    className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-200 font-bold rounded-xl flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <span>Dashboard Portal</span>
                  </button>
                </div>
              </div>

              {/* Futuristic Vector Illustration Card */}
              <div className="lg:col-span-5 relative flex items-center justify-center">
                <div className="w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] rounded-full border border-cyan-500/10 absolute animate-pulse" />
                <div className="w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] rounded-full border border-violet-500/15 absolute animate-ping" />
                
                <div className="glass-card p-8 rounded-3xl relative z-10 w-full max-w-md border-cyan-500/20 shadow-2xl shadow-cyan-500/5 hover:translate-y-[-5px] transition-transform duration-300">
                  <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-rose-500 animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Cardiovascular Twin State</span>
                    </div>
                    <span className="text-[10px] text-cyan-400 font-mono">SIMULATION ACTIVE</span>
                  </div>
                  
                  {/* Dynamic DNA Vector Design */}
                  <div className="relative h-44 flex items-center justify-center bg-slate-900/60 rounded-2xl overflow-hidden border border-white/5 p-4 mb-4">
                    <svg className="w-full h-full text-cyan-400" viewBox="0 0 100 40">
                      <defs>
                        <linearGradient id="dnaGlow" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#06b6d4" />
                          <stop offset="50%" stopColor="#a855f7" />
                          <stop offset="100%" stopColor="#10b981" />
                        </linearGradient>
                      </defs>
                      {/* Sine lines representing double helix */}
                      <path d="M 0 20 Q 25 5 50 20 T 100 20" fill="none" stroke="url(#dnaGlow)" strokeWidth="2.5" className="opacity-80" />
                      <path d="M 0 20 Q 25 35 50 20 T 100 20" fill="none" stroke="url(#dnaGlow)" strokeWidth="1.5" strokeDasharray="3 3" className="opacity-50" />
                      {/* Connecting rungs */}
                      {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((x) => {
                        const y1 = 20 + Math.sin((x / 50) * Math.PI) * 7.5;
                        const y2 = 20 - Math.sin((x / 50) * Math.PI) * 7.5;
                        return (
                          <line key={x} x1={x} y1={y1} x2={x} y2={y2} stroke="currentColor" strokeWidth="1" opacity="0.3" className="text-violet-400" />
                        );
                      })}
                    </svg>
                    <div className="absolute top-2 right-2 px-2 py-0.5 bg-cyan-500/10 text-[9px] font-mono text-cyan-400 rounded border border-cyan-500/20">DNA ID: 9472-F</div>
                    <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-[10px] text-slate-400">Preventive score syncing...</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-left">
                    <div className="bg-white/5 border border-white/5 rounded-xl p-3">
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">Health Index</span>
                      <span className="text-xl font-extrabold tracking-tight mt-1 text-cyan-400">88.5%</span>
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-xl p-3">
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">Metabolic Age</span>
                      <span className="text-xl font-extrabold tracking-tight mt-1 text-violet-400">22.4 Yrs</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Showcase Cards Section */}
            <div className="flex flex-col gap-6 text-left">
              <div>
                <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  Decentralized Wellness Infrastructure
                </h2>
                <p className="text-sm text-slate-400 mt-1">Four pillars of bio-preventive digital health coaching</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                <div className="glass-card p-6 rounded-2xl flex flex-col gap-3 hover:translate-y-[-4px] hover:border-cyan-500/20 transition-all duration-300">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-200">DNA Health Profile</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Evaluate body composition, hydration indexes, recovery potential, and baseline score averages.
                    </p>
                  </div>
                </div>

                <div className="glass-card p-6 rounded-2xl flex flex-col gap-3 hover:translate-y-[-4px] hover:border-violet-500/20 transition-all duration-300">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-200">Health Twin Simulator</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Adjust lifestyle vectors to preview real-time changes in fitness age, diabetes risks, and weight projections.
                    </p>
                  </div>
                </div>

                <div className="glass-card p-6 rounded-2xl flex flex-col gap-3 hover:translate-y-[-4px] hover:border-emerald-500/20 transition-all duration-300">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-200">AI Wellness Companion</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Consult an intelligent chat assistant trained to provide customized training, dietary answers, and doctor summaries.
                    </p>
                  </div>
                </div>

                <div className="glass-card p-6 rounded-2xl flex flex-col gap-3 hover:translate-y-[-4px] hover:border-rose-500/20 transition-all duration-300">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-200">Computer Vision Meal Analyzer</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Upload food photos to instantly calculate estimated macronutrients, caloric impact, and wellness rating grades.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Benefits Banner */}
            <div className="glass-card p-8 rounded-3xl grid md:grid-cols-3 gap-6 text-left border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 rounded-full filter blur-xl" />
              <div>
                <span className="text-xs font-semibold text-cyan-400 tracking-wider uppercase">Preventive Paradigm</span>
                <h3 className="text-lg font-bold text-slate-200 mt-1">94% Success in Habit Building</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">Users logged daily consistency milestones show a marked decrease in cardiovascular risk scores.</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-violet-400 tracking-wider uppercase">Custom FitDNA</span>
                <h3 className="text-lg font-bold text-slate-200 mt-1">Tailored Macro targets</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">Zero generic advice. Fitness blueprint plans adjust automatically to your age, goal dates, and conditions.</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-emerald-400 tracking-wider uppercase">Active Gamification</span>
                <h3 className="text-lg font-bold text-slate-200 mt-1">XP Level Milestones</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">Unlock Hydration Hero or Sleep Champion badges while earning XP points toward community rank status.</p>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================
            2. AUTHENTICATION (LOGIN / SIGN UP)
            ======================================================== */}
        {currentView === 'auth' && (
          <div className="flex-1 flex items-center justify-center px-6 py-16">
            <div className="glass-card p-8 rounded-3xl w-full max-w-md border-cyan-500/10 flex flex-col gap-6 text-left relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-violet-500" />
              
              <div className="text-center">
                <h2 className="text-2xl font-bold tracking-tight">
                  {authMode === 'login' ? 'Engine Control Center' : 'Generate Bio DNA Profile'}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {authMode === 'login' ? 'Access your preventive diagnostics dashboard' : 'Enter details to start customized health forecast'}
                </p>
              </div>

              <form onSubmit={handleAuth} className="flex flex-col gap-4">
                {authMode === 'signup' && (
                  <div>
                    <label className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block mb-1">Full User Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. John Doe"
                      required
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      className="w-full bg-slate-900/80 border border-white/5 focus:border-cyan-500/40 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                    />
                  </div>
                )}

                <div>
                  <label className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block mb-1">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="name@company.com"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full bg-slate-900/80 border border-white/5 focus:border-cyan-500/40 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block mb-1">Passkey Credentials</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full bg-slate-900/80 border border-white/5 focus:border-cyan-500/40 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/25 mt-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  {authMode === 'login' ? 'Authenticate Access' : 'Initialize Bio Assessment'}
                </button>
              </form>

              <div className="flex items-center justify-between text-xs text-slate-400 border-t border-white/5 pt-4">
                <span>
                  {authMode === 'login' ? "Don't have a profile?" : 'Already registered?'}
                </span>
                <button 
                  onClick={() => setAuthMode(prev => prev === 'login' ? 'signup' : 'login')}
                  className="text-cyan-400 hover:text-cyan-300 font-bold"
                >
                  {authMode === 'login' ? 'Generate Profile' : 'Access Login'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            3. FIRST-TIME HEALTH ASSESSMENT
            ======================================================== */}
        {currentView === 'onboarding' && (
          <div className="flex-1 flex items-center justify-center px-6 py-12">
            <div className="glass-card p-8 rounded-3xl w-full max-w-2xl border-cyan-500/10 flex flex-col gap-6 text-left relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-violet-500" />
              
              {/* Steps indicator */}
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div>
                  <span className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase block">BIO PROFILE CONFIG</span>
                  <h2 className="text-xl font-bold">First-Time Health Assessment</h2>
                </div>
                <span className="text-xs text-slate-400 font-bold">Step {wizardStep} of 3</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-400 to-violet-500 transition-all duration-300" 
                  style={{ width: `${(wizardStep / 3) * 100}%` }}
                />
              </div>

              {/* Wizard Content Panels */}
              <div className="py-2 flex-1 min-h-[300px]">
                
                {/* STEP 1: Biometrics */}
                {wizardStep === 1 && (
                  <div className="flex flex-col gap-4">
                    <h3 className="font-bold text-slate-200">1. Physical Biometrics</h3>
                    <p className="text-xs text-slate-400">Provide baseline details for BMI calculations and caloric threshold calculations.</p>
                    
                    <div className="grid sm:grid-cols-2 gap-4 mt-2">
                      <div>
                        <label className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block mb-1">Age (Years)</label>
                        <input 
                          type="number" 
                          placeholder="e.g. 28"
                          value={onboardingForm.age}
                          onChange={(e) => setOnboardingForm({ ...onboardingForm, age: e.target.value })}
                          className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-cyan-500/40"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block mb-1">Gender Identification</label>
                        <select 
                          value={onboardingForm.gender}
                          onChange={(e) => setOnboardingForm({ ...onboardingForm, gender: e.target.value })}
                          className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-cyan-500/40 text-slate-300"
                        >
                          <option value="female">Female</option>
                          <option value="male">Male</option>
                          <option value="unspecified">Non-Binary / Unspecified</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block mb-1">Height (cm)</label>
                        <input 
                          type="number" 
                          placeholder="e.g. 172"
                          value={onboardingForm.height}
                          onChange={(e) => setOnboardingForm({ ...onboardingForm, height: e.target.value })}
                          className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-cyan-500/40"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block mb-1">Weight (kg)</label>
                        <input 
                          type="number" 
                          placeholder="e.g. 68"
                          value={onboardingForm.weight}
                          onChange={(e) => setOnboardingForm({ ...onboardingForm, weight: e.target.value })}
                          className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-cyan-500/40"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: Lifestyle Habits */}
                {wizardStep === 2 && (
                  <div className="flex flex-col gap-4">
                    <h3 className="font-bold text-slate-200">2. Lifestyle Baseline</h3>
                    <p className="text-xs text-slate-400">Help the AI coach assess hydration limits, average sleep quality, and active exertion states.</p>
                    
                    <div className="grid sm:grid-cols-2 gap-4 mt-2">
                      <div>
                        <label className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block mb-1">Activity Level</label>
                        <select 
                          value={onboardingForm.activityLevel}
                          onChange={(e) => setOnboardingForm({ ...onboardingForm, activityLevel: e.target.value })}
                          className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-cyan-500/40 text-slate-300"
                        >
                          <option value="sedentary">Sedentary (desk job, minimal movement)</option>
                          <option value="light">Lightly Active (1-2 light workouts/week)</option>
                          <option value="moderate">Moderately Active (3-5 workouts/week)</option>
                          <option value="active">Very Active (daily intense training)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block mb-1">Avg. Sleep Hours</label>
                        <input 
                          type="number" 
                          step="0.5"
                          placeholder="e.g. 7"
                          value={onboardingForm.sleepHours}
                          onChange={(e) => setOnboardingForm({ ...onboardingForm, sleepHours: e.target.value })}
                          className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-cyan-500/40"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block mb-1">Daily Water Intake (Liters)</label>
                        <input 
                          type="number" 
                          step="0.1"
                          placeholder="e.g. 2.2"
                          value={onboardingForm.waterIntake}
                          onChange={(e) => setOnboardingForm({ ...onboardingForm, waterIntake: e.target.value })}
                          className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-cyan-500/40"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block mb-1">Existing Medical Conditions</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {['Diabetes', 'Heart Disease', 'Hypertension', 'Obesity'].map((cond) => {
                            const active = onboardingForm.conditions.includes(cond);
                            return (
                              <button
                                key={cond}
                                type="button"
                                onClick={() => {
                                  if (active) {
                                    setOnboardingForm({ ...onboardingForm, conditions: onboardingForm.conditions.filter(c => c !== cond) });
                                  } else {
                                    setOnboardingForm({ ...onboardingForm, conditions: [...onboardingForm.conditions, cond] });
                                  }
                                }}
                                className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all ${
                                  active 
                                    ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' 
                                    : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
                                }`}
                              >
                                {cond}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: Goals and Dates */}
                {wizardStep === 3 && (
                  <div className="flex flex-col gap-4">
                    <h3 className="font-bold text-slate-200">3. Target Blueprint Goals</h3>
                    <p className="text-xs text-slate-400">Define your primary fitness objective and deadline targets to build your personal roadmap.</p>
                    
                    <div className="grid sm:grid-cols-2 gap-4 mt-2">
                      <div>
                        <label className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block mb-1">Primary Fitness Goal</label>
                        <select 
                          value={onboardingForm.fitnessGoal}
                          onChange={(e) => setOnboardingForm({ ...onboardingForm, fitnessGoal: e.target.value })}
                          className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-cyan-500/40 text-slate-300"
                        >
                          <option value="preventive">Preventive Longevity (Avoid Disease)</option>
                          <option value="weight-loss">Weight Loss / Body Recomposition</option>
                          <option value="muscle-gain">Lean Muscle Hypertrophy</option>
                          <option value="stamina">Cardio Endurance & Stamina</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block mb-1">Target Milestone Objective</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Lose 5kg or Reach 85 Health Score"
                          value={onboardingForm.targetGoal}
                          onChange={(e) => setOnboardingForm({ ...onboardingForm, targetGoal: e.target.value })}
                          className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-cyan-500/40"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block mb-1">Milestone Target Date</label>
                        <input 
                          type="date" 
                          value={onboardingForm.targetDate}
                          onChange={(e) => setOnboardingForm({ ...onboardingForm, targetDate: e.target.value })}
                          className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-cyan-500/40 text-slate-300"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Actions */}
              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <button
                  type="button"
                  disabled={wizardStep === 1}
                  onClick={() => setWizardStep(prev => prev - 1)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 border border-white/5 rounded-xl text-xs font-semibold text-slate-300 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={handleOnboardingNext}
                  className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 cursor-pointer"
                >
                  <span>{wizardStep === 3 ? 'Generate FitDNA Profile' : 'Continue'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================
            4. FITDNA PROFILE GENERATION / REVEAL
            ======================================================== */}
        {currentView === 'dna-reveal' && (
          <div className="flex-1 flex items-center justify-center px-6 py-12">
            <div className="glass-card p-8 rounded-3xl w-full max-w-xl border-cyan-500/20 flex flex-col gap-6 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-teal-400 to-violet-500" />
              
              <div className="mx-auto p-4 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-full w-fit animate-bounce">
                <Award className="w-8 h-8" />
              </div>

              <div>
                <span className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase block">ASSESSMENT COMPILED</span>
                <h2 className="text-2xl font-black mt-1">FitDNA Profile Generated Successfully!</h2>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-2">
                  Our neural engine has calculated your body types, hydration thresholds, and metabolic indexes based on your biometrics.
                </p>
              </div>

              {/* Genetic / Metric summary grid */}
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex flex-col gap-1 text-left">
                  <span className="text-[9px] text-slate-400 uppercase font-medium">Metabolic Body Type</span>
                  <span className="text-base font-extrabold text-cyan-400">{scores.bodyType}</span>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">Efficient carbohydrate processing and high muscular response rate.</p>
                </div>
                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex flex-col gap-1 text-left">
                  <span className="text-[9px] text-slate-400 uppercase font-medium">calculated BMI Status</span>
                  <span className="text-base font-extrabold text-violet-400">{scores.bmi} kg/m²</span>
                  <span className="text-[10px] text-slate-500 mt-1 leading-relaxed">BMI Classification: <span className="text-teal-400 font-semibold">{scores.bmiCategory}</span></span>
                </div>
                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex flex-col gap-1 text-left">
                  <span className="text-[9px] text-slate-400 uppercase font-medium">Initial Health Score</span>
                  <span className="text-base font-extrabold text-emerald-400">{scores.overallHealth} / 100</span>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">Average calculated from sleep indices, water intake metrics, and exertion history.</p>
                </div>
                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex flex-col gap-1 text-left">
                  <span className="text-[9px] text-slate-400 uppercase font-medium">Recovery Capacity</span>
                  <span className="text-base font-extrabold text-amber-400">{scores.recoveryScore}%</span>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">Cellular and hormonal replenishment coefficient based on sleep averages.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCurrentView('dashboard')}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>Enter Personal Dashboard</span>
                <ArrowRight className="w-4.5 h-4.5" />
              </button>

            </div>
          </div>
        )}

        {/* ========================================================
            5. MAIN DASHBOARD PANELS
            ======================================================== */}
        {currentView === 'dashboard' && (
          <div className="flex-1 flex flex-col lg:flex-row relative">
            
            {/* --- SIDEBAR NAVIGATION --- */}
            <aside className="lg:w-64 border-r border-white/5 bg-slate-950/40 backdrop-blur-md flex flex-row lg:flex-col p-4 gap-2 overflow-x-auto lg:overflow-y-auto shrink-0 relative z-25 justify-start lg:justify-between">
              
              {/* User overview mini card (Sidebar top) */}
              <div className="hidden lg:flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-2xl mb-4 text-left">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-violet-500 flex items-center justify-center font-bold text-slate-100 shadow-md">
                  {currentUser?.name[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h4 className="text-sm font-bold truncate max-w-[120px]">{currentUser?.name || 'BioUser'}</h4>
                  <span className="text-[10px] text-cyan-400/80 font-mono tracking-wider uppercase font-semibold">DNA: {scores.bodyType}</span>
                </div>
              </div>

              {/* Nav links */}
              <nav className="flex flex-row lg:flex-col gap-1 w-full text-left">
                {[
                  { id: 'overview', label: 'Dashboard Overview', icon: Activity },
                  { id: 'blueprint', label: 'Fitness Blueprint', icon: Target },
                  { id: 'twin', label: 'Twin Simulator', icon: Compass },
                  { id: 'coach', label: 'AI Health Coach', icon: Brain },
                  { id: 'analyzer', label: 'Food Analyzer', icon: Upload },
                  { id: 'habits', label: 'Habit Tracker', icon: CheckSquare },
                  { id: 'timeline', label: 'Progress Timeline', icon: TrendingUp },
                  { id: 'achievements', label: 'Achievements', icon: Trophy },
                  { id: 'leaderboard', label: 'Community ranks', icon: Users },
                  { id: 'backend', label: 'FastAPI Integration', icon: Database }
                ].map((item) => {
                  const active = dashboardTab === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setDashboardTab(item.id as any)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                        active 
                          ? 'bg-gradient-to-r from-cyan-500/15 to-violet-500/10 text-cyan-400 border border-cyan-500/20 shadow-md shadow-cyan-500/5' 
                          : 'text-slate-400 hover:text-slate-200 bg-transparent hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${active ? 'text-cyan-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="hidden lg:block border-t border-white/5 pt-4 mt-4 text-[10px] text-slate-500 font-mono">
                FitSnapI Bio Engine Portal &copy; 2026
              </div>

            </aside>

            {/* --- CORE WORKSPACE WORKBOARD --- */}
            <div className="flex-1 overflow-y-auto px-6 py-8 max-w-7xl mx-auto w-full flex flex-col gap-8 text-left">
              
              {/* ==================== TAB: OVERVIEW ==================== */}
              {dashboardTab === 'overview' && (
                <div className="flex flex-col gap-8">
                  {/* Top Stats Cards Grid */}
                  <div className="grid md:grid-cols-4 gap-6">
                    {/* Overall Health Score Circular progress */}
                    <div className="glass-card p-5 rounded-2xl border-cyan-500/10 flex flex-col items-center justify-center text-center gap-3 min-h-[160px]">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Overall Health Score</span>
                      <div className="relative w-24 h-24 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path className="text-slate-800" strokeWidth="2.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          <path className="text-cyan-400" strokeWidth="2.5" strokeDasharray={`${scores.overallHealth}, 100`} strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        </svg>
                        <span className="absolute text-2xl font-black tracking-tighter text-slate-200">{scores.overallHealth}</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-400/5 px-2 py-0.5 rounded border border-emerald-400/10 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        Optimal Condition
                      </span>
                    </div>

                    {/* Weight Goal Progress Card */}
                    <div className="glass-card p-5 rounded-2xl border-white/5 flex flex-col justify-between min-h-[160px]">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Goal Progress</span>
                        <Target className="w-4 h-4 text-violet-400" />
                      </div>
                      <div className="my-2">
                        <span className="text-3xl font-extrabold tracking-tight text-slate-200">72.4%</span>
                        <p className="text-[10px] text-slate-400 mt-1">Goal deadline: {profileForm.targetDate}</p>
                      </div>
                      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-violet-500 to-cyan-400" style={{ width: '72.4%' }} />
                      </div>
                    </div>

                    {/* Exertion/Steps Progress Card */}
                    <div className="glass-card p-5 rounded-2xl border-white/5 flex flex-col justify-between min-h-[160px]">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Daily Exertion</span>
                        <Flame className="w-4 h-4 text-rose-500" />
                      </div>
                      <div className="my-2">
                        <span className="text-3xl font-extrabold tracking-tight text-slate-200">
                          {loggedToday ? todayWorkout : 0} <span className="text-xs text-slate-400 font-medium">/ 45 mins</span>
                        </span>
                        <p className="text-[10px] text-slate-400 mt-1">Estimated active calorie burn: {loggedToday ? todayWorkout * 8 : 0} kcal</p>
                      </div>
                      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500" style={{ width: loggedToday ? `${Math.min(100, (todayWorkout / 45) * 100)}%` : '0%' }} />
                      </div>
                    </div>

                    {/* Hydration Tracker Card */}
                    <div className="glass-card p-5 rounded-2xl border-white/5 flex flex-col justify-between min-h-[160px]">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Daily Hydration</span>
                        <Droplets className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="my-2">
                        <span className="text-3xl font-extrabold tracking-tight text-slate-200">
                          {loggedToday ? todayWater.toFixed(1) : 0} <span className="text-xs text-slate-400 font-medium">/ 3.0 L</span>
                        </span>
                        <p className="text-[10px] text-slate-400 mt-1">Water Goal: {profileForm.waterIntake}L baseline</p>
                      </div>
                      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-400" style={{ width: loggedToday ? `${Math.min(100, (todayWater / 3.0) * 100)}%` : '0%' }} />
                      </div>
                    </div>
                  </div>

                  {/* Charts & Predictons Row */}
                  <div className="grid lg:grid-cols-12 gap-8">
                    
                    {/* SVG Chart Panel (Left 7 cols) */}
                    <div className="glass-card p-6 rounded-3xl border-white/5 lg:col-span-8 flex flex-col gap-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-slate-200">Habit Metrics Chronology</h3>
                          <p className="text-[10px] text-slate-400 mt-0.5">Biometric logs tracked over the current tracking period</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                          <span className="text-[10px] text-slate-400 font-medium font-mono uppercase">Water Intake (Liters)</span>
                        </div>
                      </div>

                      {/* Line Chart Draw Area */}
                      <div className="h-48 relative flex items-end justify-center w-full px-2 border-b border-white/5">
                        <svg className="w-full h-full text-cyan-400" viewBox="0 0 100 40" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
                              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          {/* Grid Lines */}
                          <line x1="0" y1="10" x2="100" y2="10" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                          <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                          <line x1="0" y1="30" x2="100" y2="30" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                          
                          {/* Area Path */}
                          <path d="M 0 35 L 0 20 L 20 28 L 40 15 L 60 22 L 80 32 L 100 18 L 100 40 L 0 40 Z" fill="url(#chartGrad)" />
                          {/* Line Path */}
                          <path d="M 0 20 L 20 28 L 40 15 L 60 22 L 80 32 L 100 18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                          
                          {/* Data dots */}
                          <circle cx="0" cy="20" r="1.5" fill="#06b6d4" />
                          <circle cx="20" cy="28" r="1.5" fill="#06b6d4" />
                          <circle cx="40" cy="15" r="1.5" fill="#06b6d4" />
                          <circle cx="60" cy="22" r="1.5" fill="#06b6d4" />
                          <circle cx="80" cy="32" r="1.5" fill="#06b6d4" />
                          <circle cx="100" cy="18" r="1.5" fill="#06b6d4" />
                        </svg>
                        
                        {/* X-Axis labels */}
                        <div className="absolute bottom-[-20px] left-0 w-full flex justify-between text-[8px] text-slate-500 font-bold uppercase tracking-wider font-mono">
                          <span>Jun 01</span>
                          <span>Jun 02</span>
                          <span>Jun 03</span>
                          <span>Jun 04</span>
                          <span>Jun 05</span>
                          <span>Jun 06</span>
                        </div>
                      </div>
                      
                      <div className="mt-2 text-xs text-slate-400 bg-white/5 border border-white/5 p-3.5 rounded-xl leading-relaxed flex items-start gap-2.5">
                        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <span>
                          <strong>Clinical Insight:</strong> A regular water intake slope above 2.2L daily supports optimal renal clearing and cellular recovery capacity by <span className="text-emerald-400 font-semibold">+15%</span>.
                        </span>
                      </div>
                    </div>

                    {/* Risk Predictor Card (Right 4 cols) */}
                    <div className="glass-card p-6 rounded-3xl border-white/5 lg:col-span-4 flex flex-col justify-between">
                      <div className="flex flex-col gap-1">
                        <h3 className="font-bold text-slate-200">Health Risk Predictor</h3>
                        <p className="text-[10px] text-slate-400">Projected risk index thresholds over 12 weeks</p>
                      </div>

                      <div className="flex flex-col gap-3.5 my-4">
                        {[
                          { name: 'Diabetes Risk', risk: projections.diabRisk },
                          { name: 'Heart Disease', risk: projections.heartRisk },
                          { name: 'Hypertension Risk', risk: profileForm.conditions.includes('Hypertension') ? { percent: 80, label: 'High', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' } : { percent: 22, label: 'Low', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' } },
                          { name: 'Obesity Projection', risk: projections.obesityRisk }
                        ].map((riskObj) => (
                          <div key={riskObj.name} className="flex items-center justify-between border-b border-white/5 pb-2">
                            <span className="text-xs font-bold text-slate-300">{riskObj.name}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border capitalize ${riskObj.risk.color}`}>
                              {riskObj.risk.label} ({riskObj.risk.percent}%)
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="text-[9px] text-slate-400 bg-white/5 border border-white/5 p-3 rounded-lg flex items-start gap-2 leading-relaxed">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>Risks are calculated using clinical parameters. Adjust your twin variables to review how adjustments impact score projections.</span>
                      </div>
                    </div>

                  </div>

                  {/* AI Quick Coach Recommendations Banner */}
                  <div className="glass-card p-6 rounded-3xl border-cyan-500/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 text-left">
                      <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-xl">
                        <Brain className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-200">AI Predictive Health Coach Advice</h4>
                        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                          "Based on your profile, increasing daily hydration to 2.8L reduces metabolic load. Take a 10-minute walk after lunch to stabilize glucose curves."
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setDashboardTab('coach')}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-violet-500 text-white text-xs font-bold rounded-xl whitespace-nowrap cursor-pointer hover:scale-[1.02] transition-transform"
                    >
                      Consult AI Coach
                    </button>
                  </div>
                </div>
              )}

              {/* ==================== TAB: FITNESS BLUEPRINT ==================== */}
              {dashboardTab === 'blueprint' && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="font-bold text-slate-200">Personal Fitness Blueprint</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Custom training scheduling and biochemical targets formulated for your bio-indicators.</p>
                  </div>

                  {/* Summary Metric Strip */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="glass-card p-4 rounded-xl border-white/5">
                      <span className="text-[9px] text-slate-400 uppercase font-medium">Daily Calorie Target</span>
                      <span className="text-xl font-extrabold tracking-tight mt-1 text-cyan-400 block">
                        {Math.round(profileForm.weight * 30)} <span className="text-xs text-slate-500 font-medium">kcal</span>
                      </span>
                    </div>
                    <div className="glass-card p-4 rounded-xl border-white/5">
                      <span className="text-[9px] text-slate-400 uppercase font-medium">Protein Target</span>
                      <span className="text-xl font-extrabold tracking-tight mt-1 text-violet-400 block">
                        {Math.round(profileForm.weight * 1.6)} <span className="text-xs text-slate-500 font-medium">grams</span>
                      </span>
                    </div>
                    <div className="glass-card p-4 rounded-xl border-white/5">
                      <span className="text-[9px] text-slate-400 uppercase font-medium">Daily Water Goal</span>
                      <span className="text-xl font-extrabold tracking-tight mt-1 text-teal-400 block">
                        {profileForm.waterIntake} <span className="text-xs text-slate-500 font-medium">Liters</span>
                      </span>
                    </div>
                    <div className="glass-card p-4 rounded-xl border-white/5">
                      <span className="text-[9px] text-slate-400 uppercase font-medium">Ideal Sleep Window</span>
                      <span className="text-xl font-extrabold tracking-tight mt-1 text-amber-400 block">
                        7.5 - 8.5 <span className="text-xs text-slate-500 font-medium">Hours</span>
                      </span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    
                    {/* Personalized workout plan */}
                    <div className="glass-card p-6 rounded-3xl border-white/5 flex flex-col gap-4">
                      <h4 className="font-bold text-slate-200 flex items-center gap-2">
                        <Dumbbell className="w-5 h-5 text-cyan-400" />
                        <span>Workout Blueprint Schedule</span>
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        A dynamic combination of resistance training and Zone 2 endurance cardio designed to maximize preventive metabolic insulin responses.
                      </p>

                      <div className="flex flex-col gap-3.5 mt-2">
                        {[
                          { day: 'Monday', workout: 'Lower Body Strength & Core', duration: '45 mins', intensity: 'High' },
                          { day: 'Wednesday', workout: 'Zone 2 Steady-State Cardio', duration: '40 mins', intensity: 'Moderate' },
                          { day: 'Thursday', workout: 'Upper Body Pull & Push Hypertrophy', duration: '45 mins', intensity: 'High' },
                          { day: 'Saturday', workout: 'HIIT Conditioning Intervals', duration: '30 mins', intensity: 'Maximum' }
                        ].map((item) => (
                          <div key={item.day} className="flex items-center justify-between border-b border-white/5 pb-2">
                            <div>
                              <span className="text-xs font-bold text-slate-300 block">{item.day}</span>
                              <span className="text-[10px] text-slate-400">{item.workout}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-bold text-cyan-400 block">{item.duration}</span>
                              <span className="text-[9px] text-slate-500 font-mono font-bold uppercase">{item.intensity} intensity</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Nutrition Recommendations */}
                    <div className="glass-card p-6 rounded-3xl border-white/5 flex flex-col gap-4">
                      <h4 className="font-bold text-slate-200 flex items-center gap-2">
                        <Star className="w-5 h-5 text-violet-400" />
                        <span>Nutrition & Recovery Guide</span>
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Bio-optimized suggestions based on body composition profiles and genetic indicators.
                      </p>

                      <div className="flex flex-col gap-3 mt-2">
                        <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-xs leading-relaxed">
                          <strong className="text-slate-200 block mb-0.5">Optimal Meal Timings</strong>
                          Consume high-protein macro rations within 90 minutes post-workout. Avoid heavy solid meals after 8:00 PM to support restorative sleep cycles.
                        </div>
                        <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-xs leading-relaxed">
                          <strong className="text-slate-200 block mb-0.5">Cellular Recovery Suggestion</strong>
                          Take a magnesium glycinate supplement before bed to support muscle relaxation and nervous system down-regulation.
                        </div>
                        <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-xs leading-relaxed">
                          <strong className="text-slate-200 block mb-0.5">Glycemic Defense Strategy</strong>
                          Include healthy soluble fiber (avocados, asparagus, flaxseeds) in your first meal daily to establish smooth glycemic lines.
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* ==================== TAB: TWIN SIMULATOR ==================== */}
              {dashboardTab === 'twin' && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="font-bold text-slate-200">Health Twin Simulator</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Flagship Sandbox: Modify your sleep, water, and fitness habits to preview the projected impact on your biological metrics.</p>
                  </div>

                  <div className="grid lg:grid-cols-12 gap-8">
                    
                    {/* Controls Panel (Left 5 cols) */}
                    <div className="glass-card p-6 rounded-3xl border-white/5 lg:col-span-5 flex flex-col gap-6">
                      <h4 className="font-bold text-slate-200 flex items-center gap-2 border-b border-white/5 pb-3">
                        <Compass className="w-5 h-5 text-cyan-400 animate-spin" />
                        <span>Interactive Twin Sliders</span>
                      </h4>

                      {/* Slider 1: Sleep */}
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-slate-300">Daily Rest (Sleep Hours)</span>
                          <span className="font-bold text-cyan-400">{twinSleep} hours</span>
                        </div>
                        <input 
                          type="range" 
                          min="4" 
                          max="10" 
                          step="0.5"
                          value={twinSleep}
                          onChange={(e) => setTwinSleep(parseFloat(e.target.value))}
                          className="w-full accent-cyan-400 cursor-ew-resize bg-slate-800 rounded-lg h-2"
                        />
                      </div>

                      {/* Slider 2: Water */}
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-slate-300">Hydration (Water Intake)</span>
                          <span className="font-bold text-cyan-400">{twinWater.toFixed(1)} Liters</span>
                        </div>
                        <input 
                          type="range" 
                          min="1" 
                          max="5" 
                          step="0.1"
                          value={twinWater}
                          onChange={(e) => setTwinWater(parseFloat(e.target.value))}
                          className="w-full accent-cyan-400 cursor-ew-resize bg-slate-800 rounded-lg h-2"
                        />
                      </div>

                      {/* Slider 3: Workout Duration */}
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-slate-300">Exercise Duration</span>
                          <span className="font-bold text-cyan-400">{twinWorkout} mins / day</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="120" 
                          step="5"
                          value={twinWorkout}
                          onChange={(e) => setTwinWorkout(parseInt(e.target.value))}
                          className="w-full accent-cyan-400 cursor-ew-resize bg-slate-800 rounded-lg h-2"
                        />
                      </div>

                      {/* Slider 4: Diet Quality */}
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-slate-300">Nutrition Quality Index</span>
                          <span className="font-bold text-cyan-400">{twinNutrition}% Score</span>
                        </div>
                        <input 
                          type="range" 
                          min="40" 
                          max="100" 
                          step="1"
                          value={twinNutrition}
                          onChange={(e) => setTwinNutrition(parseInt(e.target.value))}
                          className="w-full accent-cyan-400 cursor-ew-resize bg-slate-800 rounded-lg h-2"
                        />
                      </div>

                      {/* Slider 5: Overall Activity level */}
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-slate-300">Activity Exertion State</label>
                        <select 
                          value={twinActivity}
                          onChange={(e) => setTwinActivity(e.target.value)}
                          className="w-full bg-slate-900 border border-white/5 focus:border-cyan-500/40 rounded-xl px-4 py-2 text-xs outline-none text-slate-300"
                        >
                          <option value="sedentary">Sedentary (No movement)</option>
                          <option value="light">Lightly Active</option>
                          <option value="moderate">Moderately Active</option>
                          <option value="active">Daily Athletic Intensity</option>
                        </select>
                      </div>

                    </div>

                    {/* Twin Comparison Display Panel (Right 7 cols) */}
                    <div className="glass-card p-6 rounded-3xl border-cyan-500/15 lg:col-span-7 flex flex-col gap-6 text-center">
                      <h4 className="font-bold text-slate-200 text-left">Projected Biological Twin Comparison</h4>

                      {/* Side-by-side core score cards */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* CURRENT LIFESTYLE */}
                        <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex flex-col gap-2 text-left relative overflow-hidden">
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Current Lifestyle</span>
                          <div className="my-1">
                            <span className="text-3xl font-extrabold tracking-tight text-slate-400">{scores.overallHealth}</span>
                            <span className="text-xs text-slate-500 font-medium ml-1">Overall HP</span>
                          </div>
                          <div className="text-[10px] text-slate-400 flex flex-col gap-1 mt-2 border-t border-white/5 pt-2">
                            <span>Fitness Age: <strong>{profileForm.age} Yrs</strong></span>
                            <span>Projected Weight: <strong>{profileForm.weight} kg</strong></span>
                          </div>
                        </div>

                        {/* IMPROVED TWIN (Dynamic) */}
                        <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-violet-500/5 border border-cyan-500/30 rounded-2xl flex flex-col gap-2 text-left relative overflow-hidden">
                          <div className="absolute top-0 right-0 px-2 py-0.5 bg-cyan-500 text-[8px] font-mono text-slate-950 font-bold uppercase rounded-bl">PROJECTED</div>
                          <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">Projected Twin</span>
                          <div className="my-1">
                            <span className="text-3xl font-extrabold tracking-tight text-cyan-300">{projections.healthScore}</span>
                            <span className="text-xs text-cyan-400 font-medium ml-1">Overall HP</span>
                          </div>
                          <div className="text-[10px] text-slate-300 flex flex-col gap-1 mt-2 border-t border-cyan-500/10 pt-2">
                            <span>Fitness Age: <strong className="text-cyan-400">{projections.fitnessAge} Yrs</strong></span>
                            <span>Projected Weight: <strong className="text-cyan-400">{projections.weight} kg</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Trajectory comparison line chart */}
                      <div className="flex flex-col gap-2 text-left mt-2">
                        <h5 className="text-xs font-bold text-slate-300">12-Week Bio-Path Projections</h5>
                        <div className="h-32 bg-slate-950/60 border border-white/5 rounded-2xl relative flex items-end p-2 overflow-hidden">
                          {/* SVG paths comparison */}
                          <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                            {/* Current flat projection */}
                            <path d={`M 0 ${40 - scores.overallHealth * 0.35} L 100 ${40 - scores.overallHealth * 0.35}`} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeDasharray="2 2" />
                            {/* Projected curve */}
                            <path d={`M 0 ${40 - scores.overallHealth * 0.35} C 30 ${40 - (scores.overallHealth + 3) * 0.35}, 70 ${40 - (projections.healthScore - 1) * 0.35}, 100 ${40 - projections.healthScore * 0.35}`} fill="none" stroke="#22d3ee" strokeWidth="2.5" />
                          </svg>
                          <div className="absolute top-2 left-2 text-[9px] text-slate-400 font-bold uppercase tracking-wider">Health Curve Over Time</div>
                          <div className="absolute bottom-2 right-2 text-[8px] text-cyan-400 font-bold font-mono">Improved twin path</div>
                        </div>
                      </div>

                      {/* Risks Dynamic indicators */}
                      <div className="grid grid-cols-3 gap-3 text-left">
                        <div className="bg-white/5 border border-white/5 rounded-xl p-3">
                          <span className="text-[9px] text-slate-400 uppercase font-medium">Diabetes Risk</span>
                          <span className={`text-[10px] font-bold block mt-1 uppercase ${projections.diabRisk.color} border px-2 py-0.5 rounded w-fit`}>
                            {projections.diabRisk.label}
                          </span>
                        </div>
                        <div className="bg-white/5 border border-white/5 rounded-xl p-3">
                          <span className="text-[9px] text-slate-400 uppercase font-medium">Heart Disease</span>
                          <span className={`text-[10px] font-bold block mt-1 uppercase ${projections.heartRisk.color} border px-2 py-0.5 rounded w-fit`}>
                            {projections.heartRisk.label}
                          </span>
                        </div>
                        <div className="bg-white/5 border border-white/5 rounded-xl p-3">
                          <span className="text-[9px] text-slate-400 uppercase font-medium">Obesity Risk</span>
                          <span className={`text-[10px] font-bold block mt-1 uppercase ${projections.obesityRisk.color} border px-2 py-0.5 rounded w-fit`}>
                            {projections.obesityRisk.label}
                          </span>
                        </div>
                      </div>

                    </div>

                  </div>
                </div>
              )}

              {/* ==================== TAB: AI HEALTH COACH ==================== */}
              {dashboardTab === 'coach' && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="font-bold text-slate-200">AI Health Coach</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Interactive medical consultation assistant trained on your FitDNA biometrics and habit history.</p>
                  </div>

                  <div className="grid lg:grid-cols-12 gap-8">
                    
                    {/* Prompt lab suggestions (Left 4 cols) */}
                    <div className="glass-card p-6 rounded-3xl border-white/5 lg:col-span-4 flex flex-col gap-4">
                      <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider border-b border-white/5 pb-2">Diagnostic Prompt Templates</h4>
                      <p className="text-[10px] text-slate-400">Select a structured clinical prompt to guide the health assistant:</p>
                      
                      <div className="flex flex-col gap-2.5 mt-2">
                        {[
                          { title: '🔍 Check My Wellness Trends', prompt: 'What are my predicted health risks based on my current biometrics?' },
                          { title: '🩺 Prepare Doctor Summary', prompt: 'Please summarize my average habit history, compliance ratings, and conditions for my doctor appointment.' },
                          { title: '🍎 Analyze Nutritional Balance', prompt: 'How can I optimize my protein intake and reduce post-workout recovery times?' },
                          { title: '🚨 Low Sugar Response Checklist', prompt: 'If my blood sugar dips low, what clinical protocols should I follow immediately?' },
                          { title: '💤 Optimize Restorative Sleep', prompt: 'How can I improve my deep sleep score averages based on my lifestyle inputs?' }
                        ].map((item) => (
                          <button
                            key={item.title}
                            onClick={() => handlePromptClick(item.prompt)}
                            className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-cyan-500/20 text-left rounded-xl transition-all cursor-pointer"
                          >
                            <strong className="text-xs text-slate-200 block mb-0.5">{item.title}</strong>
                            <p className="text-[9px] text-slate-400 line-clamp-1">{item.prompt}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Chat Panel (Right 8 cols) */}
                    <div className="glass-card p-6 rounded-3xl border-cyan-500/10 lg:col-span-8 flex flex-col h-[520px]">
                      
                      {/* Active header */}
                      <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                        <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold text-xs">
                          AI
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-200">Coach BioAssistant</h4>
                          <span className="text-[9px] text-slate-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Synchronized with FitDNA Profile
                          </span>
                        </div>
                      </div>

                      {/* Chat messages */}
                      <div className="flex-1 overflow-y-auto my-4 pr-2 flex flex-col gap-4 text-xs">
                        {chatMessages.map((msg, index) => {
                          const isAi = msg.sender === 'ai';
                          return (
                            <div key={index} className={`flex flex-col gap-1 max-w-[85%] ${isAi ? 'self-start text-left' : 'self-end text-left'}`}>
                              <span className={`text-[8px] text-slate-500 font-mono ${isAi ? 'self-start' : 'self-end'}`}>{msg.time}</span>
                              <div className={`p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                                isAi 
                                  ? 'bg-slate-900 border border-white/5 text-slate-200' 
                                  : 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-medium'
                              }`}>
                                {msg.text}
                              </div>
                            </div>
                          );
                        })}
                        {isTyping && (
                          <div className="self-start bg-slate-900 border border-white/5 p-3.5 rounded-2xl text-[10px] text-slate-400 font-medium flex items-center gap-2">
                            <svg className="animate-spin h-3.5 w-3.5 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Analyzing DNA markers...</span>
                          </div>
                        )}
                      </div>

                      {/* Input bar */}
                      <form onSubmit={handleChatSend} className="flex gap-2 border-t border-white/5 pt-3">
                        <input 
                          type="text" 
                          placeholder="Ask about workouts, nutrition targets, diabetes prevention..."
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          className="flex-1 bg-slate-900 border border-white/5 focus:border-cyan-500/40 rounded-xl px-4 py-2.5 text-xs outline-none"
                        />
                        <button 
                          type="submit"
                          className="p-3 bg-gradient-to-r from-cyan-500 to-violet-500 text-white rounded-xl hover:scale-[1.02] transition-transform cursor-pointer"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </form>

                    </div>

                  </div>
                </div>
              )}

              {/* ==================== TAB: FOOD ANALYZER ==================== */}
              {dashboardTab === 'analyzer' && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="font-bold text-slate-200">Computer Vision Food Analyzer</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Use computer vision to evaluate estimated macronutrient ratios and caloric impact of meal selections.</p>
                  </div>

                  <div className="grid lg:grid-cols-12 gap-8">
                    
                    {/* Upload / Selector Panel (Left 5 cols) */}
                    <div className="glass-card p-6 rounded-3xl border-white/5 lg:col-span-5 flex flex-col gap-6">
                      <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider border-b border-white/5 pb-2">Image Scanner Simulator</h4>
                      <p className="text-[10px] text-slate-400">Select a preset meal photo to simulate instant scanning, or click below to upload custom media:</p>

                      <div className="grid grid-cols-3 gap-3">
                        {foodPresets.map((preset) => (
                          <button
                            key={preset.name}
                            onClick={() => simulateScan(preset.name)}
                            disabled={scanningImage}
                            className={`p-3 bg-white/5 hover:bg-white/10 border rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer ${
                              selectedMealPreset === preset.name ? 'border-cyan-500/30 bg-cyan-500/5' : 'border-white/5'
                            }`}
                          >
                            <span className="text-2xl">{preset.image}</span>
                            <span className="text-[8px] font-bold text-slate-300 line-clamp-2">{preset.name.split(' ')[0]}</span>
                          </button>
                        ))}
                      </div>

                      {/* File Drag and Drop Card */}
                      <div className="border border-dashed border-white/10 hover:border-cyan-500/30 rounded-2xl p-6 flex flex-col items-center justify-center gap-2.5 transition-all text-center cursor-pointer">
                        <Upload className="w-8 h-8 text-slate-500" />
                        <div>
                          <strong className="text-xs text-slate-300 block">Drag & Drop Food Image</strong>
                          <span className="text-[9px] text-slate-500 mt-0.5 block">Supports PNG, JPG up to 10MB</span>
                        </div>
                      </div>

                    </div>

                    {/* Report analysis Display Panel (Right 7 cols) */}
                    <div className="glass-card p-6 rounded-3xl border-cyan-500/15 lg:col-span-7 flex flex-col gap-6 min-h-[350px] justify-center relative overflow-hidden">
                      {scanningImage ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-16">
                          <svg className="animate-spin h-8 w-8 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="text-xs text-slate-400 font-medium">Scanning meal biometrics...</span>
                          {/* Scan laser animation overlay */}
                          <div className="absolute left-0 right-0 h-0.5 bg-cyan-400 shadow-md shadow-cyan-400 animate-bounce top-1/2" />
                        </div>
                      ) : analyzedMeal ? (
                        <div className="flex flex-col gap-5 text-left">
                          <div className="flex justify-between items-start border-b border-white/5 pb-3">
                            <div>
                              <span className="text-[9px] text-slate-400 font-mono tracking-wider uppercase block">Analysis Report</span>
                              <h4 className="text-base font-bold text-slate-200">{analyzedMeal.name}</h4>
                            </div>
                            <span className={`text-xs font-bold px-2.5 py-1 border rounded-lg ${analyzedMeal.ratingColor}`}>
                              Rating: {analyzedMeal.rating}
                            </span>
                          </div>

                          {/* Nutrition Stats strip */}
                          <div className="grid grid-cols-4 gap-2 text-center bg-white/5 p-3 rounded-2xl border border-white/5">
                            <div>
                              <span className="text-[8px] text-slate-400 uppercase font-medium">Est. Calories</span>
                              <span className="text-sm font-extrabold text-slate-200 block mt-0.5">{analyzedMeal.calories} kcal</span>
                            </div>
                            <div>
                              <span className="text-[8px] text-slate-400 uppercase font-medium">Protein</span>
                              <span className="text-sm font-extrabold text-cyan-400 block mt-0.5">{analyzedMeal.protein}g</span>
                            </div>
                            <div>
                              <span className="text-[8px] text-slate-400 uppercase font-medium">Carbohydrate</span>
                              <span className="text-sm font-extrabold text-violet-400 block mt-0.5">{analyzedMeal.carbs}g</span>
                            </div>
                            <div>
                              <span className="text-[8px] text-slate-400 uppercase font-medium">Fat</span>
                              <span className="text-sm font-extrabold text-amber-400 block mt-0.5">{analyzedMeal.fat}g</span>
                            </div>
                          </div>

                          <div>
                            <strong className="text-xs text-slate-300 block mb-1">AI Nutritional Evaluation:</strong>
                            <p className="text-xs text-slate-400 leading-relaxed">{analyzedMeal.analysisText}</p>
                          </div>

                          <div className="border-t border-white/5 pt-3">
                            <strong className="text-xs text-slate-300 block mb-1.5">Recommended Optimization Alternatives:</strong>
                            <ul className="list-disc list-inside text-xs text-slate-400 flex flex-col gap-1.5 pl-1">
                              {analyzedMeal.alternatives.map((alt, idx) => (
                                <li key={idx} className="leading-relaxed">{alt}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500 text-center">
                          <ImageIcon className="w-10 h-10" />
                          <div>
                            <h5 className="font-bold text-slate-300">No Food Analyzed</h5>
                            <p className="text-xs text-slate-500 max-w-xs mt-1">Select a preset or upload your food picture above to parse macronutrient statistics.</p>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )}

              {/* ==================== TAB: HABITS ==================== */}
              {dashboardTab === 'habits' && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="font-bold text-slate-200">Habit Tracking System</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Track daily biometric logging schedules, water intake consistency, and exercise milestones.</p>
                  </div>

                  <div className="grid lg:grid-cols-12 gap-8">
                    
                    {/* Log entry panel (Left 5 cols) */}
                    <div className="glass-card p-6 rounded-3xl border-white/5 lg:col-span-5 flex flex-col gap-5">
                      <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider border-b border-white/5 pb-2">Log Daily Indicators</h4>
                      
                      <form onSubmit={logTodayMetrics} className="flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block mb-1">Rest (Sleep Hours)</label>
                            <input 
                              type="number" 
                              step="0.5"
                              value={todaySleep}
                              onChange={(e) => setTodaySleep(parseFloat(e.target.value) || 0)}
                              className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-cyan-500/40"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block mb-1">Hydration (Water L)</label>
                            <input 
                              type="number" 
                              step="0.1"
                              value={todayWater}
                              onChange={(e) => setTodayWater(parseFloat(e.target.value) || 0)}
                              className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-cyan-500/40"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block mb-1">Exercise (Mins)</label>
                            <input 
                              type="number" 
                              value={todayWorkout}
                              onChange={(e) => setTodayWorkout(parseInt(e.target.value) || 0)}
                              className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-cyan-500/40"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block mb-1">Calories Consumed</label>
                            <input 
                              type="number" 
                              value={todayCalories}
                              onChange={(e) => setTodayCalories(parseInt(e.target.value) || 0)}
                              className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-cyan-500/40"
                            />
                          </div>
                        </div>

                        <button 
                          type="submit"
                          className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-bold rounded-xl text-xs hover:scale-[1.02] transition-transform cursor-pointer"
                        >
                          Save Habit Indicators
                        </button>
                      </form>

                      {loggedToday && (
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-xl flex items-center gap-2">
                          <Check className="w-4 h-4" />
                          <span>Today's biometrics logged successfully (+100 XP)</span>
                        </div>
                      )}
                    </div>

                    {/* History & Weekly Streaks Panel (Right 7 cols) */}
                    <div className="glass-card p-6 rounded-3xl border-white/5 lg:col-span-7 flex flex-col gap-4">
                      <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider border-b border-white/5 pb-2">Habit Consistency Ledger</h4>

                      <div className="flex flex-col gap-3">
                        {habitHistory.map((log) => (
                          <div key={log.date} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl">
                            <div>
                              <strong className="text-xs text-slate-200 block">{log.date}</strong>
                              <span className="text-[10px] text-slate-400">
                                Sleep: {log.sleep}h | Water: {log.water}L | Workout: {log.workouts}m
                              </span>
                            </div>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                              log.completed 
                                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                                : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                            }`}>
                              {log.completed ? 'Goal Met' : 'Partial'}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Weekly AI Challenges Strip */}
                      <div className="mt-4 border-t border-white/5 pt-4">
                        <strong className="text-xs text-slate-300 block mb-3">Weekly AI Challenges</strong>
                        <div className="flex flex-col gap-3">
                          {challenges.map((ch) => {
                            const claimed = claimedRewards.includes(ch.id);
                            return (
                              <div key={ch.id} className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between gap-4">
                                <div className="flex-1 text-left">
                                  <strong className="text-xs text-slate-200 block">{ch.title}</strong>
                                  <span className="text-[9px] text-slate-400">{ch.target}</span>
                                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-2">
                                    <div className="h-full bg-cyan-400" style={{ width: `${(ch.progress / ch.max) * 100}%` }} />
                                  </div>
                                  <span className="text-[8px] text-slate-500 font-mono mt-1 block">Progress: {ch.progress} / {ch.max} {ch.unit}</span>
                                </div>
                                <button
                                  disabled={ch.progress < ch.max || claimed}
                                  onClick={() => claimChallenge(ch.id, ch.xpReward)}
                                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                                    claimed
                                      ? 'bg-slate-900 border border-white/5 text-slate-500'
                                      : ch.progress >= ch.max
                                      ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white cursor-pointer hover:scale-[1.02]'
                                      : 'bg-white/5 border border-white/5 text-slate-400'
                                  }`}
                                >
                                  {claimed ? 'Claimed' : ch.progress >= ch.max ? `Claim ${ch.xpReward} XP` : 'In Progress'}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>

                  </div>
                </div>
              )}

              {/* ==================== TAB: TIMELINE ==================== */}
              {dashboardTab === 'timeline' && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="font-bold text-slate-200">Progress Timeline</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Visualize your biological progress milestone trajectory from Day 1 to goal completion.</p>
                  </div>

                  <div className="glass-card p-8 rounded-3xl border-white/5 relative overflow-hidden flex flex-col gap-8">
                    
                    {/* Vertical timeline line for mobile, horizontal wrapper */}
                    <div className="relative flex flex-col md:flex-row md:justify-between items-start md:items-center gap-8 md:gap-4 w-full">
                      {/* Timeline Background Connector Line */}
                      <div className="absolute top-4 bottom-4 left-4 md:left-2 md:right-2 md:top-1/2 md:h-0.5 md:w-full bg-white/5 z-0" />
                      
                      {[
                        { day: 'Day 1', desc: 'Assessments Logged', status: 'Completed', date: 'Jun 01', hp: scores.overallHealth, completed: true, color: 'border-cyan-500 text-cyan-400 bg-cyan-500/10' },
                        { day: 'Week 1', desc: 'Hydration Catalyst Challenge', status: 'Completed', date: 'Jun 08', hp: scores.overallHealth + 2, completed: true, color: 'border-cyan-500 text-cyan-400 bg-cyan-500/10' },
                        { day: 'Week 2', desc: 'Cardio Volume Threshold', status: 'Pending', date: 'Jun 15', hp: scores.overallHealth + 4, completed: false, color: 'border-white/10 text-slate-500 bg-white/5' },
                        { day: 'Month 1', desc: 'Weight Recomp Target (-2kg)', status: 'Pending', date: 'Jun 30', hp: scores.overallHealth + 7, completed: false, color: 'border-white/10 text-slate-500 bg-white/5' },
                        { day: 'Target Date', desc: profileForm.targetGoal, status: 'Pending', date: profileForm.targetDate, hp: 85, completed: false, color: 'border-white/10 text-slate-500 bg-white/5' }
                      ].map((node, idx) => (
                        <div key={idx} className="flex md:flex-col items-center gap-4 md:gap-3 z-10 relative text-left md:text-center w-full md:max-w-[150px]">
                          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 ${node.color}`}>
                            {idx + 1}
                          </div>
                          <div>
                            <strong className="text-xs text-slate-200 block">{node.day}</strong>
                            <p className="text-[10px] text-slate-400 mt-0.5">{node.desc}</p>
                            <span className="text-[9px] text-slate-500 font-mono mt-1 block font-bold">{node.date} &bull; HP Proj: {node.hp}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-white/5 pt-6 grid sm:grid-cols-2 gap-6 text-left">
                      <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                        <strong className="text-xs text-slate-200 block mb-1">Health Score Improvements</strong>
                        <p className="text-xs text-slate-400 leading-relaxed">Your health score is projected to scale from <strong>{scores.overallHealth}</strong> up to <strong>85</strong> by your milestone deadline target date, reducing systemic cellular fatigue.</p>
                      </div>
                      <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                        <strong className="text-xs text-slate-200 block mb-1">Weight Curve Projection</strong>
                        <p className="text-xs text-slate-400 leading-relaxed">Based on exercise limits and nutrition scores, metabolic twin calculations estimate a weight correction to <strong>{projections.weight} kg</strong> by the end of Week 12.</p>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* ==================== TAB: ACHIEVEMENTS ==================== */}
              {dashboardTab === 'achievements' && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="font-bold text-slate-200">Achievement & Gamification</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Unlock collectible health badges and claim additional wellness XP rewards.</p>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {achievements.map((ach) => (
                      <div 
                        key={ach.id} 
                        className={`glass-card p-5 rounded-2xl border transition-all flex flex-col gap-3 text-left ${
                          ach.unlocked ? 'border-cyan-500/20 bg-cyan-500/5' : 'border-white/5 opacity-50'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-3xl">{ach.badge}</span>
                          <span className={`text-[8px] font-bold px-2 py-0.5 rounded border uppercase ${
                            ach.unlocked ? 'text-cyan-400 border-cyan-500/30' : 'text-slate-500 border-white/5'
                          }`}>
                            {ach.unlocked ? 'Unlocked' : 'Locked'}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-200 text-sm">{ach.title}</h4>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{ach.description}</p>
                        </div>
                        <span className="text-[9px] text-cyan-400 font-mono mt-1 block uppercase tracking-wider font-bold">Reward: +{ach.xpReward} XP</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ==================== TAB: LEADERBOARD ==================== */}
              {dashboardTab === 'leaderboard' && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="font-bold text-slate-200">Community Leaderboard</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Ranked by Health Points (HP) metrics rather than raw weight loss, rewarding balanced wellness habits.</p>
                  </div>

                  <div className="glass-card p-6 rounded-3xl border-white/5 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-white/5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            <th className="pb-3 pl-2">Rank</th>
                            <th className="pb-3">User Name</th>
                            <th className="pb-3">Active Badge Title</th>
                            <th className="pb-3">Habit Consistency</th>
                            <th className="pb-3 pr-2 text-right">Health Points (HP)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                          {leaderboardUsers.map((user) => (
                            <tr key={user.rank} className="hover:bg-white/[0.01] transition-colors duration-150">
                              <td className="py-4 pl-2 font-bold font-mono text-cyan-400">#{user.rank}</td>
                              <td className="py-4 font-bold text-slate-200">{user.name}</td>
                              <td className="py-4 text-violet-400 font-medium">{user.activeBadge}</td>
                              <td className="py-4 font-mono font-medium text-slate-400">{user.completionRate}</td>
                              <td className="py-4 pr-2 text-right font-extrabold font-mono text-cyan-400">{user.hp} HP</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ==================== TAB: BACKEND INTEGRATION ==================== */}
              {dashboardTab === 'backend' && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="font-bold text-slate-200">FastAPI & PostgreSQL Backend Control</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Inspect integration endpoints, verify API connection status, and read instructions for live database connectivity.</p>
                  </div>

                  <div className="grid lg:grid-cols-12 gap-8">
                    
                    {/* Connection Config (Left 5 cols) */}
                    <div className="glass-card p-6 rounded-3xl border-white/5 lg:col-span-5 flex flex-col gap-5">
                      <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider border-b border-white/5 pb-2">Sync Settings</h4>
                      
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block">FastAPI Server URL</label>
                        <input 
                          type="text" 
                          value={backendIp}
                          onChange={(e) => setBackendIp(e.target.value)}
                          className="w-full bg-slate-900 border border-white/5 focus:border-cyan-500/40 rounded-xl px-4 py-2.5 text-xs outline-none text-slate-300"
                        />
                      </div>

                      <button
                        onClick={testBackendConnection}
                        className="py-2.5 bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-bold rounded-xl text-xs hover:scale-[1.02] transition-transform cursor-pointer"
                      >
                        Ping Backend Integration
                      </button>

                      <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-xl text-xs">
                        <span className={`w-3.5 h-3.5 rounded-full ${backendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
                        <span>
                          Status: <strong>{backendConnected ? 'CONNECTED' : 'OFFLINE (Fallback Active)'}</strong>
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono">Last successful sync: {lastSyncTime}</span>
                    </div>

                    {/* Developer details and FastAPI instructions (Right 7 cols) */}
                    <div className="glass-card p-6 rounded-3xl border-white/5 lg:col-span-7 flex flex-col gap-4">
                      <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider border-b border-white/5 pb-2">Integration Blueprint Code</h4>
                      <p className="text-[10px] text-slate-400">FitSnapI is fully architected to bind to a local PostgreSQL datastore via FastAPI endpoints. Review our Python connection controller:</p>
                      
                      {/* Code Block */}
                      <pre className="bg-slate-950/80 p-4 rounded-2xl border border-white/5 overflow-x-auto text-[9px] text-cyan-400 font-mono leading-relaxed">
{`from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 1. PostgreSQL Database Configuration
SQLALCHEMY_DATABASE_URL = "postgresql://user:pass@localhost/fitsnap"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

# 2. Database Patient Profile Schema
class PatientProfile(Base):
    __tablename__ = "profiles"
    id = Column(Integer, primary_key=True, index=True)
    age = Column(Integer)
    gender = Column(String)
    weight = Column(Float)
    height = Column(Float)
    goal = Column(String)

# 3. FASTAPI Profile Sync Handler
app = FastAPI()

@app.post("/api/v1/profile")
async def sync_profile(profile: dict):
    # Synchronizes FitDNA profiles directly into PostgreSQL
    db = SessionLocal()
    try:
        new_prof = PatientProfile(**profile)
        db.add(new_prof)
        db.commit()
        return {"status": "synchronized"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))`}
                      </pre>
                    </div>

                  </div>
                </div>
              )}

            </div>

          </div>
        )}

      </main>
    </div>
  );
}
