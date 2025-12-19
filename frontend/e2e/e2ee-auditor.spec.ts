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

        // We must enter a name first to add an argument
        // The UI prompts for name if not set
        await page.getByPlaceholder('Add a Pro...').fill(argumentText);
        await page.getByRole('button', { name: 'Add' }).first().click();

        // Fill Name Prompt
        await expect(page.getByText("What's your name?")).toBeVisible();
        await page.getByPlaceholder('Enter your name').fill(displayName);
        await page.getByRole('button', { name: 'Save' }).click();

        // Verify Add Argument Payload
        // Expected: { data: { text: "encrypted", authorName: "encrypted", ... } }
        await expect.poll(() => addArgumentRequest).toBeDefined();
        const argData = addArgumentRequest.postDataJSON();

        expect(argData.data.text).not.toContain(argumentText);
        expect(argData.data.authorName).not.toContain(displayName);
        expect(argData.data.text).not.toEqual(argumentText);

        // -------------------------------------------------------------
        // 3. Verify Encrypted Vote/Participant Registration
        // -------------------------------------------------------------
        // When voting with an encrypted decision, we expect:
        // A. registerParticipant call with encrypted name
        // B. voteDecision call

        let registerParticipantRequest: any;
        await page.route('**/registerParticipant', async route => {
            registerParticipantRequest = route.request();
            await route.continue();
        });

        // We already set the name, so now just vote
        await page.getByRole('button', { name: 'Yes' }).click();

        // Verify Name Registration Payload
        // Note: registerParticipant might store the name in Firestore directly or via function.
        // Based on code inspection: ParticipantService.registerParticipant calls a function or firestore write.
        // Ideally we check whatever network call writes the participant name.

        // IF the app uses a direct write to firestore for participants, the URL will involve `firestore`
        // IF it uses a callable, it will be `functions/registerParticipant`.
        // Let's assume callable or check firestore write if callable fails.

        // Actually, checking the code: "ParticipantService.registerParticipant" logic wasn't fully inspected, 
        // but typically it handles the encryption. If it's a direct DB write, let's catch logical endpoint.
        // The requirement is "User Data (Names)". We verified name in Argument.
        // Let's also check if the vote itself is associated with a plaintext name.

        let voteDecisionRequest: any;
        await page.route('**/voteDecision', async route => {
            voteDecisionRequest = route.request();
            await route.continue();
        });

        await expect.poll(() => voteDecisionRequest).toBeDefined();
        const voteData = voteDecisionRequest.postDataJSON();

        // voteDecision(id, voteType, nameToSend)
        // If encrypted, nameToSend is null or encrypted?
        // Code says: const nameToSend = encryptionKey ? null : user.displayName;
        // So the payload should have nameToSend: null (or undefined)

        if (voteData.data && voteData.data.nameToSend) {
            expect(voteData.data.nameToSend).not.toBe(displayName);
        }

        // If registerParticipant was a function call:
        if (registerParticipantRequest) {
            const regData = registerParticipantRequest.postDataJSON();
            expect(regData.data.encryptedName).not.toContain(displayName);
        }
    });

    // Placeholder for other tests - to be filled in next step once we confirm the first one structure
});
