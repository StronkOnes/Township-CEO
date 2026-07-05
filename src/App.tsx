import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  HelpCircle, 
  BookOpen, 
  ChevronRight, 
  FileText, 
  PlusCircle, 
  TrendingUp, 
  DollarSign, 
  Percent, 
  Play, 
  Loader2, 
  MessageSquare, 
  Copy, 
  Check, 
  FileCheck, 
  Sparkles, 
  Settings, 
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  Shield,
  Briefcase,
  Download,
  Plus,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import { BusinessProfile, AgentMessage, DocFile, EVAL_DIMENSION_LABELS } from './types';
import type { EvalScore, TelemetryData, CircuitBreakerData, SkillMatch, ToolResultData } from './types';

// Preset local township business profiles for fast-start
const BUSINESS_PRESETS: BusinessProfile[] = [
  {
    id: 'spaza_shop',
    name: "Sizwe's Spaza Shop",
    type: "Spaza Shop",
    location: "Soweto, Johannesburg",
    revenue: 5500,
    expenses: 3200,
    challenges: "Wholesale snack procurement is extremely expensive. Competitor supermarkets offer bulk discounts we cannot match.",
    goals: "Source snacks cheaper, expand daily operational runway, increase margin to 45%."
  },
  {
    id: 'barber_shop',
    name: "Phola Fresh Barber",
    type: "Barber Shop",
    location: "Alexandra, Johannesburg",
    revenue: 4000,
    expenses: 1800,
    challenges: "Load-shedding cuts off power during peak Saturday afternoon hours. Hand clippers are slow.",
    goals: "Invest in solar battery power, launch a digital appointment scheduling channel via WhatsApp."
  },
  {
    id: 'food_stall',
    name: "Mam' Rose Kota & Shisanyama",
    type: "Street Food Vendor",
    location: "Khayelitsha, Cape Town",
    revenue: 6200,
    expenses: 4100,
    challenges: "Fresh bread and cooking oil prices fluctuate weekly. Food waste increases on cold or wet days.",
    goals: "Establish fixed-price local supplier agreements, design a weather-optimized daily menu strategy."
  },
  {
    id: 'mechanic',
    name: "Mabena Motors",
    type: "Mechanic",
    location: "Tembisa, Ekurhuleni",
    revenue: 8500,
    expenses: 5200,
    challenges: "Sourcing original spare parts is slow. Taxi operators demand quick repairs with immediate quotes.",
    goals: "Establish direct delivery routing with auto part wholesalers, automate quoting and invoice builders."
  }
];

