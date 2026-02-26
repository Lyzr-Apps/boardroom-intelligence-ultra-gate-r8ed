'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  FiGrid, FiAlertTriangle, FiUsers, FiDollarSign, FiHeart, FiMessageSquare,
  FiDownload, FiSend, FiRefreshCw, FiChevronRight, FiTrendingUp, FiTrendingDown,
  FiBarChart2, FiActivity, FiShield, FiTarget, FiClock, FiZap, FiMapPin,
  FiArrowRight, FiArrowUp, FiArrowDown, FiLoader, FiCheck, FiX, FiPercent
} from 'react-icons/fi'

// ===================== CONSTANTS =====================

const MANAGER_AGENT_ID = '699ff7d953661e46772f0951'
const ATTRITION_AGENT_ID = '699ff7c17bf6b85220238412'
const PLANNING_AGENT_ID = '699ff7c1d867eb2be8b21dd7'
const COMPENSATION_AGENT_ID = '699ff7c15dcf443c546ef877'
const ORG_HEALTH_AGENT_ID = '699ff7c2c28fc74c6bf654d8'

type SectionKey = 'dashboard' | 'attrition' | 'planning' | 'compensation' | 'orghealth' | 'query'

interface StrategicRisk {
  risk: string
  severity: string
  impact_area: string
  recommended_action: string
}

interface RecommendedAction {
  action: string
  priority: string
  expected_impact: string
  timeline: string
  estimated_cost_usd: number
}

interface ReportData {
  workforce_health_score?: number
  executive_summary?: string
  attrition_risk_index?: number
  workforce_cost_projection_usd?: number
  pay_equity_score?: number
  org_health_index?: number
  hiring_pipeline_score?: number
  top_strategic_risks?: StrategicRisk[]
  top_recommended_actions?: RecommendedAction[]
  board_narrative?: string
  detailed_attrition_analysis?: string
  detailed_planning_analysis?: string
  detailed_compensation_analysis?: string
  detailed_org_health_analysis?: string
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

// ===================== SAMPLE DATA =====================

const SAMPLE_DATA: ReportData = {
  workforce_health_score: 72,
  executive_summary: "## Workforce Intelligence Summary\n\nThe organization maintains a **moderate workforce health score of 72/100**, with key areas requiring immediate attention. Attrition risk is elevated in Engineering and Product departments, driven by compensation gaps and burnout indicators.\n\n### Key Highlights\n- **Attrition Risk Index**: 38% - High risk in critical roles\n- **Pay Equity Score**: 81% - Gender pay gap of 6.2% persists\n- **Org Health Index**: 68% - Declining engagement in 3 departments\n- **Hiring Pipeline**: 54% sufficiency - Critical gaps in AI/ML roles\n\n### Strategic Priorities\n1. Address compensation gaps in Engineering (estimated $2.4M correction)\n2. Implement burnout prevention in Product and Customer Success\n3. Accelerate hiring pipeline for AI/ML and Data Engineering roles",
  attrition_risk_index: 38,
  workforce_cost_projection_usd: 142500000,
  pay_equity_score: 81,
  org_health_index: 68,
  hiring_pipeline_score: 54,
  top_strategic_risks: [
    { risk: "Engineering talent flight risk", severity: "Critical", impact_area: "Engineering", recommended_action: "Immediate compensation review and retention bonuses for top performers" },
    { risk: "AI/ML hiring pipeline shortage", severity: "High", impact_area: "Technology", recommended_action: "Expand sourcing to international markets and university partnerships" },
    { risk: "Manager burnout in Product", severity: "High", impact_area: "Product", recommended_action: "Restructure reporting lines and add middle management layer" },
    { risk: "Gender pay equity gap widening", severity: "High", impact_area: "Organization-wide", recommended_action: "Conduct comprehensive pay audit and implement corrections in Q2" },
    { risk: "Customer Success attrition spike", severity: "Medium", impact_area: "Customer Success", recommended_action: "Review workload distribution and career progression paths" }
  ],
  top_recommended_actions: [
    { action: "Engineering compensation correction", priority: "Critical", expected_impact: "Reduce attrition by 15% in Engineering", timeline: "Q1 2025", estimated_cost_usd: 2400000 },
    { action: "Burnout prevention program", priority: "High", expected_impact: "Improve engagement scores by 12 points", timeline: "Q1-Q2 2025", estimated_cost_usd: 350000 },
    { action: "AI/ML talent acquisition accelerator", priority: "High", expected_impact: "Fill 80% of open AI/ML roles within 90 days", timeline: "Q1 2025", estimated_cost_usd: 1200000 },
    { action: "Pay equity audit and correction", priority: "High", expected_impact: "Close gender pay gap to <2%", timeline: "Q2 2025", estimated_cost_usd: 1800000 },
    { action: "Manager development program", priority: "Medium", expected_impact: "Reduce manager turnover by 20%", timeline: "Q2-Q3 2025", estimated_cost_usd: 500000 }
  ],
  board_narrative: "## Board Report Narrative\n\nThe workforce stands at a pivotal juncture. While overall headcount remains stable at 2,847 employees across 14 departments, several structural risks threaten organizational capability and delivery commitments.\n\n### Financial Impact Summary\n- **Current workforce cost projection**: $142.5M annually\n- **Cost to correct pay imbalances**: $4.2M (one-time)\n- **Revenue at risk from attrition**: $18.7M\n- **Projected savings from interventions**: $12.3M over 18 months\n\n### Organizational Health\nEngagement surveys indicate a **6-point decline** in Engineering and Product teams. Exit interview analysis reveals compensation (42%), career growth (28%), and work-life balance (19%) as primary departure drivers.\n\n### Competitive Position\nOur compensation sits at the **45th percentile** for Engineering roles in our target markets, down from the 55th percentile 12 months ago. This is the primary driver of our elevated attrition risk.\n\n### Board Recommendation\nWe recommend immediate approval of the **$6.25M Strategic Workforce Investment Package** covering compensation corrections, talent acquisition acceleration, and organizational health programs. Expected ROI: 2.1x over 18 months.",
  detailed_attrition_analysis: "## Attrition Risk Analysis\n\n### Overall Attrition Metrics\n- **Trailing 12-month attrition rate**: 18.4%\n- **Voluntary attrition rate**: 14.2%\n- **Involuntary attrition rate**: 4.2%\n- **Industry benchmark**: 12.5%\n\n### High-Risk Departments\n1. **Engineering** - 24.3% attrition risk (Critical)\n   - Senior Engineers: 32% flight risk\n   - Staff Engineers: 28% flight risk\n   - Key drivers: Compensation gap, limited growth paths\n\n2. **Product** - 19.8% attrition risk (High)\n   - Product Managers: 22% flight risk\n   - Key drivers: Burnout, span-of-control issues\n\n3. **Customer Success** - 17.5% attrition risk (High)\n   - CSMs: 20% flight risk\n   - Key drivers: Workload, below-market comp\n\n4. **Data Science** - 16.2% attrition risk (Medium)\n   - ML Engineers: 18% flight risk\n   - Key drivers: Tool/infrastructure gaps\n\n### Revenue at Risk\n- **Total revenue at risk**: $18.7M\n- **Replacement cost for high-risk roles**: $8.2M\n- **Productivity loss during transitions**: $5.4M\n\n### Retention Interventions\n- Spot bonuses for top 50 critical roles: $750K\n- Career path restructuring: $200K (consulting)\n- Stay interviews for high-risk individuals: $50K\n- Flexible work arrangements expansion: $100K",
  detailed_planning_analysis: "## Workforce Planning Analysis\n\n### Headcount Forecast\n| Timeframe | Current | Projected | Net Change |\n|-----------|---------|-----------|------------|\n| 6 months  | 2,847   | 2,912     | +65        |\n| 12 months | 2,847   | 3,045     | +198       |\n| 18 months | 2,847   | 3,180     | +333       |\n\n### Skill Demand Projections\n- **AI/ML Engineering**: 45 roles needed, 12 in pipeline (27% fill rate)\n- **Cloud Infrastructure**: 22 roles needed, 15 in pipeline (68% fill rate)\n- **Product Management**: 18 roles needed, 10 in pipeline (56% fill rate)\n- **Data Engineering**: 15 roles needed, 4 in pipeline (27% fill rate)\n- **Security Engineering**: 8 roles needed, 6 in pipeline (75% fill rate)\n\n### Hiring Pipeline Sufficiency\n- **Overall pipeline score**: 54%\n- **Critical gaps**: AI/ML (27%), Data Engineering (27%)\n- **Strong pipelines**: Security (75%), Cloud (68%)\n- **Average time-to-fill**: 62 days (target: 45 days)\n\n### Scenario Analysis\n- **Best case** (attrition -5%): Net headcount +280 in 12 months\n- **Base case**: Net headcount +198 in 12 months\n- **Worst case** (attrition +5%): Net headcount +85 in 12 months\n- **Hiring freeze impact**: -147 headcount in 12 months, $12M delivery risk",
  detailed_compensation_analysis: "## Compensation Benchmarking Analysis\n\n### Pay Competitiveness Score: 81/100\n\n### Market Position by Department\n| Department | Percentile | Gap | Status |\n|-----------|-----------|-----|--------|\n| Engineering | 45th | -10% | Below Market |\n| Product | 52nd | -3% | At Market |\n| Sales | 58th | +3% | Above Market |\n| Marketing | 50th | 0% | At Market |\n| Customer Success | 42nd | -12% | Below Market |\n| Data Science | 48th | -7% | Below Market |\n| Design | 55th | +2% | At Market |\n| Finance | 53rd | +1% | At Market |\n\n### Equity Analysis\n- **Gender pay gap**: 6.2% (target: <2%)\n- **Ethnicity pay gap**: 4.1% (target: <2%)\n- **Tenure-adjusted gap**: 3.8%\n- **Role-level adjusted gap**: 2.9%\n\n### Cost to Correct\n- **Engineering corrections**: $2.4M\n- **Customer Success corrections**: $890K\n- **Data Science corrections**: $650K\n- **Equity adjustments**: $260K\n- **Total correction budget**: $4.2M\n\n### Compensation Risk Heatmap\n- **Critical**: Senior Engineers, Staff Engineers, ML Engineers\n- **High**: Product Managers, Senior CSMs, Data Engineers\n- **Medium**: Designers, Marketing Managers, Sales Engineers\n- **Low**: Finance, HR, Legal, Admin",
  detailed_org_health_analysis: "## Organizational Health Analysis\n\n### Org Health Index: 68/100\n\n### Engagement Metrics\n- **Overall engagement score**: 71/100 (down 4 from last quarter)\n- **eNPS**: +18 (industry avg: +25)\n- **Response rate**: 84%\n\n### Burnout Indicators by Department\n| Department | Burnout Score | Trend | Flag |\n|-----------|--------------|-------|------|\n| Product | 78/100 | Rising | Critical |\n| Engineering | 72/100 | Stable | High |\n| Customer Success | 69/100 | Rising | High |\n| Sales | 55/100 | Stable | Medium |\n| Marketing | 48/100 | Declining | Low |\n| Finance | 42/100 | Stable | Low |\n| HR | 45/100 | Stable | Low |\n| Design | 52/100 | Declining | Medium |\n\n### Manager Effectiveness\n- **Top-performing managers**: 23 (span < 8, engagement > 80)\n- **At-risk managers**: 12 (span > 12, engagement < 60)\n- **New managers needing support**: 18 (< 6 months in role)\n\n### Engagement vs Attrition Correlation\n- Teams with engagement < 60: 2.4x attrition rate\n- Teams with engagement 60-75: 1.2x attrition rate\n- Teams with engagement > 75: 0.7x attrition rate\n\n### Recommended Interventions\n1. **Product team restructure**: Reduce manager span from 14 to 8\n2. **Engineering wellness program**: On-site counseling, flex Fridays\n3. **CS workload rebalancing**: Hire 6 additional CSMs\n4. **Manager coaching**: Quarterly 360 feedback + executive coaching\n5. **Pulse survey cadence**: Move from quarterly to monthly"
}

// ===================== HELPERS =====================

const parseAgentResponse = (result: any): ReportData | null => {
  try {
    let data = result?.response?.result
    if (typeof data === 'string') {
      try { data = JSON.parse(data) } catch { return null }
    }
    return data as ReportData
  } catch { return null }
}

function formatCurrency(value: number | undefined): string {
  if (value === undefined || value === null) return '$--'
  if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
  return `$${value.toLocaleString()}`
}

function getScoreColor(score: number | undefined): string {
  if (score === undefined || score === null) return 'text-muted-foreground'
  if (score >= 80) return 'text-green-700'
  if (score >= 60) return 'text-yellow-700'
  if (score >= 40) return 'text-orange-700'
  return 'text-red-700'
}

function getScoreBg(score: number | undefined): string {
  if (score === undefined || score === null) return 'bg-muted'
  if (score >= 80) return 'bg-green-500/20'
  if (score >= 60) return 'bg-yellow-500/20'
  if (score >= 40) return 'bg-orange-500/20'
  return 'bg-red-500/20'
}

function getRiskColor(band: string): string {
  switch (band?.toLowerCase()) {
    case 'critical': return 'bg-red-500/20 text-red-700 border-red-300'
    case 'high': return 'bg-orange-500/20 text-orange-700 border-orange-300'
    case 'medium': return 'bg-yellow-500/20 text-yellow-700 border-yellow-300'
    case 'low': return 'bg-green-500/20 text-green-700 border-green-300'
    default: return 'bg-gray-500/20 text-gray-700 border-gray-300'
  }
}

function getPriorityColor(priority: string): string {
  switch (priority?.toLowerCase()) {
    case 'critical': return 'bg-red-500/20 text-red-700 border-red-300'
    case 'high': return 'bg-orange-500/20 text-orange-700 border-orange-300'
    case 'medium': return 'bg-yellow-500/20 text-yellow-700 border-yellow-300'
    case 'low': return 'bg-green-500/20 text-green-700 border-green-300'
    default: return 'bg-gray-500/20 text-gray-700 border-gray-300'
  }
}

function getHeatmapColor(value: number): string {
  if (value >= 80) return 'bg-red-500/80 text-white'
  if (value >= 60) return 'bg-orange-500/70 text-white'
  if (value >= 40) return 'bg-yellow-500/60 text-yellow-900'
  if (value >= 20) return 'bg-green-500/50 text-green-900'
  return 'bg-green-300/40 text-green-900'
}

// ===================== MARKDOWN RENDERER =====================

function formatInline(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  if (parts.length === 1) return text
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold">{part}</strong>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  )
}

function renderMarkdown(text: string) {
  if (!text) return null
  return (
    <div className="space-y-2">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('### '))
          return <h4 key={i} className="font-serif font-semibold text-sm mt-3 mb-1 text-foreground">{line.slice(4)}</h4>
        if (line.startsWith('## '))
          return <h3 key={i} className="font-serif font-semibold text-base mt-3 mb-1 text-foreground">{line.slice(3)}</h3>
        if (line.startsWith('# '))
          return <h2 key={i} className="font-serif font-bold text-lg mt-4 mb-2 text-foreground">{line.slice(2)}</h2>
        if (line.startsWith('- ') || line.startsWith('* '))
          return <li key={i} className="ml-4 list-disc text-sm text-foreground/90">{formatInline(line.slice(2))}</li>
        if (/^\d+\.\s/.test(line))
          return <li key={i} className="ml-4 list-decimal text-sm text-foreground/90">{formatInline(line.replace(/^\d+\.\s/, ''))}</li>
        if (line.startsWith('|') && line.includes('|')) {
          const cells = line.split('|').filter(c => c.trim() !== '')
          if (cells.every(c => /^[\s\-:]+$/.test(c))) return null
          return (
            <div key={i} className="flex gap-2 text-xs font-sans">
              {cells.map((cell, ci) => (
                <span key={ci} className="flex-1 px-2 py-1 bg-secondary/50 rounded text-foreground/80">{formatInline(cell.trim())}</span>
              ))}
            </div>
          )
        }
        if (!line.trim()) return <div key={i} className="h-1" />
        return <p key={i} className="text-sm text-foreground/90">{formatInline(line)}</p>
      })}
    </div>
  )
}

