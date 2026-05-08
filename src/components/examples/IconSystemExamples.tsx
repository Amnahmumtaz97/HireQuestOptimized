'use client'

/**
 * Example component demonstrating various usage patterns for the HireQuest Icon System
 * This file is for reference only and not used in the application
 */

import React, { useState } from 'react'
import { IconCard, IconGrid } from '@/components/ui/icon-card'
import { getIndustryIcon, getRoleIcon, INDUSTRY_ICONS, ROLE_ICONS } from '@/lib/icon-mapping'

/**
 * Example 1: Basic Industry Selection
 */
export function IndustrySelectionExample() {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Select an Industry</h2>
      <IconGrid columns={3} gap="md">
        {Object.entries(INDUSTRY_ICONS).map(([key, config]) => (
          <IconCard
            key={key}
            icon={config}
            title={config.label}
            subtitle="Choose this industry"
            selected={selected === key}
            onClick={() => setSelected(key)}
            size="md"
          />
        ))}
      </IconGrid>
    </div>
  )
}

/**
 * Example 2: Role Category Selection with Icons
 */
export function RoleCategorySelectionExample() {
  const [selected, setSelected] = useState<string | null>(null)

  const roleCategories = [
    { key: 'engineering', label: 'Engineering', details: '5 technical topics' },
    { key: 'analytics', label: 'Analytics', details: '4 technical topics' },
    { key: 'android', label: 'Android', details: '6 technical topics' },
    { key: 'dsa_interview', label: 'DSA / Algorithms', details: '8 technical topics' },
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Select a Role Category</h2>
      <IconGrid columns={2} gap="lg">
        {roleCategories.map((role) => (
          <IconCard
            key={role.key}
            icon={getRoleIcon(role.key)}
            title={role.label}
            subtitle={role.details}
            selected={selected === role.key}
            onClick={() => setSelected(role.key)}
            size="lg"
          />
        ))}
      </IconGrid>
    </div>
  )
}

/**
 * Example 3: Disabled State Example
 */
export function DisabledStateExample() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Disabled and Custom States</h2>
      <IconGrid columns={2} gap="md">
        <IconCard
          icon={getIndustryIcon('software_it')}
          title="Active State"
          subtitle="This is clickable"
          selected={false}
          onClick={() => alert('Clicked!')}
        />
        <IconCard
          icon={getIndustryIcon('data_ai')}
          title="Disabled State"
          subtitle="This is not clickable"
          disabled={true}
          onClick={() => {}}
        />
      </IconGrid>
    </div>
  )
}

/**
 * Example 4: Size Variations
 */
