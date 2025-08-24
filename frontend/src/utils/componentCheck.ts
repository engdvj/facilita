// Component Health Check
// Validates all components and their dependencies

export interface ComponentIssue {
  component: string;
  issue: string;
  severity: 'error' | 'warning' | 'info';
  fix?: string;
}

export function checkComponents(): ComponentIssue[] {
  const issues: ComponentIssue[] = [];

  // Check for missing CSS classes
  const elementsWithClasses = document.querySelectorAll('[class*="glass-"], [class*="animate-in"], [class*="stagger-"]');
  
  elementsWithClasses.forEach((element) => {
    const classList = Array.from(element.classList);
    
    classList.forEach((className) => {
      if (className.startsWith('glass-') && !['glass', 'glass-hover', 'glass-strong'].includes(className)) {
        // Check if class exists in stylesheets
        const hasClass = Array.from(document.styleSheets)
          .some(sheet => {
            try {
              return Array.from(sheet.cssRules || [])
                .some(rule => rule.cssText?.includes(className));
            } catch {
              return false;
            }
          });
        
        if (!hasClass) {
          issues.push({
            component: element.tagName.toLowerCase(),
            issue: `Missing CSS class: ${className}`,
            severity: 'error',
            fix: `Add ${className} definition to CSS or replace with standard classes`
          });
        }
      }
      
      if (className.startsWith('animate-in')) {
        issues.push({
          component: element.tagName.toLowerCase(),
          issue: `Deprecated animation class: ${className}`,
          severity: 'warning',
          fix: `Replace with animate-${className.replace('animate-in ', '').replace('animate-', '')}`
        });
      }
      
      if (className.startsWith('stagger-')) {
        issues.push({
          component: element.tagName.toLowerCase(),
          issue: `Deprecated stagger class: ${className}`,
          severity: 'warning',
          fix: `Replace with inline style: style={{ animationDelay: 'Xms' }}`
        });
      }
    });
  });

  // Check for missing animations in Tailwind config
  const animationClasses = [
    'animate-fade-in',
    'animate-slide-up',
    'animate-slide-down', 
    'animate-slide-left',
    'animate-slide-right',
    'animate-scale-in',
    'animate-float'
  ];
  
  animationClasses.forEach((animClass) => {
    const elements = document.querySelectorAll(`.${animClass}`);
    if (elements.length > 0) {
      // Check if animation is defined
      const testEl = document.createElement('div');
      testEl.className = animClass;
      document.body.appendChild(testEl);
      const computedStyle = getComputedStyle(testEl);
      const hasAnimation = computedStyle.animationName !== 'none';
      document.body.removeChild(testEl);
      
      if (!hasAnimation) {
        issues.push({
          component: 'animation',
          issue: `Animation not working: ${animClass}`,
          severity: 'error',
          fix: `Check Tailwind config and CSS keyframes for ${animClass}`
        });
      }
    }
  });

  return issues;
}

export function validateComponentProps() {
  const issues: ComponentIssue[] = [];
  
  // Check for common prop issues
  const buttons = document.querySelectorAll('button');
  buttons.forEach((button, index) => {
    if (!button.hasAttribute('aria-label') && !button.textContent?.trim()) {
      issues.push({
        component: `button-${index}`,
        issue: 'Button missing aria-label or text content',
        severity: 'warning',
        fix: 'Add aria-label attribute or text content for accessibility'
      });
    }
  });
  
  const inputs = document.querySelectorAll('input');
  inputs.forEach((input, index) => {
    if (input.type !== 'hidden' && !input.hasAttribute('aria-label') && !input.getAttribute('placeholder')) {
      issues.push({
        component: `input-${index}`,
        issue: 'Input missing label or placeholder',
        severity: 'warning',
        fix: 'Add aria-label or placeholder for accessibility'
      });
    }
  });
  
  return issues;
}

export function checkPerformance(): ComponentIssue[] {
  const issues: ComponentIssue[] = [];
  
  // Check for too many DOM elements
  const totalElements = document.querySelectorAll('*').length;
  if (totalElements > 1500) {
    issues.push({
      component: 'dom',
      issue: `High DOM element count: ${totalElements}`,
      severity: 'warning',
      fix: 'Consider implementing virtualization for large lists'
    });
  }
  
  // Check for animations on too many elements
  const animatedElements = document.querySelectorAll('[class*="animate-"]').length;
  if (animatedElements > 50) {
    issues.push({
      component: 'animations',
      issue: `Too many animated elements: ${animatedElements}`,
      severity: 'warning',
      fix: 'Reduce animations or use CSS transitions instead'
    });
  }
  
  return issues;
}

export function runFullCheck(): ComponentIssue[] {
  return [
    ...checkComponents(),
    ...validateComponentProps(),
    ...checkPerformance()
  ];
}

// Auto-run in development
if (process.env.NODE_ENV === 'development') {
  setTimeout(() => {
    const issues = runFullCheck();
    if (issues.length > 0) {
      console.group('🔍 Component Health Check');
      issues.forEach(issue => {
        const emoji = issue.severity === 'error' ? '❌' : issue.severity === 'warning' ? '⚠️' : 'ℹ️';
        console.log(`${emoji} ${issue.component}: ${issue.issue}`);
        if (issue.fix) {
          console.log(`   💡 Fix: ${issue.fix}`);
        }
      });
      console.groupEnd();
    } else {
      console.log('✅ All components healthy!');
    }
  }, 2000);
}