// ===================== ERROR BOUNDARY =====================

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: '' }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-xl font-serif font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4 text-sm">{this.state.error}</p>
            <button onClick={() => this.setState({ hasError: false, error: '' })} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm">
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// ===================== INLINE COMPONENTS =====================

function ScoreCircle({ score, label, size = 'md' }: { score: number | undefined; label: string; size?: 'sm' | 'md' | 'lg' }) {
  const s = score ?? 0
  const circumference = 2 * Math.PI * 40
  const offset = circumference - (s / 100) * circumference
  const sizeClass = size === 'lg' ? 'w-32 h-32' : size === 'md' ? 'w-24 h-24' : 'w-16 h-16'
  const textSize = size === 'lg' ? 'text-3xl' : size === 'md' ? 'text-xl' : 'text-sm'

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`${sizeClass} relative glass-score-ring`}>
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="8" />
          <circle cx="50" cy="50" r="40" fill="none" stroke={s >= 70 ? 'hsl(142 71% 35%)' : s >= 50 ? 'hsl(43 75% 38%)' : 'hsl(0 84% 60%)'} strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={score !== undefined ? offset : circumference} className="transition-all duration-1000" style={{ filter: 'drop-shadow(0 0 6px currentColor)' }} />
        </svg>
        <div className={`absolute inset-0 flex items-center justify-center ${textSize} font-serif font-bold text-foreground`}>
          {score !== undefined ? s : '--'}
        </div>
      </div>
      <span className="font-sans text-xs uppercase tracking-wider text-muted-foreground text-center">{label}</span>
    </div>
  )
}

