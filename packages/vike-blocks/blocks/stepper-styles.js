// Shared, framework-agnostic logic + styling for the `stepper` block, imported by BOTH renderers so the
// twins can't drift. Owns the one pure model bit (a step's state relative to the current step) and the
// theme-native styles for the progress header, connectors, and nav buttons.

// A step's state relative to the active step: passed steps are 'complete' (checkmark), the active one is
// 'current', later ones are 'upcoming'. Pure — unit-tested, drives the indicator color + glyph.
export function stepState(index, current) {
  if (index < current) return 'complete'
  if (index === current) return 'current'
  return 'upcoming'
}

export const stepperRootStyle = () => ({ font: 'inherit', color: 'var(--color-text, #0f172a)' })

// The header row: each step is an equal-width column (indicator + label), connectors drawn between.
export const stepperHeaderStyle = () => ({ display: 'flex', alignItems: 'flex-start', gap: 0 })

export const stepperItemStyle = () => ({ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 0, gap: '0.4rem' })

// The numbered/checked circle. Complete + current use the primary accent; upcoming is a muted ring.
export function stepperDotStyle(state) {
  const active = state === 'complete' || state === 'current'
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '1.9rem',
    height: '1.9rem',
    flexShrink: 0,
    borderRadius: '999px',
    border: `2px solid ${active ? 'var(--color-primary, #6366f1)' : 'var(--color-border, #cbd5e1)'}`,
    background: state === 'current' ? 'var(--color-primary, #6366f1)' : state === 'complete' ? 'var(--color-primary-soft, rgba(99,102,241,0.14))' : 'transparent',
    color: state === 'current' ? 'var(--color-primary-contrast, #ffffff)' : active ? 'var(--color-primary, #6366f1)' : 'var(--color-muted, #94a3b8)',
    fontSize: '13px',
    fontWeight: 600,
    transition: 'background 0.2s ease, border-color 0.2s ease, color 0.2s ease',
  }
}

// The connector bar between two indicators — filled once the step to its LEFT is complete.
export function stepperConnectorStyle(filled) {
  return {
    flex: 1,
    height: '2px',
    marginTop: 'calc(0.95rem - 1px)', // center on the 1.9rem dot
    background: filled ? 'var(--color-primary, #6366f1)' : 'var(--color-border, #e2e8f0)',
    transition: 'background 0.2s ease',
  }
}

export function stepperLabelStyle(state) {
  return {
    fontSize: '13px',
    fontWeight: state === 'current' ? 600 : 500,
    textAlign: 'center',
    color: state === 'upcoming' ? 'var(--color-muted, #94a3b8)' : 'var(--color-text, #334155)',
  }
}

export const stepperDescriptionStyle = () => ({ fontSize: '12px', textAlign: 'center', color: 'var(--color-muted, #94a3b8)' })

// A nav button (Back / Next). The primary Next is filled; Back is a bordered ghost. A disabled button
// is dimmed and inert.
export function stepperButtonStyle(primary, disabled) {
  return {
    padding: '0.5rem 1.1rem',
    borderRadius: 'var(--radius, 8px)',
    border: primary ? '1px solid var(--color-primary, #6366f1)' : '1px solid var(--color-border, #e2e8f0)',
    background: primary ? 'var(--color-primary, #6366f1)' : 'transparent',
    color: primary ? 'var(--color-primary-contrast, #ffffff)' : 'var(--color-text, #334155)',
    font: 'inherit',
    fontSize: '14px',
    fontWeight: 500,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
  }
}

// Static <style> for the header-button hover/focus + the panel fade-in keyframe, on shared classes so
// both twins share one rule. Attribute selectors stay UNQUOTED (Vue escapes quotes inside <style>).
export const STEPPER_STYLE_TAG =
  '@keyframes vike-blocks-step-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}' +
  '.vike-blocks-step-head:not([disabled]){cursor:pointer}' +
  '.vike-blocks-step-head:not([disabled]):hover [data-dot=upcoming]{border-color:var(--color-primary,#6366f1)}' +
  '.vike-blocks-step-head:focus-visible{outline:2px solid var(--color-primary,#6366f1);outline-offset:2px;border-radius:var(--radius,8px)}' +
  '@media (prefers-reduced-motion: reduce){.vike-blocks-step-panel{animation:none}}'
