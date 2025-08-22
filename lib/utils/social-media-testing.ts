// Social Media Testing Utilities for Link4Coders
// Tools for testing and validating social media implementation

import { SocialMediaValidator } from '@/lib/validation/social-media-validation'
import { 
  SOCIAL_PLATFORMS, 
  detectPlatformFromUrl, 
  getSVGIcon, 
  isValidIconUrl 
} from '@/lib/config/social-icons'

export interface SocialMediaTestResult {
  testName: string
  passed: boolean
  details: string
  timestamp: string
  data?: any
}

export class SocialMediaTestingService {
  
  /**
   * Test social media URL validation
   */
  static testUrlValidation(): SocialMediaTestResult[] {
    const results: SocialMediaTestResult[] = []
    
    // Test valid URLs
    const validUrls = [
      'https://twitter.com/username',
      'https://linkedin.com/in/username',
      'https://instagram.com/username',
      'https://github.com/username',
      'https://discord.com/users/123456789',
      'https://youtube.com/@username'
    ]
    
    validUrls.forEach(url => {
      const validation = SocialMediaValidator.validateUrl(url)
      results.push({
        testName: `Valid URL: ${url}`,
        passed: validation.isValid,
        details: validation.isValid 
          ? `✓ URL validated successfully. Platform: ${validation.detectedPlatform || 'unknown'}`
          : `✗ Validation failed: ${validation.errors.join(', ')}`,
        timestamp: new Date().toISOString(),
        data: validation
      })
    })
    
    // Test invalid URLs
    const invalidUrls = [
      'http://twitter.com/username', // HTTP instead of HTTPS
      'not-a-url',
      '',
      'https://malicious-site.com'
    ]
    
    invalidUrls.forEach(url => {
      const validation = SocialMediaValidator.validateUrl(url)
      results.push({
        testName: `Invalid URL: ${url || 'empty'}`,
        passed: !validation.isValid, // Should fail
        details: !validation.isValid 
          ? `✓ Correctly rejected invalid URL: ${validation.errors.join(', ')}`
          : `✗ Should have rejected invalid URL`,
        timestamp: new Date().toISOString(),
        data: validation
      })
    })
    
    return results
  }
  
  /**
   * Test platform detection
   */
  static testPlatformDetection(): SocialMediaTestResult[] {
    const results: SocialMediaTestResult[] = []
    
    const testCases = [
      { url: 'https://twitter.com/username', expected: 'twitter' },
      { url: 'https://x.com/username', expected: 'twitter' },
      { url: 'https://linkedin.com/in/username', expected: 'linkedin' },
      { url: 'https://instagram.com/username', expected: 'instagram' },
      { url: 'https://github.com/username', expected: 'github' },
      { url: 'https://discord.com/users/123', expected: 'discord' },
      { url: 'https://youtube.com/@username', expected: 'youtube' },
      { url: 'https://unknown-platform.com/user', expected: null }
    ]
    
    testCases.forEach(({ url, expected }) => {
      const detected = detectPlatformFromUrl(url)
      const passed = detected === expected
      
      results.push({
        testName: `Platform Detection: ${url}`,
        passed,
        details: passed 
          ? `✓ Correctly detected platform: ${detected || 'none'}`
          : `✗ Expected ${expected}, got ${detected}`,
        timestamp: new Date().toISOString(),
        data: { url, expected, detected }
      })
    })
    
    return results
  }
  
  /**
   * Test icon validation
   */
  static testIconValidation(): SocialMediaTestResult[] {
    const results: SocialMediaTestResult[] = []
    
    // Test valid icon URLs
    const validIconUrls = [
      'https://example.com/icon.png',
      'https://example.com/icon.jpg',
      'https://example.com/icon.svg',
      'https://example.com/icon.webp'
    ]
    
    validIconUrls.forEach(url => {
      const isValid = isValidIconUrl(url)
      results.push({
        testName: `Valid Icon URL: ${url}`,
        passed: isValid,
        details: isValid 
          ? `✓ Icon URL format is valid`
          : `✗ Icon URL format should be valid`,
        timestamp: new Date().toISOString(),
        data: { url, isValid }
      })
    })
    
    // Test invalid icon URLs
    const invalidIconUrls = [
      'https://example.com/file.txt',
      'https://example.com/file.pdf',
      'not-a-url',
      ''
    ]
    
    invalidIconUrls.forEach(url => {
      const isValid = isValidIconUrl(url)
      results.push({
        testName: `Invalid Icon URL: ${url || 'empty'}`,
        passed: !isValid, // Should be invalid
        details: !isValid 
          ? `✓ Correctly rejected invalid icon URL`
          : `✗ Should have rejected invalid icon URL`,
        timestamp: new Date().toISOString(),
        data: { url, isValid }
      })
    })
    
    return results
  }
  
