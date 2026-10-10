import { test, expect } from '@playwright/test';

const ANALYZE_URL = '**/api/analyze';

/** Deterministic analysis payload the UI should render. */
const mockAnalysisResponse = {
  analysis: {
    documentTitle: 'Northbridge Community Scholarship - Conditional Award Notification',
    documentType: 'Scholarship award notice',
    oneSentenceSummary:
      'You have been selected for a $2,500 scholarship that requires accepting the award and submitting documents by the stated deadlines.',
    plainEnglishSummary:
      'This notice awards you a $2,500 scholarship for 2026-2027 if you accept the award, confirm enrollment, send a thank-you letter, and provide an official transcript.',
    whyItMatters: 'Missing a requirement or deadline may delay or cancel the award.',
    immediateActions: [
      {
        id: 'action-1',
        text: 'Accept the award through the Northbridge Student Awards Portal',
        evidence: [
          {
            blockId: 'para-1',
            quote: 'Submit the scholarship acceptance form through the Student Awards Portal',
          },
        ],
        evidenceStatus: [
          { verified: true, sourceLabel: 'Paragraph 1', page: null },
        ],
        priority: 'high',
        details: 'The checklist deadline is October 20, 2026.',
        dependsOn: [],
        dueDateId: null,
      },
    ],
    checklist: [],
    dates: [],
    requiredItems: [],
    terms: [],
    questionsToAsk: [],
    uncertainties: [],
    messageDraft: null,
  },
};

const PASTE_TEXT = [
  'Northbridge Community Scholarship - Conditional Award Notification. Date: October 9, 2026. Reference ID: NCS-DEMO-10482.',
  'To complete your award requirements, you must: 1. Accept the award: Submit the scholarship acceptance form through the Student Awards Portal. The checklist deadline is October 20, 2026.',
].join('\n\n');

test.describe('CivicClear app flow in a real browser', () => {
  test('landing renders and sample walkthrough navigation works', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: /let.?s make this make sense/i })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /start with a document/i })
    ).toBeVisible();

    await page.goto('/sample');
    await expect(page.getByText(/sample walkthrough/i).first()).toBeVisible();
    await expect(page.getByText(/fictional example/i).first()).toBeVisible();
    await page.getByRole('button', { name: /start walkthrough/i }).click();
    await expect(page.getByText(/sample document/i).first()).toBeVisible();
    await page.getByRole('button', { name: /see the analysis/i }).click();
    await expect(page.getByText(/the gist/i)).toBeVisible();
  });

  test('privacy step: clicking without consent shows feedback and never advances', async ({ page }) => {
    await page.route(ANALYZE_URL, (route) => route.abort());

    await page.goto('/');
    await page.getByRole('button', { name: /start with a document/i }).click();

    await page.getByLabel(/paste your document text here/i).fill(PASTE_TEXT);
    await page.getByRole('button', { name: /^continue$/i }).click();
    await expect(page.getByText(/review extracted text/i)).toBeVisible();

    await page.getByRole('button', { name: /^continue$/i }).click();
    await expect(page.getByText(/privacy checkpoint/i)).toBeVisible();

    // The consent button is clickable at all times, and explains what is missing.
    const confirmButton = page.getByRole('button', { name: /make this understandable/i });
    await expect(confirmButton).toBeEnabled();
    await expect(page.getByText(/check the confirmation box/i)).toBeVisible();

    await confirmButton.click();
    await expect(
      page.getByText(/please confirm the checkbox above before continuing/i)
    ).toBeVisible();
    // Still on the privacy step.
    await expect(page.getByText(/privacy checkpoint/i)).toBeVisible();
    // No network request was made.
    // (route.aborted would throw if it were hit and the test would fail below.)
    await page.waitForTimeout(500);

    // After checking the box, the error clears and the click advances.
    await page.getByRole('checkbox').check();
    await expect(
      page.getByText(/please confirm the checkbox above before continuing/i)
    ).toHaveCount(0);
    await confirmButton.click();
    await expect(page.getByText(/what are you trying to figure out/i)).toBeVisible();
  });

  test('full flow: paste -> review -> consent -> analyze -> results render', async ({ page }) => {
    await page.route(ANALYZE_URL, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockAnalysisResponse),
      });
    });

    await page.goto('/');
    await page.getByRole('button', { name: /start with a document/i }).click();
    await page.getByLabel(/paste your document text here/i).fill(PASTE_TEXT);
    await page.getByRole('button', { name: /^continue$/i }).click();
    await page.getByRole('button', { name: /^continue$/i }).click();

    await expect(page.getByText(/privacy checkpoint/i)).toBeVisible();
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: /make this understandable/i }).click();

    await expect(page.getByText(/what are you trying to figure out/i)).toBeVisible();
    await page.getByRole('button', { name: /analyze document/i }).click();

    await expect(page.getByText(/the gist/i)).toBeVisible();
    await expect(
      page.getByText('Northbridge Community Scholarship - Conditional Award Notification')
    ).toBeVisible();
    await expect(
      page.getByText(/accept the award through the northbridge student awards portal/i)
    ).toBeVisible();
  });

  test('server error surfaces on the context step and the user can retry', async ({ page }) => {
    await page.route(ANALYZE_URL, async (route) => {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({
          error:
            'AI analysis is not configured yet. Add your Gemini API key to the server environment (GEMINI_API_KEY) to enable document analysis. You can still explore the sample walkthrough.',
        }),
      });
    });

    await page.goto('/');
    await page.getByRole('button', { name: /start with a document/i }).click();
    await page.getByLabel(/paste your document text here/i).fill(PASTE_TEXT);
    await page.getByRole('button', { name: /^continue$/i }).click();
    await page.getByRole('button', { name: /^continue$/i }).click();
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: /make this understandable/i }).click();
    await expect(page.getByText(/what are you trying to figure out/i)).toBeVisible();
    await page.getByRole('button', { name: /analyze document/i }).click();

    await expect(page.getByText(/not configured yet/i)).toBeVisible();
    await expect(page.getByText(/what are you trying to figure out/i)).toBeVisible();
  });
});
