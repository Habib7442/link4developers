# Template System Testing Guide

This document outlines the testing scenarios for the Template System feature in Link4Coders.

## Overview

The Template System includes:
- 3 Free Templates: Developer Dark, Minimalist Light, GitHub Focus
- Template selection interface in dashboard
- Dynamic template rendering on public profiles
- Template preview functionality
- Database integration for saving user preferences

## Test Scenarios

### 1. Template Selection Interface

**Location**: `/dashboard/themes`

#### Test Cases:
- [ ] **Load Templates**: Verify all 3 free templates display correctly
- [ ] **Current Theme Display**: Check current theme is highlighted
- [ ] **Template Selection**: Click different templates to select them
- [ ] **Preview Functionality**: Click preview button opens new tab with correct template
- [ ] **Save Template**: Apply button saves the selected template
- [ ] **Loading States**: Verify loading indicators work properly
- [ ] **Error Handling**: Test with network errors

#### Expected Behavior:
- Templates display with preview cards
- Current template shows "Current" badge
- Selected template shows "Selected" state
- Preview opens in new tab with `?preview=template-id`
- Save button only appears when selection changes
- Success/error messages display appropriately

### 2. Template Rendering

**Location**: Public profile pages (`/[username]`)

#### Test Cases:
- [ ] **Developer Dark Template**: Default template renders correctly
- [ ] **Minimalist Light Template**: Light theme renders with proper colors
- [ ] **GitHub Focus Template**: GitHub-style layout displays correctly
- [ ] **Template Switching**: Changing template in dashboard updates public profile
- [ ] **Preview Mode**: URL with `?preview=template-id` overrides user's saved template
- [ ] **Invalid Template**: Invalid template IDs fallback to default
- [ ] **Missing Template**: Non-existent templates fallback gracefully

#### Expected Behavior:
- Each template has distinct visual design
- Colors, typography, and layout match template configuration
- All user data displays correctly in each template
- Links and interactions work in all templates
- Responsive design works on all screen sizes

### 3. Template Components

#### Developer Dark Template:
- [ ] **Colors**: Dark background (#18181a), cyan accents (#54E0FF)
- [ ] **Layout**: Centered header, card-style links
- [ ] **Typography**: Sharp Grotesk font, proper sizing
- [ ] **Glassmorphic**: Proper glassmorphic effects
- [ ] **Avatar**: Large avatar (120px) with gradient fallback
- [ ] **Links**: Card-style with hover effects

#### Minimalist Light Template:
- [ ] **Colors**: White background, blue accents (#2563eb)
- [ ] **Layout**: Centered header, button-style links
- [ ] **Typography**: Clean, readable fonts
- [ ] **Spacing**: Spacious layout with proper margins
- [ ] **Avatar**: Medium avatar (100px) with blue fallback
- [ ] **Links**: Button-style with subtle shadows

#### GitHub Focus Template:
- [ ] **Colors**: Dark GitHub colors (#0d1117, #238636)
- [ ] **Layout**: Left-aligned header, repository-style links
- [ ] **Typography**: GitHub-style fonts and sizing
- [ ] **Spacing**: Compact layout similar to GitHub
- [ ] **Avatar**: Medium avatar (80px) with green fallback
- [ ] **Links**: Repository-style with stats

### 4. Database Integration

#### Test Cases:
- [ ] **Save Template**: Template preference saves to database
- [ ] **Load Template**: User's saved template loads on page refresh
- [ ] **Default Template**: New users get default template (developer-dark)
- [ ] **Template Validation**: Invalid template IDs are rejected
- [ ] **Premium Access**: Premium templates require premium subscription
- [ ] **API Endpoints**: Template API endpoints work correctly

#### Expected Behavior:
- Template changes persist across sessions
- Database updates reflect immediately
- Proper error handling for invalid data
- Premium restrictions enforced correctly

### 5. Responsive Design

#### Test Cases:
- [ ] **Mobile (320px-768px)**: All templates work on mobile devices
- [ ] **Tablet (768px-1024px)**: Proper layout on tablets
- [ ] **Desktop (1024px+)**: Full desktop experience
- [ ] **Ultra-wide (1440px+)**: Content doesn't stretch too wide

#### Expected Behavior:
- Text remains readable at all sizes
- Images scale appropriately
- Navigation remains accessible
- No horizontal scrolling
- Touch targets are appropriately sized

### 6. Performance Testing

#### Test Cases:
- [ ] **Template Loading**: Templates load quickly
- [ ] **Template Switching**: Smooth transitions between templates
- [ ] **Image Optimization**: Avatar images load efficiently
- [ ] **Bundle Size**: Template components don't significantly increase bundle size
- [ ] **Memory Usage**: No memory leaks when switching templates

#### Expected Behavior:
- Fast initial load times
- Smooth user experience
- Efficient resource usage
- No performance degradation

### 7. Accessibility Testing

#### Test Cases:
- [ ] **Screen Readers**: All templates work with screen readers
- [ ] **Keyboard Navigation**: Full keyboard accessibility
- [ ] **Color Contrast**: Sufficient contrast in all templates
- [ ] **Focus Indicators**: Clear focus states
- [ ] **Alt Text**: Proper alt text for images

#### Expected Behavior:
- WCAG 2.1 AA compliance
- Semantic HTML structure
- Proper ARIA labels
- Accessible color schemes

### 8. Cross-Browser Testing

#### Test Cases:
- [ ] **Chrome**: Full functionality in Chrome
- [ ] **Firefox**: Full functionality in Firefox
- [ ] **Safari**: Full functionality in Safari
- [ ] **Edge**: Full functionality in Edge
- [ ] **Mobile Browsers**: iOS Safari, Chrome Mobile

#### Expected Behavior:
- Consistent appearance across browsers
- All features work in supported browsers
- Graceful degradation for older browsers

## Manual Testing Checklist

### Setup
- [ ] Create test user account
- [ ] Add sample links in different categories
- [ ] Set up profile information (name, bio, avatar, etc.)

### Template Selection
- [ ] Navigate to `/dashboard/themes`
- [ ] Verify current template is highlighted
- [ ] Select each template and verify selection state
- [ ] Click preview for each template
- [ ] Apply different templates and verify they save

### Public Profile Testing
- [ ] Visit public profile with each template
- [ ] Verify template renders correctly
- [ ] Test all interactive elements (links, share button)
- [ ] Test preview mode with URL parameters
- [ ] Verify responsive design on different screen sizes

### Edge Cases
- [ ] Test with empty profile (no links, no bio)
- [ ] Test with maximum content (many links, long bio)
- [ ] Test with special characters in content
- [ ] Test with very long usernames/titles
- [ ] Test with missing avatar

## Automated Testing

Consider implementing:
- Unit tests for template configuration
- Integration tests for template rendering
- E2E tests for template selection flow
- Visual regression tests for template appearance
- Performance tests for template loading

## Bug Reporting

When reporting bugs, include:
- Template being tested
- Browser and device information
- Steps to reproduce
- Expected vs actual behavior
- Screenshots or screen recordings
- Console errors (if any)

## Success Criteria

The Template System is considered successful when:
- All 3 templates render correctly
- Template selection works smoothly
- Database integration is reliable
- Performance is acceptable
- Accessibility standards are met
- Cross-browser compatibility is achieved
- User experience is intuitive and enjoyable