export default function App() {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'arena' | 'workshops' | 'docs'>('arena');
  
  // App State
  const [profile, setProfile] = useState<BusinessProfile>(BUSINESS_PRESETS[0]);
  const [customProfiles, setCustomProfiles] = useState<BusinessProfile[]>([]);
  const [customRequest, setCustomRequest] = useState('How do I reduce my wholesale procurement costs and increase cash-flow runway?');
  
  // Multi-Agent Solve State
  const [isSolving, setIsSolving] = useState(false);
  const [solveResponse, setSolveResponse] = useState<{ messages: AgentMessage[]; summary: string; evaluation?: EvalScore[]; overallEvalScore?: number; telemetry?: TelemetryData; circuitBreaker?: CircuitBreakerData; matchedSkill?: SkillMatch | null; toolResults?: ToolResultData; sessionId?: string } | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [agentTypingIndex, setAgentTypingIndex] = useState<number>(-1);
  const [feedbackText, setFeedbackText] = useState('');
  const [isFeedbackSubmitting, setIsFeedbackSubmitting] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [solveError, setSolveError] = useState<string | null>(null);

  // Specialist Workshop States
  const [marketingInput, setMarketingInput] = useState('Promote a weekend hair-braiding special with R50 off');
  const [isMarketingGenerating, setIsMarketingGenerating] = useState(false);
  const [marketingResult, setMarketingResult] = useState<{ text: string; channel: string } | null>(null);

  const [customerComplaint, setCustomerComplaint] = useState('A customer is angry that their hair treatment session started 45 minutes late because of a power cut.');
  const [isCsGenerating, setIsCsGenerating] = useState(false);
  const [csResult, setCsResult] = useState<{ text: string; loyalty: string } | null>(null);

  // Finance Solver States
  const [financialRevenue, setFinancialRevenue] = useState(profile.revenue);
  const [financialExpenses, setFinancialExpenses] = useState(profile.expenses);
  const [projectedCostCut, setProjectedCostCut] = useState(15); // 15% reduction

  // System Documentation states
  const [docsList, setDocsList] = useState<DocFile[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocFile | null>(null);
  const [docContent, setDocContent] = useState<string>('');
  const [isLoadingDoc, setIsLoadingDoc] = useState(false);
  
  // Copy states
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Sync state with selected profile
  useEffect(() => {
    setFinancialRevenue(profile.revenue);
    setFinancialExpenses(profile.expenses);
  }, [profile]);

  const handleAddProfile = () => {
    const newProfile: BusinessProfile = {
      id: `custom_${Date.now()}`,
      name: "My New Business",
      type: "",
      location: "",
      revenue: 0,
      expenses: 0,
      challenges: "",
      goals: ""
    };
    setCustomProfiles(prev => [...prev, newProfile]);
    setProfile(newProfile);
  };

  const handleDeleteProfile = (id: string) => {
    setCustomProfiles(prev => prev.filter(p => p.id !== id));
    if (profile.id === id) {
      setProfile(BUSINESS_PRESETS[0]);
    }
  };

  const allProfiles = [...BUSINESS_PRESETS, ...customProfiles];

  // Load documentation catalog on mount
  useEffect(() => {
    fetch('/api/docs')
      .then(res => res.json())
      .then((data: DocFile[]) => {
        setDocsList(data);
        if (data.length > 0) {
          handleSelectDoc(data[1]); // Default to Project Vision
        }
      })
      .catch(err => console.error("Could not load docs:", err));
  }, []);

  const handleSelectDoc = async (doc: DocFile) => {
    setSelectedDoc(doc);
    setIsLoadingDoc(true);
    try {
      const res = await fetch(`/api/docs/content?path=${encodeURIComponent(doc.path)}`);
      const data = await res.json();
      setDocContent(data.content || 'No content found.');
    } catch (err: any) {
      setDocContent(`Error loading document: ${err.message}`);
    } finally {
      setIsLoadingDoc(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleDownloadPDF = () => {
    if (!solveResponse) return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2); // 170mm
    
    let y = 20;

    const checkPageOverflow = (neededHeight: number) => {
      if (y + neededHeight > pageHeight - margin) {
        doc.addPage();
        y = 20;
        drawPageBorder();
      }
    };

    const drawPageBorder = () => {
      doc.setDrawColor(228, 228, 231); // zinc-200
      doc.setLineWidth(0.2);
      doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(113, 113, 122); // zinc-500
      doc.text('Township CEO AI OS • Strategic Roadmap Report', margin, pageHeight - 13);
      const pageCount = doc.getNumberOfPages();
      doc.text(`Page ${pageCount}`, pageWidth - margin - 10, pageHeight - 13);
    };

    drawPageBorder();

    // Header Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(24, 24, 27); // zinc-900
    doc.text('TOWNSHIP CEO', margin, y);
    y += 7;

    // Subtitle
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(113, 113, 122); // zinc-500
    doc.text('AI-POWERED OPERATING SYSTEM FOR TOWNSHIP MICRO-ENTERPRISES', margin, y);
    y += 5;

    // Accent line
    doc.setDrawColor(245, 158, 11); // amber-500
    doc.setLineWidth(1);
    doc.line(margin, y, margin + contentWidth, y);
    y += 10;

    // Metadata Card
    doc.setFillColor(244, 244, 245); // zinc-100
    doc.rect(margin, y, contentWidth, 32, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(24, 24, 27);
    doc.text('ENTERPRISE METADATA & PROFILE DETAILS', margin + 5, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(63, 63, 70); // zinc-700
    doc.text(`Business Name:  ${profile.name}`, margin + 5, y + 13);
    doc.text(`Business Type:  ${profile.type}`, margin + 5, y + 18);
    doc.text(`Location:            ${profile.location}`, margin + 5, y + 23);

    doc.text(`Monthly Rev:      R ${profile.revenue.toLocaleString('en-ZA')}`, margin + 90, y + 13);
    doc.text(`Monthly Exp:      R ${profile.expenses.toLocaleString('en-ZA')}`, margin + 90, y + 18);
    doc.text(`Surplus Margin:  ${profile.revenue > 0 ? (((profile.revenue - profile.expenses) / profile.revenue) * 100).toFixed(1) : 0}%`, margin + 90, y + 23);
    y += 42;

    // Section header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(24, 24, 27);
    doc.text('CONSOLIDATED BOARD STRATEGIC ROADMAP', margin, y);
    y += 6;

    doc.setDrawColor(212, 212, 216); // zinc-300
    doc.setLineWidth(0.3);
    doc.line(margin, y, margin + contentWidth, y);
    y += 8;

    // Body Lines
    const lines = solveResponse.summary.split('\n');
    lines.forEach((line) => {
      let cleanLine = line.trim();
      if (!cleanLine) {
        y += 4;
        return;
      }

      let isHeading = false;
      let isSubheading = false;
      let isListItem = false;

      if (cleanLine.startsWith('# ')) {
        isHeading = true;
        cleanLine = cleanLine.replace('# ', '');
      } else if (cleanLine.startsWith('## ') || cleanLine.startsWith('### ')) {
        isSubheading = true;
        cleanLine = cleanLine.replace('## ', '').replace('### ', '');
      } else if (cleanLine.startsWith('* ') || cleanLine.startsWith('- ')) {
        isListItem = true;
        cleanLine = cleanLine.replace('* ', '').replace('- ', '');
      }

      cleanLine = cleanLine.replace(/\*\*/g, '');

      if (isHeading) {
        checkPageOverflow(12);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(24, 24, 27);
        y += 4;
      } else if (isSubheading) {
        checkPageOverflow(10);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(39, 39, 42);
        y += 3;
      } else if (isListItem) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(39, 39, 42);
        cleanLine = '•  ' + cleanLine;
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(39, 39, 42);
      }

      const wrappedLines: string[] = doc.splitTextToSize(cleanLine, contentWidth);
      wrappedLines.forEach((wLine) => {
        checkPageOverflow(6);
        doc.text(wLine, margin + (isListItem && wLine !== wrappedLines[0] ? 4 : 0), y);
        y += 5.5;
      });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(39, 39, 42);
    });

    const safeName = profile.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    doc.save(`township_ceo_roadmap_${safeName}.pdf`);
  };

  // Triggers Multi-Agent Solves with simulated streaming outputs
  const handleSolveTask = async (feedback?: string) => {
    setIsSolving(true);
    setSolveError(null);
    if (!feedback) {
      setSolveResponse(null);
      setCurrentStepIndex(-1);
    }
    
    try {
      const res = await fetch('/api/agents/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          request: customRequest,
          feedback: feedback || undefined,
          sessionId: sessionId
        })
      });
      if (!res.ok) {
        setSolveError(`Server error: ${res.status} ${res.statusText}`);
        return;
      }
      const data = await res.json();
      
      if (!data.success) {
        setSolveError(data.error || 'Solve request failed on server');
        return;
      }

      if (!data.messages || !Array.isArray(data.messages) || data.messages.length === 0) {
        setSolveError('Server returned no agent messages');
        return;
      }

      setSolveResponse({
        messages: data.messages,
        summary: data.summary || '',
        evaluation: data.evaluation || [],
        overallEvalScore: data.overallEvalScore || 0,
        telemetry: data.telemetry || null,
        circuitBreaker: data.circuitBreaker || null,
        matchedSkill: data.matchedSkill || null,
        toolResults: data.toolResults || null,
        sessionId: data.sessionId || null
      });
      if (data.sessionId) setSessionId(data.sessionId);
      
      // Step-by-step playback simulation
      for (let i = 0; i < data.messages.length; i++) {
        setCurrentStepIndex(i);
        await new Promise(resolve => setTimeout(resolve, 1200));
      }
      setCurrentStepIndex(data.messages.length); // Reveal Summary
      setFeedbackText('');
    } catch (err: any) {
      console.error(err);
      setSolveError(err.message || 'Network error — is the server running?');
    } finally {
      setIsSolving(false);
      setIsFeedbackSubmitting(false);
    }
  };

  const handleSubmitFeedback = () => {
    if (!feedbackText.trim()) return;
    setIsFeedbackSubmitting(true);
    handleSolveTask(feedbackText);
  };

  // Dedicate Marketing Campaign Generation
  const handleGenerateMarketing = async () => {
    setIsMarketingGenerating(true);
    try {
      const res = await fetch('/api/agents/marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, campaignGoal: marketingInput })
      });
      const data = await res.json();
      setMarketingResult({ text: data.campaignText, channel: data.channel });
    } catch (err) {
      console.error(err);
    } finally {
      setIsMarketingGenerating(false);
    }
  };

  // Dedicate CS Response template builder
  const handleGenerateCs = async () => {
    setIsCsGenerating(true);
    try {
      const res = await fetch('/api/agents/customer-service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, complaint: customerComplaint })
      });
      const data = await res.json();
      setCsResult({ text: data.suggestedResponse, loyalty: data.loyaltyOutline });
    } catch (err) {
      console.error(err);
    } finally {
      setIsCsGenerating(false);
    }
  };

  // Simple Markdown Parsers for Hub
  const renderMarkdown = (md: string) => {
    if (!md) return null;
    const lines = md.split('\n');
    return lines.map((line, idx) => {
      // Code blocks
      if (line.trim().startsWith('```')) {
        return null; // Skip markdown wrapping lines
      }
      // Horizontal Rule
      if (line.trim() === '---') {
        return <hr key={idx} className="my-6 border-zinc-800" />;
      }
      // Headings
      if (line.startsWith('# ')) {
        return <h1 key={idx} className="font-sans text-3xl font-bold tracking-tight text-white mt-8 mb-4">{line.replace('# ', '')}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={idx} className="font-sans text-xl font-semibold tracking-tight text-white mt-6 mb-3 border-b border-zinc-800 pb-2">{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="font-sans text-base font-semibold text-zinc-200 mt-4 mb-2">{line.replace('### ', '')}</h3>;
      }
      // List items
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        const clean = line.replace(/^\s*[\*\-]\s+/, '');
        return (
          <li key={idx} className="text-zinc-300 ml-6 list-disc mb-1.5 leading-relaxed text-sm">
            {parseBoldText(clean)}
          </li>
        );
      }
      if (line.trim().startsWith('1. ') || line.trim().startsWith('2. ') || line.trim().startsWith('3. ') || line.trim().startsWith('4. ')) {
        const clean = line.replace(/^\s*\d+\.\s+/, '');
        return (
          <li key={idx} className="text-zinc-300 ml-6 list-decimal mb-1.5 leading-relaxed text-sm">
            {parseBoldText(clean)}
          </li>
        );
      }
      // Paragraph
      if (line.trim() === '') return <div key={idx} className="h-2" />;
      
      return (
        <p key={idx} className="text-zinc-300 text-sm leading-relaxed mb-3">
          {parseBoldText(line)}
        </p>
      );
    });
  };

  // Inline bold text utility
  const parseBoldText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  // Math Helper calculations
  const profitMargin = financialRevenue > 0 ? ((financialRevenue - financialExpenses) / financialRevenue) * 100 : 0;
  const originalCostOfSales = financialExpenses * 0.7; // assume stock is 70% of cost
  const originalFixedCosts = financialExpenses * 0.3; // rent, transport is 30%
  const newCostOfSales = originalCostOfSales * (1 - projectedCostCut / 100);
  const newExpenses = originalFixedCosts + newCostOfSales;
  const newMargin = financialRevenue > 0 ? ((financialRevenue - newExpenses) / financialRevenue) * 100 : 0;
  const breakEvenDaily = (originalFixedCosts / (profitMargin / 100 || 1)) / 30;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-amber-500 selection:text-zinc-950">
      
      {/* HEADER BAR */}
      <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3" id="app_header">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-zinc-950 font-bold tracking-tighter shadow-lg shadow-amber-500/10">
            TC
          </div>
          <div>
            <span className="font-sans text-lg font-bold tracking-tight text-white block">Township CEO</span>
            <span className="font-mono text-[10px] text-zinc-500 tracking-widest uppercase">Multi-Agent AI Operating System</span>
          </div>
        </div>

        {/* TOP LEVEL NAVIGATION TABS */}
        <nav className="flex space-x-1 bg-zinc-900 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('arena')}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition flex items-center space-x-2 ${
              activeTab === 'arena' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Briefcase size={14} />
            <span>CEO Arena</span>
          </button>
          <button
            onClick={() => setActiveTab('workshops')}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition flex items-center space-x-2 ${
              activeTab === 'workshops' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles size={14} />
            <span>Specialist Workshops</span>
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition flex items-center space-x-2 ${
              activeTab === 'docs' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <BookOpen size={14} />
            <span>System Specs</span>
          </button>
        </nav>
      </header>

      {/* CORE FRAMEWORK CONTAINER */}
      <main className="max-w-[1600px] mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: ACTIVE PROFILE CONTROLLER & KPI PANEL */}
        <section className="lg:col-span-4 space-y-6">
          
          {/* PROFILE CONTROL BOARD */}
          <div className="bg-zinc-900 border border-zinc-800/80 rounded-xl p-5 shadow-sm">
            <h2 className="font-sans text-xs font-bold tracking-widest text-zinc-400 uppercase mb-4 flex items-center justify-between">
              <span>Business Profile Controller</span>
              <Settings size={14} className="text-zinc-500" />
            </h2>
            
            <div className="space-y-3">
              <label className="block text-[11px] font-mono text-zinc-500 uppercase">Select or Create Your Business Profile</label>
              <div className="grid grid-cols-2 gap-2">
                {allProfiles.map((bp) => {
                  const isCustom = bp.id.startsWith('custom_');
                  return (
                    <div key={bp.id} className="relative group">
                      <button
                        onClick={() => setProfile(bp)}
                        className={`w-full p-3 rounded-lg text-left transition border ${
                          profile.id === bp.id
                            ? 'bg-amber-500/10 border-amber-500 text-amber-500'
                            : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                        }`}
                      >
                        <Building2 size={16} className="mb-1.5" />
                        <span className="block font-medium text-xs truncate">{bp.name || 'Unnamed Business'}</span>
                        <span className="block text-[10px] opacity-70 truncate">{bp.type || 'Custom Business'}</span>
                      </button>
                      {isCustom && (
                        <button
                          onClick={() => handleDeleteProfile(bp.id)}
                          className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-600 border border-red-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
                          title="Delete this business"
                        >
                          <Trash2 size={10} className="text-white" />
                        </button>
                      )}
                    </div>
                  );
                })}
                <button
                  onClick={handleAddProfile}
                  className="p-3 rounded-lg border-2 border-dashed border-zinc-700 hover:border-amber-500 text-zinc-500 hover:text-amber-500 transition flex flex-col items-center justify-center min-h-[72px] cursor-pointer"
                >
                  <Plus size={18} className="mb-1" />
                  <span className="text-[10px] font-medium">New Business</span>
                </button>
              </div>

              {/* DYNAMIC EDITABLE PROFILE FORM */}
              <div className="border-t border-zinc-800/80 pt-4 mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Business Name</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Location / Township</label>
                    <input
                      type="text"
                      value={profile.location}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Monthly Revenue (ZAR)</label>
                    <input
                      type="number"
                      value={profile.revenue}
                      onChange={(e) => setProfile({ ...profile, revenue: Number(e.target.value) })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Monthly Expenses (ZAR)</label>
                    <input
                      type="number"
                      value={profile.expenses}
                      onChange={(e) => setProfile({ ...profile, expenses: Number(e.target.value) })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Immediate Challenges</label>
                  <textarea
                    rows={2}
                    value={profile.challenges}
                    onChange={(e) => setProfile({ ...profile, challenges: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none resize-none leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Active Business Goal</label>
                  <input
                    type="text"
                    value={profile.goals}
                    onChange={(e) => setProfile({ ...profile, goals: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* DYNAMIC KPI SUMMARY CARD */}
          <div className="bg-zinc-900 border border-zinc-800/80 rounded-xl p-5">
            <h2 className="font-sans text-xs font-bold tracking-widest text-zinc-400 uppercase mb-3.5">
              Enterprise Vital Signs
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-lg">
                <span className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Gross Margin</span>
                <span className={`text-xl font-bold font-mono tracking-tight ${profitMargin > 35 ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {profitMargin.toFixed(1)}%
                </span>
                <span className="block text-[9px] text-zinc-400 mt-0.5">Healthy &gt; 35%</span>
              </div>
              
              <div className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-lg">
                <span className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Monthly Surplus</span>
                <span className="text-xl font-bold font-mono tracking-tight text-white">
                  R{(profile.revenue - profile.expenses).toLocaleString('en-ZA')}
                </span>
                <span className="block text-[9px] text-zinc-400 mt-0.5">Retained Profit</span>
              </div>
            </div>

            {/* Warn about blend financing if surplus is very small */}
            {profile.revenue - profile.expenses < 1000 && (
              <div className="mt-4 p-3 bg-red-950/30 border border-red-900/50 rounded-lg flex items-start space-x-2.5">
                <AlertTriangle size={15} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-red-200 leading-normal">
                  *Risk Indicator*: Low surplus margin increases the risk of blending business capital with personal household groceries. Define a fixed salary for yourself immediately.
                </p>
              </div>
            )}
          </div>
          
        </section>

        {/* RIGHT COLUMN: PRIMARY WORKSPACE SWITCHBOARD */}
        <section className="lg:col-span-8">
          
          {/* TAB 1: CENTRAL MULTI-AGENT ARENA */}
          {activeTab === 'arena' && (
            <div className="space-y-6">
              
              {/* INTERACTIVE INPUT FIELD */}
              <div className="bg-zinc-900 border border-zinc-800/80 rounded-xl p-5">
                <div className="flex items-center space-x-2 mb-3">
                  <Sparkles size={16} className="text-amber-500 animate-pulse" />
                  <h2 className="font-sans text-xs font-bold tracking-widest text-zinc-400 uppercase">
                    CEO Consult Command Arena
                  </h2>
                </div>
                
                <p className="text-xs text-zinc-400 mb-4 leading-normal">
                  Pose any complex business issue (procurement, marketing specials, load-shedding survival, scaling limits). The central CEO Agent will invoke the specialized research, operations, and finance agents to outline a strategic solution.
                </p>

                <div className="space-y-3">
                  <textarea
                    rows={3}
                    value={customRequest}
                    onChange={(e) => setCustomRequest(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white focus:border-amber-500 focus:outline-none leading-relaxed"
                    placeholder="Enter strategic business question..."
                  />

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-mono text-zinc-500">
                      Active AI Layer: <strong className="text-zinc-300">Gemini-3.5-Flash</strong> via Abstraction Layer
                    </span>
                    
                    <button
                      onClick={() => handleSolveTask()}
                      disabled={isSolving}
                      className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-800 text-zinc-950 disabled:text-zinc-500 font-medium text-xs transition flex items-center space-x-2 shadow-lg shadow-amber-500/10 cursor-pointer"
                    >
                      {isSolving ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>Deliberating...</span>
                        </>
                      ) : (
                        <>
                          <Play size={14} fill="currentColor" />
                          <span>Initiate Multi-Agent Solve</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {solveError && (
                <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-4 flex items-start space-x-3">
                  <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-red-400 mb-1">Solve Error</p>
                    <p className="text-[11px] text-red-300/80 leading-relaxed">{solveError}</p>
                  </div>
                </div>
              )}

              {/* COGNITIVE REASONING CHAIN STAGE */}
              {(isSolving || solveResponse) && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
                  <h3 className="font-sans text-xs font-bold tracking-widest text-zinc-400 uppercase border-b border-zinc-800 pb-3 flex items-center justify-between">
                    <span>Orchestration Reasoning Matrix</span>
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  </h3>

                  <div className="space-y-4 min-h-[150px]">
                    <AnimatePresence mode="popLayout">
                      {solveResponse?.messages.map((msg, index) => {
                        const isVisible = index <= currentStepIndex;
                        if (!isVisible) return null;

                        // Styling indicators based on agents
                        const isCEO = msg.sender === 'CEO Agent';
                        const isFinance = msg.sender === 'Finance Agent';
                        const isResearch = msg.sender === 'Research Agent';
                        const isOps = msg.sender === 'Operations Agent';

                        let accentColor = "border-amber-500 text-amber-500 bg-amber-500/5";
                        if (isFinance) accentColor = "border-emerald-500 text-emerald-500 bg-emerald-500/5";
                        if (isResearch) accentColor = "border-sky-500 text-sky-500 bg-sky-500/5";
                        if (isOps) accentColor = "border-purple-500 text-purple-500 bg-purple-500/5";

                        return (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={`p-4 rounded-lg border bg-zinc-950/80 space-y-2 border-zinc-800/80`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${accentColor}`}>
                                  {msg.sender}
                                </span>
                                <span className="text-[10px] font-mono text-zinc-500">→ {msg.receiver}</span>
                              </div>
                              <span className="text-[10px] font-mono text-zinc-500">{msg.timestamp}</span>
                            </div>
                            <p className="text-xs text-zinc-300 leading-relaxed font-mono whitespace-pre-line">
                              {msg.content}
                            </p>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>

                    {/* Loader if still working through steps */}
                    {isSolving && currentStepIndex < (solveResponse?.messages.length || 0) - 1 && (
                      <div className="flex items-center space-x-2 text-zinc-500 text-xs py-4 pl-1">
                        <Loader2 size={13} className="animate-spin text-amber-500" />
                        <span>Specialists are compiling localized responses...</span>
                      </div>
                    )}
                  </div>

                  {/* SUMMARY COLLATED ROADMAP PLAN */}
                  {currentStepIndex >= (solveResponse?.messages.length || 0) && solveResponse && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="border border-amber-500/30 bg-amber-500/[0.02] rounded-lg p-5 mt-4 space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                        <div className="flex items-center space-x-2">
                          <FileCheck size={16} className="text-amber-500" />
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                            Consolidated Board Strategic Roadmap
                          </h4>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleDownloadPDF}
                            className="text-[10px] font-mono px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-600 text-zinc-950 flex items-center space-x-1.5 transition font-semibold cursor-pointer"
                          >
                            <Download size={11} />
                            <span>Download PDF</span>
                          </button>

                          <button
                            onClick={() => handleCopy(solveResponse.summary, 'masterplan')}
                            className="text-[10px] font-mono px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center space-x-1.5 hover:bg-zinc-700 transition cursor-pointer"
                          >
                            {copiedText === 'masterplan' ? (
                              <>
                                <Check size={11} className="text-emerald-500" />
                                <span>Copied Strategy</span>
                              </>
                            ) : (
                              <>
                                <Copy size={11} />
                                <span>Copy Strategy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line font-sans prose-invert">
                        {renderMarkdown(solveResponse.summary)}
                      </div>

                      {/* Evaluation Scores */}
                      {solveResponse.evaluation && solveResponse.evaluation.length > 0 && (
                        <div className="border-t border-amber-500/20 pt-3 mt-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <FileCheck size={13} className="text-emerald-500" />
                              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Agent Evaluation</span>
                            </div>
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                              (solveResponse.overallEvalScore || 0) >= 4 ? 'bg-emerald-500/20 text-emerald-500' :
                              (solveResponse.overallEvalScore || 0) >= 3 ? 'bg-amber-500/20 text-amber-500' :
                              'bg-red-500/20 text-red-500'
                            }`}>
                              Score: {solveResponse.overallEvalScore?.toFixed(1)} / 5.0
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {solveResponse.evaluation.map((evalItem, idx) => (
                              <div key={idx} className="bg-zinc-950 border border-zinc-800 rounded p-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[9px] font-mono text-zinc-500 truncate">{EVAL_DIMENSION_LABELS[evalItem.dimension] || evalItem.dimension}</span>
                                  <span className={`text-[10px] font-bold font-mono ${
                                    evalItem.score >= 4 ? 'text-emerald-500' :
                                    evalItem.score >= 3 ? 'text-amber-500' : 'text-red-500'
                                  }`}>{evalItem.score}/5</span>
                                </div>
                                <div className="mt-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full transition-all ${
                                    evalItem.score >= 4 ? 'bg-emerald-500' :
                                    evalItem.score >= 3 ? 'bg-amber-500' : 'bg-red-500'
                                  }`} style={{ width: `${(evalItem.score / 5) * 100}%` }} />
                                </div>
                                <p className="text-[8px] text-zinc-500 mt-1 leading-tight">{evalItem.rationale}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Telemetry & Circuit Breaker */}
                      {solveResponse.telemetry && (
                        <div className="border-t border-amber-500/20 pt-3 mt-2">
                          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                            <div className="bg-zinc-950 border border-zinc-800 rounded p-2 text-center">
                              <span className="block text-[9px] font-mono text-zinc-500">Tokens</span>
                              <span className="block text-xs font-bold text-white font-mono">{solveResponse.telemetry.totalTokens.toLocaleString()}</span>
                            </div>
                            <div className="bg-zinc-950 border border-zinc-800 rounded p-2 text-center">
                              <span className="block text-[9px] font-mono text-zinc-500">Cost</span>
                              <span className="block text-xs font-bold text-white font-mono">${solveResponse.telemetry.totalCost.toFixed(4)}</span>
                            </div>
                            <div className="bg-zinc-950 border border-zinc-800 rounded p-2 text-center">
                              <span className="block text-[9px] font-mono text-zinc-500">Trust</span>
                              <span className={`block text-xs font-bold font-mono ${(solveResponse.telemetry.trustScore || 1) < 0.4 ? 'text-red-500' : 'text-emerald-500'}`}>
                                {((solveResponse.telemetry.trustScore || 1) * 100).toFixed(0)}%
                              </span>
                            </div>
                            <div className="bg-zinc-950 border border-zinc-800 rounded p-2 text-center">
                              <span className="block text-[9px] font-mono text-zinc-500">Corrections</span>
                              <span className="block text-xs font-bold text-white font-mono">{solveResponse.telemetry.userCorrections}</span>
                            </div>
                            <div className="bg-zinc-950 border border-zinc-800 rounded p-2 text-center">
                              <span className="block text-[9px] font-mono text-zinc-500">Skill</span>
                              <span className="block text-xs font-bold text-amber-500 font-mono truncate">{solveResponse.matchedSkill?.name?.replace('_agent', '') || 'none'}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Feedback Form */}
                      <div className="border-t border-amber-500/20 pt-3 mt-2">
                        <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">
                          Provide Feedback for Refinement
                        </label>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                            placeholder="E.g., 'Give me more specific numbers' or 'Focus on cost reduction'"
                            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                          />
                          <button
                            onClick={handleSubmitFeedback}
                            disabled={isFeedbackSubmitting || !feedbackText.trim()}
                            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-800 text-zinc-950 disabled:text-zinc-500 font-semibold text-xs transition shrink-0 flex items-center space-x-1 cursor-pointer"
                          >
                            {isFeedbackSubmitting ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />}
                            <span>Refine</span>
                          </button>
                        </div>
                        <p className="text-[9px] text-zinc-500 mt-1">Corrections are tracked as labeled failure data per whitepaper Day 4</p>
                      </div>
                    </motion.div>
                  )}

                </div>
              )}

            </div>
          )}

          {/* TAB 2: SPECIALIST WORKSHOPS */}
          {activeTab === 'workshops' && (
            <div className="space-y-6">
              
              {/* FINANCIAL SOLVER PANEL */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <DollarSign size={18} className="text-emerald-500" />
                    <h3 className="font-sans text-xs font-bold tracking-widest text-zinc-300 uppercase">
                      Financial CFO Margin & Break-Even Solver
                    </h3>
                  </div>
                  <span className="font-mono text-[9px] text-zinc-500 uppercase">Simulation Tool</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* SLIDERS INPUT BLOCK */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-zinc-400">Monthly Revenue Input</span>
                        <span className="font-mono text-white font-bold">R{financialRevenue.toLocaleString('en-ZA')}</span>
                      </div>
                      <input
                        type="range"
                        min={1000}
                        max={30000}
                        step={500}
                        value={financialRevenue}
                        onChange={(e) => setFinancialRevenue(Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-zinc-400">Monthly Operational Expenses</span>
                        <span className="font-mono text-white font-bold">R{financialExpenses.toLocaleString('en-ZA')}</span>
                      </div>
                      <input
                        type="range"
                        min={500}
                        max={20000}
                        step={250}
                        value={financialExpenses}
                        onChange={(e) => setFinancialExpenses(Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-zinc-400">Projected Sourcing Cost Reduction</span>
                        <span className="font-mono text-emerald-500 font-bold">{projectedCostCut}%</span>
                      </div>
                      <input
                        type="range"
                        min={5}
                        max={35}
                        step={1}
                        value={projectedCostCut}
                        onChange={(e) => setProjectedCostCut(Number(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* FINANCIAL SIMULATION METRIC GRAPH */}
                  <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-3 flex flex-col justify-between">
                    <div>
                      <span className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Simulated Impact Report</span>
                      <div className="space-y-2 border-b border-zinc-800 pb-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-400">Current Margin:</span>
                          <span className="font-mono text-white font-semibold">{profitMargin.toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-400">Target Margin (with cost cut):</span>
                          <span className="font-mono text-emerald-500 font-bold">{newMargin.toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-400">Retained Surplus Gain:</span>
                          <span className="font-mono text-white">R{(financialRevenue - newExpenses - (financialRevenue - financialExpenses)).toFixed(0)} / mo</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-400">Daily Break-Even Revenue needed:</span>
                        <span className="font-mono text-amber-500 font-semibold">R{breakEvenDaily.toFixed(0)} / day</span>
                      </div>
                      <p className="text-[9px] text-zinc-400 leading-normal">
                        This indicates that if daily transactions drop below R{breakEvenDaily.toFixed(0)}, your fixed expenses (rent, utilities) will begin eroding your wholesale stock procurement reserves.
                      </p>
                    </div>
                  </div>

                </div>
              </div>

              {/* MARKETING WRITER PANEL */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <Sparkles size={18} className="text-amber-500" />
                    <h3 className="font-sans text-xs font-bold tracking-widest text-zinc-300 uppercase">
                      Marketing Agent WhatsApp Campaign Creator
                    </h3>
                  </div>
                  <span className="font-mono text-[9px] text-zinc-500 uppercase">Core Tool Execution</span>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-mono text-zinc-400 uppercase">Input Campaign / Promo Goal</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={marketingInput}
                      onChange={(e) => setMarketingInput(e.target.value)}
                      className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                    />
                    <button
                      onClick={handleGenerateMarketing}
                      disabled={isMarketingGenerating}
                      className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-800 text-zinc-950 disabled:text-zinc-500 font-semibold text-xs transition shrink-0 cursor-pointer"
                    >
                      {isMarketingGenerating ? <Loader2 size={13} className="animate-spin" /> : "Write Copy"}
                    </button>
                  </div>
                </div>

                {marketingResult && (
                  <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                      <span className="text-[10px] font-mono text-zinc-500">Recommended Channel: WhatsApp Status</span>
                      
                      <button
                        onClick={() => handleCopy(marketingResult.text, 'marketing')}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 flex items-center space-x-1.5 hover:bg-zinc-700 transition"
                      >
                        {copiedText === 'marketing' ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                        <span>{copiedText === 'marketing' ? "Copied" : "Copy Message"}</span>
                      </button>
                    </div>
                    
                    <p className="text-xs text-zinc-300 leading-relaxed font-mono whitespace-pre-line bg-zinc-900/50 p-3.5 rounded border border-zinc-800/60">
                      {marketingResult.text}
                    </p>
                  </div>
                )}
              </div>

              {/* CUSTOMER SERVICE COMPLAINT PANEL */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <MessageSquare size={18} className="text-indigo-400" />
                    <h3 className="font-sans text-xs font-bold tracking-widest text-zinc-300 uppercase">
                      CS Agent Response Generator
                    </h3>
                  </div>
                  <span className="font-mono text-[9px] text-zinc-500 uppercase">Core Tool Execution</span>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-mono text-zinc-400 uppercase">Input Customer Complaint / Situation</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={customerComplaint}
                      onChange={(e) => setCustomerComplaint(e.target.value)}
                      className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                    />
                    <button
                      onClick={handleGenerateCs}
                      disabled={isCsGenerating}
                      className="px-5 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:bg-zinc-800 text-white disabled:text-zinc-500 font-semibold text-xs transition shrink-0 cursor-pointer"
                    >
                      {isCsGenerating ? <Loader2 size={13} className="animate-spin" /> : "Build Reply"}
                    </button>
                  </div>
                </div>

                {csResult && (
                  <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                      <span className="text-[10px] font-mono text-zinc-500">Suggested Action: Goodwill De-escalation template</span>
                      
                      <button
                        onClick={() => handleCopy(csResult.text, 'cs_response')}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 flex items-center space-x-1.5 hover:bg-zinc-700 transition"
                      >
                        {copiedText === 'cs_response' ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                        <span>{copiedText === 'cs_response' ? "Copied" : "Copy Reply"}</span>
                      </button>
                    </div>
                    
                    <p className="text-xs text-zinc-300 leading-relaxed font-mono whitespace-pre-line bg-zinc-900/50 p-3.5 rounded border border-zinc-800/60">
                      {csResult.text}
                    </p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 3: SYSTEM SPECIFICATIONS & SKILLS DOC HUB */}
          {activeTab === 'docs' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* FILE DIRECTORY SIDEBAR */}
              <div className="md:col-span-4 bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4">
                <h3 className="font-sans text-[11px] font-bold tracking-widest text-zinc-400 uppercase border-b border-zinc-800 pb-2">
                  System Blueprints
                </h3>

                <div className="space-y-4">
                  
                  {/* SYSTEM SPECS SECTION */}
                  <div className="space-y-1.5">
                    <span className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider pl-1.5">Documentation Specs</span>
                    {docsList.filter(d => d.category === 'system').map(d => (
                      <button
                        key={d.path}
                        onClick={() => handleSelectDoc(d)}
                        className={`w-full text-left p-2 rounded text-xs transition flex items-center space-x-2 truncate ${
                          selectedDoc?.path === d.path ? 'bg-zinc-800 text-amber-500 font-medium' : 'text-zinc-400 hover:bg-zinc-950 hover:text-zinc-200'
                        }`}
                      >
                        <FileText size={13} className="shrink-0" />
                        <span className="truncate">{d.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* AGENT SKILLS SECTION */}
                  <div className="space-y-1.5">
                    <span className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider pl-1.5">Agent Skills</span>
                    {docsList.filter(d => d.category === 'skills').map(d => (
                      <button
                        key={d.path}
                        onClick={() => handleSelectDoc(d)}
                        className={`w-full text-left p-2 rounded text-xs transition flex items-center space-x-2 truncate ${
                          selectedDoc?.path === d.path ? 'bg-zinc-800 text-amber-500 font-medium' : 'text-zinc-400 hover:bg-zinc-950 hover:text-zinc-200'
                        }`}
                      >
                        <Sparkles size={13} className="shrink-0" />
                        <span className="truncate">{d.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* ADR SECTION */}
                  <div className="space-y-1.5">
                    <span className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider pl-1.5">Architectural Decisions (ADRs)</span>
                    {docsList.filter(d => d.category === 'adr').map(d => (
                      <button
                        key={d.path}
                        onClick={() => handleSelectDoc(d)}
                        className={`w-full text-left p-2 rounded text-xs transition flex items-center space-x-2 truncate ${
                          selectedDoc?.path === d.path ? 'bg-zinc-800 text-amber-500 font-medium' : 'text-zinc-400 hover:bg-zinc-950 hover:text-zinc-200'
                        }`}
                      >
                        <Shield size={13} className="shrink-0" />
                        <span className="truncate">{d.name}</span>
                      </button>
                    ))}
                  </div>

                </div>
              </div>

              {/* LIVE MARKDOWN DOCUMENT RENDERER */}
              <div className="md:col-span-8 bg-zinc-900 border border-zinc-800 rounded-xl p-6 min-h-[500px]">
                {isLoadingDoc ? (
                  <div className="h-full flex items-center justify-center py-20 flex-col space-y-3">
                    <Loader2 size={24} className="animate-spin text-amber-500" />
                    <span className="text-zinc-500 text-xs">Reading specification markdown from workspace...</span>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-5">
                      <span className="font-mono text-[10px] text-zinc-500 uppercase">{selectedDoc?.path}</span>
                      <button
                        onClick={() => handleCopy(docContent, 'doc_copy')}
                        className="text-[10px] font-mono px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center space-x-1.5 hover:bg-zinc-700 transition"
                      >
                        {copiedText === 'doc_copy' ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                        <span>{copiedText === 'doc_copy' ? "Copied" : "Copy Source"}</span>
                      </button>
                    </div>

                    <div className="prose prose-sm prose-invert max-w-none">
                      {renderMarkdown(docContent)}
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

        </section>

      </main>

      {/* FOOTER BAR */}
      <footer className="mt-20 border-t border-zinc-900 bg-zinc-950 px-6 py-6 flex flex-col md:flex-row items-center justify-between text-zinc-500 text-xs gap-4 max-w-[1600px] mx-auto">
        <div className="flex items-center space-x-2">
          <Shield size={14} />
          <span>Township CEO AI OS • Google Agents Intensive Capstone</span>
        </div>
        <div className="flex items-center gap-4 font-mono text-[9px] tracking-wider uppercase text-zinc-600">
          <span>Course: <span className="text-amber-500">5-Day AI Agents Intensive</span></span>
          <span>SDD: <span className="text-emerald-500">✓ specs/</span></span>
          <span>Skills: <span className="text-emerald-500">✓ .agent/skills/</span></span>
          <span>Eval: <span className="text-emerald-500">✓ 7-Dim</span></span>
          <span>MCP: <span className="text-emerald-500">✓ /api/tools/</span></span>
          <span>Status: <span className="text-emerald-500">● Online</span></span>
        </div>
      </footer>

    </div>
  );
}