export function SizeVariationsExample() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Icon Card Size Variations</h2>

      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">Extra Small (xs)</p>
        <div className="flex gap-2">
          {Object.entries(INDUSTRY_ICONS).slice(0, 2).map(([key, config]) => (
            <IconCard
              key={key}
              icon={config}
              title={config.label}
              size="xs"
              showIcon={true}
            />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">Small (sm)</p>
        <IconGrid columns={3} gap="sm">
          {Object.entries(INDUSTRY_ICONS).slice(0, 3).map(([key, config]) => (
            <IconCard
              key={key}
              icon={config}
              title={config.label}
              size="sm"
            />
          ))}
        </IconGrid>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">Medium (md) - Default</p>
        <IconGrid columns={3} gap="md">
          {Object.entries(INDUSTRY_ICONS).slice(0, 3).map(([key, config]) => (
            <IconCard
              key={key}
              icon={config}
              title={config.label}
              size="md"
            />
          ))}
        </IconGrid>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">Large (lg)</p>
        <IconGrid columns={2} gap="lg">
          {Object.entries(INDUSTRY_ICONS).slice(0, 2).map(([key, config]) => (
            <IconCard
              key={key}
              icon={config}
              title={config.label}
              subtitle="Large icon card"
              size="lg"
            />
          ))}
        </IconGrid>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">Extra Large (xl)</p>
        <IconGrid columns={1} gap="lg">
          <IconCard
            icon={getIndustryIcon('software_it')}
            title="Software / IT"
            subtitle="Extra large icon card for prominent display"
            size="xl"
          />
        </IconGrid>
      </div>
    </div>
  )
}

/**
 * Example 5: Grid Variations
 */
export function GridVariationsExample() {
  const industries = Object.entries(INDUSTRY_ICONS).slice(0, 6)

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Grid Layout Variations</h2>

      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">1 Column</p>
        <IconGrid columns={1} gap="md">
          {industries.slice(0, 2).map(([key, config]) => (
            <IconCard key={key} icon={config} title={config.label} />
          ))}
        </IconGrid>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">2 Columns</p>
        <IconGrid columns={2} gap="md">
          {industries.slice(0, 4).map(([key, config]) => (
            <IconCard key={key} icon={config} title={config.label} />
          ))}
        </IconGrid>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">3 Columns (Default)</p>
        <IconGrid columns={3} gap="md">
          {industries.map(([key, config]) => (
            <IconCard key={key} icon={config} title={config.label} />
          ))}
        </IconGrid>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">4 Columns</p>
        <IconGrid columns={4} gap="md">
          {industries.map(([key, config]) => (
            <IconCard key={key} icon={config} title={config.label} />
          ))}
        </IconGrid>
      </div>
    </div>
  )
}

/**
 * Example 6: Custom Children Content
 */
export function CustomChildrenExample() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Custom Content Inside Cards</h2>
      <IconGrid columns={2} gap="md">
        <IconCard
          icon={getIndustryIcon('software_it')}
          title="Software / IT"
          subtitle="Choose this industry"
        >
          <div className="flex gap-2">
            <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
              Popular
            </span>
            <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
              Trending
            </span>
          </div>
        </IconCard>

        <IconCard
          icon={getIndustryIcon('data_ai')}
          title="Data / AI"
          subtitle="Emerging field"
        >
          <div className="mt-2 text-xs text-muted-foreground">
            Latest industry trends: ML, Deep Learning, NLP
          </div>
        </IconCard>
      </IconGrid>
    </div>
  )
}

/**
 * Example 7: Dark Mode Support
 */
export function DarkModeSupportExample() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Dark Mode Support</h2>
      <p className="text-sm text-muted-foreground">
        This component automatically adapts to dark/light mode. Try switching themes!
      </p>
      <IconGrid columns={3} gap="md">
        {Object.entries(INDUSTRY_ICONS).slice(0, 6).map(([key, config]) => (
          <IconCard
            key={key}
            icon={config}
            title={config.label}
            subtitle="Theme aware styling"
            selected={false}
          />
        ))}
      </IconGrid>
    </div>
  )
}

/**
 * Main Examples Component
 * Shows all example implementations
 */
export function IconSystemExamples() {
  const [activeExample, setActiveExample] = useState<number>(1)

  const examples = [
    { id: 1, label: 'Industry Selection', Component: IndustrySelectionExample },
    { id: 2, label: 'Role Categories', Component: RoleCategorySelectionExample },
    { id: 3, label: 'Disabled States', Component: DisabledStateExample },
    { id: 4, label: 'Size Variations', Component: SizeVariationsExample },
    { id: 5, label: 'Grid Layouts', Component: GridVariationsExample },
    { id: 6, label: 'Custom Content', Component: CustomChildrenExample },
    { id: 7, label: 'Dark Mode', Component: DarkModeSupportExample },
  ]

  const ActiveComponent = examples.find((ex) => ex.id === activeExample)?.Component

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">HireQuest Icon System Examples</h1>
        <div className="flex flex-wrap gap-2">
          {examples.map((example) => (
            <button
              key={example.id}
              onClick={() => setActiveExample(example.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeExample === example.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-input/30 text-foreground hover:bg-input/50'
              }`}
            >
              {example.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-input/10 p-6">
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  )
}