function MetricCard({ label, value, subtitle, icon, onClick }: { label: string; value: string | number; subtitle?: string; icon?: React.ReactNode; onClick?: () => void }) {
  return (
    <div onClick={onClick} className={`glass-card rounded-xl p-6 ${onClick ? 'glass-card-interactive' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-muted-foreground text-xs font-sans tracking-wider uppercase">{label}</p>
          <p className="text-3xl font-serif font-bold text-primary mt-2">{value}</p>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        {icon && <div className="text-primary/60 mt-1">{icon}</div>}
      </div>
    </div>
  )
}

function EmptyState({ message, subMessage, onAction, actionLabel }: { message: string; subMessage?: string; onAction?: () => void; actionLabel?: string }) {
  return (
    <div className="text-center py-16 text-muted-foreground glass-panel rounded-2xl mx-auto max-w-md">
      <FiBarChart2 className="mx-auto h-12 w-12 mb-4 opacity-40" />
      <p className="text-lg font-serif">{message}</p>
      {subMessage && <p className="text-sm mt-2">{subMessage}</p>}
      {onAction && actionLabel && (
        <Button onClick={onAction} className="mt-4 glass-btn-primary border-0">
          {actionLabel} <FiArrowRight className="ml-2" />
        </Button>
      )}
    </div>
  )
}

function InlineError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 text-destructive backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <FiX className="h-4 w-4" />
        <p className="font-medium text-sm">{message}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="underline mt-1 text-sm">Try again</button>
      )}
    </div>
  )
}

function InlineStatus({ message, type }: { message: string; type: 'success' | 'info' | 'loading' }) {
  return (
    <div className={`rounded-xl p-3 text-sm flex items-center gap-2 backdrop-blur-md ${type === 'success' ? 'bg-green-500/10 text-green-700 border border-green-300/30' : type === 'loading' ? 'bg-primary/10 text-primary border border-primary/20 glass-shimmer' : 'bg-secondary/50 text-secondary-foreground border border-border/30'}`}>
      {type === 'loading' && <FiLoader className="h-4 w-4 animate-spin" />}
      {type === 'success' && <FiCheck className="h-4 w-4" />}
      {message}
    </div>
  )
}

function SkeletonCard() {
  return <div className="glass-skeleton rounded-xl h-32" />
}

// ===================== AGENT INFO =====================

function AgentInfoPanel({ activeAgentId }: { activeAgentId: string | null }) {
  const agents = [
    { id: MANAGER_AGENT_ID, name: 'Workforce Intelligence Orchestrator', purpose: 'Central coordinator for all analysis' },
    { id: ATTRITION_AGENT_ID, name: 'Attrition Risk Prediction', purpose: 'Predicts employee flight risk' },
    { id: PLANNING_AGENT_ID, name: 'Workforce Planning', purpose: 'Headcount & skill forecasting' },
    { id: COMPENSATION_AGENT_ID, name: 'Compensation Benchmarking', purpose: 'Market pay analysis' },
    { id: ORG_HEALTH_AGENT_ID, name: 'Org Health', purpose: 'Engagement & burnout tracking' },
  ]
  return (
    <div className="glass-panel rounded-xl p-3">
      <div className="flex items-center gap-2 mb-3 px-1">
        <FiActivity className="h-4 w-4 text-primary" />
        <span className="text-sm font-sans font-medium text-foreground">Intelligence Agents</span>
      </div>
      <div className="space-y-1.5">
        {agents.map((agent) => (
          <div key={agent.id} className={`flex items-center gap-2 p-2 rounded-lg text-xs transition-all duration-300 ${activeAgentId === agent.id ? 'glass-panel-strong border-primary/20' : 'hover:bg-white/20'}`}>
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${activeAgentId === agent.id ? 'bg-primary animate-pulse shadow-[0_0_8px_rgba(139,90,43,0.4)]' : 'bg-muted-foreground/30'}`} />
            <div className="min-w-0">
              <p className="font-medium text-foreground truncate">{agent.name}</p>
              <p className="text-muted-foreground truncate">{agent.purpose}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ===================== SECTION: DASHBOARD =====================

function DashboardSection({
  data,
  isGenerating,
  error,
  onGenerate,
  onNavigate,
  showSample
}: {
  data: ReportData | null
  isGenerating: boolean
  error: string | null
  onGenerate: () => void
  onNavigate: (s: SectionKey) => void
  showSample: boolean
}) {
  const d = showSample ? SAMPLE_DATA : data

  return (
    <div className="space-y-6">
      {/* Workforce Overview */}
      <div className="glass-panel-strong rounded-2xl p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="font-sans text-xs uppercase tracking-wider text-muted-foreground">Total Headcount</p>
            <p className="text-2xl font-serif font-bold text-foreground mt-1">{d ? '2,847' : '--'}</p>
          </div>
          <div className="text-center">
            <p className="font-sans text-xs uppercase tracking-wider text-muted-foreground">Attrition Rate</p>
            <p className={`text-2xl font-serif font-bold mt-1 ${d ? 'text-orange-700' : 'text-muted-foreground'}`}>{d ? '18.4%' : '--%'}</p>
          </div>
          <div className="text-center">
            <p className="font-sans text-xs uppercase tracking-wider text-muted-foreground">Avg Engagement</p>
            <p className={`text-2xl font-serif font-bold mt-1 ${d ? 'text-yellow-700' : 'text-muted-foreground'}`}>{d ? '71/100' : '--/100'}</p>
          </div>
          <div className="text-center">
            <p className="font-sans text-xs uppercase tracking-wider text-muted-foreground">Pay Competitiveness</p>
            <p className={`text-2xl font-serif font-bold mt-1 ${d ? getScoreColor(d?.pay_equity_score) : 'text-muted-foreground'}`}>{d?.pay_equity_score !== undefined ? `${d.pay_equity_score}/100` : '--/100'}</p>
          </div>
        </div>
      </div>

      {/* Intelligence Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Attrition Risk Index */}
        <div className="glass-card glass-card-interactive rounded-xl p-6" onClick={() => onNavigate('attrition')}>
          <div className="flex items-center justify-between mb-4">
            <p className="font-sans text-xs uppercase tracking-wider text-muted-foreground">Attrition Risk Index</p>
            <FiAlertTriangle className="h-4 w-4 text-orange-600" />
          </div>
          <ScoreCircle score={d?.attrition_risk_index} label="" size="sm" />
          <p className="text-sm text-muted-foreground mt-3 text-center">
            {d?.attrition_risk_index !== undefined
              ? (d.attrition_risk_index >= 50 ? 'Critical Risk' : d.attrition_risk_index >= 30 ? 'Elevated Risk' : 'Moderate Risk')
              : 'Pending analysis'}
          </p>
          <div className="flex items-center justify-center mt-2 text-xs text-primary">
            <span>View details</span> <FiChevronRight className="ml-1 h-3 w-3" />
          </div>
        </div>

        {/* Workforce Cost */}
        <div className="glass-card glass-card-interactive rounded-xl p-6" onClick={() => onNavigate('planning')}>
          <div className="flex items-center justify-between mb-4">
            <p className="font-sans text-xs uppercase tracking-wider text-muted-foreground">Workforce Cost Projection</p>
            <FiDollarSign className="h-4 w-4 text-primary" />
          </div>
          <p className="text-3xl font-serif font-bold text-primary">{d?.workforce_cost_projection_usd !== undefined ? formatCurrency(d.workforce_cost_projection_usd) : '$--'}</p>
          <p className="text-sm text-muted-foreground mt-2">Annual projection</p>
          {d && <div className="flex items-center gap-1 mt-2 text-xs text-orange-600"><FiTrendingUp className="h-3 w-3" /> +4.2% vs last year</div>}
          <div className="flex items-center justify-center mt-2 text-xs text-primary">
            <span>View details</span> <FiChevronRight className="ml-1 h-3 w-3" />
          </div>
        </div>

        {/* Hiring Pipeline */}
        <div className="glass-card glass-card-interactive rounded-xl p-6" onClick={() => onNavigate('planning')}>
          <div className="flex items-center justify-between mb-4">
            <p className="font-sans text-xs uppercase tracking-wider text-muted-foreground">Hiring Pipeline Score</p>
            <FiUsers className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-serif font-bold ${getScoreColor(d?.hiring_pipeline_score)}`}>{d?.hiring_pipeline_score ?? '--'}%</span>
              <span className="text-xs text-muted-foreground">sufficiency</span>
            </div>
            <Progress value={d?.hiring_pipeline_score ?? 0} className="h-2 mt-3" />
          </div>
          <p className="text-sm text-muted-foreground mt-2">Pipeline fill rate</p>
          <div className="flex items-center justify-center mt-2 text-xs text-primary">
            <span>View details</span> <FiChevronRight className="ml-1 h-3 w-3" />
          </div>
        </div>

        {/* Pay Equity */}
        <div className="glass-card glass-card-interactive rounded-xl p-6" onClick={() => onNavigate('compensation')}>
          <div className="flex items-center justify-between mb-4">
            <p className="font-sans text-xs uppercase tracking-wider text-muted-foreground">Pay Equity Monitor</p>
            <FiDollarSign className="h-4 w-4 text-accent" />
          </div>
          <ScoreCircle score={d?.pay_equity_score} label="" size="sm" />
          <p className="text-sm text-muted-foreground mt-3 text-center">
            {d ? 'Gender gap: 6.2%' : 'Pending analysis'}
          </p>
          <div className="flex items-center justify-center mt-2 text-xs text-primary">
            <span>View details</span> <FiChevronRight className="ml-1 h-3 w-3" />
          </div>
        </div>

        {/* Org Health */}
        <div className="glass-card glass-card-interactive rounded-xl p-6" onClick={() => onNavigate('orghealth')}>
          <div className="flex items-center justify-between mb-4">
            <p className="font-sans text-xs uppercase tracking-wider text-muted-foreground">Org Health Index</p>
            <FiHeart className="h-4 w-4 text-red-500" />
          </div>
          <ScoreCircle score={d?.org_health_index} label="" size="sm" />
          <p className="text-sm text-muted-foreground mt-3 text-center">
            {d ? '3 burnout flags' : 'Pending analysis'}
          </p>
          <div className="flex items-center justify-center mt-2 text-xs text-primary">
            <span>View details</span> <FiChevronRight className="ml-1 h-3 w-3" />
          </div>
        </div>

        {/* Strategic Risk */}
        <div className="glass-card glass-card-interactive rounded-xl p-6" onClick={() => onNavigate('query')}>
          <div className="flex items-center justify-between mb-4">
            <p className="font-sans text-xs uppercase tracking-wider text-muted-foreground">Strategic Risk Radar</p>
            <FiShield className="h-4 w-4 text-red-600" />
          </div>
          <ScoreCircle score={d?.workforce_health_score} label="" size="sm" />
          <p className="text-sm text-muted-foreground mt-3 text-center">
            {d ? `${Array.isArray(d?.top_strategic_risks) ? d.top_strategic_risks.length : 0} active risks` : 'Pending analysis'}
          </p>
          <div className="flex items-center justify-center mt-2 text-xs text-primary">
            <span>Explore</span> <FiChevronRight className="ml-1 h-3 w-3" />
          </div>
        </div>
      </div>

      {/* ===== INSIGHTS SECTION ===== */}
      {d && (
        <>
          {/* Financial Impact Summary */}
          <div className="glass-panel rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <FiDollarSign className="h-5 w-5 text-accent" />
              <h3 className="font-serif text-lg font-semibold text-foreground">Financial Impact Summary</h3>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-card rounded-xl p-4 text-center">
                <p className="text-xs font-sans uppercase tracking-wider text-muted-foreground">Annual Workforce Cost</p>
                <p className="text-2xl font-serif font-bold text-primary mt-2">$142.5M</p>
                <div className="flex items-center justify-center gap-1 mt-1 text-xs text-orange-600">
                  <FiTrendingUp className="h-3 w-3" /> +4.2% YoY
                </div>
              </div>
              <div className="glass-card rounded-xl p-4 text-center">
                <p className="text-xs font-sans uppercase tracking-wider text-muted-foreground">Revenue at Risk</p>
                <p className="text-2xl font-serif font-bold text-red-700 mt-2">$18.7M</p>
                <div className="flex items-center justify-center gap-1 mt-1 text-xs text-red-600">
                  <FiAlertTriangle className="h-3 w-3" /> From attrition
                </div>
              </div>
              <div className="glass-card rounded-xl p-4 text-center">
                <p className="text-xs font-sans uppercase tracking-wider text-muted-foreground">Pay Correction Needed</p>
                <p className="text-2xl font-serif font-bold text-orange-700 mt-2">$4.2M</p>
                <div className="flex items-center justify-center gap-1 mt-1 text-xs text-muted-foreground">
                  <FiTarget className="h-3 w-3" /> One-time fix
                </div>
              </div>
              <div className="glass-card rounded-xl p-4 text-center">
                <p className="text-xs font-sans uppercase tracking-wider text-muted-foreground">Projected ROI</p>
                <p className="text-2xl font-serif font-bold text-green-700 mt-2">2.1x</p>
                <div className="flex items-center justify-center gap-1 mt-1 text-xs text-green-600">
                  <FiTrendingUp className="h-3 w-3" /> 18-month horizon
                </div>
              </div>
            </div>
          </div>

          {/* Department Health Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-panel rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <FiBarChart2 className="h-5 w-5 text-primary" />
                <h3 className="font-serif text-lg font-semibold text-foreground">Department Attrition Risk</h3>
              </div>
              <div className="space-y-3">
                {[
                  { dept: 'Engineering', rate: 24.3, band: 'Critical', color: 'bg-red-500/70' },
                  { dept: 'Product', rate: 19.8, band: 'High', color: 'bg-orange-500/60' },
                  { dept: 'Customer Success', rate: 17.5, band: 'High', color: 'bg-orange-500/60' },
                  { dept: 'Data Science', rate: 16.2, band: 'Medium', color: 'bg-yellow-500/60' },
                  { dept: 'Sales', rate: 11.0, band: 'Low', color: 'bg-green-500/50' },
                  { dept: 'Marketing', rate: 9.5, band: 'Low', color: 'bg-green-500/50' },
                ].map((item, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground font-medium">{item.dept}</span>
                      <div className="flex items-center gap-2">
                        <span className={`font-serif font-bold ${item.rate >= 20 ? 'text-red-700' : item.rate >= 15 ? 'text-orange-700' : 'text-green-700'}`}>{item.rate}%</span>
                        <Badge className={`${getRiskColor(item.band)} border text-xs glass-badge`}>{item.band}</Badge>
                      </div>
                    </div>
                    <div className="relative h-2.5 glass-progress overflow-hidden">
                      <div className={`absolute h-full rounded-full transition-all duration-700 ${item.color}`} style={{ width: `${Math.min(item.rate * 3.5, 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <FiPercent className="h-5 w-5 text-accent" />
                <h3 className="font-serif text-lg font-semibold text-foreground">Compensation vs Market</h3>
              </div>
              <div className="space-y-3">
                {[
                  { dept: 'Engineering', percentile: 45, gap: -10 },
                  { dept: 'Customer Success', percentile: 42, gap: -12 },
                  { dept: 'Data Science', percentile: 48, gap: -7 },
                  { dept: 'Product', percentile: 52, gap: -3 },
                  { dept: 'Sales', percentile: 58, gap: 3 },
                  { dept: 'Design', percentile: 55, gap: 2 },
                ].map((item, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground font-medium">{item.dept}</span>
                      <div className="flex items-center gap-2">
                        <span className={`font-mono text-xs font-bold ${item.gap >= 0 ? 'text-green-700' : 'text-red-700'}`}>{item.gap >= 0 ? '+' : ''}{item.gap}%</span>
                        <span className={`font-serif font-bold text-sm ${item.percentile >= 50 ? 'text-green-700' : 'text-red-700'}`}>{item.percentile}th</span>
                      </div>
                    </div>
                    <div className="relative h-2.5 glass-progress overflow-hidden">
                      <div className={`absolute h-full rounded-full transition-all duration-700 ${item.percentile >= 50 ? 'bg-green-500/60' : item.percentile >= 45 ? 'bg-yellow-500/60' : 'bg-red-500/60'}`} style={{ width: `${item.percentile}%` }} />
                      <div className="absolute h-full border-r-2 border-foreground/30" style={{ left: '50%' }} title="Market median" />
                    </div>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2"><span className="w-3 h-0.5 bg-foreground/30 inline-block" /> 50th percentile (market median)</p>
              </div>
            </div>
          </div>

          {/* Engagement & Burnout Snapshot + Hiring Pipeline */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Burnout Snapshot */}
            <div className="glass-panel rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <FiActivity className="h-5 w-5 text-red-500" />
                <h3 className="font-serif text-lg font-semibold text-foreground">Burnout Snapshot</h3>
              </div>
              <div className="space-y-3">
                {[
                  { dept: 'Product', score: 78, trend: 'up' },
                  { dept: 'Engineering', score: 72, trend: 'flat' },
                  { dept: 'Customer Success', score: 69, trend: 'up' },
                  { dept: 'Sales', score: 55, trend: 'flat' },
                  { dept: 'Design', score: 52, trend: 'down' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 glass-card rounded-xl">
                    <div className="w-20 text-xs font-medium text-foreground truncate">{item.dept}</div>
                    <div className="flex-1">
                      <div className="relative h-5 glass-progress overflow-hidden">
                        <div className={`absolute h-full rounded-full transition-all duration-700 ${item.score >= 70 ? 'bg-red-500/70' : item.score >= 50 ? 'bg-yellow-500/60' : 'bg-green-500/50'}`} style={{ width: `${item.score}%` }} />
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-foreground">{item.score}</span>
                      </div>
                    </div>
                    {item.trend === 'up' ? <FiTrendingUp className="h-3.5 w-3.5 text-red-500 flex-shrink-0" /> : item.trend === 'down' ? <FiTrendingDown className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> : <FiActivity className="h-3.5 w-3.5 text-yellow-500 flex-shrink-0" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Hiring Pipeline Gaps */}
            <div className="glass-panel rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <FiUsers className="h-5 w-5 text-primary" />
                <h3 className="font-serif text-lg font-semibold text-foreground">Hiring Pipeline</h3>
              </div>
              <div className="space-y-3">
                {[
                  { skill: 'AI/ML Eng.', needed: 45, filled: 12, pct: 27 },
                  { skill: 'Data Eng.', needed: 15, filled: 4, pct: 27 },
                  { skill: 'Product Mgmt', needed: 18, filled: 10, pct: 56 },
                  { skill: 'Cloud Infra', needed: 22, filled: 15, pct: 68 },
                  { skill: 'Security Eng.', needed: 8, filled: 6, pct: 75 },
                ].map((item, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-foreground font-medium">{item.skill}</span>
                      <span className={`font-bold ${item.pct >= 60 ? 'text-green-700' : item.pct >= 40 ? 'text-yellow-700' : 'text-red-700'}`}>{item.filled}/{item.needed}</span>
                    </div>
                    <Progress value={item.pct} className="h-2" />
                  </div>
                ))}
                <div className="pt-2 border-t border-white/20">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Avg. Time-to-Fill</span>
                    <span className="font-serif font-bold text-orange-700">62 days</span>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="text-muted-foreground">Target</span>
                    <span className="font-serif font-bold text-green-700">45 days</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Equity Gaps */}
            <div className="glass-panel rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <FiShield className="h-5 w-5 text-accent" />
                <h3 className="font-serif text-lg font-semibold text-foreground">Equity & DEI</h3>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Gender Pay Gap', value: 6.2, target: 2 },
                  { label: 'Ethnicity Pay Gap', value: 4.1, target: 2 },
                  { label: 'Tenure-Adjusted', value: 3.8, target: 2 },
                  { label: 'Role-Level Adjusted', value: 2.9, target: 2 },
                ].map((item, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-foreground font-medium">{item.label}</span>
                      <span className={`font-bold ${item.value > item.target ? 'text-red-700' : 'text-green-700'}`}>{item.value}%</span>
                    </div>
                    <div className="relative h-2 glass-progress overflow-hidden">
                      <div className="absolute h-full bg-red-400/70 rounded-full transition-all duration-500" style={{ width: `${Math.min(item.value * 10, 100)}%` }} />
                      <div className="absolute h-full border-r-2 border-green-600" style={{ left: `${item.target * 10}%` }} />
                    </div>
                  </div>
                ))}
                <div className="pt-2 border-t border-white/20 text-xs text-muted-foreground">
                  <p className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-600 inline-block" /> Target: &lt;2% gap</p>
                </div>
              </div>
            </div>
          </div>

          {/* Engagement vs Attrition Correlation + Exit Drivers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Engagement-Attrition Correlation */}
            <div className="glass-panel rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <FiZap className="h-5 w-5 text-primary" />
                <h3 className="font-serif text-lg font-semibold text-foreground">Engagement-Attrition Link</h3>
              </div>
              <div className="space-y-3">
                {[
                  { range: 'Engagement < 60', multiplier: '2.4x', teams: 4, color: 'bg-red-500/15 border-red-300/30', textColor: 'text-red-700', barWidth: 96 },
                  { range: 'Engagement 60-75', multiplier: '1.2x', teams: 8, color: 'bg-yellow-500/15 border-yellow-300/30', textColor: 'text-yellow-700', barWidth: 48 },
                  { range: 'Engagement > 75', multiplier: '0.7x', teams: 12, color: 'bg-green-500/15 border-green-300/30', textColor: 'text-green-700', barWidth: 28 },
                ].map((item, i) => (
                  <div key={i} className={`rounded-xl p-4 ${item.color} border backdrop-blur-sm`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">{item.range}</span>
                      <span className={`font-serif font-bold text-xl ${item.textColor}`}>{item.multiplier}</span>
                    </div>
                    <div className="relative h-2 glass-progress overflow-hidden">
                      <div className={`absolute h-full rounded-full ${item.textColor === 'text-red-700' ? 'bg-red-500/60' : item.textColor === 'text-yellow-700' ? 'bg-yellow-500/60' : 'bg-green-500/50'}`} style={{ width: `${item.barWidth}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{item.teams} teams in this range</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Exit Interview Drivers */}
            <div className="glass-panel rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <FiMapPin className="h-5 w-5 text-red-500" />
                <h3 className="font-serif text-lg font-semibold text-foreground">Exit Interview Drivers</h3>
              </div>
              <div className="space-y-4">
                {[
                  { driver: 'Compensation', pct: 42, icon: <FiDollarSign className="h-4 w-4" /> },
                  { driver: 'Career Growth', pct: 28, icon: <FiTrendingUp className="h-4 w-4" /> },
                  { driver: 'Work-Life Balance', pct: 19, icon: <FiClock className="h-4 w-4" /> },
                  { driver: 'Management', pct: 7, icon: <FiUsers className="h-4 w-4" /> },
                  { driver: 'Other', pct: 4, icon: <FiGrid className="h-4 w-4" /> },
                ].map((item, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-foreground">
                        <span className="text-muted-foreground">{item.icon}</span>
                        <span className="font-medium">{item.driver}</span>
                      </div>
                      <span className="font-serif font-bold text-foreground">{item.pct}%</span>
                    </div>
                    <div className="relative h-3 glass-progress overflow-hidden">
                      <div className="absolute h-full bg-primary/50 rounded-full transition-all duration-700" style={{ width: `${item.pct * 2}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Strategic Risks + Actions in Compact Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strategic Risks */}
            {Array.isArray(d?.top_strategic_risks) && d.top_strategic_risks.length > 0 && (
              <div className="glass-panel rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <FiAlertTriangle className="h-5 w-5 text-red-600" />
                  <h3 className="font-serif text-lg font-semibold text-foreground">Top Strategic Risks</h3>
                </div>
                <div className="space-y-2.5">
                  {d.top_strategic_risks.map((risk, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 glass-card rounded-xl">
                      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-red-500/15 text-red-700 text-xs font-bold flex-shrink-0 mt-0.5 backdrop-blur-sm">{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm text-foreground truncate">{risk?.risk ?? ''}</p>
                          <Badge className={`${getRiskColor(risk?.severity)} border text-xs glass-badge flex-shrink-0`}>
                            {risk?.severity ?? 'Unknown'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{risk?.impact_area ?? 'N/A'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Actions */}
            {Array.isArray(d?.top_recommended_actions) && d.top_recommended_actions.length > 0 && (
              <div className="glass-panel rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <FiTarget className="h-5 w-5 text-accent" />
                  <h3 className="font-serif text-lg font-semibold text-foreground">Priority Actions</h3>
                </div>
                <div className="space-y-2.5">
                  {d.top_recommended_actions.map((action, i) => (
                    <div key={i} className="p-3 glass-card rounded-xl">
                      <div className="flex items-center gap-3 mb-1.5">
                        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/15 text-primary text-xs font-bold flex-shrink-0 backdrop-blur-sm">{i + 1}</div>
                        <span className="font-medium text-sm text-foreground flex-1">{action?.action ?? ''}</span>
                        <Badge className={`${getPriorityColor(action?.priority)} border text-xs glass-badge flex-shrink-0`}>
                          {action?.priority ?? ''}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground ml-10">
                        <span className="flex items-center gap-1"><FiClock className="h-3 w-3" /> {action?.timeline ?? 'N/A'}</span>
                        <span className="flex items-center gap-1"><FiDollarSign className="h-3 w-3" /> {action?.estimated_cost_usd !== undefined ? formatCurrency(action.estimated_cost_usd) : 'N/A'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Board Narrative Summary */}
          {d?.board_narrative && (
            <div className="glass-panel-strong rounded-2xl p-6 border-2 border-primary/10">
              <div className="flex items-center gap-2 mb-4">
                <FiBarChart2 className="h-5 w-5 text-primary" />
                <h3 className="font-serif text-lg font-semibold text-foreground">Board Report Narrative</h3>
              </div>
              {renderMarkdown(d.board_narrative)}
            </div>
          )}
        </>
      )}

      {/* Generate Report CTA */}
      {error && <InlineError message={error} onRetry={onGenerate} />}
      {isGenerating && <InlineStatus message="Generating intelligence report... This may take a few minutes as sub-agents analyze your workforce data." type="loading" />}

      <div className="flex justify-center pt-4">
        <Button onClick={onGenerate} disabled={isGenerating} size="lg" className="text-base px-8 py-6 glass-btn-primary border-0 rounded-xl">
          {isGenerating ? (
            <><FiLoader className="mr-2 h-5 w-5 animate-spin" /> Generating Report...</>
          ) : (
            <><FiTarget className="mr-2 h-5 w-5" /> Generate Intelligence Report</>
          )}
        </Button>
      </div>
    </div>
  )
}

// ===================== SECTION: ATTRITION =====================

function AttritionSection({ data, showSample, onNavigate }: { data: ReportData | null; showSample: boolean; onNavigate: (s: SectionKey) => void }) {
  const d = showSample ? SAMPLE_DATA : data

  if (!d?.detailed_attrition_analysis) {
    return <EmptyState message="No attrition data available" subMessage="Generate an Intelligence Report from the Dashboard to populate this view." onAction={() => onNavigate('dashboard')} actionLabel="Go to Dashboard" />
  }

  const highRiskRoles = [
    { role: 'Senior Engineer', dept: 'Engineering', risk: 32, band: 'Critical' },
    { role: 'Staff Engineer', dept: 'Engineering', risk: 28, band: 'Critical' },
    { role: 'Product Manager', dept: 'Product', risk: 22, band: 'High' },
    { role: 'Senior CSM', dept: 'Customer Success', risk: 20, band: 'High' },
    { role: 'ML Engineer', dept: 'Data Science', risk: 18, band: 'Medium' },
    { role: 'Data Engineer', dept: 'Data Science', risk: 16, band: 'Medium' },
    { role: 'DevOps Lead', dept: 'Engineering', risk: 15, band: 'Medium' },
    { role: 'UX Designer', dept: 'Design', risk: 12, band: 'Low' },
    { role: 'Sales Engineer', dept: 'Sales', risk: 11, band: 'Low' },
    { role: 'Marketing Manager', dept: 'Marketing', risk: 10, band: 'Low' },
  ]

  const deptRisk = [
    { dept: 'Engineering', critical: 85, high: 60, medium: 35, low: 15 },
    { dept: 'Product', critical: 45, high: 65, medium: 40, low: 20 },
    { dept: 'Customer Success', critical: 40, high: 55, medium: 45, low: 25 },
    { dept: 'Data Science', critical: 30, high: 45, medium: 50, low: 30 },
    { dept: 'Design', critical: 15, high: 25, medium: 40, low: 55 },
    { dept: 'Sales', critical: 20, high: 30, medium: 35, low: 50 },
    { dept: 'Marketing', critical: 10, high: 20, medium: 30, low: 60 },
    { dept: 'Finance', critical: 8, high: 15, medium: 25, low: 65 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <FiAlertTriangle className="h-6 w-6 text-orange-600" />
        <h2 className="font-serif text-2xl font-semibold tracking-wide">Attrition Risk Analysis</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* High-Risk Roles */}
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="font-serif text-lg font-semibold mb-4">Top 10 High-Risk Roles</h3>
          <ScrollArea className="h-80">
            <div className="space-y-2">
              {highRiskRoles.map((role, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl glass-card">
                  <div>
                    <p className="font-medium text-sm text-foreground">{role.role}</p>
                    <p className="text-xs text-muted-foreground">{role.dept}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-serif font-bold text-sm ${getScoreColor(100 - role.risk)}`}>{role.risk}%</span>
                    <Badge className={`${getRiskColor(role.band)} border text-xs glass-badge`}>{role.band}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Departmental Risk Heatmap */}
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="font-serif text-lg font-semibold mb-4">Departmental Risk Heatmap</h3>
          <div className="overflow-x-auto">
            <div className="grid grid-cols-5 gap-1.5 text-xs">
              <div className="font-medium text-muted-foreground p-2">Department</div>
              <div className="font-medium text-center text-red-600 p-2">Critical</div>
              <div className="font-medium text-center text-orange-600 p-2">High</div>
              <div className="font-medium text-center text-yellow-600 p-2">Medium</div>
              <div className="font-medium text-center text-green-600 p-2">Low</div>
              {deptRisk.map((row, i) => (
                <React.Fragment key={i}>
                  <div className="p-2 text-foreground font-medium truncate">{row.dept}</div>
                  <div className={`p-2 text-center rounded-lg glass-heatmap-cell ${getHeatmapColor(row.critical)} font-bold`}>{row.critical}</div>
                  <div className={`p-2 text-center rounded-lg glass-heatmap-cell ${getHeatmapColor(row.high)} font-bold`}>{row.high}</div>
                  <div className={`p-2 text-center rounded-lg glass-heatmap-cell ${getHeatmapColor(row.medium)} font-bold`}>{row.medium}</div>
                  <div className={`p-2 text-center rounded-lg glass-heatmap-cell ${getHeatmapColor(row.low)} font-bold`}>{row.low}</div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Revenue at Risk */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard label="Revenue at Risk" value="$18.7M" subtitle="From high-risk departures" icon={<FiTrendingDown className="h-5 w-5 text-red-500" />} />
        <MetricCard label="Replacement Cost" value="$8.2M" subtitle="For all high-risk roles" icon={<FiDollarSign className="h-5 w-5" />} />
        <MetricCard label="Productivity Loss" value="$5.4M" subtitle="During transition periods" icon={<FiActivity className="h-5 w-5" />} />
      </div>

      {/* Detailed Analysis */}
      <div className="glass-panel rounded-2xl p-6">
        <h3 className="font-serif text-lg font-semibold mb-4">Detailed Attrition Analysis</h3>
        {renderMarkdown(d.detailed_attrition_analysis)}
      </div>
    </div>
  )
}

// ===================== SECTION: WORKFORCE PLANNING =====================

function PlanningSection({
  data,
  showSample,
  onNavigate,
  scenarioResults,
  isSimulating,
  onRunSimulation,
  simError
}: {
  data: ReportData | null
  showSample: boolean
  onNavigate: (s: SectionKey) => void
  scenarioResults: ReportData | null
  isSimulating: boolean
  onRunSimulation: (params: { attritionChange: number; hiringFreeze: boolean; department: string; timeHorizon: number }) => void
  simError: string | null
}) {
  const d = showSample ? SAMPLE_DATA : data
  const [attritionChange, setAttritionChange] = useState(0)
  const [hiringFreeze, setHiringFreeze] = useState(false)
  const [department, setDepartment] = useState('all')
  const [timeHorizon, setTimeHorizon] = useState('12')

  if (!d?.detailed_planning_analysis) {
    return <EmptyState message="No workforce planning data available" subMessage="Generate an Intelligence Report from the Dashboard to populate this view." onAction={() => onNavigate('dashboard')} actionLabel="Go to Dashboard" />
  }

  const forecastData = [
    { period: '6 months', current: 2847, projected: 2912, net: '+65' },
    { period: '12 months', current: 2847, projected: 3045, net: '+198' },
    { period: '18 months', current: 2847, projected: 3180, net: '+333' },
  ]

  const skillDemand = [
    { skill: 'AI/ML Engineering', needed: 45, pipeline: 12, fill: 27 },
    { skill: 'Cloud Infrastructure', needed: 22, pipeline: 15, fill: 68 },
    { skill: 'Product Management', needed: 18, pipeline: 10, fill: 56 },
    { skill: 'Data Engineering', needed: 15, pipeline: 4, fill: 27 },
    { skill: 'Security Engineering', needed: 8, pipeline: 6, fill: 75 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <FiUsers className="h-6 w-6 text-primary" />
        <h2 className="font-serif text-2xl font-semibold tracking-wide">Workforce Planning</h2>
      </div>

      {/* Headcount Forecast */}
      <div className="glass-panel rounded-2xl p-6">
        <h3 className="font-serif text-lg font-semibold mb-4">Headcount Forecast</h3>
        <div className="grid grid-cols-3 gap-4">
          {forecastData.map((row, i) => (
            <div key={i} className="p-4 glass-card rounded-xl text-center">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-sans">{row.period}</p>
              <p className="text-2xl font-serif font-bold text-primary mt-2">{row.projected.toLocaleString()}</p>
              <div className="flex items-center justify-center gap-1 mt-1 text-sm">
                <FiArrowUp className="h-3 w-3 text-green-600" />
                <span className="text-green-700 font-medium">{row.net}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skill Demand */}
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="font-serif text-lg font-semibold mb-4">Skill Demand Projections</h3>
          <div className="space-y-3">
            {skillDemand.map((skill, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground font-medium">{skill.skill}</span>
                  <span className={`text-xs font-bold ${skill.fill >= 60 ? 'text-green-700' : skill.fill >= 40 ? 'text-yellow-700' : 'text-red-700'}`}>{skill.fill}% fill rate</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{skill.pipeline} in pipeline / {skill.needed} needed</span>
                </div>
                <Progress value={skill.fill} className="h-2" />
              </div>
            ))}
          </div>
        </div>

        {/* Pipeline Score */}
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="font-serif text-lg font-semibold mb-4">Hiring Pipeline Sufficiency</h3>
          <div className="flex flex-col items-center justify-center py-4">
            <ScoreCircle score={d?.hiring_pipeline_score} label="Pipeline Score" size="lg" />
            <div className="mt-4 grid grid-cols-2 gap-4 w-full text-center">
              <div className="p-3 bg-red-500/10 rounded-xl backdrop-blur-sm border border-red-300/20">
                <p className="text-xs text-red-700 font-sans uppercase tracking-wider">Critical Gaps</p>
                <p className="text-lg font-serif font-bold text-red-700 mt-1">AI/ML, Data Eng</p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-xl backdrop-blur-sm border border-green-300/20">
                <p className="text-xs text-green-700 font-sans uppercase tracking-wider">Strong Pipelines</p>
                <p className="text-lg font-serif font-bold text-green-700 mt-1">Security, Cloud</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scenario Simulator */}
      <div className="glass-panel-strong rounded-2xl p-6 border-2 border-primary/15">
        <div className="flex items-center gap-2 mb-1">
          <FiTarget className="h-5 w-5 text-accent" />
          <h3 className="font-serif text-lg font-semibold">Scenario Simulator</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-5">Adjust parameters to model workforce outcomes</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider">Attrition Rate Change %</Label>
            <Input type="number" min={-20} max={20} value={attritionChange} onChange={(e) => setAttritionChange(Number(e.target.value))} className="font-mono glass-input rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider">Hiring Freeze</Label>
            <div className="flex items-center gap-2 h-10">
              <Switch checked={hiringFreeze} onCheckedChange={setHiringFreeze} />
              <span className="text-sm text-muted-foreground">{hiringFreeze ? 'Active' : 'Inactive'}</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider">Department</Label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger className="glass-input rounded-xl"><SelectValue placeholder="Select department" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="engineering">Engineering</SelectItem>
                <SelectItem value="product">Product</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="customer-success">Customer Success</SelectItem>
                <SelectItem value="data-science">Data Science</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider">Time Horizon</Label>
            <Select value={timeHorizon} onValueChange={setTimeHorizon}>
              <SelectTrigger className="glass-input rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6 months</SelectItem>
                <SelectItem value="12">12 months</SelectItem>
                <SelectItem value="18">18 months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-4">
          <Button onClick={() => onRunSimulation({ attritionChange, hiringFreeze, department, timeHorizon: parseInt(timeHorizon) })} disabled={isSimulating} className="w-full md:w-auto glass-btn-primary border-0 rounded-xl">
            {isSimulating ? <><FiLoader className="mr-2 h-4 w-4 animate-spin" /> Running Simulation...</> : <><FiRefreshCw className="mr-2 h-4 w-4" /> Run Simulation</>}
          </Button>
        </div>

        {simError && <div className="mt-4"><InlineError message={simError} /></div>}

        {scenarioResults && (
          <div className="mt-6 p-4 glass-card rounded-xl">
            <h4 className="font-serif font-semibold text-sm mb-3">Simulation Results</h4>
            {renderMarkdown(typeof scenarioResults === 'object' ? (scenarioResults?.executive_summary ?? scenarioResults?.detailed_planning_analysis ?? 'Simulation complete. Review the updated metrics above.') : String(scenarioResults))}
          </div>
        )}
      </div>

      {/* Detailed Analysis */}
      <div className="glass-panel rounded-2xl p-6">
        <h3 className="font-serif text-lg font-semibold mb-4">Detailed Planning Analysis</h3>
        {renderMarkdown(d.detailed_planning_analysis)}
      </div>
    </div>
  )
}

// ===================== SECTION: COMPENSATION =====================

function CompensationSection({ data, showSample, onNavigate }: { data: ReportData | null; showSample: boolean; onNavigate: (s: SectionKey) => void }) {
  const d = showSample ? SAMPLE_DATA : data

  if (!d?.detailed_compensation_analysis) {
    return <EmptyState message="No compensation data available" subMessage="Generate an Intelligence Report from the Dashboard to populate this view." onAction={() => onNavigate('dashboard')} actionLabel="Go to Dashboard" />
  }

  const deptComp = [
    { dept: 'Engineering', percentile: 45, gap: -10, status: 'Below Market' },
    { dept: 'Product', percentile: 52, gap: -3, status: 'At Market' },
    { dept: 'Sales', percentile: 58, gap: 3, status: 'Above Market' },
    { dept: 'Marketing', percentile: 50, gap: 0, status: 'At Market' },
    { dept: 'Customer Success', percentile: 42, gap: -12, status: 'Below Market' },
    { dept: 'Data Science', percentile: 48, gap: -7, status: 'Below Market' },
    { dept: 'Design', percentile: 55, gap: 2, status: 'At Market' },
    { dept: 'Finance', percentile: 53, gap: 1, status: 'At Market' },
  ]

  const riskHeatmap = [
    { role: 'Senior Engineer', ic: 90, manager: 75, director: 50 },
    { role: 'Staff Engineer', ic: 85, manager: 70, director: 45 },
    { role: 'ML Engineer', ic: 80, manager: 65, director: 40 },
    { role: 'Product Manager', ic: 55, manager: 70, director: 45 },
    { role: 'Senior CSM', ic: 65, manager: 55, director: 35 },
    { role: 'Data Engineer', ic: 70, manager: 50, director: 30 },
    { role: 'Designer', ic: 40, manager: 45, director: 25 },
    { role: 'Marketing Mgr', ic: 35, manager: 40, director: 20 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <FiDollarSign className="h-6 w-6 text-accent" />
        <h2 className="font-serif text-2xl font-semibold tracking-wide">Compensation Benchmarking</h2>
      </div>

      {/* Pay Competitiveness Score */}
      <div className="glass-panel-strong rounded-2xl p-8 flex flex-col items-center">
        <ScoreCircle score={d?.pay_equity_score} label="Pay Competitiveness Score" size="lg" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compensation Risk Heatmap */}
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="font-serif text-lg font-semibold mb-4">Compensation Risk by Role & Level</h3>
          <div className="overflow-x-auto">
            <div className="grid grid-cols-4 gap-1.5 text-xs">
              <div className="font-medium text-muted-foreground p-2">Role</div>
              <div className="font-medium text-center text-muted-foreground p-2">IC Level</div>
              <div className="font-medium text-center text-muted-foreground p-2">Manager</div>
              <div className="font-medium text-center text-muted-foreground p-2">Director</div>
              {riskHeatmap.map((row, i) => (
                <React.Fragment key={i}>
                  <div className="p-2 text-foreground font-medium truncate">{row.role}</div>
                  <div className={`p-2 text-center rounded-lg glass-heatmap-cell ${getHeatmapColor(row.ic)} font-bold`}>{row.ic}</div>
                  <div className={`p-2 text-center rounded-lg glass-heatmap-cell ${getHeatmapColor(row.manager)} font-bold`}>{row.manager}</div>
                  <div className={`p-2 text-center rounded-lg glass-heatmap-cell ${getHeatmapColor(row.director)} font-bold`}>{row.director}</div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Equity Gap */}
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="font-serif text-lg font-semibold mb-4">Equity Gap Analysis</h3>
          <div className="space-y-4">
            {[
              { label: 'Gender Pay Gap', value: 6.2, target: 2 },
              { label: 'Ethnicity Pay Gap', value: 4.1, target: 2 },
              { label: 'Tenure-Adjusted Gap', value: 3.8, target: 2 },
              { label: 'Role-Level Adjusted Gap', value: 2.9, target: 2 },
            ].map((item, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground font-medium">{item.label}</span>
                  <span className={`font-bold ${item.value > item.target ? 'text-red-700' : 'text-green-700'}`}>{item.value}%</span>
                </div>
                <div className="relative h-3 glass-progress overflow-hidden">
                  <div className="absolute h-full bg-red-400/70 rounded-full transition-all duration-500" style={{ width: `${Math.min(item.value * 10, 100)}%` }} />
                  <div className="absolute h-full border-r-2 border-green-600" style={{ left: `${item.target * 10}%` }} />
                </div>
                <p className="text-xs text-muted-foreground">Target: &lt;{item.target}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cost to Correct */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard label="Engineering Corrections" value="$2.4M" icon={<FiArrowUp className="h-4 w-4 text-red-500" />} />
        <MetricCard label="Customer Success" value="$890K" icon={<FiArrowUp className="h-4 w-4 text-orange-500" />} />
        <MetricCard label="Data Science" value="$650K" icon={<FiArrowUp className="h-4 w-4 text-yellow-500" />} />
        <MetricCard label="Total Correction" value="$4.2M" subtitle="One-time investment" icon={<FiDollarSign className="h-4 w-4 text-primary" />} />
      </div>

      {/* Market Position Table */}
      <div className="glass-panel rounded-2xl p-6">
        <h3 className="font-serif text-lg font-semibold mb-4">Market Position by Department</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-2 px-3 font-sans text-xs uppercase tracking-wider text-muted-foreground">Department</th>
                <th className="text-center py-2 px-3 font-sans text-xs uppercase tracking-wider text-muted-foreground">Percentile</th>
                <th className="text-center py-2 px-3 font-sans text-xs uppercase tracking-wider text-muted-foreground">Gap</th>
                <th className="text-center py-2 px-3 font-sans text-xs uppercase tracking-wider text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {deptComp.map((row, i) => (
                <tr key={i} className="border-b border-white/10 hover:bg-white/10 transition-colors">
                  <td className="py-2 px-3 font-medium text-foreground">{row.dept}</td>
                  <td className="py-2 px-3 text-center">
                    <span className={`font-serif font-bold ${row.percentile >= 50 ? 'text-green-700' : 'text-red-700'}`}>{row.percentile}th</span>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span className={`font-mono ${row.gap >= 0 ? 'text-green-700' : 'text-red-700'}`}>{row.gap >= 0 ? '+' : ''}{row.gap}%</span>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <Badge className={`${row.gap < -5 ? 'bg-red-500/20 text-red-700 border-red-300' : row.gap >= 0 ? 'bg-green-500/20 text-green-700 border-green-300' : 'bg-yellow-500/20 text-yellow-700 border-yellow-300'} border text-xs glass-badge`}>
                      {row.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Analysis */}
      <div className="glass-panel rounded-2xl p-6">
        <h3 className="font-serif text-lg font-semibold mb-4">Detailed Compensation Analysis</h3>
        {renderMarkdown(d.detailed_compensation_analysis)}
      </div>
    </div>
  )
}

// ===================== SECTION: ORG HEALTH =====================

function OrgHealthSection({ data, showSample, onNavigate }: { data: ReportData | null; showSample: boolean; onNavigate: (s: SectionKey) => void }) {
  const d = showSample ? SAMPLE_DATA : data

  if (!d?.detailed_org_health_analysis) {
    return <EmptyState message="No organizational health data available" subMessage="Generate an Intelligence Report from the Dashboard to populate this view." onAction={() => onNavigate('dashboard')} actionLabel="Go to Dashboard" />
  }

  const burnoutData = [
    { dept: 'Product', score: 78, trend: 'Rising', flag: 'Critical' },
    { dept: 'Engineering', score: 72, trend: 'Stable', flag: 'High' },
    { dept: 'Customer Success', score: 69, trend: 'Rising', flag: 'High' },
    { dept: 'Sales', score: 55, trend: 'Stable', flag: 'Medium' },
    { dept: 'Design', score: 52, trend: 'Declining', flag: 'Medium' },
    { dept: 'Marketing', score: 48, trend: 'Declining', flag: 'Low' },
    { dept: 'HR', score: 45, trend: 'Stable', flag: 'Low' },
    { dept: 'Finance', score: 42, trend: 'Stable', flag: 'Low' },
  ]

  const engagementVsAttrition = [
    { range: 'Engagement < 60', attritionMultiplier: '2.4x', teams: 4, color: 'bg-red-500/20 text-red-700' },
    { range: 'Engagement 60-75', attritionMultiplier: '1.2x', teams: 8, color: 'bg-yellow-500/20 text-yellow-700' },
    { range: 'Engagement > 75', attritionMultiplier: '0.7x', teams: 12, color: 'bg-green-500/20 text-green-700' },
  ]

  const managerRisk = [
    { type: 'Top-performing managers', count: 23, detail: 'span < 8, engagement > 80', status: 'Healthy' },
    { type: 'At-risk managers', count: 12, detail: 'span > 12, engagement < 60', status: 'Critical' },
    { type: 'New managers needing support', count: 18, detail: '< 6 months in role', status: 'Monitor' },
  ]

  const interventions = [
    { title: 'Product team restructure', desc: 'Reduce manager span from 14 to 8' },
    { title: 'Engineering wellness program', desc: 'On-site counseling, flex Fridays' },
    { title: 'CS workload rebalancing', desc: 'Hire 6 additional CSMs' },
    { title: 'Manager coaching', desc: 'Quarterly 360 feedback + executive coaching' },
    { title: 'Pulse survey cadence', desc: 'Move from quarterly to monthly' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <FiHeart className="h-6 w-6 text-red-500" />
        <h2 className="font-serif text-2xl font-semibold tracking-wide">Organizational Health</h2>
      </div>

      {/* Org Health Score */}
      <div className="glass-panel-strong rounded-2xl p-8">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          <ScoreCircle score={d?.org_health_index} label="Org Health Index" size="lg" />
          <div className="space-y-3 text-center md:text-left">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Overall Engagement:</span>
              <span className="font-serif font-bold text-yellow-700">71/100</span>
              <FiTrendingDown className="h-4 w-4 text-red-500" />
              <span className="text-xs text-red-600">-4 from last quarter</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">eNPS:</span>
              <span className="font-serif font-bold text-foreground">+18</span>
              <span className="text-xs text-muted-foreground">(industry avg: +25)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Response Rate:</span>
              <span className="font-serif font-bold text-green-700">84%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Burnout Heatmap */}
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="font-serif text-lg font-semibold mb-4">Burnout Indicators by Department</h3>
          <div className="space-y-2">
            {burnoutData.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-xl glass-card">
                <div className="w-28 text-sm font-medium text-foreground truncate">{item.dept}</div>
                <div className="flex-1">
                  <div className="relative h-6 glass-progress overflow-hidden">
                    <div className={`absolute h-full rounded-full transition-all duration-700 ${item.score >= 70 ? 'bg-red-500/70' : item.score >= 50 ? 'bg-yellow-500/60' : 'bg-green-500/50'}`} style={{ width: `${item.score}%` }} />
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">{item.score}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 w-16 text-xs">
                  {item.trend === 'Rising' ? <FiTrendingUp className="h-3 w-3 text-red-500" /> : item.trend === 'Declining' ? <FiTrendingDown className="h-3 w-3 text-green-500" /> : <FiActivity className="h-3 w-3 text-yellow-500" />}
                  <span className="text-muted-foreground">{item.trend}</span>
                </div>
                <Badge className={`${getRiskColor(item.flag)} border text-xs glass-badge`}>{item.flag}</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Engagement vs Attrition */}
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="font-serif text-lg font-semibold mb-4">Engagement vs Attrition Correlation</h3>
          <div className="space-y-4">
            {engagementVsAttrition.map((item, i) => (
              <div key={i} className={`p-4 rounded-xl ${item.color} backdrop-blur-sm border border-white/15`}>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{item.range}</span>
                  <span className="font-serif font-bold text-lg">{item.attritionMultiplier}</span>
                </div>
                <p className="text-xs mt-1 opacity-80">{item.teams} teams in this range</p>
              </div>
            ))}

            <Separator className="my-4 bg-white/20" />

            <div>
              <h4 className="font-serif font-semibold text-sm mb-3">Manager Risk Ranking</h4>
              <div className="space-y-2">
                {managerRisk.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2 glass-card rounded-xl text-sm">
                    <div>
                      <p className="font-medium text-foreground">{item.type}</p>
                      <p className="text-xs text-muted-foreground">{item.detail}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-primary">{item.count}</span>
                      <Badge className={`${getRiskColor(item.status === 'Healthy' ? 'low' : item.status === 'Critical' ? 'critical' : 'medium')} border text-xs glass-badge`}>{item.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Interventions */}
      <div className="glass-panel rounded-2xl p-6">
        <h3 className="font-serif text-lg font-semibold mb-4">Recommended Interventions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {interventions.map((item, i) => (
            <div key={i} className="p-4 glass-card rounded-xl">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center text-xs font-bold text-primary flex-shrink-0 mt-0.5">{i + 1}</div>
                <div>
                  <p className="font-medium text-sm text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Analysis */}
      <div className="glass-panel rounded-2xl p-6">
        <h3 className="font-serif text-lg font-semibold mb-4">Detailed Org Health Analysis</h3>
        {renderMarkdown(d.detailed_org_health_analysis)}
      </div>
    </div>
  )
}

// ===================== SECTION: STRATEGIC QUERY =====================

function QuerySection({
  chatMessages,
  isQuerying,
  queryError,
  onSendMessage,
}: {
  chatMessages: ChatMessage[]
  isQuerying: boolean
  queryError: string | null
  onSendMessage: (msg: string) => void
}) {
  const [inputValue, setInputValue] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [chatMessages])

  const suggestedQueries = [
    "What's our biggest retention risk?",
    "Show Engineering headcount forecast",
    "Compare compensation equity across divisions",
    "What departments have the highest burnout risk?",
    "Calculate revenue at risk from top flight risks",
  ]

  const handleSend = () => {
    if (!inputValue.trim() || isQuerying) return
    onSendMessage(inputValue.trim())
    setInputValue('')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <FiMessageSquare className="h-6 w-6 text-primary" />
        <h2 className="font-serif text-2xl font-semibold tracking-wide">Strategic Query</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" style={{ minHeight: '500px' }}>
        {/* Suggested Queries */}
        <div className="lg:col-span-1 space-y-2">
          <p className="font-sans text-xs uppercase tracking-wider text-muted-foreground mb-3">Suggested Queries</p>
          {suggestedQueries.map((q, i) => (
            <button key={i} onClick={() => { setInputValue(q); onSendMessage(q) }} disabled={isQuerying} className="w-full text-left p-3 text-sm glass-card glass-card-interactive rounded-xl transition-all text-foreground disabled:opacity-50">
              {q}
            </button>
          ))}
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-3 flex flex-col">
          <div className="glass-panel rounded-2xl flex-1 flex flex-col">
            <div className="flex-1 p-4 flex flex-col">
              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-[300px]">
                {chatMessages.length === 0 && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-muted-foreground">
                      <FiMessageSquare className="h-12 w-12 mx-auto mb-4 opacity-30" />
                      <p className="font-serif text-lg">Ask anything about your workforce</p>
                      <p className="text-sm mt-2">Select a suggested query or type your own strategic question</p>
                    </div>
                  </div>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user' ? 'glass-chat-user text-primary-foreground' : 'glass-chat-assistant text-foreground'}`}>
                      {msg.role === 'assistant' ? renderMarkdown(msg.content) : <p className="text-sm">{msg.content}</p>}
                      <p className={`text-xs mt-2 ${msg.role === 'user' ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>{msg.timestamp}</p>
                    </div>
                  </div>
                ))}
                {isQuerying && (
                  <div className="flex justify-start">
                    <div className="glass-chat-assistant rounded-2xl p-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground glass-shimmer">
                        <FiLoader className="h-4 w-4 animate-spin" />
                        Analyzing workforce data...
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {queryError && <div className="mb-3"><InlineError message={queryError} /></div>}

              {/* Input */}
              <div className="flex gap-2">
                <Input value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Ask a strategic workforce question..." className="flex-1 glass-input rounded-xl" onKeyDown={(e) => { if (e.key === 'Enter') handleSend() }} disabled={isQuerying} />
                <Button onClick={handleSend} disabled={!inputValue.trim() || isQuerying} size="icon" className="glass-btn-primary border-0 rounded-xl">
                  <FiSend className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ===================== MAIN PAGE =====================

export default function Page() {
  const [activeSection, setActiveSection] = useState<SectionKey>('dashboard')
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [isQuerying, setIsQuerying] = useState(false)
  const [queryError, setQueryError] = useState<string | null>(null)
  const [scenarioResults, setScenarioResults] = useState<ReportData | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [simError, setSimError] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState<string | null>(null)
  const [showSample, setShowSample] = useState(false)
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const navItems: { key: SectionKey; label: string; icon: React.ReactNode }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: <FiGrid className="h-5 w-5" /> },
    { key: 'attrition', label: 'Attrition Risk', icon: <FiAlertTriangle className="h-5 w-5" /> },
    { key: 'planning', label: 'Workforce Planning', icon: <FiUsers className="h-5 w-5" /> },
    { key: 'compensation', label: 'Compensation', icon: <FiDollarSign className="h-5 w-5" /> },
    { key: 'orghealth', label: 'Org Health', icon: <FiHeart className="h-5 w-5" /> },
    { key: 'query', label: 'Strategic Query', icon: <FiMessageSquare className="h-5 w-5" /> },
  ]

  const handleGenerateReport = useCallback(async () => {
    setIsGenerating(true)
    setGenerateError(null)
    setActiveAgentId(MANAGER_AGENT_ID)
    try {
      const result = await callAIAgent(
        'Generate a comprehensive workforce intelligence report covering attrition risk analysis, workforce planning projections, compensation benchmarking, and organizational health assessment for our organization.',
        MANAGER_AGENT_ID
      )
      if (result.success) {
        const data = parseAgentResponse(result)
        if (data) {
          setReportData(data)
        } else {
          setGenerateError('Failed to parse agent response. Please try again.')
        }
      } else {
        setGenerateError(result.error ?? 'Failed to generate report. Please try again.')
      }
    } catch (err) {
      setGenerateError('An unexpected error occurred. Please try again.')
    } finally {
      setIsGenerating(false)
      setActiveAgentId(null)
    }
  }, [])

  const handleExportReport = useCallback(async () => {
    setIsExporting(true)
    setExportStatus('Generating board report...')
    setActiveAgentId(MANAGER_AGENT_ID)
    try {
      const result = await callAIAgent(
        'Generate a board-ready executive intelligence report with all strategic metrics, risk assessments, heatmap summaries, and actionable recommendations in PDF format.',
        MANAGER_AGENT_ID
      )
      if (result.success) {
        const files = result?.module_outputs?.artifact_files
        if (Array.isArray(files) && files.length > 0 && files[0]?.file_url) {
          window.open(files[0].file_url, '_blank')
          setExportStatus('Report downloaded successfully')
        } else {
          const data = parseAgentResponse(result)
          if (data) {
            setReportData(data)
            setExportStatus('Report generated (no PDF available - data updated)')
          } else {
            setExportStatus('Report generated but no PDF file available')
          }
        }
      } else {
        setExportStatus('Failed to generate report')
      }
    } catch {
      setExportStatus('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
      setActiveAgentId(null)
      setTimeout(() => setExportStatus(null), 5000)
    }
  }, [])

  const handleRunSimulation = useCallback(async (params: { attritionChange: number; hiringFreeze: boolean; department: string; timeHorizon: number }) => {
    setIsSimulating(true)
    setSimError(null)
    setActiveAgentId(MANAGER_AGENT_ID)
    try {
      const result = await callAIAgent(
        `Run a workforce planning scenario simulation with the following parameters: attrition rate change: ${params.attritionChange}%, hiring freeze: ${params.hiringFreeze}, department: ${params.department}, time horizon: ${params.timeHorizon} months. Provide headcount impact, cost projections, and delivery risk assessment.`,
        MANAGER_AGENT_ID
      )
      if (result.success) {
        const data = parseAgentResponse(result)
        if (data) {
          setScenarioResults(data)
        } else {
          setSimError('Failed to parse simulation results.')
        }
      } else {
        setSimError(result.error ?? 'Simulation failed. Please try again.')
      }
    } catch {
      setSimError('An unexpected error occurred during simulation.')
    } finally {
      setIsSimulating(false)
      setActiveAgentId(null)
    }
  }, [])

  const handleSendMessage = useCallback(async (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setChatMessages(prev => [...prev, { role: 'user', content: message, timestamp }])
    setIsQuerying(true)
    setQueryError(null)
    setActiveAgentId(MANAGER_AGENT_ID)
    try {
      const result = await callAIAgent(message, MANAGER_AGENT_ID)
      if (result.success) {
        const data = parseAgentResponse(result)
        let responseText = ''
        if (data && typeof data === 'object') {
          if (data.executive_summary) {
            responseText = data.executive_summary
          } else if (data.board_narrative) {
            responseText = data.board_narrative
          } else {
            const textFields = ['detailed_attrition_analysis', 'detailed_planning_analysis', 'detailed_compensation_analysis', 'detailed_org_health_analysis'] as const
            for (const field of textFields) {
              if (data[field]) {
                responseText = data[field] as string
                break
              }
            }
            if (!responseText) {
              responseText = JSON.stringify(data, null, 2)
            }
          }
        } else if (typeof data === 'string') {
          responseText = data
        } else {
          const rawText = result?.response?.result?.text ?? result?.response?.message ?? ''
          responseText = rawText || 'Analysis complete. The data has been processed.'
        }
        const rTimestamp = new Date().toLocaleTimeString()
        setChatMessages(prev => [...prev, { role: 'assistant', content: responseText, timestamp: rTimestamp }])
      } else {
        setQueryError(result.error ?? 'Failed to get response.')
      }
    } catch {
      setQueryError('An unexpected error occurred.')
    } finally {
      setIsQuerying(false)
      setActiveAgentId(null)
    }
  }, [])

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardSection data={reportData} isGenerating={isGenerating} error={generateError} onGenerate={handleGenerateReport} onNavigate={setActiveSection} showSample={showSample} />
      case 'attrition':
        return <AttritionSection data={reportData} showSample={showSample} onNavigate={setActiveSection} />
      case 'planning':
        return <PlanningSection data={reportData} showSample={showSample} onNavigate={setActiveSection} scenarioResults={scenarioResults} isSimulating={isSimulating} onRunSimulation={handleRunSimulation} simError={simError} />
      case 'compensation':
        return <CompensationSection data={reportData} showSample={showSample} onNavigate={setActiveSection} />
      case 'orghealth':
        return <OrgHealthSection data={reportData} showSample={showSample} onNavigate={setActiveSection} />
      case 'query':
        return <QuerySection chatMessages={chatMessages} isQuerying={isQuerying} queryError={queryError} onSendMessage={handleSendMessage} />
      default:
        return null
    }
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen glass-bg-animated text-foreground flex relative">
        {/* Floating Glass Orbs */}
        <div className="glass-orb glass-orb-1" />
        <div className="glass-orb glass-orb-2" />
        <div className="glass-orb glass-orb-3" />

        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-72' : 'w-0 overflow-hidden'} flex-shrink-0 glass-sidebar flex flex-col transition-all duration-300 z-10`}>
          {/* Logo / Brand */}
          <div className="p-6 border-b border-white/20">
            <h1 className="font-serif text-lg font-bold text-primary tracking-wide">CHRO Intelligence</h1>
            <p className="text-xs text-muted-foreground mt-1 font-sans">Workforce Analytics Platform</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <button key={item.key} onClick={() => setActiveSection(item.key)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-sans glass-nav-item ${activeSection === item.key ? 'glass-nav-active text-primary-foreground' : 'text-foreground/80 hover:text-foreground'}`}>
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Agent Info */}
          <div className="p-4 border-t border-white/20">
            <AgentInfoPanel activeAgentId={activeAgentId} />
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 z-10">
          {/* Header */}
          <header className="h-16 glass-header flex items-center justify-between px-6 flex-shrink-0">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-white/30 rounded-xl transition-all text-foreground backdrop-blur-sm">
                <FiGrid className="h-5 w-5" />
              </button>
              <div>
                <h2 className="font-serif text-xl font-semibold text-foreground tracking-wide">CHRO Intelligence Console</h2>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {exportStatus && (
                <span className="text-xs text-muted-foreground font-sans">{exportStatus}</span>
              )}
              <div className="flex items-center gap-2 glass-card rounded-xl px-3 py-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground cursor-pointer">Sample Data</Label>
                <Switch checked={showSample} onCheckedChange={setShowSample} />
              </div>
              <Button onClick={handleExportReport} disabled={isExporting} variant="outline" size="sm" className="flex items-center gap-2 glass-card rounded-xl border-white/30">
                {isExporting ? <FiLoader className="h-4 w-4 animate-spin" /> : <FiDownload className="h-4 w-4" />}
                <span className="hidden md:inline">Export Board Report</span>
              </Button>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 overflow-y-auto p-6">
            {renderSection()}
          </main>
        </div>
      </div>
    </ErrorBoundary>
  )
}
