import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Tag, MapPin, Building2, ArrowRight, CheckCircle2, Bot, X } from 'lucide-react';
import { getProfile, updateProfile, type UserProfile } from '../lib/api';
import { useAuth } from '../components/auth/AuthWrapper';

export function OnboardingPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  // Local state for inputs
  const [tagInput, setTagInput] = useState('');
  const [locInput, setLocInput] = useState('');
  const [orgInput, setOrgInput] = useState('');
  const [avatarGender, setAvatarGender] = useState<'male' | 'female' | 'neutral'>('neutral');

  useEffect(() => {
    // Attempt to load the blank profile created by the backend on signup
    getProfile().then(p => {
      if (p) setProfile(p);
    });
  }, []);

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleFinish = async () => {
    if (profile) {
      await updateProfile(profile);
    }
    // Save avatar preference
    localStorage.setItem('avatar_gender', avatarGender);
    // Mark onboarding complete so we don't return here
    localStorage.setItem('onboarded', 'true');
    localStorage.removeItem('just_signed_up');
    navigate('/');
  };

  // Handlers for adding items
  const addTag = () => {
    const tags = profile?.focus_tags || [];
    if (tagInput.trim() && profile && !tags.includes(tagInput.trim())) {
      setProfile({ ...profile, focus_tags: [...tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (t: string) => {
    if (profile) setProfile({ ...profile, focus_tags: (profile.focus_tags || []).filter(x => x !== t) });
  };

  const addLoc = () => {
    if (locInput.trim() && profile) {
      const locs = profile.preferred_locations || [];
      if (!locs.includes(locInput.trim())) {
        setProfile({ ...profile, preferred_locations: [...locs, locInput.trim()] });
        setLocInput('');
      }
    }
  };

  const removeLoc = (l: string) => {
    if (profile) setProfile({ ...profile, preferred_locations: (profile.preferred_locations || []).filter(x => x !== l) });
  };

  const addOrg = () => {
    if (orgInput.trim() && profile) {
      const entities = [...profile.entities];
      if (entities.length === 0) {
        entities.push({ name: "My Business", tracked_organizations: [], target_sectors: [] });
      }
      const orgs = entities[0].tracked_organizations || [];
      if (!orgs.includes(orgInput.trim())) {
        entities[0] = { ...entities[0], tracked_organizations: [...orgs, orgInput.trim()] };
        setProfile({ ...profile, entities });
        setOrgInput('');
      }
    }
  };

  const removeOrg = (o: string) => {
    if (profile && profile.entities.length > 0) {
      const entities = [...profile.entities];
      entities[0] = { ...entities[0], tracked_organizations: entities[0].tracked_organizations.filter(x => x !== o) };
      setProfile({ ...profile, entities });
    }
  };

  const slideVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  };

  if (!profile) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading profile...</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center py-12 px-4">
      
      {/* Progress Bar */}
      <div className="w-full max-w-2xl mb-8">
        <div className="flex justify-between mb-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`text-xs font-medium ${step >= i ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-600'}`}>
              Step {i}
            </div>
          ))}
        </div>
        <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 transition-all duration-500 ease-out"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden relative min-h-[550px] md:min-h-[600px]">
        <AnimatePresence mode="wait">
          
          {step === 1 && (
            <motion.div key="step1" variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="p-8 md:p-12 pb-28 md:pb-32 absolute inset-0">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-6">
                <Tag className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">What topics do you track?</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8">Add keywords like "Agentic AI", "Robotics", or "Fintech". Articles mentioning these will be boosted in your feed.</p>
              
              <div className="flex gap-2 mb-6">
                <input 
                  type="text" 
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addTag()}
                  className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white"
                  placeholder="e.g. LLMs"
                />
                <button onClick={addTag} className="px-4 bg-slate-900 dark:bg-slate-800 text-white rounded-lg hover:bg-slate-800 transition-colors">Add</button>
              </div>

              <div className="flex flex-wrap gap-2">
                {(profile.focus_tags || []).map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium border border-blue-100 dark:border-blue-800/50">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-blue-900 dark:hover:text-blue-100"><X size={14} /></button>
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="p-8 md:p-12 pb-28 md:pb-32 absolute inset-0">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl flex items-center justify-center mb-6">
                <MapPin className="text-emerald-600 dark:text-emerald-400" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Any specific regions?</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8">Add countries or regions (e.g. "US", "Europe", "India"). We will prioritize news affecting these markets.</p>
              
              <div className="flex gap-2 mb-6">
                <input 
                  type="text" 
                  value={locInput}
                  onChange={e => setLocInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addLoc()}
                  className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white"
                  placeholder="e.g. India"
                />
                <button onClick={addLoc} className="px-4 bg-slate-900 dark:bg-slate-800 text-white rounded-lg hover:bg-slate-800 transition-colors">Add</button>
              </div>

              <div className="flex flex-wrap gap-2">
                {(profile.preferred_locations || []).map(loc => (
                  <span key={loc} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-full text-sm font-medium border border-emerald-100 dark:border-emerald-800/50">
                    {loc}
                    <button onClick={() => removeLoc(loc)} className="hover:text-emerald-900 dark:hover:text-emerald-100"><X size={14} /></button>
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="p-8 md:p-12 pb-28 md:pb-32 absolute inset-0">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center mb-6">
                <Building2 className="text-purple-600 dark:text-purple-400" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Tracked Organizations</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8">Who are your competitors, partners, or vendors? Items mentioning them will receive a massive 'Business Relevance' boost.</p>
              
              <div className="flex gap-2 mb-6">
                <input 
                  type="text" 
                  value={orgInput}
                  onChange={e => setOrgInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addOrg()}
                  className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white"
                  placeholder="e.g. OpenAI"
                />
                <button onClick={addOrg} className="px-4 bg-slate-900 dark:bg-slate-800 text-white rounded-lg hover:bg-slate-800 transition-colors">Add</button>
              </div>

              <div className="flex flex-wrap gap-2">
                {profile.entities.length > 0 && (profile.entities[0].tracked_organizations || []).map(org => (
                  <span key={org} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium border border-purple-100 dark:border-purple-800/50">
                    {org}
                    <button onClick={() => removeOrg(org)} className="hover:text-purple-900 dark:hover:text-purple-100"><X size={14} /></button>
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="p-8 md:p-12 pb-28 md:pb-32 absolute inset-0 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-blue-500/30">
                <CheckCircle2 className="text-white" size={40} />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">You're all set!</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm">
                Your intelligence feed is now perfectly calibrated to your interests. The AI will immediately begin boosting relevance based on your rules.
              </p>
              
              <div className="w-full max-w-xs space-y-3 mb-8">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 text-left">Choose an Avatar Style</label>
                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => setAvatarGender('male')} className={`py-3 rounded-lg border font-medium ${avatarGender === 'male' ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/20 dark:border-blue-400 dark:text-blue-300' : 'bg-white border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'}`}>Male</button>
                  <button onClick={() => setAvatarGender('female')} className={`py-3 rounded-lg border font-medium ${avatarGender === 'female' ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/20 dark:border-blue-400 dark:text-blue-300' : 'bg-white border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'}`}>Female</button>
                  <button onClick={() => setAvatarGender('neutral')} className={`py-3 rounded-lg border font-medium ${avatarGender === 'neutral' ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/20 dark:border-blue-400 dark:text-blue-300' : 'bg-white border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'}`}>Neutral</button>
                </div>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
        
        {/* Navigation Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-8 border-t border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex justify-between">
          <button 
            onClick={() => step > 1 ? setStep(step - 1) : null}
            className={`px-6 py-2.5 font-medium ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
          >
            Back
          </button>
          
          {step < 4 ? (
            <button onClick={handleNext} className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-medium flex items-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors">
              Continue <ArrowRight size={16} />
            </button>
          ) : (
            <button onClick={handleFinish} className="px-8 py-2.5 bg-blue-600 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/30">
              Enter Dashboard <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
