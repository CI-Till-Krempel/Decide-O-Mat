import { test, expect } from '@playwright/test';

test.describe('E2EE Auditor Agent', () => {

    test('should verify E2EE for all sensitive operations', async ({ page }) => {
        test.setTimeout(60000); // Emulators can be slow
        // Shared constants
        const decisionQuestion = "My Secret Decision Question";
        const argumentText = "My Secret Argument";
        const displayName = "Secret Agent Man";

        // -------------------------------------------------------------
        // 1. Verify Encrypted Decision Creation
        // -------------------------------------------------------------
        let createDecisionRequest: any;
        await page.route('**/createDecision', async route => {
            createDecisionRequest = route.request();
            await route.continue();
        });

        // Debug: Log browser console to stdout
        page.on('console', msg => console.log(`BROWSER: ${msg.text()}`));
        page.on('pageerror', err => console.log(`BROWSER ERROR: ${err}`));

        await page.goto('/');
        await page.getByPlaceholder('What do you need to decide?').fill(decisionQuestion);
        await page.getByRole('button', { name: 'Start Deciding' }).click();

        // Verify Create Decision Payload
        // The callable usually sends { data: { question: "..." } }
        await expect.poll(() => createDecisionRequest).toBeDefined();
        const createData = createDecisionRequest.postDataJSON();
        expect(createData.data.question).not.toContain(decisionQuestion);
        expect(createData.data.question).not.toEqual(decisionQuestion);

        // Wait for navigation to decision page
        await page.waitForURL(/\/d\/.+/);

        // -------------------------------------------------------------
        // 2. Verify Encrypted Argument Creation
        // -------------------------------------------------------------
        let addArgumentRequest: any;
        await page.route('**/addArgument', async route => {
            addArgumentRequest = route.request();
            await route.continue();
        });

        // -------------------------------------------------------------
        // Setup Routes early to capture all potential calls
        // -------------------------------------------------------------

        let registerParticipantRequest: any;
        await page.route('**/registerParticipant', async route => {
            console.log('registerParticipant intercepted');
            registerParticipantRequest = route.request();
            await route.continue();
        });

        // Explicitly set the name to ensure we are testing Encryption of the specific string
        // The app auto-generates a name, so we must edit it.
        const editButton = page.getByRole('button', { name: '✏️' });
        await expect(editButton).toBeVisible();
        await editButton.click();

        const nameInput = page.getByPlaceholder('Enter your name');
        await expect(nameInput).toBeVisible();
        await nameInput.fill(displayName);

        // This save triggers registerParticipant
        await page.getByRole('button', { name: 'Save' }).click();

        // Verify registration happened and was encrypted
        await expect.poll(() => registerParticipantRequest).toBeDefined();
        const firstRegData = registerParticipantRequest.postDataJSON();
        expect(firstRegData.data.encryptedDisplayName).toBeDefined();
        expect(firstRegData.data.encryptedDisplayName).not.toContain(displayName);

        const argumentInput = page.getByPlaceholder('Add a Pro...');
        await expect(argumentInput).toBeVisible();
        await argumentInput.fill(argumentText);

        const addButton = page.getByRole('button', { name: 'Add' }).first();
        await expect(addButton).toBeEnabled();
        await addButton.click();

        // No name prompt expected now


        // Verify Add Argument Payload
        // Expected: { data: { text: "encrypted", authorName: "encrypted", ... } }
        await expect.poll(() => addArgumentRequest).toBeDefined();
        const argData = addArgumentRequest.postDataJSON();

        expect(argData.data.text).not.toContain(argumentText);
        expect(argData.data.authorName).not.toContain(displayName);
        expect(argData.data.text).not.toEqual(argumentText);

        // -------------------------------------------------------------
        // 3. Verify Encrypted Vote
        // -------------------------------------------------------------

        // We already verified participant registration above.
        // Now verify vote. Note: vote might trigger registerParticipant is map not updated,
        // but we mainly care that voteDecision is clean.

        let voteDecisionRequest: any;
        await page.route('**/voteDecision', async route => {
            console.log('voteDecision intercepted');
            voteDecisionRequest = route.request();
            await route.continue();
        });

        await expect(page.getByRole('button', { name: 'Yes' })).toBeVisible();
        await page.getByRole('button', { name: 'Yes' }).click();

        // Increased timeout for emulators
        await expect.poll(() => voteDecisionRequest, { timeout: 15000 }).toBeDefined();
        const voteData = voteDecisionRequest.postDataJSON();

        // voteDecision(id, voteType, nameToSend)
        // If encrypted, nameToSend is null or encrypted?
        // Code says: const nameToSend = encryptionKey ? null : user.displayName;
        if (voteData.data && voteData.data.nameToSend) {
            expect(voteData.data.nameToSend).not.toBe(displayName);
        }
    });

    // Placeholder for other tests - to be filled in next step once we confirm the first one structure
});
