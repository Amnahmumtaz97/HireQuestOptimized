'use client'

import { useMemo, useState } from 'react'
import { ArrowRight, Check, Layers3, Search, SlidersHorizontal } from 'lucide-react'
import { useReveal } from '@/hooks/use-reveal'
import { INTERVIEW_CATALOG_DEPARTMENTS } from '@/lib/interview-catalog/departments-data'
import { getIndustryIcon } from '@/lib/icon-mapping'
import { SectionBand, SectionHeading } from '@/components/landing/product/product-ui'

const STEPS = [
  ['01', 'Choose a department', 'Start with the team or discipline you are targeting.'],
  ['02', 'Pick a specialization', 'Focus the session on a role, framework, or technical area.'],
  ['03', 'Select topics', 'Generate questions from the exact skills you want to rehearse.'],
]

export function ProductCategories() {
  const ref = useReveal<HTMLDivElement>()
  const departments = INTERVIEW_CATALOG_DEPARTMENTS
  const [query, setQuery] = useState('')
  const [selectedKey, setSelectedKey] = useState(departments[0]?.key ?? '')

  const specializationCount = departments.reduce(
    (total, department) => total + (department.specializations?.length ?? 0),
    0,
  )
  const filteredDepartments = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return departments
    return departments.filter(
      (department) =>
        department.label.toLowerCase().includes(normalized) ||
        department.specializations?.some((specialization) =>
          specialization.label.toLowerCase().includes(normalized),
        ),
    )
  }, [departments, query])
  const selectedDepartment =
    departments.find((department) => department.key === selectedKey) ?? departments[0]
  const selectedSpecializations = selectedDepartment?.specializations ?? []

  return (
    <SectionBand id="categories">
      <div ref={ref} className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Interview catalog"
          title="Practice for the role you actually want"
          description="Choose a department, narrow it to a specialization, then build a session from the topics that matter for that interview."
        />

        <div className="reveal mt-10 grid overflow-hidden rounded-2xl border border-border/70 bg-card/80 sm:grid-cols-3">
          {[
            [departments.length, 'Departments'],
            [`${specializationCount}+`, 'Specializations'],
            [5, 'Interview modes'],
          ].map(([value, label], index) => (
            <div
              key={label}
              className={[
                'px-5 py-4',
                index < 2 ? 'border-b border-border/70 sm:border-b-0 sm:border-r' : '',
              ].join(' ')}
            >
              <div className="text-2xl font-extrabold tracking-tight text-foreground">{value}</div>
              <div className="mt-1 text-xs font-medium text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>

        <div className="reveal mt-6 grid gap-3 sm:grid-cols-3">
          {STEPS.map(([number, title, copy]) => (
            <div key={number} className="rounded-2xl border border-border/70 bg-card/60 p-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {number}
                </span>
                <div className="text-sm font-bold text-foreground">{title}</div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{copy}</p>
            </div>
          ))}
        </div>

        <div className="reveal mt-8 overflow-hidden rounded-3xl border border-border/70 bg-card/85 shadow-[0_24px_70px_-48px_rgba(37,99,235,0.45)] backdrop-blur-sm">
          <div className="flex flex-col gap-4 border-b border-border/70 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                <Layers3 className="h-4 w-4 text-primary" />
                Explore the catalog
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                This is the same structure used in the new interview wizard.
              </p>
            </div>
            <label className="flex h-10 w-full items-center gap-2 rounded-xl border border-border bg-background/80 px-3 sm:max-w-xs">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              <span className="sr-only">Search departments or specializations</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search roles or technologies"
                className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </label>
          </div>

          <div className="grid lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
            <div className="border-b border-border/70 p-4 sm:p-5 lg:border-b-0 lg:border-r">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Departments
                </span>
                <span className="text-[11px] text-muted-foreground">{filteredDepartments.length} shown</span>
              </div>
              {filteredDepartments.length ? (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  {filteredDepartments.map((department) => {
                    const Icon = getIndustryIcon(department.key).icon
                    const count = department.specializations?.length ?? 0
                    const selected = department.key === selectedDepartment?.key
                    return (
                      <button
                        key={department.key}
                        type="button"
                        onClick={() => setSelectedKey(department.key)}
                        className={[
                          'group flex min-w-0 items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors',
                          selected
                            ? 'border-primary/35 bg-primary/10'
                            : 'border-transparent bg-background/45 hover:border-border hover:bg-background/80',
                        ].join(' ')}
                      >
                        <span
                          className={[
                            'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                            selected ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary',
                          ].join(' ')}
                        >
                          <Icon className="h-4 w-4" strokeWidth={1.9} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-bold text-foreground">
                            {department.label}
                          </span>
                          <span className="mt-0.5 block text-[10px] text-muted-foreground">
                            {count} specialization{count === 1 ? '' : 's'}
                          </span>
                        </span>
                        <ArrowRight
                          className={[
                            'h-3.5 w-3.5 shrink-0 transition-transform',
                            selected
                              ? 'text-primary'
                              : '-translate-x-1 text-muted-foreground opacity-0 group-hover:translate-x-0 group-hover:opacity-100',
                          ].join(' ')}
                        />
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
                  No matching department or specialization.
                </div>
              )}
            </div>

            <div className="p-5 sm:p-6">
              {selectedDepartment ? (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                        Selected department
                      </div>
                      <h3 className="mt-2 text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
                        {selectedDepartment.label}
                      </h3>
                      <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
                        Choose specializations, then tune topics, difficulty, duration, and interview mode.
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                      <SlidersHorizontal className="h-3.5 w-3.5" />
                      Wizard ready
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {selectedSpecializations.slice(0, 6).map((specialization, index) => (
                      <div
                        key={specialization.key}
                        className="rounded-2xl border border-border/70 bg-background/55 p-4"
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Check className="h-3 w-3" strokeWidth={2.5} />
                          </span>
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-foreground">{specialization.label}</div>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {(specialization.technicalTopics ?? []).slice(0, 3).map((topic) => (
                                <span
                                  key={topic}
                                  className="rounded-full border border-border bg-card px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                                >
                                  {topic}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        {index === 0 ? (
                          <div className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-primary">
                            Popular starting point
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>

                  {selectedSpecializations.length > 6 ? (
                    <div className="mt-4 text-xs font-medium text-muted-foreground">
                      + {selectedSpecializations.length - 6} more specializations available in the wizard
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </SectionBand>
  )
}