  /**
   * Test SVG icon generation
   */
  static testSVGIconGeneration(): SocialMediaTestResult[] {
    const results: SocialMediaTestResult[] = []
    
    Object.entries(SOCIAL_PLATFORMS).forEach(([platform, config]) => {
      config.iconVariants.forEach(variant => {
        const svg = getSVGIcon(platform, variant)
        const passed = svg.length > 0 && svg.includes('<svg')
        
        results.push({
          testName: `SVG Icon: ${platform} - ${variant}`,
          passed,
          details: passed 
            ? `✓ SVG icon generated successfully (${svg.length} chars)`
            : `✗ Failed to generate SVG icon`,
          timestamp: new Date().toISOString(),
          data: { platform, variant, svgLength: svg.length }
        })
      })
    })
    
    return results
  }
  
  /**
   * Test complete social media link validation
   */
  static testCompleteValidation(): SocialMediaTestResult[] {
    const results: SocialMediaTestResult[] = []
    
    const testCases = [
      {
        name: 'Valid Twitter Link with Platform Icon',
        data: {
          url: 'https://twitter.com/username',
          title: 'Twitter',
          category: 'social' as const,
          use_custom_icon: false,
          icon_variant: 'twitter1'
        },
        shouldPass: true
      },
      {
        name: 'Valid Instagram Link with Custom Icon',
        data: {
          url: 'https://instagram.com/username',
          title: 'Instagram',
          category: 'social' as const,
          use_custom_icon: true,
          custom_icon_url: 'https://example.com/custom-icon.png'
        },
        shouldPass: true
      },
      {
        name: 'Invalid Link - Missing URL',
        data: {
          url: '',
          title: 'Social Media',
          category: 'social' as const
        },
        shouldPass: false
      },
      {
        name: 'Invalid Link - Custom Icon without URL',
        data: {
          url: 'https://twitter.com/username',
          title: 'Twitter',
          category: 'social' as const,
          use_custom_icon: true,
          custom_icon_url: ''
        },
        shouldPass: false
      }
    ]
    
    testCases.forEach(({ name, data, shouldPass }) => {
      const validation = SocialMediaValidator.validateSocialMediaLink(data)
      const passed = validation.isValid === shouldPass
      
      results.push({
        testName: name,
        passed,
        details: passed 
          ? `✓ Validation result as expected (${shouldPass ? 'valid' : 'invalid'})`
          : `✗ Expected ${shouldPass ? 'valid' : 'invalid'}, got ${validation.isValid ? 'valid' : 'invalid'}. Errors: ${validation.errors.join(', ')}`,
        timestamp: new Date().toISOString(),
        data: { input: data, validation }
      })
    })
    
    return results
  }
  
  /**
   * Run all social media tests
   */
  static async runAllTests(): Promise<{
    urlValidation: SocialMediaTestResult[]
    platformDetection: SocialMediaTestResult[]
    iconValidation: SocialMediaTestResult[]
    svgGeneration: SocialMediaTestResult[]
    completeValidation: SocialMediaTestResult[]
    summary: {
      totalTests: number
      passed: number
      failed: number
    }
  }> {
    console.log('🧪 Starting social media testing...')
    
    const urlValidation = this.testUrlValidation()
    const platformDetection = this.testPlatformDetection()
    const iconValidation = this.testIconValidation()
    const svgGeneration = this.testSVGIconGeneration()
    const completeValidation = this.testCompleteValidation()
    
    const allResults = [
      ...urlValidation,
      ...platformDetection,
      ...iconValidation,
      ...svgGeneration,
      ...completeValidation
    ]
    
    const passed = allResults.filter(r => r.passed).length
    const failed = allResults.length - passed
    
    const summary = {
      totalTests: allResults.length,
      passed,
      failed
    }
    
    console.log('✅ Social media testing completed:', summary)
    
    return {
      urlValidation,
      platformDetection,
      iconValidation,
      svgGeneration,
      completeValidation,
      summary
    }
  }
  
  /**
   * Generate test report
   */
  static generateTestReport(results: any): string {
    const { summary, urlValidation, platformDetection, iconValidation, svgGeneration, completeValidation } = results
    
    let report = `# Social Media Implementation Test Report\n\n`
    report += `**Generated:** ${new Date().toISOString()}\n\n`
    report += `## Summary\n`
    report += `- **Total Tests:** ${summary.totalTests}\n`
    report += `- **Passed:** ${summary.passed}\n`
    report += `- **Failed:** ${summary.failed}\n`
    report += `- **Success Rate:** ${((summary.passed / summary.totalTests) * 100).toFixed(1)}%\n\n`
    
    const sections = [
      { name: 'URL Validation', results: urlValidation },
      { name: 'Platform Detection', results: platformDetection },
      { name: 'Icon Validation', results: iconValidation },
      { name: 'SVG Generation', results: svgGeneration },
      { name: 'Complete Validation', results: completeValidation }
    ]
    
    sections.forEach(({ name, results }) => {
      const sectionPassed = results.filter((r: any) => r.passed).length
      const sectionTotal = results.length
      
      report += `## ${name}\n`
      report += `**Results:** ${sectionPassed}/${sectionTotal} passed\n\n`
      
      results.forEach((result: any) => {
        const icon = result.passed ? '✅' : '❌'
        report += `${icon} **${result.testName}**\n`
        report += `   ${result.details}\n\n`
      })
    })
    
    return report
  }
}
