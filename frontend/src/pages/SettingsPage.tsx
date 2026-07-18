import React, { useState, useEffect } from 'react';
import { Settings, Bell, Shield, Tag, Building2, Plus, X, Save, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile, type UserProfile } from '../lib/api';

export function SettingsPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newTrackedOrg, setNewTrackedOrg] = useState('');
  const [newTargetSector, setNewTargetSector] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    const data = await getProfile();
    setProfile(data);
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!profile) return;
    setIsSaving(true);
    const success = await updateProfile(profile);
    setIsSaving(false);
    if (success) {
      alert("Settings saved successfully! New articles will be scored against these updated keywords.");
    } else {
      alert("Failed to save settings.");
    }
  };

  const addTag = () => {
    if (newTag.trim() && profile && !profile.focus_tags.includes(newTag.trim())) {
      setProfile({
        ...profile,
        focus_tags: [...profile.focus_tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    if (profile) {
      setProfile({
        ...profile,
        focus_tags: profile.focus_tags.filter(t => t !== tagToRemove)
      });
    }
  };

  const addLocation = () => {
    if (newLocation.trim() && profile) {
      const currentLocs = profile.preferred_locations || [];
      if (!currentLocs.includes(newLocation.trim())) {
        setProfile({
          ...profile,
          preferred_locations: [...currentLocs, newLocation.trim()]
        });
        setNewLocation('');
      }
    }
  };

  const removeLocation = (locToRemove: string) => {
    if (profile) {
      setProfile({
        ...profile,
        preferred_locations: profile.preferred_locations.filter(l => l !== locToRemove)
      });
    }
  };

  const addTrackedOrg = (entityIndex: number) => {
    if (newTrackedOrg.trim() && profile) {
      const newEntities = [...profile.entities];
      const currentOrgs = newEntities[entityIndex].competitors || [];
      if (!currentOrgs.includes(newTrackedOrg.trim())) {
        newEntities[entityIndex] = {
          ...newEntities[entityIndex],
          competitors: [...currentOrgs, newTrackedOrg.trim()]
        };
        setProfile({ ...profile, entities: newEntities });
        setNewTrackedOrg('');
      }
    }
  };

  const removeTrackedOrg = (entityIndex: number, orgToRemove: string) => {
    if (profile) {
      const newEntities = [...profile.entities];
      newEntities[entityIndex] = {
        ...newEntities[entityIndex],
        competitors: newEntities[entityIndex].competitors.filter(c => c !== orgToRemove)
      };
      setProfile({ ...profile, entities: newEntities });
    }
  };

  const addTargetSector = (entityIndex: number) => {
    if (newTargetSector.trim() && profile) {
      const newEntities = [...profile.entities];
      const currentSectors = newEntities[entityIndex].target_sectors || [];
      if (!currentSectors.includes(newTargetSector.trim())) {
        newEntities[entityIndex] = {
          ...newEntities[entityIndex],
          target_sectors: [...currentSectors, newTargetSector.trim()]
        };
        setProfile({ ...profile, entities: newEntities });
        setNewTargetSector('');
      }
    }
  };

  const removeTargetSector = (entityIndex: number, sectorToRemove: string) => {
    if (profile) {
      const newEntities = [...profile.entities];
      newEntities[entityIndex] = {
        ...newEntities[entityIndex],
        target_sectors: newEntities[entityIndex].target_sectors.filter(s => s !== sectorToRemove)
      };
      setProfile({ ...profile, entities: newEntities });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 text-blue-600 dark:text-blue-400">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="border-b border-slate-200 dark:border-slate-800 pb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Settings</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Manage your application preferences and integrations.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-70"
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save Changes
        </button>
      </header>

      <div className="grid gap-6">
        {/* Personal Interest Tags */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <Tag size={18} className="text-blue-600 dark:text-blue-400" />
            <h2 className="font-semibold text-slate-900 dark:text-white">Interest Tags</h2>
          </div>
          <div className="p-6">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Add keywords you personally care about. Articles mentioning these will make up to 15% of the total relevance score.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {profile?.focus_tags.map(tag => (
                <div key={tag} className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-full text-sm border border-slate-200 dark:border-slate-700">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-1"><X size={14} /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 max-w-sm">
              <input 
                type="text" 
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTag()}
                placeholder="Add a new tag (e.g. Robotics)..." 
                className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button onClick={addTag} className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors">
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Geographic Focus */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <Tag size={18} className="text-purple-600 dark:text-purple-400" />
            <h2 className="font-semibold text-slate-900 dark:text-white">Geographic Focus (Countries)</h2>
          </div>
          <div className="p-6">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Track news affecting specific countries (e.g. "United States", "India"). Articles impacting these regions will make up to 10% of the total relevance score.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {profile?.preferred_locations?.map(loc => (
                <div key={loc} className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-full text-sm border border-slate-200 dark:border-slate-700">
                  {loc}
                  <button onClick={() => removeLocation(loc)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-1"><X size={14} /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 max-w-sm">
              <input 
                type="text" 
                value={newLocation}
                onChange={e => setNewLocation(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addLocation()}
                placeholder="Add a country..." 
                className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button onClick={addLocation} className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors">
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Business Entities */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <Building2 size={18} className="text-emerald-600 dark:text-emerald-400" />
            <h2 className="font-semibold text-slate-900 dark:text-white">Business Rules</h2>
          </div>
          <div className="p-6 space-y-6">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
              Articles matching tracked organizations make up 45% of the score. Articles matching target sectors make up 30% of the score.
            </p>
            {profile?.entities.map((entity, index) => (
              <div key={index} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Company Name</label>
                  <input type="text" value={entity.name} readOnly className="w-full bg-transparent border-b border-slate-300 dark:border-slate-600 py-1 text-slate-900 dark:text-white font-medium focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Tracked Organizations</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {entity.competitors.map(comp => (
                       <div key={comp} className="flex items-center gap-1 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-md text-sm border border-slate-200 dark:border-slate-700 shadow-sm">
                         {comp}
                         <button onClick={() => removeTrackedOrg(index, comp)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-1"><X size={14} /></button>
                       </div>
                    ))}
                  </div>
                  <div className="flex gap-2 max-w-sm">
                    <input 
                      type="text" 
                      value={newTrackedOrg}
                      onChange={e => setNewTrackedOrg(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addTrackedOrg(index)}
                      placeholder="Add tracked org (e.g. OpenAI)..." 
                      className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button onClick={() => addTrackedOrg(index)} className="px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md border border-slate-200 dark:border-slate-700 transition-colors">
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Target Sectors</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {entity.target_sectors.map(sector => (
                       <div key={sector} className="flex items-center gap-1 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-md text-sm border border-slate-200 dark:border-slate-700 shadow-sm">
                         {sector}
                         <button onClick={() => removeTargetSector(index, sector)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-1"><X size={14} /></button>
                       </div>
                    ))}
                  </div>
                  <div className="flex gap-2 max-w-sm">
                    <input 
                      type="text" 
                      value={newTargetSector}
                      onChange={e => setNewTargetSector(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addTargetSector(index)}
                      placeholder="Add target sector..." 
                      className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button onClick={() => addTargetSector(index)} className="px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md border border-slate-200 dark:border-slate-700 transition-colors">
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
